/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { z } from "zod";
import type { passenger as Passenger, seat as Seat } from "@prisma/client";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { keysFromSnakeToCamel } from "~/utils/keysFromSnakeToCamel";
import { groupBy } from "~/utils/groupBy";
import { capitalLetterToNumber } from "~/utils/capitalLetterToNumber";

interface PassengersWithBoardingPass extends Passenger {
  boarding_pass_id: number;
  purchase_id: number;
  seat_type_id: number;
  seat_id: number | null;
}

interface AssignSeatsArgs {
  passengers: PassengersWithBoardingPass[];
  seats: Seat[];
}

interface GroupPassengersByPurchaseAndSortByAgeArgs {
  passengers: PassengersWithBoardingPass[];
}

interface AssignSeatsForGroupArgs {
  group: PassengersWithBoardingPass[];
  airplaneSeats: Seat[];
}

interface FindAdjacentSeatsArgs {
  group: PassengersWithBoardingPass[];
  airplaneSeats: Seat[];
}

interface AssignSeatsForMinorsArgs {
  group: PassengersWithBoardingPass[];
  airplaneSeats: Seat[];
}

interface AssignRemainingSeatsArgs {
  group: PassengersWithBoardingPass[];
  airplaneSeats: Seat[];
}

function assignSeats({ passengers, seats }: AssignSeatsArgs) {
  const passengerGroups = groupPassengersByPurchaseAndSortByAge({ passengers });

  for (const group of passengerGroups) {
    assignSeatsForGroup({ group, airplaneSeats: seats });
  }
}

function groupPassengersByPurchaseAndSortByAge({
  passengers,
}: GroupPassengersByPurchaseAndSortByAgeArgs) {
  const groupedByPurchase = groupBy(passengers, "purchase_id");

  return Object.values(groupedByPurchase).map((group) =>
    group.sort((a, b) => a.age - b.age)
  );
}

function assignSeatsForGroup({
  group,
  airplaneSeats,
}: AssignSeatsForGroupArgs) {
  const adjacentSeatsIds = findAdjacentSeats({ group, airplaneSeats });

  if (adjacentSeatsIds) {
    // Assign adjacent seats to passengers
    for (let i = 0; i < group.length; i++) {
      const currentPassenger = group[i];
      const currentAdjacentSeatId = adjacentSeatsIds[i];
      if (!currentPassenger || !currentAdjacentSeatId) continue;
      currentPassenger.seat_id = currentAdjacentSeatId;
    }
  } else {
    assignSeatsForMinors({ group, airplaneSeats });

    assignRemainingSeats({ group, airplaneSeats });
  }
}

function findAdjacentSeats({ group, airplaneSeats }: FindAdjacentSeatsArgs) {
  const groupSize = group.length;

  for (const seat of airplaneSeats) {
    const row = seat.seat_row;
    const column = capitalLetterToNumber(seat.seat_column);

    const adjacentSeatIds = [];
    let seatFound = true;

    for (let i = 0; i < groupSize; i++) {
      const adjacentSeat = airplaneSeats.find(
        (seat) =>
          seat.seat_row === row &&
          capitalLetterToNumber(seat.seat_column) === column + i
      );

      if (adjacentSeat) {
        adjacentSeatIds.push(adjacentSeat.seat_id);
      } else {
        seatFound = false;
        break;
      }
    }

    if (seatFound) {
      return adjacentSeatIds;
    }
  }

  return null;
}

