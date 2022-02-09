import { Migration } from '../../config/migration.config';
import Customer from '../../models/core/Customer';
import PurchaseHistory from '../../models/core/PurchaseHistory';
import PurchaseHistoryDetail from '../../models/core/PurchaseHistoryDetail';
import { MigrationPurchaseHistoryService } from '../../service/migration-purchase-history.service';

export const databasePath = __dirname;

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.sequelize.transaction(async (transaction) => {
    const migrationService = new MigrationPurchaseHistoryService()
    await migrationService.migrate(transaction)
  });
};
export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.sequelize.transaction(async (transaction) => {
    await PurchaseHistoryDetail.truncate({cascade: true, force: true, restartIdentity: true})
    await PurchaseHistory.truncate({cascade: true, force: true, restartIdentity: true})
    await Customer.truncate({cascade: true, force: true, restartIdentity: true})
  });
};