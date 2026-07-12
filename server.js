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

// Inicializar la base de datos con soporte para la estructura DUAL (64-bits y 32-bits Retro)
const initDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS configuracion (
        id SERIAL PRIMARY KEY,
        clave VARCHAR(50) UNIQUE NOT NULL,
        valor TEXT NOT NULL
      );
    `);
    
    // --- PROTOCOLOS DE INSERCIÓN ARQUITECTURA STANDARD (64 BITS) ---
    const res64 = await pool.query("SELECT * FROM configuracion WHERE clave = 'version'");
    if (res64.rowCount === 0) {
      await pool.query("INSERT INTO configuracion (clave, valor) VALUES ('version', '4.0')");
    }
    await pool.query(`
      INSERT INTO configuracion (clave, valor) 
      VALUES ('url_juego_zip', 'https://tu-enlace-aqui.com/juego.zip') 
      ON CONFLICT (clave) DO NOTHING;
    `);
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

    // --- 🌟 NUEVO: PROTOCOLOS DE INSERCIÓN RAMA RETRO (32 BITS - IBM THINKCENTRE) ---
    const res32 = await pool.query("SELECT * FROM configuracion WHERE clave = 'version_32'");
    if (res32.rowCount === 0) {
      await pool.query("INSERT INTO configuracion (clave, valor) VALUES ('version_32', '1.0')");
    }
    await pool.query(`
      INSERT INTO configuracion (clave, valor) 
      VALUES ('url_juego_zip_32', 'https://tu-enlace-aqui.com/juego32.zip') 
      ON CONFLICT (clave) DO NOTHING;
    `);
    await pool.query(`
      INSERT INTO configuracion (clave, valor) 
      VALUES ('url_updater_version_32', '1.0') 
      ON CONFLICT (clave) DO NOTHING;
    `);
    await pool.query(`
      INSERT INTO configuracion (clave, valor) 
      VALUES ('url_updater_exe_32', 'https://tu-enlace-aqui.com/SteelAndPowderUpdater32.exe') 
      ON CONFLICT (clave) DO NOTHING;
    `);

    // Limpieza de basura obsoleta antigua
    await pool.query("DELETE FROM configuracion WHERE clave IN ('url_exe', 'url_data_win', 'url_options_ini')");

    console.log("PostgreSQL Inicializada y Segmentada en (64-bits / 32-bits) con éxito.");
  } catch (err) {
    console.error("Error al inicializar la base de datos unificada:", err);
  }
};
initDB();

// --- INTERFAZ GRÁFICA CONTROL DE MANDOS (Dashboard Avanzado Multiarquitectura) ---
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
        <title>S&P Dual Core Control</title>
        <style>
          :root {
            --bg-color: #070a12;
            --panel-color: #0f1626;
            --accent-color: #00f2fe;
            --accent-32: #eab308; /* Color Amarillo Táctico para la IBM ThinkCentre */
            --accent-updater: #ff3c46; 
            --accent-pack: #10b981; 
            --text-color: #f1f5f9;
            --text-muted: #64748b;
            --success-color: #10b981;
            --border-panel: #1e293b;
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
            max-width: 800px;
            padding: 35px;
            border-radius: 16px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6);
            border: 1px solid var(--border-panel);
          }
          h1 {
            font-size: 26px;
            margin-top: 0;
            text-transform: uppercase;
            letter-spacing: 2px;
            color: var(--accent-color);
            border-bottom: 2px solid rgba(0, 242, 254, 0.2);
            padding-bottom: 10px;
            text-align: center;
          }
          .status {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 10px;
            font-size: 13px;
            color: var(--success-color);
            margin-bottom: 30px;
            font-weight: bold;
          }
          .status-dot {
            width: 9px;
            height: 9px;
            background-color: var(--success-color);
            border-radius: 50%;
            box-shadow: 0 0 10px var(--success-color);
          }
          .columns-container {
            display: flex;
            gap: 25px;
            flex-wrap: wrap;
          }
          .architecture-column {
            flex: 1;
            min-width: 320px;
            background: rgba(255, 255, 255, 0.02);
            padding: 20px;
            border-radius: 12px;
            border: 1px solid rgba(255, 255, 255, 0.05);
          }
          .architecture-column.x64 { border-top: 4px solid var(--accent-color); }
          .architecture-column.x32 { border-top: 4px solid var(--accent-32); }
          
          h2 {
            font-size: 15px;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-top: 5px;
            margin-bottom: 20px;
            padding-bottom: 8px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          }
          .x64 h2 { color: var(--accent-color); }
          .x32 h2 { color: var(--accent-32); }

          .sub-title {
            font-size: 11px;
            text-transform: uppercase;
            color: var(--text-muted);
            margin-top: 15px;
            font-weight: bold;
            letter-spacing: 0.5px;
          }
          .form-group {
            margin-bottom: 15px;
          }
          label {
            display: block;
            font-size: 11px;
            color: #94a3b8;
            margin-bottom: 6px;
          }
          input[type="text"] {
            width: 100%;
            padding: 10px;
            background-color: #060911;
            border: 1px solid #334155;
            border-radius: 6px;
            color: var(--text-color);
            font-size: 13px;
            box-sizing: border-box;
            transition: border-color 0.3s;
          }
          .x64 input[type="text"]:focus { outline: none; border-color: var(--accent-color); }
          .x32 input[type="text"]:focus { outline: none; border-color: var(--accent-32); }
          
          button {
            width: 100%;
            padding: 15px;
            background: linear-gradient(135deg, #0f172a, #1e293b);
            border: 1px solid var(--accent-color);
            border-radius: 8px;
            color: #00f2fe;
            font-weight: bold;
            font-size: 16px;
            cursor: pointer;
            margin-top: 25px;
            text-transform: uppercase;
            letter-spacing: 1px;
            transition: all 0.2s ease;
          }
          button:hover {
            background: linear-gradient(135deg, #0052d4, var(--accent-color));
            color: #fff;
            box-shadow: 0 0 15px rgba(0, 242, 254, 0.4);
            transform: translateY(-1px);
          }
          footer {
            margin-top: 30px;
            text-align: center;
            font-size: 11px;
            color: var(--text-muted);
          }
        </style>
      </head>
      <body>
        <div class="dashboard">
          <h1>S&P Matrix Cloud Network</h1>
          <div class="status">
            <div class="status-dot"></div>
            <span>Servidor Central Activo // Gestión de Despliegue Multi-Core</span>
          </div>
            
          <form action="/update-config" method="POST">
            <div class="columns-container">
              
              <div class="architecture-column x64">
                <h2>Ecosistema Standard (64-Bits)</h2>
                
                <div class="form-group">
                  <label for="version">Versión del Juego Principal</label>
                  <input type="text" id="version" name="version" value="${config.version || '4.0'}" required>
                </div>
                
                <div class="sub-title" style="color: var(--accent-pack)">Ficheros Binarios:</div>
                <div class="form-group">
                  <label for="url_juego_zip">URL de descarga (juego.zip)</label>
                  <input type="text" id="url_juego_zip" name="url_juego_zip" value="${config.url_juego_zip || ''}" placeholder="Enlace directo zip de 64 bits" required>
                </div>
                
                <div class="sub-title" style="color: var(--accent-updater)">Kernel Auto-Updater:</div>
                <div class="form-group">
                  <label for="url_updater_version">Versión Interna Updater</label>
                  <input type="text" id="url_updater_version" name="url_updater_version" value="${config.url_updater_version || '4.5'}" required>
                </div>
                <div class="form-group">
                  <label for="url_updater_exe">URL ejecutable (SteelAndPowderUpdater.exe)</label>
                  <input type="text" id="url_updater_exe" name="url_updater_exe" value="${config.url_updater_exe || ''}" required>
                </div>
              </div>

              <div class="architecture-column x32">
                <h2>Ecosistema Retro (32-Bits XP)</h2>
                
                <div class="form-group">
                  <label for="version_32">Versión de Steel & Powder 32</label>
                  <input type="text" id="version_32" name="version_32" value="${config.version_32 || '1.0'}" required>
                </div>
                
                <div class="sub-title" style="color: var(--accent-pack)">Ficheros Binarios (GM 1.4 + data.win):</div>
                <div class="form-group">
                  <label for="url_juego_zip_32">URL de descarga (juego_32.zip)</label>
                  <input type="text" id="url_juego_zip_32" name="url_juego_zip_32" value="${config.url_juego_zip_32 || ''}" placeholder="Enlace directo zip de 32 bits" required>
                </div>
                
                <div class="sub-title" style="color: var(--accent-updater)">Kernel Auto-Updater XP:</div>
                <div class="form-group">
                  <label for="url_updater_version_32">Versión Interna Updater XP</label>
                  <input type="text" id="url_updater_version_32" name="url_updater_version_32" value="${config.url_updater_version_32 || '1.0'}" required>
                </div>
                <div class="form-group">
                  <label for="url_updater_exe_32">URL ejecutable XP (SteelAndPowderUpdater32.exe)</label>
                  <input type="text" id="url_updater_exe_32" name="url_updater_exe_32" value="${config.url_updater_exe_32 || ''}" required>
                </div>
              </div>

            </div>
            
            <button type="submit">Sincronizar Ambas Redes en Caliente</button>
          </form>
          
          <footer>Diamant OS Custom Engine // Segmentación de Núcleos 2026</footer>
        </div>
      </body>
      </html>
    `);
  } catch (err) {
    res.status(500).send("Error cargando el panel de control multi-núcleo.");
  }
});

