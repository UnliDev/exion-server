import { objectType } from '@nexus/schema';
import { sep } from 'path';

export const Schedule = objectType({
  name: 'Schedule',
  definition(t) {
    t.model.id();
    t.model.step();
    t.model.shootingId();
    t.model.userId();
  },
});
