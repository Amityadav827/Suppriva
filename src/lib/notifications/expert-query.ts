import type { ExpertQuery } from "@/lib/database/types";

type ExpertQueryNotificationResult = {
  delivered: boolean;
  reason?: string;
};

export async function notifyExpertQueryAdmin(
  query: ExpertQuery,
): Promise<ExpertQueryNotificationResult> {
  const notificationEmail = process.env.EXPERT_QUERY_NOTIFICATION_EMAIL;
  const resendApiKey = process.env.RESEND_API_KEY;

  if (!notificationEmail || !resendApiKey) {
    return {
      delivered: false,
      reason: "Email notification is not configured.",
    };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Suppriva <no-reply@suppriva.com>",
      to: [notificationEmail],
      subject: `New Expert Query - ${query.product_name}`,
      text: [
        `Name: ${query.name}`,
        `Email: ${query.email}`,
        `Product: ${query.product_name}`,
        `Product URL: ${query.product_url}`,
        `Question Type: ${query.question_type}`,
        "",
        query.message,
      ].join("\n"),
    }),
  });

  if (!response.ok) {
    const payload = await response.text().catch(() => "");

    return {
      delivered: false,
      reason: payload || "Notification request failed.",
    };
  }

  return { delivered: true };
}
