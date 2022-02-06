import dotenv from 'dotenv';
import { join } from "path";
import { Sequelize } from "sequelize-typescript";

dotenv.config()

const {DB_NAME, DB_PORT = 3306, DB_USER, DB_PASSWORD, DB_HOST} = process.env || {}
const db = new Sequelize({
  dialect: 'postgres',
  database: DB_NAME,
  port: +DB_PORT,
  username: DB_USER,
  password: DB_PASSWORD,
  host: DB_HOST,
  define: {
    underscored: true,
  },
  models: [join(__dirname, '../models')]
})

export default db