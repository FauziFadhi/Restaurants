import dotenv from 'dotenv';
import { join } from "path";
import { Sequelize } from "sequelize-typescript";

dotenv.config()

const {DB_NAME, DB_PORT = 3306, DB_USERNAME, DB_PASSWORD} = process.env || {}
const db = new Sequelize({
  dialect: 'mysql',
  database: DB_NAME,
  port: +DB_PORT,
  username: DB_USERNAME,
  password: DB_PASSWORD,
  define: {
    underscored: true,
  },
  models: [join(__dirname, '../models')]
})

export default db