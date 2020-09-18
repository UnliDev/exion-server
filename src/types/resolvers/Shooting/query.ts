import { intArg, queryField } from "@nexus/schema";
import { getUserId } from "../../../utils/auth";

export const shootingQueryField = queryField((t) => {
  t.connectionField('shootings', {
    type: 'Shooting',
    additionalArgs: { searchShooting: 'SearchShootingInput' },
    async nodes(_, { searchShooting, after }, ctx) {
      const {
        title,
        startAt,
        endAt,
      } = searchShooting!;
      const cursor = after ? {
        id: parseInt(after, 36),
      } : undefined;
      const id = after ? { not: parseInt(after, 36) } : undefined;

      const shootings = await ctx.prisma.shooting.findMany({
        cursor,
        where: {
          title: { contains: title },
          shootingStartAt: { lte: endAt },
          shootingEndAt: { gte: startAt },
          id,
        },
        orderBy: { id: 'desc' },
      });
      return shootings;
    },
  });

  t.field('selectShooting', {
    type: 'Shooting',
    args: { shootingId: intArg({ required: true }) },
    nullable: true,
    async resolve(_, { shootingId }, ctx) {
      const shooting = await ctx.prisma.shooting.findOne({
        where: {
          id: shootingId,
        },
      });
      return new Promise((resolve, reject) => resolve(shooting));
    },
  });

  t.connectionField('bookmarkShootings', {
    type: 'Shooting',
    async nodes(_, { after }, ctx) {
      const cursor = after ? {
        id: parseInt(after, 36),
      } : undefined;
      const id = after ? { not: parseInt(after, 36) } : undefined;
      const userId = getUserId(ctx);
      const bookmarkShootings = await ctx.prisma.shooting.findMany({
        cursor,
        where: {
          bookmark: {
            some: {
              userId,
            },
          },
          id,
        },
        orderBy: { id: 'desc' },
      });
      return bookmarkShootings;
    },
  });
});
