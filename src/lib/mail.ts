import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendOTPEmail(to: string, otp: string): Promise<void> {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject: "Your Innr Crcl verification code",
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body style="margin:0;padding:0;background:#0a0a0f;font-family:'Courier New',monospace;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0"
               style="background:#111118;border:1px solid #2a2a3a;border-radius:12px;overflow:hidden;">
          <tr>
            <td style="background:#f0c040;padding:20px 32px;">
              <p style="margin:0;font-size:11px;letter-spacing:4px;color:#0a0a0f;text-transform:uppercase;font-weight:700;">
                INNR CRCL // Verification
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:40px 32px;">
              <h1 style="margin:0 0 8px;font-size:14px;letter-spacing:3px;color:#888;text-transform:uppercase;">
                Your one-time code
              </h1>
              <p style="margin:0 0 32px;font-size:48px;font-weight:700;letter-spacing:12px;color:#f0c040;">
                ${otp}
              </p>
              <p style="margin:0;font-size:13px;color:#555;line-height:1.7;">
                This code expires in <strong style="color:#aaa;">10 minutes</strong>.<br/>
                If you didn't request this, you can safely ignore this email.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px;border-top:1px solid #1e1e2a;">
              <p style="margin:0;font-size:11px;color:#333;letter-spacing:1px;">
                INNR CRCL · GLA UNIVERSITY · DO NOT REPLY
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `,
    });
  } catch (error) {
    console.error("[MAIL ERROR]", error);
    console.log(`[OTP FALLBACK] ${to}: ${otp}`);
  }
}