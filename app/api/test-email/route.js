import { errorResponse, successResponse } from "@/util/apiResponse";

export async function POST(request) {
  try {
    const { to, message, provider: requestProvider } = await request.json();
    const provider = requestProvider || process.env.EMAIL_PROVIDER || "brevo";

    if (
      typeof to !== "string" ||
      typeof message !== "string" ||
      !to.trim() ||
      !message.trim()
    ) {
      return errorResponse("Recipient email and message are required");
    }

    if (provider !== "brevo" && provider !== "resend") {
      return errorResponse("Unsupported email provider");
    }

    const subject = `AUTH-FULL-NEXTJS-${new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(new Date())}`;

    const response =
      provider === "resend"
        ? await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              accept: "application/json",
              Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
              "content-type": "application/json",
            },
            body: JSON.stringify({
              from: `${process.env.RESEND_SENDER_NAME} <${process.env.RESEND_SENDER_EMAIL}>`,
              to: [to.trim()],
              subject,
              text: message,
            }),
          })
        : await fetch("https://api.brevo.com/v3/smtp/email", {
            method: "POST",
            headers: {
              accept: "application/json",
              "api-key": process.env.BREVO_API_KEY,
              "content-type": "application/json",
            },
            body: JSON.stringify({
              sender: {
                email: process.env.BREVO_SENDER_EMAIL,
                name: process.env.BREVO_SENDER_NAME,
              },
              to: [{ email: to.trim() }],
              subject,
              textContent: message,
            }),
          });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`[${provider}] Error sending email:`, errorBody);
      return errorResponse(
        `${provider === "resend" ? "Resend" : "Brevo"} could not send the email. Provider response: ${errorBody}`,
        response.status,
      );
    }

    return successResponse("Email sent");
  } catch {
    return errorResponse("Invalid request body");
  }
}