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

// Inicializar la base de datos con soporte para la nueva estructura unificada del ZIP
const initDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS configuracion (
        id SERIAL PRIMARY KEY,
        clave VARCHAR(50) UNIQUE NOT NULL,
        valor TEXT NOT NULL
      );
    `);
    
    // Verificar e insertar versión base del juego
    const res = await pool.query("SELECT * FROM configuracion WHERE clave = 'version'");
    if (res.rowCount === 0) {
      await pool.query("INSERT INTO configuracion (clave, valor) VALUES ('version', '4.0')");
    }

    // 🌟 NUEVO: Asegurar que exista la clave para el archivo ZIP unificado
    await pool.query(`
      INSERT INTO configuracion (clave, valor) 
      VALUES ('url_juego_zip', 'https://tu-enlace-aqui.com/juego.zip') 
      ON CONFLICT (clave) DO NOTHING;
    `);

    // Asegurar que existan las claves para el Auto-Updater (C#)
    await pool.query(`
      INSERT INTO configuracion (clave, valor) 
      VALUES ('url_updater_version', '4.0') 
      ON CONFLICT (clave) DO NOTHING;
    `);
    await pool.query(`
      INSERT INTO configuracion (clave, valor) 
      VALUES ('url_updater_exe', 'https://tu-enlace-aqui.com/SteelAndPowderUpdater.exe') 
      ON CONFLICT (clave) DO NOTHING;
    `);

    // Opcional: Limpiar las claves antiguas obsoletas para que no dejen basura en tu DB
    await pool.query("DELETE FROM configuracion WHERE clave IN ('url_exe', 'url_data_win', 'url_options_ini')");

  } catch (err) {
    console.error("Error al inicializar la base de datos unificada:", err);
  }
};
initDB();

// --- INTERFAZ GRÁFICA CONTROL DE MANDOS (Dashboard Simplificado) ---
app.get('/', async (req, res) => {
  try {
    const datos = await pool.query("SELECT * FROM configuracion");
    const config = {};
    datos.rows.forEach(row => { config[row.clave] = row.valor; });

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
            --accent-updater: #ff3c46; 
            --accent-pack: #10b981; 
            --text-color: #f1f5f9;
            --text-muted: #64748b;
            --success-color: #10b981;
          }
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: var(--bg-color);
            color: var(--text-color);
            margin: 0;
            padding: 40px 20px;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
          }
          .dashboard {
            background-color: var(--panel-color);
            width: 100%;
            max-width: 650px;
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
          h2 {
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-top: 30px;
            margin-bottom: 15px;
            padding-bottom: 5px;
          }
          .section-game {
            color: var(--accent-color);
            border-bottom: 1px dashed rgba(0, 242, 254, 0.3);
          }
          .section-pack {
            color: var(--accent-pack);
            border-bottom: 1px dashed rgba(16, 185, 129, 0.3);
          }
          .section-updater {
            color: var(--accent-updater);
            border-bottom: 1px dashed rgba(255, 60, 70, 0.3);
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
          .pack-group input[type="text"]:focus {
            border-color: var(--accent-pack);
          }
          .updater-group input[type="text"]:focus {
            border-color: var(--accent-updater);
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
            margin-top: 15px;
            transition: transform 0.2s, opacity 0.2s;
          }
          button:hover {
            opacity: 0.9;
            transform: translateY(-1px);
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
            
            <h2 class="section-game">Configuración del Juego Principal</h2>
            
            <div class="form-group">
              <label for="version">Versión Activa del Juego</label>
              <input type="text" id="version" name="version" value="${config.version || '4.0'}" required>
            </div>
            
            <h2 class="section-pack">Distribución del Despliegue Unificado</h2>

            <div class="form-group pack-group">
              <label for="url_juego_zip">URL del Archivo Completo: juego.zip (Juego + Data + Config)</label>
              <input type="text" id="url_juego_zip" name="url_juego_zip" value="${config.url_juego_zip || ''}" placeholder="Ej: https://link-directo-de-tu-zip.com/juego.zip" required>
            </div>
            
            <h2 class="section-updater">Configuración del Auto-Updater (C#)</h2>
            
            <div class="form-group updater-group">
              <label for="url_updater_version">Versión del Actualizador (Local v4.0)</label>
              <input type="text" id="url_updater_version" name="url_updater_version" value="${config.url_updater_version || '4.0'}" required>
            </div>
            
            <div class="form-group updater-group">
              <label for="url_updater_exe">URL de Descarga: SteelAndPowderUpdater.exe</label>
              <input type="text" id="url_updater_exe" name="url_updater_exe" value="${config.url_updater_exe || ''}" required>
            </div>
            
            <button type="submit">Inyectar Configuración en Caliente</button>
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

// Procesar los cambios en lote de la base de datos
app.post('/update-config', async (req, res) => {
  const { version, url_juego_zip, url_updater_version, url_updater_exe } = req.body;
  try {
    await pool.query("UPDATE configuracion SET valor = $1 WHERE clave = 'version'", [version]);
    await pool.query("UPDATE configuracion SET valor = $1 WHERE clave = 'url_juego_zip'", [url_juego_zip]);
    await pool.query("UPDATE configuracion SET valor = $1 WHERE clave = 'url_updater_version'", [url_updater_version]);
    await pool.query("UPDATE configuracion SET valor = $1 WHERE clave = 'url_updater_exe'", [url_updater_exe]);
    
    res.send("<script>alert('¡Estructura de distribución del ZIP actualizada con éxito en PostgreSQL!'); window.location.href='/';</script>");
  } catch (err) {
    res.status(500).send("Error al actualizar la base de datos.");
  }
});

// ==========================================================
//   ENDPOINTS DE CONSULTA (APIs para el Launcher / Updater)
// ==========================================================

// Consulta Versión del Juego
app.get('/version', async (req, res) => {
  try {
    const resultado = await pool.query("SELECT valor FROM configuracion WHERE clave = 'version'");
    res.send(resultado.rows[0].valor);
  } catch (err) {
    res.status(500).send("Error");
  }
});

// Consulta Versión del Updater ejecutable
app.get('/updater/version', async (req, res) => {
  try {
    const resultado = await pool.query("SELECT valor FROM configuracion WHERE clave = 'url_updater_version'");
    res.send(resultado.rows[0].valor);
  } catch (err) {
    res.status(500).send("Error");
  }
});

// 🌟 RUTA CRÍTICA: Redirección Dinámica del Paquete ZIP Completo del Juego
app.get('/download/juego.zip', async (req, res) => {
  try {
    const resultado = await pool.query("SELECT valor FROM configuracion WHERE clave = 'url_juego_zip'");
    // Redirige directamente al link que guardaste en el Dashboard
    res.redirect(resultado.rows[0].valor);
  } catch (err) {
    res.status(500).send("Error al procesar la descarga del paquete.");
  }
});

// Redirección de Descarga: El nuevo binario del Auto-Updater (.exe)
app.get('/download/SteelAndPowderUpdater.exe', async (req, res) => {
  try {
    const resultado = await pool.query("SELECT valor FROM configuracion WHERE clave = 'url_updater_exe'");
    res.redirect(resultado.rows[0].valor);
  } catch (err) {
    res.status(500).send("Error");
  }
});

app.listen(PORT, () => {
  console.log(`Servidor de despliegue activo en puerto ${PORT}`);
});