function assignSeatsForMinors({
  group,
  airplaneSeats,
}: AssignSeatsForMinorsArgs) {
  let passengersGroup = [...group];
  const minors = passengersGroup.filter((passenger) => passenger.age < 18);

  for (const minor of minors) {
    const adult = passengersGroup.find((passenger) => passenger.age >= 18);

    if (adult && adult.seat_id) {
      const adultSeat = airplaneSeats.find(
        (seat) => seat.seat_id === adult.seat_id
      );

      if (adultSeat) {
        const adultRow = adultSeat.seat_row;
        const adultColumn = capitalLetterToNumber(adultSeat.seat_column);

        const availableSeatForMinor = airplaneSeats.find(
          (seat) =>
            seat.seat_row === adultRow &&
            (capitalLetterToNumber(seat.seat_column) === adultColumn - 1 ||
              capitalLetterToNumber(seat.seat_column) === adultColumn + 1)
        );

        if (availableSeatForMinor) {
          minor.seat_id = availableSeatForMinor.seat_id;
        }
      }

      // Remove the assigned adult and minor from the passengersGroup
      passengersGroup = passengersGroup.filter(
        (passenger) => passenger !== adult && passenger !== minor
      );
    }
  }
}

function assignRemainingSeats({
  group,
  airplaneSeats,
}: AssignRemainingSeatsArgs) {
  for (const passenger of group) {
    const availableSeat = airplaneSeats.find(
      (seat) => seat.seat_type_id === passenger.seat_type_id && !seat.seat_id
    );

    if (availableSeat) {
      passenger.seat_id = availableSeat.seat_id;
    }
  }
}

const simulationOutputSchema = z.object({
  code: z.number(),
  data: z
    .object({
      flightId: z.number().optional(),
      takeoffDateTime: z.number().optional(),
      takeoffAirport: z.string().optional(),
      landingDateTime: z.number().optional(),
      landingAirport: z.string().optional(),
      airplaneId: z.number().optional(),
      passengers: z
        .array(
          z
            .object({
              passengerId: z.number(),
              dni: z.string(),
              name: z.string(),
              age: z.number(),
              country: z.string(),
              boardingPassId: z.number(),
              purchaseId: z.number(),
              seatTypeId: z.number(),
              seatId: z.number().nullish(),
            })
            .optional()
        )
        .optional(),
    })
    .optional(),
  errors: z.string().optional(),
});

const simulationInputSchema = z.object({
  flight_id: z.number(),
});

export const simulationRouter = createTRPCRouter({
  getSimulation: publicProcedure
    .meta({
      openapi: { method: "GET", path: "/flights/{flight_id}/passengers" },
    })
    .input(simulationInputSchema)
    .output(simulationOutputSchema)
    .query(async ({ ctx, input }) => {
      try {
        const selectedFlight = await ctx.prisma.flight.findFirst({
          where: { flight_id: input.flight_id },
        });
        if (!selectedFlight) {
          return {
            code: 404,
            data: {},
          };
        }

        const boardingPassesByFlightId =
          await ctx.prisma.boarding_pass.findMany({
            where: {
              flight_id: input.flight_id,
            },
          });

        const selectedFlightPassengersIds = boardingPassesByFlightId.map(
          (boardingPass) => boardingPass.passenger_id
        );

        const passengers = await ctx.prisma.passenger.findMany({
          where: {
            passenger_id: { in: selectedFlightPassengersIds },
          },
        });

        const passengersWithBoardingPass = passengers.map((passenger) => {
          const passengerBoardingPassData = boardingPassesByFlightId.find(
            (boardingPass) =>
              boardingPass.passenger_id === passenger.passenger_id
          )!;

          return {
            boarding_pass_id: passengerBoardingPassData?.boarding_pass_id,
            purchase_id: passengerBoardingPassData?.purchase_id,
            seat_type_id: passengerBoardingPassData?.seat_type_id,
            seat_id: passengerBoardingPassData?.seat_id,
            ...passenger,
          };
        });

        const airplaneSeats = await ctx.prisma.seat.findMany({
          where: {
            airplane_id: selectedFlight.airplane_id,
          },
        });

        assignSeats({
          passengers: passengersWithBoardingPass,
          seats: airplaneSeats,
        });

        const checkInSimulation = keysFromSnakeToCamel({
          passengers: passengersWithBoardingPass,
          ...selectedFlight,
        });

        return {
          code: 200,
          data: checkInSimulation,
        };
      } catch (error) {
        return {
          code: 400,
          errors: "Could not connect to db",
        };
      }
    }),
});
