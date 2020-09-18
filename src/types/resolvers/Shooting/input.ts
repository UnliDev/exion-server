import { inputObjectType } from "@nexus/schema";

export const SearchShootingInputType = inputObjectType({
  name: 'SearchShootingInput',
  definition(t) {
    t.string('title');
    t.date('startAt');
    t.date('endAt');
  },
});
