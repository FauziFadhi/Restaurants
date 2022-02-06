import { DataType } from 'sequelize-typescript';
import { Migration } from '../../config/migration.config';

export const databasePath = __dirname;

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.createTable('restaurant_dishes', {
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
      name: {
        type: DataType.TEXT,
        allowNull: false,
      },
      price: {
        type: DataType.DECIMAL,
        allowNull: false,
        defaultValue: 0,
      },
      created_at: DataType.DATE,
      updated_at: DataType.DATE,
      deleted_at: DataType.DATE
    });

    await queryInterface.addIndex('restaurant_dishes', ['price', 'name'])
    await queryInterface.addIndex('restaurant_dishes', ['name'])
    await queryInterface.addIndex('restaurant_dishes', ['restaurant_id', 'price'])
  });
};
export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.removeIndex('restaurant_dishes', ['name'])
    await queryInterface.removeIndex('restaurant_dishes', ['restaurant_id', 'price'])
    await queryInterface.removeIndex('restaurant_dishes', ['price', 'name'])
    await queryInterface.dropTable('restaurant_dishes');

  });
};
