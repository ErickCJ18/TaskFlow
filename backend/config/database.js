const mysql = require('mysql2/promise');
require('dotenv').config();

let pool;

const connectDB = async () => {
  try {
    pool = await mysql.createPool({
      host:     process.env.DB_HOST     || 'localhost',
      port:     parseInt(process.env.DB_PORT) || 3306,
      database: process.env.DB_DATABASE || 'taskflowdb',
      user:     process.env.DB_USER     || 'root',
      password: process.env.DB_PASSWORD || '',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    await pool.query('SELECT 1');
    console.log('✅ Conectado a MySQL exitosamente');
    await initializeDatabase();
  } catch (err) {
    console.error('❌ Error al conectar a MySQL:', err.message);
    process.exit(1);
  }
};

const initializeDatabase = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS Users (
        id        INT AUTO_INCREMENT PRIMARY KEY,
        name      VARCHAR(100) NOT NULL,
        email     VARCHAR(150) NOT NULL UNIQUE,
        password  VARCHAR(255) NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS Tasks (
        id          INT AUTO_INCREMENT PRIMARY KEY,
        userId      INT NOT NULL,
        title       VARCHAR(200) NOT NULL,
        description TEXT,
        priority    ENUM('Alta','Media','Baja') DEFAULT 'Media',
        status      ENUM('Pendiente','En Progreso','Completada') DEFAULT 'Pendiente',
        dueDate     DATE,
        createdAt   DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt   DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
      )
    `);

    console.log('✅ Base de datos inicializada correctamente');
  } catch (err) {
    console.error('❌ Error al inicializar la base de datos:', err.message);
  }
};

const getPool = () => pool;

module.exports = { connectDB, getPool };
