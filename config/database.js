// Database configuration for different environments
const config = {
  development: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5433, // Using 5433 to avoid conflict with system PostgreSQL
    database: process.env.DB_NAME || 'sap',
    username: process.env.DB_USER || 'sap_user',
    password: process.env.DB_PASSWORD || 'P6v5AbvmO_EZQWVI.CqN8f8S',
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  },

  production: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    dialect: 'postgres',
    logging: false,
    pool: {
      max: 20,
      min: 5,
      acquire: 30000,
      idle: 10000
    },
    ssl: process.env.DB_SSL === 'true' ? {
      require: true,
      rejectUnauthorized: false
    } : false
  },

  test: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5433,
    database: process.env.DB_NAME || 'sap_test',
    username: process.env.DB_USER || 'sap_user',
    password: process.env.DB_PASSWORD || 'P6v5AbvmO_EZQWVI.CqN8f8S',
    dialect: 'postgres',
    logging: false
  }
};

// Export configuration based on NODE_ENV
const environment = process.env.NODE_ENV || 'development';
module.exports = config[environment];