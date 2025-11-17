import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const nodemailer = require('nodemailer');
import dotenv from 'dotenv';

dotenv.config();

// Lazy initialization - only create transporter when needed
let transporter = null;
function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransporter({
      host: 'smtp.sendgrid.net',
      port: 587,
      secure: false,
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY
      }
    });
  }
  return transporter;
}

export async function sendEmail({ to, subject, html, text }) {
  try {
    if (!process.env.SENDGRID_API_KEY) {
      console.log('Email service not configured, skipping email send');
      return null;
    }

    const info = await getTransporter().sendMail({
      from: process.env.FROM_EMAIL || 'noreply@miniferias.pe',
      to,
      subject,
      text,
      html
    });

    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

export async function sendOrderConfirmation(order, user) {
  const subject = `Pedido Confirmado - ${order.orderNumber}`;
  const html = `
    <h1>¡Pedido Confirmado!</h1>
    <p>Hola ${user.name},</p>
    <p>Tu pedido <strong>${order.orderNumber}</strong> ha sido recibido.</p>
    <p>Total: S/ ${order.total}</p>
    <p>Te notificaremos cuando el vendedor confirme tu pedido.</p>
    <p>Gracias por tu compra!</p>
  `;
  const text = `Hola ${user.name}, Tu pedido ${order.orderNumber} ha sido recibido. Total: S/ ${order.total}`;

  return sendEmail({ to: user.email, subject, html, text });
}

export async function sendOrderStatusUpdate(order, user, newStatus) {
  const statusMessages = {
    CONFIRMED: 'ha sido confirmado por el vendedor',
    PREPARING: 'está siendo preparado',
    SHIPPED: 'ha sido enviado',
    DELIVERED: 'ha sido entregado',
    CANCELLED: 'ha sido cancelado'
  };

  const subject = `Actualización de Pedido - ${order.orderNumber}`;
  const html = `
    <h1>Actualización de Pedido</h1>
    <p>Hola ${user.name},</p>
    <p>Tu pedido <strong>${order.orderNumber}</strong> ${statusMessages[newStatus]}.</p>
    ${order.notes ? `<p>Nota del vendedor: ${order.notes}</p>` : ''}
    <p>Gracias por tu compra!</p>
  `;
  const text = `Hola ${user.name}, Tu pedido ${order.orderNumber} ${statusMessages[newStatus]}.`;

  return sendEmail({ to: user.email, subject, html, text });
}

export async function sendEventReminder(event, email) {
  const subject = `Recordatorio: ${event.name} - MiniFeria`;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-PE', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #333;">¡No te lo pierdas!</h1>
      <h2 style="color: #4F46E5;">${event.name}</h2>

      ${event.coverImage ? `<img src="${event.coverImage}" alt="${event.name}" style="width: 100%; max-width: 600px; border-radius: 8px; margin: 20px 0;" />` : ''}

      <p style="font-size: 16px; color: #555;">${event.description}</p>

      <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0; font-size: 14px; color: #666;">
          <strong>Fecha de inicio:</strong><br/>
          ${formatDate(event.startDate)}
        </p>
        <p style="margin: 10px 0 0 0; font-size: 14px; color: #666;">
          <strong>Fecha de fin:</strong><br/>
          ${formatDate(event.endDate)}
        </p>
      </div>

      <p style="font-size: 14px; color: #555;">
        ¡El evento comienza pronto! No te pierdas la oportunidad de visitar los booths participantes y descubrir productos increíbles.
      </p>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.FRONTEND_URL || 'https://miniferias.pe'}/events/${event.slug}"
           style="background-color: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
          Ver Evento
        </a>
      </div>

      <p style="font-size: 12px; color: #999; margin-top: 30px;">
        Has recibido este email porque te suscribiste a recordatorios para este evento.
      </p>
    </div>
  `;

  const text = `
    ¡No te lo pierdas!

    ${event.name}

    ${event.description}

    Fecha de inicio: ${formatDate(event.startDate)}
    Fecha de fin: ${formatDate(event.endDate)}

    Visita: ${process.env.FRONTEND_URL || 'https://miniferias.pe'}/events/${event.slug}
  `;

  return sendEmail({ to: email, subject, html, text });
}
