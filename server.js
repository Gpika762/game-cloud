const express = require('express');
const { Pool } = require('pg');
const app = express();
const PORT = process.env.PORT || 3000;

// Configurar Express para entender formularios y JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Conexión a tu base de datos de Render
const pool = new Pool({
  connectionString: "postgresql://diamant_admin:1eHyGEphrKH6LATzknJtF9FZysglyKIq@dpg-d8ur56vavr4c73fltc2g-a/diamant_os",
  ssl: { rejectUnauthorized: false }
});

// Inicializar la base de datos
const initDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS configuracion (
        id SERIAL PRIMARY KEY,
        clave VARCHAR(50) UNIQUE NOT NULL,
        valor TEXT NOT NULL
      );
    `);
    
    const res = await pool.query("SELECT * FROM configuracion WHERE clave = 'version'");
    if (res.rowCount === 0) {
      await pool.query("INSERT INTO configuracion (clave, valor) VALUES ('version', '2.3')");
      await pool.query("INSERT INTO configuracion (clave, valor) VALUES ('url_data_win', 'https://tu-enlace-aqui.com/data.win')");
      await pool.query("INSERT INTO configuracion (clave, valor) VALUES ('url_exe', 'https://tu-enlace-aqui.com/SteelAndPowder.exe')");
    }
  } catch (err) {
    console.error("Error al inicializar DB:", err);
  }
};
initDB();

// --- INTERFAZ GRÁFICA BONITA (Dashboard) ---
app.get('/', async (req, res) => {
  try {
    const datos = await pool.query("SELECT * FROM configuracion");
    const config = {};
    datos.rows.forEach(row => { config[row.clave] = row.valor; });

    // HTML y CSS incrustado con diseño premium oscuro
    res.send(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>S&P Core Control</title>
        <style>
          :root {
            --bg-color: #0b0f19;
            --panel-color: #151d30;
            --accent-color: #00f2fe;
            --text-color: #f1f5f9;
            --text-muted: #64748b;
            --success-color: #10b981;
          }
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: var(--bg-color);
            color: var(--text-color);
            margin: 0;
            padding: 20px;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
          }
          .dashboard {
            background-color: var(--panel-color);
            width: 100%;
            max-width: 600px;
            padding: 30px;
            border-radius: 16px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
            border: 1px solid rgba(0, 242, 254, 0.1);
          }
          h1 {
            font-size: 24px;
            margin-top: 0;
            text-transform: uppercase;
            letter-spacing: 2px;
            color: var(--accent-color);
            border-bottom: 2px solid rgba(0, 242, 254, 0.2);
            padding-bottom: 10px;
          }
          .status {
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 14px;
            color: var(--success-color);
            margin-bottom: 25px;
          }
          .status-dot {
            width: 8px;
            height: 8px;
            background-color: var(--success-color);
            border-radius: 50%;
            box-shadow: 0 0 8px var(--success-color);
          }
          .form-group {
            margin-bottom: 20px;
          }
          label {
            display: block;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: var(--text-muted);
            margin-bottom: 8px;
          }
          input[type="text"] {
            width: 100%;
            padding: 12px;
            background-color: #0b0f19;
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            color: var(--text-color);
            font-size: 14px;
            box-sizing: border-box;
            transition: border-color 0.3s;
          }
          input[type="text"]:focus {
            outline: none;
            border-color: var(--accent-color);
          }
          button {
            width: 100%;
            padding: 14px;
            background: linear-gradient(135deg, #0072ff, var(--accent-color));
            border: none;
            border-radius: 8px;
            color: #fff;
            font-weight: bold;
            font-size: 16px;
            cursor: pointer;
            transition: transform 0.2s, opacity 0.2s;
          }
          button:hover {
            opacity: 0.9;
            transform: translateY(-1px);
          }
          button:active {
            transform: translateY(1px);
          }
          footer {
            margin-top: 25px;
            text-align: center;
            font-size: 11px;
            color: var(--text-muted);
          }
        </style>
      </head>
      <body>
        <div class="dashboard">
          <h1>S&P Cloud Deployment</h1>
          <div class="status">
            <div class="status-dot"></div>
            <span>Servidor Central Activo & Conectado a PostgreSQL</span>
          </div>
          
          <form action="/update-config" method="POST">
            <div class="form-group">
              <label for="version">Versión Global Activa</label>
              <input type="text" id="version" name="version" value="${config.version || '2.3'}" required>
            </div>
            
            <div class="form-group">
              <label for="url_exe">URL de Descarga: SteelAndPowder.exe</label>
              <input type="text" id="url_exe" name="url_exe" value="${config.url_exe || ''}" required>
            </div>
            
            <div class="form-group">
              <label for="url_data_win">URL de Descarga: data.win (Archivo Pesado)</label>
              <input type="text" id="url_data_win" name="url_data_win" value="${config.url_data_win || ''}" required>
            </div>
            
            <button type="submit">Guardar Cambios en Servidor</button>
          </form>
          
          <footer>Diamant OS Core Engine // 2026</footer>
        </div>
      </body>
      </html>
    `);
  } catch (err) {
    res.status(500).send("Error cargando el panel de control.");
  }
});

// Ruta para procesar los cambios del formulario web
app.post('/update-config', async (req, res) => {
  const { version, url_exe, url_data_win } = req.body;
  try {
    await pool.query("UPDATE configuracion SET valor = $1 WHERE clave = 'version'", [version]);
    await pool.query("UPDATE configuracion SET valor = $1 WHERE clave = 'url_exe'", [url_exe]);
    await pool.query("UPDATE configuracion SET valor = $1 WHERE clave = 'url_data_win'", [url_data_win]);
    res.send("<script>alert('¡Configuración guardada en PostgreSQL con éxito!'); window.location.href='/';</script>");
  } catch (err) {
    res.status(500).send("Error al actualizar la base de datos.");
  }
});

// --- APIS PARA EL JUEGO (.BAT) ---

app.get('/version', async (req, res) => {
  try {
    const resultado = await pool.query("SELECT valor FROM configuracion WHERE clave = 'version'");
    res.send(resultado.rows[0].valor);
  } catch (err) {
    res.status(500).send("Error");
  }
});

app.get('/download/data.win', async (req, res) => {
  try {
    const resultado = await pool.query("SELECT valor FROM configuracion WHERE clave = 'url_data_win'");
    res.redirect(resultado.rows[0].valor);
  } catch (err) {
    res.status(500).send("Error");
  }
});

app.get('/download/SteelAndPowder.exe', async (req, res) => {
  try {
    const resultado = await pool.query("SELECT valor FROM configuracion WHERE clave = 'url_exe'");
    res.redirect(resultado.rows[0].valor);
  } catch (err) {
    res.status(500).send("Error");
  }
});

app.listen(PORT, () => {
  console.log(`Servidor activo en puerto ${PORT}`);
});
