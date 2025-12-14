require("dotenv").config();
const express = require("express");
const { Pool } = require("pg");

const app = express();
app.use(express.json());

// Conexión a PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Ruta base
app.get("/", (req, res) => {
  res.send("API de Ingresos y Egresos con PostgreSQL 🚀");
});


// =======================
// INGRESOS
// =======================

// Crear ingreso
app.post("/ingresos", async (req, res) => {
  const { descripcion, monto } = req.body;

  try {
    const result = await pool.query(
      "INSERT INTO transactions (description, amount, type) VALUES ($1, $2, 'ingreso') RETURNING *",
      [descripcion, monto]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear ingreso" });
  }
});

// Listar ingresos
app.get("/ingresos", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM transactions WHERE type = 'ingreso' ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener ingresos" });
  }
});


// =======================
// EGRESOS
// =======================

// Crear egreso
app.post("/egresos", async (req, res) => {
  const { descripcion, monto } = req.body;

  try {
    const result = await pool.query(
      "INSERT INTO transactions (description, amount, type) VALUES ($1, $2, 'egreso') RETURNING *",
      [descripcion, monto]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear egreso" });
  }
});

// Listar egresos
app.get("/egresos", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM transactions WHERE type = 'egreso' ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener egresos" });
  }
});


// =======================
// BALANCE
// =======================

app.get("/balance", async (req, res) => {
  try {
    const ingresos = await pool.query(
      "SELECT COALESCE(SUM(amount), 0) AS total FROM transactions WHERE type = 'ingreso'"
    );

    const egresos = await pool.query(
      "SELECT COALESCE(SUM(amount), 0) AS total FROM transactions WHERE type = 'egreso'"
    );

    const totalIngresos = Number(ingresos.rows[0].total);
    const totalEgresos = Number(egresos.rows[0].total);

    res.json({
      totalIngresos,
      totalEgresos,
      balance: totalIngresos - totalEgresos,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al calcular balance" });
  }
});


// =======================
// SERVER
// =======================

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

