const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_RE = /^https?:\/\/.+/;

function sanitize(str) {
  if (typeof str !== 'string') return '';
  return str.trim().slice(0, 2000);
}

function validateLead(body) {
  const errors = [];

  const name = sanitize(body.name);
  const email = sanitize(body.email);
  const website = sanitize(body.website);
  const service = sanitize(body.service);
  const message = sanitize(body.message);

  if (!name) errors.push({ field: 'name', message: 'Full name is required.' });
  if (!email) {
    errors.push({ field: 'email', message: 'Email address is required.' });
  } else if (!EMAIL_RE.test(email)) {
    errors.push({ field: 'email', message: 'Please enter a valid email address.' });
  }

  if (website && !URL_RE.test(website)) {
    errors.push({ field: 'website', message: 'Please enter a valid URL starting with http:// or https://.' });
  }

  return {
    valid: errors.length === 0,
    errors,
    data: { name, email, website, service, message },
  };
}

module.exports = { validateLead, sanitize };
