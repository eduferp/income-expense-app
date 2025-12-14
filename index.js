require("dotenv").config();
const express = require("express");
const { Pool } = require("pg");

const app = express();
app.use(express.json());

// =======================
// CONEXIÓN POSTGRES (Railway OK)
// =======================
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// =======================
// RUTA BASE
// =======================
app.get("/", (req, res) => {
  res.send("API de Ingresos y Egresos con PostgreSQL 🚀");
});

// =======================
// INGRESOS
// =======================

// Crear ingreso
app.post("/ingresos", async (req, res) => {
  // Acepta ambos formatos
  const descripcion = req.body.descripcion || req.body.description;
  const monto = req.body.monto || req.body.amount;

  if (!descripcion || !monto) {
    return res.status(400).json({
      error: "descripcion y monto son requeridos",
    });
  }

  try {
    const result = await pool.query(
      `INSERT INTO transactions (description, amount, type)
       VALUES ($1, $2, 'ingreso')
       RETURNING *`,
      [descripcion, monto]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("ERROR INGRESO:", error.message);
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
    console.error(error.message);
    res.status(500).json({ error: "Error al obtener ingresos" });
  }
});

// =======================
// EGRESOS
// =======================

// Crear egreso
app.post("/egresos", async (req, res) => {
  const descripcion = req.body.descripcion || req.body.description;
  const monto = req.body.monto || req.body.amount;

  if (!descripcion || !monto) {
    return res.status(400).json({
      error: "descripcion y monto son requeridos",
    });
  }

  try {
    const result = await pool.query(
      `INSERT INTO transactions (description, amount, type)
       VALUES ($1, $2, 'egreso')
       RETURNING *`,
      [descripcion, monto]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("ERROR EGRESO:", error.message);
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
    console.error(error.message);
    res.status(500).json({ error: "Error al obtener egresos" });
  }
});

// =======================
// BALANCE
// =======================
app.get("/balance", async (req, res) => {
  try {
    const ingresos = await pool.query(
      "SELECT COALESCE(SUM(amount), 0) AS total FROM transactions WHERE type = 'ingreso'
