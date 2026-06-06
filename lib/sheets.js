const { google } = require('googleapis');
const { logger } = require('./logger');

let _sheets;
function getClient() {
  if (!_sheets) {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    _sheets = google.sheets({ version: 'v4', auth });
  }
  return _sheets;
}

async function appendLead(lead) {
  const sheets = getClient();
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;

  const row = [
    lead.timestamp,
    lead.leadId,
    lead.name,
    lead.email,
    lead.website || '',
    lead.service || '',
    lead.message || '',
  ];

  const result = await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: 'Sheet1!A:G',
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: [row] },
  });

  logger.info('sheets.row_appended', {
    leadId: lead.leadId,
    updatedRange: result.data.updates?.updatedRange,
  });

  return result.data;
}

module.exports = { appendLead };
