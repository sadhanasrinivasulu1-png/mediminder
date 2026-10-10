const nodemailer = require('nodemailer');
const config = require('../config/env');

let transporter = null;

if (config.SMTP_ENABLED && config.SMTP_USER) {
  transporter = nodemailer.createTransport({
    host: config.SMTP_HOST,
    port: config.SMTP_PORT,
    secure: config.SMTP_SECURE,
    auth: {
      user: config.SMTP_USER,
      pass: config.SMTP_PASS
    }
  });
  console.log('[NotificationService] SMTP Transporter configured.');
} else {
  console.log('[NotificationService] Email notifications are running in development log mode (SMTP_ENABLED=false).');
}

async function sendMedicineReminderEmail(user, reminder, medicine) {
  const subject = `MediMinder Alert: Time to take ${medicine.medicine_name}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #0284c7; margin: 0; font-size: 26px;">MediMinder</h1>
        <p style="color: #64748b; margin: 4px 0 0 0; font-size: 14px;">Healthcare Medication Assistant</p>
      </div>

      <div style="background-color: #f0f9ff; border-left: 4px solid #0284c7; padding: 16px; border-radius: 6px; margin-bottom: 20px;">
        <h2 style="color: #0f172a; margin: 0 0 8px 0; font-size: 18px;">Hello ${user.name || 'there'},</h2>
        <p style="color: #334155; margin: 0; font-size: 15px;">It's time for your scheduled medication:</p>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
        <tr>
          <td style="padding: 10px 0; color: #64748b; font-weight: 600; width: 130px;">Medicine:</td>
          <td style="padding: 10px 0; color: #0f172a; font-weight: bold; font-size: 17px;">${medicine.medicine_name}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #64748b; font-weight: 600;">Dosage:</td>
          <td style="padding: 10px 0; color: #0f172a;">${medicine.dosage}</td>
        </tr>
        ${medicine.instructions ? `
        <tr>
          <td style="padding: 10px 0; color: #64748b; font-weight: 600;">Instructions:</td>
          <td style="padding: 10px 0; color: #0f172a;">${medicine.instructions}</td>
        </tr>` : ''}
        <tr>
          <td style="padding: 10px 0; color: #64748b; font-weight: 600;">Scheduled Time:</td>
          <td style="padding: 10px 0; color: #0284c7; font-weight: 600;">${new Date(reminder.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
        </tr>
      </table>

      <div style="text-align: center; margin-top: 24px;">
        <a href="${config.CLIENT_URL}/dashboard" style="background-color: #0284c7; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; display: inline-block;">
          Open MediMinder & Mark Taken
        </a>
      </div>

      <p style="margin-top: 32px; font-size: 12px; color: #94a3b8; text-align: center;">
        You received this email because you scheduled medication reminders on MediMinder.
      </p>
    </div>
  `;

  if (transporter) {
    try {
      await transporter.sendMail({
        from: config.SMTP_FROM,
        to: user.email,
        subject,
        html
      });
      console.log(`[NotificationService] Email sent to ${user.email} for ${medicine.medicine_name}`);
      return true;
    } catch (err) {
      console.error(`[NotificationService] Failed to send email to ${user.email}:`, err.message);
      return false;
    }
  } else {
    console.log(`[NotificationService DEV LOG] Reminder triggered for [${user.email}]: Take ${medicine.medicine_name} (${medicine.dosage})`);
    return true;
  }
}

module.exports = {
  sendMedicineReminderEmail
};
