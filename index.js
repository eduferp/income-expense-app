const express = require("express");
const { Pool } = require("pg");

const app = express();
app.use(express.json());

// 🔴 DEBUG CLAVE (déjalo por ahora)
console.log("DATABASE_URL:", process.env.DATABASE_URL);

// Conexión PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Ruta base
app.get("/", (req, res) => {
  res.send("API de Ingresos y Egresos con PostgreSQL 🚀");
});

// =======================
// INGRESOS
// =======================
app.post("/ingresos", async (req, res) => {
  const { descripcion, monto } = req.body;

  if (!descripcion || !monto) {
    return res.status(400).json({ error: "Faltan datos" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO transactions (description, amount, type) VALUES ($1, $2, 'ingreso') RETURNING *",
      [descripcion, monto]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("DB ERROR:", error);
    res.status(500).json({ error: "Error al crear ingreso" });
  }
});

// =======================
// SERVER
// =======================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
