import { DataType } from 'sequelize-typescript';
import { Migration } from '../../config/migration.config';

export const databasePath = __dirname;

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.createTable('purchase_histories', {
      id: {
        type: DataType.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      restaurant_id: {
        type: DataType.INTEGER,
        allowNull: false,
        references: {
          model: 'restaurants',
          key: 'id'
        }
      },
      restaurant_name: {
        type: DataType.STRING,
        allowNull: false,
        comment: 'history restaurant name'
      },
      customer_id: {
        type: DataType.INTEGER,
        allowNull: false,
        references: {
          model: 'customers',
          key: 'id'
        }
      },
      amount: {
        type: DataType.DECIMAL,
        allowNull: false,
        defaultValue: 0,
      },
      date: {
        type: DataType.DATE,
        allowNull: false,
      },
      created_at: DataType.DATE,
      updated_at: DataType.DATE,
      deleted_at: DataType.DATE
    });
  });

  queryInterface.addIndex('purchase_histories', ['restaurant_id', 'amount'])
  queryInterface.addIndex('purchase_histories', ['restaurant_id', 'date'])
};
export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.sequelize.transaction(async (transaction) => {
  queryInterface.removeIndex('purchase_histories', ['restaurant_id', 'date'])
  queryInterface.removeIndex('purchase_histories', ['restaurant_id', 'amount'])

    await queryInterface.dropTable('purchase_histories');
  });
};
