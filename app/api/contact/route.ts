import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { assertAllowedOrigin } from '../_utils/origin';

export const runtime = 'nodejs';

const noCacheHeaders = {
  'Cache-Control': 'no-store',
  Pragma: 'no-cache',
  Expires: '0',
  'Content-Type': 'application/json; charset=utf-8',
} as const;

type ContactPayload = {
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  role?: string;
  companySize?: string;
  productInterest?: string;
  timeline?: string;
  message?: string;
  consent?: boolean;
  hp?: string;
  website?: string;
};

type ContactMode = 'basic' | 'advanced';

type NormalizedContact = {
  mode: ContactMode;
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
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

const trimIfString = (value: unknown) => (typeof value === 'string' ? value.trim() : value);

const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const MAX_LENGTHS = {
  firstName: 80,
  lastName: 80,
  fullName: 160,
  email: 120,
  company: 120,
  role: 120,
  companySize: 120,
  productInterest: 120,
  timeline: 120,
  message: 2000,
} as const;

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 5;
const splitName = (name: string) => {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return { firstName: '', lastName: '' };
  }

  const [firstName, ...rest] = parts;
  return {
    firstName,
    lastName: rest.join(' '),
  };
};

const normalizeContactPayload = (payload: ContactPayload): NormalizedContact | null => {
  const firstName = trimIfString(payload.firstName);
  const lastName = trimIfString(payload.lastName);
  const name = trimIfString(payload.name);
  const email = trimIfString(payload.email);
  const phone = trimIfString(payload.phone);
  const company = trimIfString(payload.company);
  const role = trimIfString(payload.role);
  const companySize = trimIfString(payload.companySize);
  const productInterest = trimIfString(payload.productInterest);
  const timeline = trimIfString(payload.timeline);
  const message = trimIfString(payload.message);

  const hasAdvancedFields =
    isNonEmptyString(company) ||
    isNonEmptyString(role) ||
    isNonEmptyString(companySize) ||
    isNonEmptyString(productInterest) ||
    isNonEmptyString(timeline);

  if (!isNonEmptyString(email) || !isNonEmptyString(message) || payload.consent !== true) {
    return null;
  }

  if (hasAdvancedFields) {
    if (
      !isNonEmptyString(firstName) ||
      !isNonEmptyString(lastName) ||
      !isNonEmptyString(company) ||
      !isNonEmptyString(role) ||
      !isNonEmptyString(companySize) ||
      !isNonEmptyString(productInterest) ||
      !isNonEmptyString(timeline)
    ) {
      return null;
    }

    return {
      mode: 'advanced',
      fullName: `${firstName} ${lastName}`.trim(),
      firstName,
      lastName,
      email,
      phone: isNonEmptyString(phone) ? phone : 'N/A',
      company,
      role,
      companySize,
      productInterest,
      timeline,
      message,
      consent: true,
    };
  }

  const fallbackName = isNonEmptyString(name) ? name : `${firstName ?? ''} ${lastName ?? ''}`.trim();
  if (!isNonEmptyString(fallbackName)) {
    return null;
  }

  const parsedName = splitName(fallbackName);

  return {
    mode: 'basic',
    fullName: fallbackName,
    firstName: parsedName.firstName,
    lastName: parsedName.lastName,
    email,
    phone: isNonEmptyString(phone) ? phone : 'N/A',
    company: 'N/A',
    role: 'N/A',
    companySize: 'N/A',
    productInterest: 'General contact',
    timeline: 'N/A',
    message,
    consent: true,
  };
};

const isValidLengths = (normalized: NormalizedContact) => {
  if (normalized.fullName.length > MAX_LENGTHS.fullName) return false;
  if (normalized.firstName.length > MAX_LENGTHS.firstName) return false;
  if (normalized.lastName.length > MAX_LENGTHS.lastName) return false;
  if (normalized.email.length > MAX_LENGTHS.email) return false;
  if (normalized.company.length > MAX_LENGTHS.company) return false;
  if (normalized.role.length > MAX_LENGTHS.role) return false;
  if (normalized.companySize.length > MAX_LENGTHS.companySize) return false;
  if (normalized.productInterest.length > MAX_LENGTHS.productInterest) return false;
  if (normalized.timeline.length > MAX_LENGTHS.timeline) return false;
  return normalized.message.length <= MAX_LENGTHS.message;
};

