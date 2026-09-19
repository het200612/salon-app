const mysql = require('mysql2');
require('dotenv').config();

/**
 * MySQL connection pool.
 * Using a pool instead of a single connection for better performance
 * and automatic connection management under concurrent requests.
 */
const pool = mysql.createPool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT) || 3306,
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME     || 'salondb',
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0,
});

// Promisify the pool so we can use async/await
const promisePool = pool.promise();

/**
 * Test the database connection on startup.
 * Logs success or exits the process on failure.
 */
async function testConnection() {
  try {
    const [rows] = await promisePool.query('SELECT 1 AS connected');
    if (rows[0].connected === 1) {
      console.log('✅  MySQL connected successfully.');
    }
  } catch (err) {
    console.error('❌  MySQL connection failed:', err.message);
    process.exit(1);
  }
}

module.exports = { pool: promisePool, testConnection };
