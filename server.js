import express from "express";
import { Resend } from "resend";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

// ✅ Verificar variables de entorno al arrancar
if (!process.env.RESEND_API_KEY) {
  console.error("❌ Falta RESEND_API_KEY en las variables de entorno");
  console.error("→ Creá una API key en resend.com y agregala en Render → Environment");
  process.exit(1);
}

const EMAIL_DESTINO = process.env.EMAIL_DESTINO;

if (!process.env.EMAIL_DESTINO) {
  console.error("❌ Falta EMAIL_DESTINO en las variables de entorno");
  process.exit(1);
}

console.log("✅ RESEND_API_KEY cargada correctamente");
console.log("📧 Los briefs van a llegar a:", EMAIL_DESTINO);

const resend = new Resend(process.env.RESEND_API_KEY);

const app = express();

app.set("trust proxy", 1);
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: "Demasiados intentos. Probá de nuevo en 15 minutos." },
});
app.use("/api/", limiter);

// CORS
app.use(cors({
  origin: [
    "https://belenaraceli.com",
    "http://localhost:3000",
    "http://127.0.0.1:5500",
  ],
}));

// ─────────────────────────────────────────
// ENDPOINT PRINCIPAL
// ─────────────────────────────────────────
app.post("/api/contacto", async (req, res) => {
  const data = req.body;

  console.log("📥 Nuevo brief de:", data.email);

  if (!data.email || !data.nombre || !data.problema) {
    return res.status(400).json({ error: "Faltan campos obligatorios." });
  }

  if (data.website) {
    return res.status(400).json({ error: "Bot detectado." });
  }

  // ── HTML del email ──────────────────────
  const row = (label, value) =>
    value
      ? `<tr>
           <td style="padding:10px 16px;color:#8a8476;font-size:13px;white-space:nowrap;vertical-align:top;width:180px;">${label}</td>
           <td style="padding:10px 16px;color:#1a1a18;font-size:13px;line-height:1.6;">${String(value).replace(/\n/g, "<br/>")}</td>
         </tr>`
      : "";

  const section = (title, rows) => `
    <tr>
      <td colspan="2" style="padding:24px 16px 6px;font-size:16px;font-weight:600;color:#141410;border-top:2px solid #f0ece2;">
        ${title}
      </td>
    </tr>${rows}`;

  const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f5f0e8;font-family:'Helvetica Neue',Arial,sans-serif;">
<div style="max-width:640px;margin:32px auto;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 2px 20px rgba(0,0,0,0.08);">

  <div style="background:#141410;padding:36px;text-align:center;">
    <div style="font-size:28px;color:#f0ece2;font-weight:300;">Belén Araceli</div>
    <div style="font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:#8a7a5c;margin-top:8px;">Nuevo Brief Recibido</div>
  </div>

  <div style="padding:20px 16px 8px;">
    <div style="background:#fdf0ea;border-left:3px solid #b85c2c;border-radius:0 6px 6px 0;padding:12px 16px;font-size:13px;color:#7d5a40;">
      De: <strong>${data.nombre}</strong>${data.empresa ? ` · ${data.empresa}` : ""} — 
      <a href="mailto:${data.email}" style="color:#b85c2c;">${data.email}</a>
      ${data.telefono ? ` · ${data.telefono}` : ""}
    </div>
  </div>

  <table style="width:100%;border-collapse:collapse;">
    ${section("01 · Contacto", `
      ${row("Nombre", data.nombre)}
      ${row("Empresa / Marca", data.empresa)}
      ${row("Email", data.email)}
      ${row("Teléfono", data.telefono)}
      ${row("Ciudad", data.ciudad)}
    `)}
    ${section("02 · El Negocio", `
      ${row("Descripción", data.descripcion_negocio)}
      ${row("Antigüedad", data.antiguedad)}
      ${row("Rubro", data.rubro)}
      ${row("Propuesta de valor", data.propuesta_valor)}
      ${row("Competidores", data.competidores)}
    `)}
    ${section("03 · El Proyecto", `
      ${row("Tipo", Array.isArray(data.tipo_proyecto) ? data.tipo_proyecto.join(", ") : data.tipo_proyecto)}
      ${row("Sitio actual", data.sitio_actual)}
      ${row("Problema a resolver", data.problema)}
      ${row("Objetivos", data.objetivos)}
    `)}
    ${section("04 · Audiencia", `
      ${row("Cliente ideal", data.cliente_ideal)}
      ${row("B2C / B2B", data.b2c_b2b)}
      ${row("Alcance", data.alcance)}
    `)}
    ${section("05 · Estilo", `
      ${row("Identidad visual", data.identidad_visual)}
      ${row("Referencias", data.referencias_web)}
      ${row("Estilo deseado", Array.isArray(data.estilo) ? data.estilo.join(", ") : data.estilo)}
      ${row("No quiere", data.no_quiero)}
    `)}
    ${section("06 · Funcionalidades", `
      ${row("Funcionalidades", Array.isArray(data.funcionalidades) ? data.funcionalidades.join(", ") : data.funcionalidades)}
      ${row("Extra", data.funcionalidad_otra)}
    `)}
    ${section("07 · Contenido", `
      ${row("Textos", data.textos)}
      ${row("Fotos", data.fotos)}
      ${row("Páginas", data.paginas)}
      ${row("Administración", data.cms)}
    `)}
    ${section("08 · Tiempos y presupuesto", `
      ${row("Urgencia", data.urgencia)}
      ${row("Fecha límite", data.fecha_limite)}
      ${row("Presupuesto", data.presupuesto)}
    `)}
    ${section("09 · Adicional", `
      ${row("Dominio / Hosting", data.dominio_hosting)}
      ${row("Comentarios", data.comentarios)}
      ${row("Cómo llegó", data.como_llegaste)}
    `)}
  </table>

  <div style="background:#f5f0e8;padding:20px 32px;text-align:center;font-size:11px;color:#a09888;letter-spacing:0.06em;">
    belenaraceli.com · Brief de Proyecto Web
  </div>
</div>
</body></html>`.trim();

  try {
    const { data: result, error } = await resend.emails.send({
      from: "Brief <brief@belenaraceli.com>",  // dominio gratuito de Resend
      to: EMAIL_DESTINO,
      replyTo: data.email,
      subject: `✨ Nuevo Brief — ${data.nombre}${data.empresa ? " · " + data.empresa : ""}`,
      html,
    });

    if (error) {
      console.error("❌ Error de Resend:", error);
      return res.status(500).json({ error: "Error al enviar el email." });
    }

    console.log(`✅ Brief enviado — ID: ${result.id} — Cliente: ${data.nombre} <${data.email}>`);
    res.json({ ok: true });

  } catch (err) {
    console.error("❌ Error inesperado:", err.message);
    res.status(500).json({ error: "Error al enviar el email." });
  }
});

// Health check
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Servidor de brief activo 🚀" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});