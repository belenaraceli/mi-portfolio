import express from "express";
import nodemailer from "nodemailer";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// 🛡️ Seguridad básica
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🛡️ Limitar spam (muy importante)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 10, // 10 requests por IP
});
app.use("/api/", limiter);

// 🛡️ CORS (permitir solo tu dominio)
app.use(cors());

// 📩 Endpoint
app.post("/api/contacto", async (req, res) => {
  const data = req.body;

  // 🛑 Validación mínima
  if (!data.email || !data.nombre || !data.problema) {
    return res.status(400).json({ error: "Faltan campos obligatorios" });
  }

  // 🛑 Anti-bot simple (honeypot)
  if (data.website) {
    return res.status(400).json({ error: "Bot detectado" });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // 🧾 Formatear bonito (clave para que no sea un caos)
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

    res.json({ ok: true });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al enviar email" });
  }
});

app.listen(3000, () => {
  console.log("Servidor corriendo en puerto 3000");
});