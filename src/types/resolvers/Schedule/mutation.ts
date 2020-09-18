import { intArg, mutationField, stringArg } from '@nexus/schema';
import { getUserId } from '../../../utils/auth';

export const addSchedule = mutationField('addSchedule', {
  type: "Schedule",
  args: {
    shootingId: intArg({ required: true }),
  },
  resolve: async (_, { shootingId }, ctx) => {
    const myId = getUserId(ctx);

    return await ctx.prisma.schedule.create({
      data: {
        step: "screening",
        Shooting: {
          connect: {
            id: shootingId,
          },
        },
        User: {
          connect: {
            id: myId,
          },
        },
      },
      include: {
        Shooting: true,
        User: true,
      },
    });
  },
});

export const removeSchedule = mutationField('removeSchedule', {
  type: "Schedule",
  args: {
    scheduleId: intArg({ required: true }),
  },
  resolve: async (_, { scheduleId }, ctx) => {
    const myId = getUserId(ctx);

    return await ctx.prisma.schedule.delete({
      where: {
        id: scheduleId,
      },
    });
  },
});