// Procesar los cambios globales en lote de ambas arquitecturas
app.post('/update-config', async (req, res) => {
  const { 
    version, url_juego_zip, url_updater_version, url_updater_exe,
    version_32, url_juego_zip_32, url_updater_version_32, url_updater_exe_32 
  } = req.body;
  try {
    // Actualizar bloque de 64 bits
    await pool.query("UPDATE configuracion SET valor = $1 WHERE clave = 'version'", [version]);
    await pool.query("UPDATE configuracion SET valor = $1 WHERE clave = 'url_juego_zip'", [url_juego_zip]);
    await pool.query("UPDATE configuracion SET valor = $1 WHERE clave = 'url_updater_version'", [url_updater_version]);
    await pool.query("UPDATE configuracion SET ... WHERE ...", [url_updater_exe]); // Sincronizado dinámicamente
    await pool.query("UPDATE configuracion SET valor = $1 WHERE clave = 'url_updater_exe'", [url_updater_exe]);
    
    // Actualizar bloque de 32 bits
    await pool.query("UPDATE configuracion SET valor = $1 WHERE clave = 'version_32'", [version_32]);
    await pool.query("UPDATE configuracion SET valor = $1 WHERE clave = 'url_juego_zip_32'", [url_juego_zip_32]);
    await pool.query("UPDATE configuracion SET valor = $1 WHERE clave = 'url_updater_version_32'", [url_updater_version_32]);
    await pool.query("UPDATE configuracion SET valor = $1 WHERE clave = 'url_updater_exe_32'", [url_updater_exe_32]);
    
    res.send("<script>alert('¡Ambos ecosistemas (64 y 32 bits) actualizados en PostgreSQL!'); window.location.href='/';</script>");
  } catch (err) {
    res.status(500).send("Error al inyectar configuraciones en PostgreSQL.");
  }
});

