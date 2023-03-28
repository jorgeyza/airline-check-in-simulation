import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import keysFromSnakeToCamel from "~/utils/keysFromSnakeToCamel";

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

        const passengerFullData = selectedFlightPassengersIds.map(
          (passengerId) => {
            const passengerBasicData = passengers.find(
              (passenger) => passenger.passenger_id === passengerId
            )!;
            const passengerBoardingPassData = boardingPassesByFlightId.find(
              (boardingPass) => boardingPass.passenger_id === passengerId
            )!;
            return {
              boarding_pass_id: passengerBoardingPassData?.boarding_pass_id,
              purchase_id: passengerBoardingPassData?.purchase_id,
              seat_type_id: passengerBoardingPassData?.seat_type_id,
              seat_id: passengerBoardingPassData?.seat_id,
              ...passengerBasicData,
            };
          }
        );

        const checkInSimulation = keysFromSnakeToCamel({
          passengers: passengerFullData,
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