export async function POST(request: Request) {
  const jsonResponse = (body: { ok: true } | { error: string }, init?: { status?: number }) =>
    NextResponse.json(body, {
      ...init,
      headers: noCacheHeaders,
    });

  const forbidden = assertAllowedOrigin(request);
  if (forbidden) {
    return forbidden;
  }

  const requestIp = getRequestIp(request);
  if (isRateLimited(requestIp)) {
    return jsonResponse({ error: 'Too many requests. Please try again later.' }, { status: 429 });
  }

  let payload: ContactPayload;

  try {
    payload = (await request.json()) as ContactPayload;
  } catch {
    return jsonResponse({ error: 'Invalid request body.' }, { status: 400 });
  }

  const hp = trimIfString(payload.hp);
  const website = trimIfString(payload.website);

  if ((typeof hp === 'string' && hp.length > 0) || (typeof website === 'string' && website.length > 0)) {
    return jsonResponse({ ok: true });
  }

  const normalized = normalizeContactPayload(payload);
  if (!normalized) {
    return jsonResponse({ error: 'Please complete all required fields and consent to be contacted.' }, { status: 400 });
  }

  if (!isValidEmail(normalized.email)) {
    return jsonResponse({ error: 'Please use a valid email address.' }, { status: 400 });
  }

  if (!isValidLengths(normalized)) {
    return jsonResponse({ error: 'Please review the form fields and try again.' }, { status: 400 });
  }

  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const to = process.env.CONTACT_TO;
  const from = process.env.CONTACT_FROM || user;

  if (!host || !port || !user || !pass || !to || !from) {
    return jsonResponse({ error: 'Email service is not configured.' }, { status: 500 });
  }

  const smtpPort = Number(port);
  if (!Number.isFinite(smtpPort) || smtpPort <= 0) {
    return jsonResponse({ error: 'Email service is not configured.' }, { status: 500 });
  }

  const transporter = nodemailer.createTransport({
    host,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: { user, pass },
  });

  const subject =
    normalized.mode === 'advanced'
      ? `New contact request from ${normalized.firstName} ${normalized.lastName}`
      : `New basic contact from ${normalized.fullName}`;

  const modeLabel = normalized.mode.toUpperCase();

  const text = `Contact mode: ${modeLabel}
Name: ${normalized.fullName}
Email: ${normalized.email}
Phone: ${normalized.phone}
Company: ${normalized.company}
Role: ${normalized.role}
Company size: ${normalized.companySize}
Interest: ${normalized.productInterest}
Timeline: ${normalized.timeline}

Message:
${normalized.message}`;

  const escapedMessage = escapeHtml(normalized.message).replace(/\n/g, '<br/>');

  const html = `
    <h2>New contact request (${modeLabel})</h2>
    <p><strong>Name:</strong> ${escapeHtml(normalized.fullName)}</p>
    <p><strong>Email:</strong> ${escapeHtml(normalized.email)}</p>
    <p><strong>Phone:</strong> ${escapeHtml(normalized.phone)}</p>
    <p><strong>Company:</strong> ${escapeHtml(normalized.company)}</p>
    <p><strong>Role:</strong> ${escapeHtml(normalized.role)}</p>
    <p><strong>Company size:</strong> ${escapeHtml(normalized.companySize)}</p>
    <p><strong>Interest:</strong> ${escapeHtml(normalized.productInterest)}</p>
    <p><strong>Timeline:</strong> ${escapeHtml(normalized.timeline)}</p>
    <p><strong>Message:</strong><br/>${escapedMessage}</p>
  `;

  try {
    await transporter.sendMail({
      from,
      to,
      replyTo: normalized.email,
      subject,
      text,
      html,
    });

    return jsonResponse({ ok: true });
  } catch (error) {
    console.error('Contact email send failed:', error);
    return jsonResponse({ error: 'Failed to send email. Please try again.' }, { status: 500 });
  }
}