// ==========================================================
//    ENDPOINTS DE CONSULTA DE LA RAMA ESTÁNDAR (64-BITS)
// ==========================================================
app.get('/version', async (req, res) => {
  try {
    const resultado = await pool.query("SELECT valor FROM configuracion WHERE clave = 'version'");
    res.send(resultado.rows[0].valor);
  } catch (err) { res.status(500).send("Error"); }
});

app.get('/updater/version', async (req, res) => {
  try {
    const resultado = await pool.query("SELECT valor FROM configuracion WHERE clave = 'url_updater_version'");
    res.send(resultado.rows[0].valor);
  } catch (err) { res.status(500).send("Error"); }
});

app.get('/download/juego.zip', async (req, res) => {
  try {
    const resultado = await pool.query("SELECT valor FROM configuracion WHERE clave = 'url_juego_zip'");
    res.redirect(resultado.rows[0].valor);
  } catch (err) { res.status(500).send("Error"); }
});

app.get('/download/SteelAndPowderUpdater.exe', async (req, res) => {
  try {
    const resultado = await pool.query("SELECT valor FROM configuracion WHERE clave = 'url_updater_exe'");
    res.redirect(resultado.rows[0].valor);
  } catch (err) { res.status(500).send("Error"); }
});


// ==========================================================
// 🌟 NUEVO: ENDPOINTS DE CONSULTA RAMA RETRO (32-BITS XP)
// ==========================================================

// Consulta de versión para el juego de GameMaker 1.4 (o su updater) en XP
app.get('/32/version', async (req, res) => {
  try {
    const resultado = await pool.query("SELECT valor FROM configuracion WHERE clave = 'version_32'");
    res.send(resultado.rows[0].valor);
  } catch (err) { res.status(500).send("Error"); }
});

// Consulta de versión del Kernel del actualizador de 32 bits
app.get('/32/updater/version', async (req, res) => {
  try {
    const resultado = await pool.query("SELECT valor FROM configuracion WHERE clave = 'url_updater_version_32'");
    res.send(resultado.rows[0].valor);
  } catch (err) { res.status(500).send("Error"); }
});

// Redirección del ZIP unificado de 32 bits (Contiene: Steel_&_powder.exe, data.win, D3DX9_43.dll)
app.get('/32/download/juego.zip', async (req, res) => {
  try {
    const resultado = await pool.query("SELECT valor FROM configuracion WHERE clave = 'url_juego_zip_32'");
    res.redirect(resultado.rows[0].valor);
  } catch (err) { res.status(500).send("Error"); }
});

// Redirección del ejecutable del auto-updater compilado para 32-bits / XP
app.get('/32/download/SteelAndPowderUpdater.exe', async (req, res) => {
  try {
    const resultado = await pool.query("SELECT valor FROM configuracion WHERE clave = 'url_updater_exe_32'");
    res.redirect(resultado.rows[0].valor);
  } catch (err) { res.status(500).send("Error"); }
});

app.listen(PORT, () => {
  console.log(`Servidor de despliegue Dual-Core activo en puerto ${PORT}`);
});
