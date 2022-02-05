import { readFileSync } from 'fs';
import { SequelizeStorage, Umzug } from 'umzug';
import { databasePath } from '../migration/migration-template';
import db from './database.config';

export const migrator = new Umzug({
  migrations: {
    glob: ['core/*.ts', { cwd: databasePath }],
  },
  create: {
    folder: `${databasePath}/core`,
    template: (filepath) => [
      [
        filepath,
        readFileSync(`${databasePath}/migration-template.ts`).toString(),
      ],
    ],
  },
  context: db.getQueryInterface(),
  storage: new SequelizeStorage({
    sequelize: db,
  }),
  logger: console,
});

export type Migration = typeof migrator._types.migration;
