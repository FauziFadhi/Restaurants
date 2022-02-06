import { DataType } from 'sequelize-typescript';
import { Migration } from '../../config/migration.config';

export const databasePath = __dirname;

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.createTable('purchase_history_details', {
      id: {
        type: DataType.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      purchase_history_id: {
        type: DataType.INTEGER,
        references: {
          model: 'purchase_histories',
          key: 'id'
        }
      },
      restaurant_id: {
        type: DataType.INTEGER,
        allowNull: false,
        references: {
          model: 'restaurants',
          key: 'id'
        }
      },
      dish_id: {
        type: DataType.INTEGER,
        allowNull: false,
        references: {
          model: 'restaurant_dishes',
          key: 'id'
        }
      },
      dish_name: {
        type: DataType.STRING,
        allowNull: false,
        comment: 'history dish name'
      },
      amount: {
        type: DataType.DECIMAL,
        allowNull: false,
        defaultValue: 0,
      },
      created_at: DataType.DATE,
      updated_at: DataType.DATE,
      deleted_at: DataType.DATE,
    });

    await queryInterface.addIndex('purchase_history_details', ['restaurant_id', 'amount'])
  });
};
export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.removeIndex('purchase_history_details', ['restaurant_id', 'amount'])

    await queryInterface.dropTable('purchase_history_details');
  });
};
