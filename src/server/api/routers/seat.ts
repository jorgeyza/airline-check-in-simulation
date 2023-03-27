import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const seatRouter = createTRPCRouter({
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.seat.findMany();
  }),

  getAllByAirplaneId: publicProcedure
    .input(z.object({ airplane_id: z.number() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.seat.findMany({
        where: { airplane_id: input.airplane_id },
      });
    }),

  getAllSeatTypes: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.seat_type.findMany();
  }),
});
