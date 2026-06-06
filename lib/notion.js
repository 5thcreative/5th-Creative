const { Client } = require('@notionhq/client');
const { logger } = require('./logger');

let _client;
function getClient() {
  if (!_client) _client = new Client({ auth: process.env.NOTION_API_KEY });
  return _client;
}

async function checkDuplicate(email) {
  const notion = getClient();
  const dbId = process.env.NOTION_DATABASE_ID;

  const response = await notion.databases.query({
    database_id: dbId,
    filter: {
      property: 'Email',
      email: { equals: email },
    },
    page_size: 1,
  });

  return response.results.length > 0;
}

async function createLead(lead) {
  const notion = getClient();
  const dbId = process.env.NOTION_DATABASE_ID;

  const properties = {
    'Lead ID': { title: [{ text: { content: lead.leadId } }] },
    'Full Name': { rich_text: [{ text: { content: lead.name } }] },
    'Email': { email: lead.email },
    'Website': { url: lead.website || null },
    'Service': { select: lead.service ? { name: lead.service } : null },
    'Description': { rich_text: [{ text: { content: lead.message || '' } }] },
    'Lead Status': { select: { name: 'New Lead' } },
    'Date Submitted': { date: { start: lead.timestamp } },
  };

  // Remove null selects
  if (!lead.service) delete properties['Service'];

  const page = await notion.pages.create({
    parent: { database_id: dbId },
    properties,
  });

  logger.info('notion.lead_created', { leadId: lead.leadId, pageId: page.id });
  return page;
}

module.exports = { checkDuplicate, createLead };
