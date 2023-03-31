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
  assignedSeatIds: Set<number | null>;
}

interface FindAdjacentSeatsArgs {
  group: PassengersWithBoardingPass[];
  airplaneSeats: Seat[];
}

interface AssignRemainingSeatsArgs {
  group: PassengersWithBoardingPass[];
  airplaneSeats: Seat[];
  assignedSeatIds: Set<number | null>;
}

function assignSeats({ passengers, seats }: AssignSeatsArgs) {
  const passengerGroups = groupPassengersByPurchaseAndSortByAge({ passengers });
  const assignedSeatIds = new Set(
    passengers
      .filter((passenger) => passenger.seat_id !== null)
      .map((passenger) => passenger.seat_id)
  );

  for (const group of passengerGroups) {
    assignSeatsForGroup({ group, airplaneSeats: seats, assignedSeatIds });
  }
}

function groupPassengersByPurchaseAndSortByAge({
  passengers,
}: GroupPassengersByPurchaseAndSortByAgeArgs) {
  const groupedByPurchase = groupBy(passengers, "purchase_id");

  return Object.values(groupedByPurchase).map((group) =>
    group.sort((a, b) => {
      if (a.seat_id === null && b.seat_id !== null) return 1;
      if (a.seat_id !== null && b.seat_id === null) return -1;
      return 0;
    })
  );
}

function assignSeatsForGroup({
  group,
  airplaneSeats,
  assignedSeatIds,
}: AssignSeatsForGroupArgs) {
  const adjacentSeatsIds = findAdjacentSeats({ group, airplaneSeats });

  if (adjacentSeatsIds) {
    const minors = group.filter((passenger) => passenger.age < 18);
    const adults = group.filter((passenger) => passenger.age >= 18);

    let minorIndex = 0;
    let adultIndex = 0;

    // Assign adjacent seats to passengers, prioritizing minors seated next to adults
    for (let i = 0; i < group.length; i++) {
      const currentAdjacentSeatId = adjacentSeatsIds[i];
      const nextAdjacentSeatId = adjacentSeatsIds[i + 1];
      const currentMinor = minors[minorIndex];
      const currentAdult = adults[adultIndex];

      if (
        currentMinor &&
        currentAdjacentSeatId &&
        currentAdult &&
        nextAdjacentSeatId
      ) {
        currentMinor.seat_id = currentAdjacentSeatId;
        assignedSeatIds.add(currentAdjacentSeatId);
        minorIndex++;

        currentAdult.seat_id = nextAdjacentSeatId;
        assignedSeatIds.add(nextAdjacentSeatId);
        adultIndex++;

        i++; // Skip the next seat since we've already assigned it
      } else if (currentAdult && currentAdjacentSeatId) {
        currentAdult.seat_id = currentAdjacentSeatId;
        assignedSeatIds.add(currentAdjacentSeatId);
        adultIndex++;
      }
    }
  } else {
    assignRemainingSeats({ group, airplaneSeats, assignedSeatIds });
  }
}

function findAdjacentSeats({
  group,
  airplaneSeats,
}: FindAdjacentSeatsArgs): number[] | null {
  const groupSize = group.length;
  const maxGroupSize = 3; // Define the maximum group size for finding adjacent seats

  // If the group size is larger than the maxGroupSize, find adjacent seats for subgroups
  if (groupSize > maxGroupSize) {
    const subgroups: PassengersWithBoardingPass[][] = [];
    for (let i = 0; i < groupSize; i += maxGroupSize) {
      const subgroup = group.slice(i, i + maxGroupSize);
      subgroups.push(subgroup);
    }

    const adjacentSeatsIdsForSubgroups = findAdjacentSeatsForSubgroups({
      subgroups,
      airplaneSeats,
    });

    if (adjacentSeatsIdsForSubgroups) {
      return adjacentSeatsIdsForSubgroups.flat();
    }

    return null;
  }

  // Find the first passenger in the group with an assigned seat
  const firstAssignedPassenger = group.find(
    (passenger) => passenger.seat_id !== null
  );

  let startingSeat: Seat | undefined;
  if (firstAssignedPassenger) {
    startingSeat = airplaneSeats.find(
      (seat) => seat.seat_id === firstAssignedPassenger.seat_id
    );
  }

  if (!startingSeat) {
    startingSeat = airplaneSeats[0];
    if (!startingSeat) return null;
  }

  const row = startingSeat.seat_row;
  const column = capitalLetterToNumber(startingSeat.seat_column);

  const adjacentSeatIds: number[] = [];
  let seatsFound = true;

  for (let i = 0; i < groupSize; i++) {
    const currentPassenger = group[i];
    const adjacentSeat = airplaneSeats.find(
      (seat) =>
        seat.seat_row === row &&
        capitalLetterToNumber(seat.seat_column) === column + i &&
        (seat.seat_type_id === currentPassenger?.seat_type_id ||
          seat.seat_id === currentPassenger?.seat_id)
    );

    if (adjacentSeat) {
      adjacentSeatIds.push(adjacentSeat.seat_id);
    } else {
      seatsFound = false;
      break;
    }
  }

  if (seatsFound) {
    return adjacentSeatIds;
  }

  return null;
}

function findAdjacentSeatsForSubgroups({
  subgroups,
  airplaneSeats,
}: {
  subgroups: PassengersWithBoardingPass[][];
  airplaneSeats: Seat[];
}) {
  const adjacentSeatsIdsForSubgroups = [];

  for (const subgroup of subgroups) {
    const adjacentSeatsIds = findAdjacentSeats({
      group: subgroup,
      airplaneSeats,
    });

    if (adjacentSeatsIds) {
      adjacentSeatsIdsForSubgroups.push(adjacentSeatsIds);
    } else {
      return null;
    }
  }

  return adjacentSeatsIdsForSubgroups;
}

function assignRemainingSeats({
  group,
  airplaneSeats,
  assignedSeatIds,
}: AssignRemainingSeatsArgs) {
  for (const passenger of group) {
    if (passenger.seat_id) continue;

    const availableSeat = airplaneSeats.find(
      (seat) =>
        seat.seat_type_id === passenger.seat_type_id &&
        !assignedSeatIds.has(seat.seat_id)
    );

    if (availableSeat) {
      passenger.seat_id = availableSeat.seat_id;
      assignedSeatIds.add(availableSeat.seat_id);
    } else {
      // If no available seat of the same type is found, try to assign a seat of a different type
      const alternativeSeatType = passenger.seat_type_id === 1 ? 2 : 1;
      const alternativeSeat = airplaneSeats.find(
        (seat) =>
          seat.seat_type_id === alternativeSeatType &&
          !assignedSeatIds.has(seat.seat_id)
      );

      if (alternativeSeat) {
        passenger.seat_id = alternativeSeat.seat_id;
        assignedSeatIds.add(alternativeSeat.seat_id);
      }
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
