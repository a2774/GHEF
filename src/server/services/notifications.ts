type OwnerNotification = {
  subject: string;
  text: string;
  replyTo?: string;
};

// A failed email is logged, never thrown: the message is already saved in the database.
export async function notifyOwner({ subject, text, replyTo }: OwnerNotification) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.NOTIFY_EMAIL;
  if (!apiKey || !to) {
    console.warn("Owner email skipped: set RESEND_API_KEY and NOTIFY_EMAIL.");
    return;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM ?? "Ganga Handmade Export <onboarding@resend.dev>",
        to: [to],
        subject,
        text,
        reply_to: replyTo,
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) {
      console.error("Owner email failed:", response.status, await response.text());
    }
  } catch (error) {
    console.error("Owner email failed:", error);
  }
}
