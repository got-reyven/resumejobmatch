const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM =
  process.env.RESEND_FROM_EMAIL ?? "Resume Job Match <onboarding@resend.dev>";
const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://resumejobmatch.vercel.app";

export async function sendWelcomeEmail(
  to: string,
  name: string | null
): Promise<{ success: boolean; error?: string }> {
  if (!RESEND_API_KEY) {
    console.error("[welcome-email] RESEND_API_KEY not configured, skipping");
    return { success: false, error: "RESEND_API_KEY not configured" };
  }

  const greeting = name ? `Hi ${name}` : "Hi there";

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: RESEND_FROM,
      to: [to],
      subject: "Welcome to Resume Job Match!",
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;">
          <h1 style="color:#1a1a1a;font-size:24px;margin-bottom:16px;">${greeting}, welcome aboard!</h1>
          <p style="color:#444;font-size:16px;line-height:1.6;">
            Thanks for joining <strong>Resume Job Match</strong>. You now have access to AI-powered resume analysis
            that helps you understand exactly how you match with any job.
          </p>
          <p style="color:#444;font-size:16px;line-height:1.6;">Here's what you can do:</p>
          <ul style="color:#444;font-size:15px;line-height:1.8;padding-left:20px;">
            <li>Upload your resume and paste a job description</li>
            <li>Get an instant match score with detailed insights</li>
            <li>See specific action items to improve your chances</li>
          </ul>
          <p style="margin-top:24px;">
            <a href="${APP_URL}/dashboard" style="display:inline-block;padding:14px 28px;background:#6696C9;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;">
              Go to Dashboard
            </a>
          </p>
          <p style="margin-top:32px;color:#999;font-size:13px;">
            Questions? Just reply to this email — we're here to help.
          </p>
        </div>
      `,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error("[welcome-email] Resend error:", body);
    return { success: false, error: body };
  }

  return { success: true };
}
