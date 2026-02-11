import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export const runtime = 'nodejs';

type ContactPayload = {
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

export async function POST(request: Request) {
  let payload: ContactPayload;

  try {
    payload = (await request.json()) as ContactPayload;
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  if (
    !payload?.firstName ||
    !payload?.lastName ||
    !payload?.email ||
    !payload?.company ||
    !payload?.role ||
    !payload?.companySize ||
    !payload?.productInterest ||
    !payload?.timeline ||
    !payload?.message ||
    !payload?.consent
  ) {
    return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
  }

  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const to = process.env.CONTACT_TO;
  const from = process.env.CONTACT_FROM || user;

  if (!host || !port || !user || !pass || !to || !from) {
    return NextResponse.json(
      { error: 'Email service is not configured.' },
      { status: 500 }
    );
  }

  const transporter = nodemailer.createTransport({
    host,
    port: Number(port),
    secure: Number(port) === 465,
    auth: { user, pass },
  });

  const firstName = String(payload.firstName);
  const lastName = String(payload.lastName);
  const email = String(payload.email);
  const phone = payload.phone ? String(payload.phone) : 'N/A';
  const company = String(payload.company);
  const role = String(payload.role);
  const companySize = String(payload.companySize);
  const productInterest = String(payload.productInterest);
  const timeline = String(payload.timeline);
  const message = String(payload.message);

  const subject = `New contact request from ${firstName} ${lastName}`;

  const text = `Name: ${firstName} ${lastName}
Email: ${email}
Phone: ${phone}
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
    <p><strong>Phone:</strong> ${escapeHtml(phone)}</p>
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

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send email.' },
      { status: 500 }
    );
  }
}
