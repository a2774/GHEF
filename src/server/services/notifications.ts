type Email = {
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
};

type OwnerNotification = Omit<Email, "to">;

/** Sends one email through Resend. Returns false instead of throwing. */
export async function sendEmail({ to, subject, text, replyTo }: Email) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("Email skipped: set RESEND_API_KEY.");
    return false;
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
      console.error("Email failed:", response.status, await response.text());
      return false;
    }
    return true;
  } catch (error) {
    console.error("Email failed:", error);
    return false;
  }
}

// A failed email is logged, never thrown: the message is already saved in the database.
export async function notifyOwner({ subject, text, replyTo }: OwnerNotification) {
  const to = process.env.NOTIFY_EMAIL;
  if (!to) {
    console.warn("Owner email skipped: set RESEND_API_KEY and NOTIFY_EMAIL.");
    return;
  }
  await sendEmail({ to, subject, text, replyTo });
}
