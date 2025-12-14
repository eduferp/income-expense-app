require("dotenv").config();
const express = require("express");
const { Pool } = require("pg");

const app = express();
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Inicializar DB
const initDB = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS transactions (
      id SERIAL PRIMARY KEY,
      description TEXT NOT NULL,
      amount NUMERIC NOT NULL,
      type VARCHAR(10) NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
};
initDB();

// Ruta base
app.get("/", (req, res) => {
  res.send("API de Ingresos y Egresos con PostgreSQL 🚀");
});

// Crear ingreso
app.post("/ingresos", async (req, res) => {
  const { description, amount } = req.body;

  try {
    const result = await pool.query(
      "INSERT INTO transactions (description, amount, type) VALUES ($1, $2, 'ingreso') RETURNING *",
      [description, amount]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: error.message });
  }
});

// Listar ingresos
app.get("/ingresos", async (req, res) => {
  const result = await pool.query(
    "SELECT * FROM transactions WHERE type='ingreso' ORDER BY created_at DESC"
  );
  res.json(result.rows);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
