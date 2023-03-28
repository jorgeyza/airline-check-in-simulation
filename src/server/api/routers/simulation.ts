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
              seatId: z.number(),
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

        const passengersBasicInfo = await ctx.prisma.passenger.findMany({
          where: {
            passenger_id: { in: selectedFlightPassengersIds },
          },
        });

        const passengersFullInfo = passengersBasicInfo.map((passenger) => ({
          ...passenger,
          boardingPassId: 1,
          purchaseId: 1,
          seatTypeId: 1,
          seatId: 1,
        }));

        const checkInSimulation = keysFromSnakeToCamel({
          passengers: passengersFullInfo,
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
