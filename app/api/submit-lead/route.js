import { v4 as uuidv4 } from 'uuid';
import { validateLead } from '../../../lib/validate';
import { rateLimit } from '../../../lib/rate-limit';
import { logger } from '../../../lib/logger';
import { checkDuplicate, createLead } from '../../../lib/notion';
import { appendLead } from '../../../lib/sheets';
import { sendLeadNotification } from '../../../lib/gmail';

export async function POST(request) {
  const requestId = uuidv4().slice(0, 8);
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';

  // Rate limit
  const limit = rateLimit(ip);
  if (!limit.allowed) {
    logger.warn('rate_limit_exceeded', { requestId, ip });
    return Response.json(
      { success: false, error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: { 'Retry-After': String(limit.retryAfter) },
      }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { success: false, error: 'Invalid request body.' },
      { status: 400 }
    );
  }

  // Validate
  const { valid, errors, data } = validateLead(body);
  if (!valid) {
    logger.info('validation_failed', { requestId, errors });
    return Response.json(
      { success: false, error: 'Validation failed.', errors },
      { status: 422 }
    );
  }

  const lead = {
    leadId: uuidv4(),
    timestamp: new Date().toISOString(),
    ...data,
  };

  logger.info('submission_received', { requestId, leadId: lead.leadId, email: lead.email });

  // Duplicate check via Notion
  let isDuplicate = false;
  try {
    isDuplicate = await checkDuplicate(lead.email);
  } catch (err) {
    logger.error('notion.duplicate_check_failed', { requestId, error: err.message });
    // Continue — don't block submission if check fails
  }

  if (isDuplicate) {
    logger.warn('duplicate_submission', { requestId, leadId: lead.leadId, email: lead.email });
    // Still return success to the user (don't reveal internal state)
    // but don't create duplicate records
    return Response.json({
      success: true,
      message: 'Thank you. Your request has been received. A member of 5th Creative will contact you shortly.',
    });
  }

  const results = { notion: false, sheets: false, gmail: false };

  // Save to Notion
  try {
    await createLead(lead);
    results.notion = true;
  } catch (err) {
    logger.error('notion.create_failed', {
      requestId,
      leadId: lead.leadId,
      error: err.message,
      code: err.code,
    });
  }

  // Save to Google Sheets
  try {
    await appendLead(lead);
    results.sheets = true;
  } catch (err) {
    logger.error('sheets.append_failed', {
      requestId,
      leadId: lead.leadId,
      error: err.message,
    });
  }

  // Send Gmail notification
  try {
    await sendLeadNotification(lead);
    results.gmail = true;
  } catch (err) {
    logger.error('gmail.send_failed', {
      requestId,
      leadId: lead.leadId,
      error: err.message,
    });
  }

  // If both Notion and Sheets failed, return error
  if (!results.notion && !results.sheets) {
    logger.error('all_storage_failed', { requestId, leadId: lead.leadId, results });
    return Response.json(
      {
        success: false,
        error: 'We encountered a problem saving your request. Please try again or email us directly at hello@5thcreative.com.',
      },
      { status: 500 }
    );
  }

  logger.info('submission_complete', { requestId, leadId: lead.leadId, results });

  return Response.json({
    success: true,
    message: 'Thank you. Your request has been received. A member of 5th Creative will contact you shortly.',
  });
}
