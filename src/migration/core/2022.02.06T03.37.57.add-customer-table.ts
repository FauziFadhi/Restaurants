import { DataType } from 'sequelize-typescript';
import { Migration } from '../../config/migration.config';

export const databasePath = __dirname;

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.createTable('customers', {
      id: {
        type: DataType.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataType.STRING,
        allowNull: false,
      },
      balance: {
        type: DataType.DECIMAL,
        allowNull: false,
        defaultValue: 0,
      },
      created_at: DataType.DATE,
      updated_at: DataType.DATE,
      deleted_at: DataType.DATE,
    });

    await queryInterface.addIndex('customers', ['name'])
    await queryInterface.addIndex('customers', ['balance'])
  });
};
export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.removeIndex('customers', ['name'])
    await queryInterface.removeIndex('customers', ['balance'])
    await queryInterface.dropTable('customers');
    
  });
};
