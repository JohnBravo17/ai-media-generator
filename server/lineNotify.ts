/**
 * LINE Notify Integration
 * Sends notifications to LINE when users sign up
 */

const LINE_NOTIFY_API = "https://notify-api.line.me/api/notify";
const LINE_NOTIFY_TOKEN = process.env.LINE_NOTIFY_TOKEN;

if (!LINE_NOTIFY_TOKEN) {
  console.warn("[LINE Notify] Token not configured");
}

/**
 * Send notification to LINE
 */
export async function sendLineNotification(message: string): Promise<boolean> {
  if (!LINE_NOTIFY_TOKEN) {
    console.warn("[LINE Notify] Cannot send notification: token not configured");
    return false;
  }

  try {
    const formData = new URLSearchParams();
    formData.append("message", message);

    const response = await fetch(LINE_NOTIFY_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": `Bearer ${LINE_NOTIFY_TOKEN}`,
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[LINE Notify] API error:", response.status, errorText);
      return false;
    }

    return true;
  } catch (error) {
    console.error("[LINE Notify] Error sending notification:", error);
    return false;
  }
}

/**
 * Notify about new user sign-up
 */
export async function notifyNewSignup(user: {
  name?: string | null;
  email?: string | null;
  loginMethod?: string | null;
}) {
  const message = `
🎉 New User Sign-up!

Name: ${user.name || "N/A"}
Email: ${user.email || "N/A"}
Login Method: ${user.loginMethod || "N/A"}
Time: ${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}
  `.trim();

  return await sendLineNotification(message);
}

