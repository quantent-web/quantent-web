import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

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

export async function POST(request: Request) {
  const payload = (await request.json()) as ContactPayload;

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
  const to = process.env.CONTACT_TO || 'aaron86mf@gmail.com';
  const from = process.env.CONTACT_FROM || user;

  if (!host || !port || !to || !from) {
    return NextResponse.json(
      { error: 'Email service is not configured.' },
      { status: 500 }
    );
  }

  const transporter = nodemailer.createTransport({
    host,
    port: Number(port),
    secure: Number(port) === 465,
    auth: user && pass ? { user, pass } : undefined,
  });

  const subject = `New contact request from ${payload.firstName} ${payload.lastName}`;

  const text = `Name: ${payload.firstName} ${payload.lastName}
Email: ${payload.email}
Phone: ${payload.phone || 'N/A'}
Company: ${payload.company}
Role: ${payload.role}
Company size: ${payload.companySize}
Interest: ${payload.productInterest}
Timeline: ${payload.timeline}

Message:
${payload.message}`;

  const html = `
    <h2>New contact request</h2>
    <p><strong>Name:</strong> ${payload.firstName} ${payload.lastName}</p>
    <p><strong>Email:</strong> ${payload.email}</p>
    <p><strong>Phone:</strong> ${payload.phone || 'N/A'}</p>
    <p><strong>Company:</strong> ${payload.company}</p>
    <p><strong>Role:</strong> ${payload.role}</p>
    <p><strong>Company size:</strong> ${payload.companySize}</p>
    <p><strong>Interest:</strong> ${payload.productInterest}</p>
    <p><strong>Timeline:</strong> ${payload.timeline}</p>
    <p><strong>Message:</strong><br/>${payload.message.replace(/\n/g, '<br/>')}</p>
  `;

  try {
    await transporter.sendMail({
      from,
      to,
      replyTo: payload.email,
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
