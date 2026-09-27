export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  /**
   * Send transactional email using Resend API or mock logger
   */
  static async sendEmail({ to, subject, html, text }: SendEmailParams): Promise<{ success: boolean; id?: string }> {
    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL || "notifications@afrix.work";

    if (!apiKey) {
      // Mock email delivery in development / without API key
      console.log(`[EmailService:Mock] To: ${to} | Subject: "${subject}" | Content length: ${html.length}`);
      return { success: true, id: `mock_email_${Date.now()}` };
    }

    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromEmail,
          to,
          subject,
          html,
          text: text || html.replace(/<[^>]*>?/gm, ""),
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error("[EmailService] Failed to send email via Resend:", error);
        return { success: false };
      }

      const data = await response.json();
      return { success: true, id: data.id };
    } catch (err) {
      console.error("[EmailService] Network error sending email:", err);
      return { success: false };
    }
  }
}
