import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const nodemailer = require('nodemailer');
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransporter({
  host: 'smtp.sendgrid.net',
  port: 587,
  secure: false,
  auth: {
    user: 'apikey',
    pass: process.env.SENDGRID_API_KEY
  }
});

export async function sendEmail({ to, subject, html, text }) {
  try {
    if (!process.env.SENDGRID_API_KEY) {
      console.log('Email service not configured, skipping email send');
      return null;
    }

    const info = await transporter.sendMail({
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
