import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

const simulationOutputSchema = z.object({
  code: z.number(),
  data: z
    .object({
      flight_id: z.number().optional(),
      takeoff_date_time: z.number().optional(),
      takeoff_airport: z.string().optional(),
      landing_date_time: z.number().optional(),
      landing_airport: z.string().optional(),
      airplane_id: z.number().optional(),
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
        const flight = await ctx.prisma.flight.findFirst({
          where: { flight_id: input.flight_id },
        });
        if (!flight) {
          return {
            code: 404,
            data: {},
          };
        }

        return {
          code: 200,
          data: flight,
        };
      } catch (error) {
        return {
          code: 400,
          errors: "Could not connect to db",
        };
      }
    }),
});

/*
```
{
  "code": 200,
  "data": {
  "flightId": 1,
  "takeoffDateTime": 1688207580,
  "takeoffAirport": "Aeropuerto Internacional Arturo Merino Benitez, Chile",
  "landingDateTime": 1688221980,
  "landingAirport": "Aeropuerto Internacional Jorge Cháve, Perú",
  "airplaneId": 1,
  "passengers": [
  {
  "passengerId": 90,
  "dni": 983834822,
  "name": "Marisol",
  "age": 44,
  "country": "México",
  "boardingPassId": 24,
  "purchaseId": 47,
  "seatTypeId": 1,
  "seatId": 1
  },
  {...}
  ]
  }
}
```

```
{
  "code": 404,
  "data": {}
}
```

```
{
    "code": 400,
    "errors": "could not connect to db"
}
```*/
