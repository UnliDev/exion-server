import { queryField } from "@nexus/schema";
import { getUserId } from "../../../utils/auth";

export const scheduleQueryField = queryField((t) => {
  t.connectionField('schedules', {
    type: 'Schedule',
    async nodes(_, { after }, ctx) {
      const cursor = after ? {
        id: parseInt(after, 36),
      } : undefined;
      const id = after ? { not: parseInt(after, 36) } : undefined;
      const userId = getUserId(ctx);
      const scheduleShootings = await ctx.prisma.schedule.findMany({
        cursor,
        where: {
          userId,
          id,
        },
        include: {
          Shooting: true,
        },
        orderBy: { id: 'desc' },
      });
      return scheduleShootings;
    },
  });
});
