import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'noir_portfolio',
  process.env.DB_USER || 'noir_user',
  process.env.DB_PASS || 'noir_pass_2024',
  {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    dialect: 'mariadb',
    logging: false,
    dialectOptions: {
      decimalNumbers: true,
    },
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('MariaDB connected successfully');
    await sequelize.sync({ alter: true });
    console.log('Models synchronized');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

export default sequelize;
