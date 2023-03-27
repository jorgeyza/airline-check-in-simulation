import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const airplaneRouter = createTRPCRouter({
  getOne: publicProcedure
    .input(z.object({ airplane_id: z.number() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.airplane.findFirst({
        where: { airplane_id: input.airplane_id },
      });
    }),
});
