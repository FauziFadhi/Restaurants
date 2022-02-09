import { Migration } from '../../config/migration.config';
import Restaurant from '../../models/core/Restaurant';
import RestaurantDish from '../../models/core/RestaurantDish';
import RestaurantSchedule from '../../models/core/RestaurantSchedule';
import { MigrationRestaurantService } from '../../service/migration-restaurant.service';

export const databasePath = __dirname;

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.sequelize.transaction(async (transaction) => {
    const migrateService = new MigrationRestaurantService();
    await migrateService.migrate(transaction);
  });
};
export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.sequelize.transaction(async (transaction) => {
    await Promise.all([
      RestaurantDish.truncate({
        force: true,
        restartIdentity: true,
        cascade: true,
      }),
      RestaurantSchedule.truncate({
        force: true,
        restartIdentity: true,
        cascade: true,
      }),
    ]);
    await Restaurant.truncate({
      force: true,
      restartIdentity: true,
      cascade: true,
    });
  });
};
