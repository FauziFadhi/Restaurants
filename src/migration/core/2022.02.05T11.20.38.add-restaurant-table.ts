import { DataType } from 'sequelize-typescript';
import { Migration } from '../../config/migration.config';

export const databasePath = __dirname;

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.createTable('restaurants', {
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
  });

  await queryInterface.addIndex('restaurants' , ['name'], {
    unique: true,
    where: {
    deleted_at: null,
  }})
};
export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.removeIndex('restaurants', ['name'], {
      where: { deleted_at: null }, 
      unique: true,
  })
    await queryInterface.dropTable('restaurants');
  });
};
