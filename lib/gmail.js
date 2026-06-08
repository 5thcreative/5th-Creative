const nodemailer = require('nodemailer');
const { logger } = require('./logger');

let _transporter;
function getTransporter() {
  if (!_transporter) {
    _transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
  }
  return _transporter;
}

async function sendLeadNotification(lead) {
  const transporter = getTransporter();
  const to = process.env.GMAIL_NOTIFY_TO || process.env.GMAIL_USER;

  const html = `
    <div style="font-family: -apple-system, sans-serif; max-width: 560px; margin: 0 auto; color: #222;">
      <h2 style="margin-bottom: 24px; color: #000;">New Lead Received</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="padding: 10px 0; color: #666; width: 130px;">Name</td><td style="padding: 10px 0; font-weight: 600;">${escapeHtml(lead.name)}</td></tr>
        <tr><td style="padding: 10px 0; color: #666;">Email</td><td style="padding: 10px 0;"><a href="mailto:${escapeHtml(lead.email)}" style="color: #1878F3;">${escapeHtml(lead.email)}</a></td></tr>
        <tr><td style="padding: 10px 0; color: #666;">Website</td><td style="padding: 10px 0;">${lead.website ? `<a href="${escapeHtml(lead.website)}" style="color: #1878F3;">${escapeHtml(lead.website)}</a>` : '—'}</td></tr>
        <tr><td style="padding: 10px 0; color: #666;">Service</td><td style="padding: 10px 0;">${escapeHtml(lead.service || '—')}</td></tr>
        <tr><td style="padding: 10px 0; color: #666;">Description</td><td style="padding: 10px 0;">${escapeHtml(lead.message || '—')}</td></tr>
        <tr><td style="padding: 10px 0; color: #666;">Date</td><td style="padding: 10px 0;">${lead.timestamp}</td></tr>
        <tr><td style="padding: 10px 0; color: #666;">Lead ID</td><td style="padding: 10px 0; font-family: monospace; font-size: 13px;">${lead.leadId}</td></tr>
      </table>
      <hr style="margin: 24px 0; border: none; border-top: 1px solid #eee;" />
      <p style="font-size: 13px; color: #999;">This notification was sent by the 5th Creative lead capture system.</p>
    </div>
  `;

  const result = await transporter.sendMail({
    from: `"5th Creative" <${process.env.GMAIL_USER}>`,
    to,
    subject: `🚀 New Lead Submitted — ${lead.name}`,
    html,
  });

  logger.info('gmail.notification_sent', { leadId: lead.leadId, messageId: result.messageId });
  return result;
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

module.exports = { sendLeadNotification };
