import { createTRPCRouter } from "~/server/api/trpc";
import { flightRouter } from "~/server/api/routers/flight";
import { seatRouter } from "~/server/api/routers/seat";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  flight: flightRouter,
  seat: seatRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
