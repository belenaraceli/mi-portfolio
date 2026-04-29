import express from "express";
import nodemailer from "nodemailer";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// 🔴 IMPORTANTE PARA RENDER (arregla tu error de proxy)
app.set("trust proxy", 1);

// 🛡️ Seguridad básica
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🛡️ Limitar spam
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
});
app.use("/api/", limiter);

// 🛡️ CORS (podés después limitarlo a tu dominio)
app.use(cors());

// 📩 Endpoint
app.post("/api/contacto", async (req, res) => {
  const data = req.body;

  console.log("📥 Datos recibidos:", data); // 👈 debug

  // 🛑 Validación mínima
  if (!data.email || !data.nombre || !data.problema) {
    return res.status(400).json({ error: "Faltan campos obligatorios" });
  }

  // 🛑 Anti-bot simple
  if (data.website) {
    return res.status(400).json({ error: "Bot detectado" });
  }

  try {
    // 🔴 TRANSPORTER MEJOR CONFIGURADO
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // 🧾 Contenido del mail
    const contenido = `
Nuevo Brief:

Nombre: ${data.nombre}
Email: ${data.email}
Empresa: ${data.empresa || "-"}

Problema:
${data.problema}

Objetivos:
${data.objetivos || "-"}

Mensaje completo:
${JSON.stringify(data, null, 2)}
    `;

    await transporter.sendMail({
      from: `"Brief Web" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: "Nuevo cliente potencial 🚀",
      text: contenido,
    });

    console.log("✅ Email enviado correctamente");

    res.json({ ok: true });

  } catch (error) {
    console.error("❌ Error real:", error); // 👈 esto te va a decir EXACTO qué falla
    res.status(500).json({ error: "Error al enviar email" });
  }
});

app.listen(3000, () => {
  console.log("🚀 Servidor corriendo en puerto 3000");
});