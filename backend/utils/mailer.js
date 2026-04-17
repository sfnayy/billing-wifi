import nodemailer from 'nodemailer';

// Transporter menggunakan Gmail SMTP
// Gunakan App Password Gmail (bukan password biasa)
// Enable di: Google Account → Security → 2-Step Verification → App passwords
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Kirim email OTP ke user
 * @param {string} toEmail - alamat email tujuan
 * @param {string} otp - kode OTP 6 digit
 */
export async function sendOtpEmail(toEmail, otp) {
  // Jika email tidak dikonfigurasi, log ke console (mode testing)
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log(`\n[2FA OTP - DEV MODE] OTP untuk ${toEmail}: ${otp}\n`);
    return { dev: true };
  }

  const mailOptions = {
    from: `"NetBilling WiFi" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'Kode Verifikasi Login (OTP) - NetBilling',
    html: `
      <div style="font-family: 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; background: #f8fafc; padding: 32px; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="display: inline-block; background: #2563eb; padding: 12px 20px; border-radius: 12px;">
            <span style="color: white; font-size: 20px; font-weight: 800; letter-spacing: -0.5px;">📶 NetBilling</span>
          </div>
        </div>
        <h2 style="font-size: 22px; color: #1e293b; font-weight: 700; margin-bottom: 8px; text-align: center;">Verifikasi Login Anda</h2>
        <p style="color: #64748b; text-align: center; margin-bottom: 28px;">Gunakan kode OTP berikut untuk menyelesaikan login.</p>
        <div style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border: 2px dashed #3b82f6; border-radius: 14px; padding: 24px; text-align: center; margin-bottom: 24px;">
          <p style="margin: 0 0 8px 0; color: #64748b; font-size: 13px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase;">Kode OTP Anda</p>
          <p style="margin: 0; font-size: 48px; font-weight: 900; letter-spacing: 12px; color: #1d4ed8; font-family: monospace;">${otp}</p>
        </div>
        <p style="color: #64748b; font-size: 13px; text-align: center; margin-bottom: 4px;">⏱ Kode berlaku selama <strong>5 menit</strong>.</p>
        <p style="color: #94a3b8; font-size: 12px; text-align: center;">Jika Anda tidak mencoba login, abaikan email ini.</p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
}
