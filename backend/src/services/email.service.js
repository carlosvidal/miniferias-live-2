import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Resend client
let resend = null;
function getResendClient() {
  if (!resend && process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

export async function sendEmail({ to, subject, html, text }) {
  try {
    const client = getResendClient();

    if (!client) {
      console.log('Email service not configured (missing RESEND_API_KEY), skipping email send');
      return null;
    }

    const fromEmail = process.env.FROM_EMAIL || 'MiniFeria <onboarding@resend.dev>';

    const { data, error } = await client.emails.send({
      from: fromEmail,
      to: Array.isArray(to) ? to : [to],
      subject,
      text,
      html
    });

    if (error) {
      console.error('Error sending email:', error);
      throw error;
    }

    console.log('Email sent successfully:', data.id);
    return data;
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

export async function sendDataDeletionConfirmation(user, deletionToken, reason) {
  const subject = 'Confirmación de Eliminación de Cuenta - Miniferias Live';
  const confirmUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/confirm-deletion?token=${deletionToken}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #FEF2F2; border-left: 4px solid #EF4444; padding: 20px; margin-bottom: 20px;">
        <h1 style="color: #991B1B; margin: 0;">⚠️ Solicitud de Eliminación de Cuenta</h1>
      </div>

      <p style="font-size: 16px; color: #333;">Hola ${user.name},</p>

      <p style="font-size: 16px; color: #555;">
        Hemos recibido una solicitud para eliminar tu cuenta de Miniferias Live y todos tus datos personales.
      </p>

      ${reason ? `
        <div style="background-color: #F3F4F6; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; font-size: 14px; color: #666;">
            <strong>Motivo proporcionado:</strong><br/>
            ${reason}
          </p>
        </div>
      ` : ''}

      <div style="background-color: #FEF2F2; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #FEE2E2;">
        <h3 style="color: #991B1B; margin-top: 0;">⚠️ Esta acción es permanente e irreversible</h3>
        <p style="color: #555; font-size: 14px; margin-bottom: 0;">
          Si confirmas la eliminación, se eliminarán los siguientes datos:
        </p>
        <ul style="color: #555; font-size: 14px;">
          <li>Información de perfil (nombre, email, foto)</li>
          <li>Datos de autenticación</li>
          <li>Mensajes de chat</li>
          <li>Preferencias y configuraciones</li>
        </ul>
        <p style="color: #555; font-size: 14px;">
          <strong>Nota:</strong> Los registros de pedidos se conservarán de forma anónima por razones legales y contables.
        </p>
      </div>

      <p style="font-size: 16px; color: #555;">
        <strong>Si NO solicitaste esta eliminación,</strong> ignora este correo y tu cuenta permanecerá activa.
      </p>

      <p style="font-size: 16px; color: #555;">
        <strong>Para confirmar la eliminación de tu cuenta,</strong> haz clic en el siguiente botón:
      </p>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${confirmUrl}"
           style="background-color: #DC2626; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
          Confirmar Eliminación de Cuenta
        </a>
      </div>

      <p style="font-size: 14px; color: #999;">
        O copia y pega este enlace en tu navegador:<br/>
        <a href="${confirmUrl}" style="color: #4F46E5; word-break: break-all;">${confirmUrl}</a>
      </p>

      <div style="background-color: #EFF6FF; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3B82F6;">
        <p style="margin: 0; font-size: 14px; color: #1E40AF;">
          <strong>🔒 Seguridad:</strong> Este enlace es válido por 24 horas y solo puede usarse una vez.
        </p>
      </div>

      <p style="font-size: 12px; color: #999; margin-top: 40px; padding-top: 20px; border-top: 1px solid #E5E7EB;">
        Este es un correo automático de Miniferias Live. Si tienes preguntas, contacta a privacy@miniferieslive.com
      </p>
    </div>
  `;

  const text = `
    CONFIRMACIÓN DE ELIMINACIÓN DE CUENTA - MINIFERIAS LIVE

    Hola ${user.name},

    Hemos recibido una solicitud para eliminar tu cuenta de Miniferias Live y todos tus datos personales.

    ${reason ? `Motivo proporcionado: ${reason}\n\n` : ''}

    ⚠️ ESTA ACCIÓN ES PERMANENTE E IRREVERSIBLE

    Si confirmas la eliminación, se eliminarán:
    - Información de perfil (nombre, email, foto)
    - Datos de autenticación
    - Mensajes de chat
    - Preferencias y configuraciones

    Nota: Los registros de pedidos se conservarán de forma anónima por razones legales.

    Si NO solicitaste esta eliminación, ignora este correo y tu cuenta permanecerá activa.

    Para confirmar la eliminación de tu cuenta, haz clic en este enlace:
    ${confirmUrl}

    Este enlace es válido por 24 horas y solo puede usarse una vez.

    ---
    Miniferias Live
    privacy@miniferieslive.com
  `;

  return sendEmail({ to: user.email, subject, html, text });
}
