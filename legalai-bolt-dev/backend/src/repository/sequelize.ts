import 'dotenv/config';
import { Sequelize } from 'sequelize';

console.log('[Sequelize Config]', {
    DB_NAME: process.env.DB_NAME,
    DB_USER: process.env.DB_USER,
    DB_HOST: process.env.DB_HOST,
    DB_PORT: process.env.DB_PORT,
    DB_SSL: process.env.DB_SSL
});

export const sequelize = new Sequelize(
    process.env.DB_NAME as string,
    process.env.DB_USER as string,
    process.env.DB_PASSWORD as string,
    {
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT) || 5432,
        dialect: 'postgres',
        logging: false,
        dialectOptions: {
            ssl: process.env.DB_SSL == 'true',
        },
    }
);
