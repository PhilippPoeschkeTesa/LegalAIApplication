import { sequelize } from '../repository/sequelize';

// Example: Test connection and export sequelize instance
sequelize.authenticate()
  .then(() => {
    console.log('✅ Successfully connected to PostgreSQL via Sequelize');
  })
  .catch((err: Error) => {
    console.error('❌ Sequelize connection failed:', err);
  });

export default sequelize;
