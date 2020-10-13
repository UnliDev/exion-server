import { inputObjectType } from "@nexus/schema";

export const SearchShootingInputType = inputObjectType({
  name: 'SearchShootingInput',
  definition(t) {
    t.string('title', { nullable: false });
    t.date('startAt', { nullable: false });
    t.date('endAt', { nullable: false });
  },
});

export const AddShootingInputType = inputObjectType({
  name: 'AddShootingInput',
  definition(t) {
    t.string('title');
    t.string('producer');
    t.date('shootingStartAt');
    t.date('shootingEndAt');
    t.int('headCount');
    t.string('content');
    t.int('wage');
    t.string('meetingPlace');
    t.date('meetingTime');
    t.gender('gender');
    t.int('minHeight');
    t.int('maxHeight');
    t.int('minWeight');
    t.int('maxWeight');
    t.boolean('isGlasses');
    t.boolean('isTattoo');
    t.boolean('isDyeing');
  },
});
