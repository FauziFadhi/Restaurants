import { DataType } from 'sequelize-typescript';
import { Migration } from '../../config/migration.config';

export const databasePath = __dirname;

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.createTable('restaurant_schedules', {
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
      day: {
        type: DataType.INTEGER,
        allowNull: false,
      },
      start_time: {
        type: DataType.TIME,
        allowNull: false,
      },
      end_time: {
        type: DataType.TIME,
        allowNull: false,
      },
      created_at: DataType.DATE,
      updated_at: DataType.DATE,
      deleted_at: DataType.DATE,
    });

    queryInterface.addIndex('restaurant_schedules', ['day', 'start_time', 'end_time'])
    queryInterface.addIndex('restaurant_schedules', ['day','restaurant_id', 'start_time', 'end_time'])
  });
};
export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.sequelize.transaction(async (transaction) => {
    queryInterface.removeIndex('restaurant_schedules', ['day', 'start_time', 'end_time'])
    queryInterface.removeIndex('restaurant_schedules', ['day','restaurant_id', 'start_time', 'end_time'])
    await queryInterface.dropTable('restaurant_schedules');
  });
};
