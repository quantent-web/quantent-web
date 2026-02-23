import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export const runtime = "nodejs";

const noCacheHeaders = {
  'Cache-Control': 'no-store',
  Pragma: 'no-cache',
  Expires: '0',
} as const;

type ContactPayload = {
  name?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company: string;
  role: string;
  companySize: string;
  productInterest: string;
  timeline: string;
  message: string;
  consent: boolean;
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

const trimToString = (value: unknown): string | undefined =>
  (typeof value === 'string' ? value.trim() : undefined);

const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const MAX_LENGTHS = {
  firstName: 80,
  lastName: 80,
  email: 120,
  company: 120,
  role: 120,
  message: 2000,
} as const;

const VALIDATION_ERROR = 'Invalid field values.';

export async function POST(request: Request) {
  const jsonResponse = (
    body: { ok: true } | { error: string },
    init?: { status?: number }
  ) =>
    NextResponse.json(body, {
      ...init,
      headers: noCacheHeaders,
    });

  let rawPayload: unknown;

  try {
    rawPayload = await request.json();
  } catch {
    return jsonResponse({ error: 'Invalid request body.' }, { status: 400 });
  }

  if (!rawPayload || typeof rawPayload !== 'object') {
    return jsonResponse({ error: 'Invalid request body.' }, { status: 400 });
  }

  const payload = rawPayload as Record<string, unknown>;
  const providedFirstName = trimToString(payload.firstName);
  const providedLastName = trimToString(payload.lastName);
  const basicName = trimToString(payload.name);
  const isBasicMode =
    !isNonEmptyString(providedFirstName) && isNonEmptyString(basicName);
  const isAdvancedMode = isNonEmptyString(providedFirstName);

  if (!isAdvancedMode && !isBasicMode) {
    return jsonResponse({ error: 'Missing required fields.' }, { status: 400 });
  }

  const [basicFirstName = '', ...basicLastNameParts] = isBasicMode
    ? basicName.split(/\s+/).filter(Boolean)
    : [];

  const normalizedPayload: ContactPayload = {
    firstName: isBasicMode ? basicFirstName : providedFirstName ?? '',
    lastName: isBasicMode ? basicLastNameParts.join(' ') : providedLastName ?? '',
    email: trimToString(payload.email) ?? '',
    phone: trimToString(payload.phone),
    company: isBasicMode ? 'N/A' : trimToString(payload.company) ?? '',
    role: isBasicMode ? 'General inquiry' : trimToString(payload.role) ?? '',
    companySize: isBasicMode ? 'Unknown' : trimToString(payload.companySize) ?? '',
    productInterest: isBasicMode
      ? 'General contact'
      : trimToString(payload.productInterest) ?? '',
    timeline: isBasicMode ? 'Not specified' : trimToString(payload.timeline) ?? '',
    message: trimToString(payload.message) ?? '',
    consent: payload.consent === true,
  };

  const {
    firstName,
    lastName,
    email,
    phone,
    company,
    role,
    companySize,
    productInterest,
    timeline,
    message,
    consent,
  } = normalizedPayload;

  if (
    !isNonEmptyString(firstName) ||
    (!isBasicMode && !isNonEmptyString(lastName)) ||
    !isNonEmptyString(email) ||
    !isNonEmptyString(company) ||
    !isNonEmptyString(role) ||
    !isNonEmptyString(companySize) ||
    !isNonEmptyString(productInterest) ||
    !isNonEmptyString(timeline) ||
    !isNonEmptyString(message) ||
    consent !== true
  ) {
    return jsonResponse({ error: 'Missing required fields.' }, { status: 400 });
  }

  if (
    firstName.length > MAX_LENGTHS.firstName ||
    lastName.length > MAX_LENGTHS.lastName ||
    email.length > MAX_LENGTHS.email ||
    company.length > MAX_LENGTHS.company ||
    role.length > MAX_LENGTHS.role ||
    message.length > MAX_LENGTHS.message
  ) {
    return jsonResponse({ error: VALIDATION_ERROR }, { status: 400 });
  }

  if (!isValidEmail(email)) {
    return jsonResponse({ error: VALIDATION_ERROR }, { status: 400 });
  }

  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const to = process.env.CONTACT_TO;
  const from = process.env.CONTACT_FROM || user;

  if (!host || !port || !user || !pass || !to || !from) {
    return jsonResponse(
      { error: 'Email service is not configured.' },
      { status: 500 }
    );
  }

  const smtpPort = Number(port);
  if (!Number.isFinite(smtpPort) || smtpPort <= 0) {
    return jsonResponse(
      { error: 'Email service is not configured.' },
      { status: 500 }
    );
  }

  const transporter = nodemailer.createTransport({
    host,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: { user, pass },
  });

  const formattedPhone = isNonEmptyString(phone) ? phone : 'N/A';

  const subject = `New contact request from ${firstName} ${lastName}`;

  const text = `Name: ${firstName} ${lastName}
Email: ${email}
Phone: ${formattedPhone}
Company: ${company}
Role: ${role}
Company size: ${companySize}
Interest: ${productInterest}
Timeline: ${timeline}

Message:
${message}`;

  const escapedMessage = escapeHtml(message).replace(/\n/g, '<br/>');

  const html = `
    <h2>New contact request</h2>
    <p><strong>Name:</strong> ${escapeHtml(firstName)} ${escapeHtml(lastName)}</p>
    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
    <p><strong>Phone:</strong> ${escapeHtml(formattedPhone)}</p>
    <p><strong>Company:</strong> ${escapeHtml(company)}</p>
    <p><strong>Role:</strong> ${escapeHtml(role)}</p>
    <p><strong>Company size:</strong> ${escapeHtml(companySize)}</p>
    <p><strong>Interest:</strong> ${escapeHtml(productInterest)}</p>
    <p><strong>Timeline:</strong> ${escapeHtml(timeline)}</p>
    <p><strong>Message:</strong><br/>${escapedMessage}</p>
  `;

  try {
    await transporter.sendMail({
      from,
      to,
      replyTo: email,
      subject,
      text,
      html,
    });

    return jsonResponse({ ok: true });
  } catch (error) {
    return jsonResponse(
      { error: error instanceof Error ? error.message : 'Failed to send email.' },
      { status: 500 }
    );
  }
}
