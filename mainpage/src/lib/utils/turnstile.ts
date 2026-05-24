const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export async function verifyTurnstileToken(token: string): Promise<boolean> {
  if (!process.env.CF_TURNSTILE_SECRET) {
    console.error("Turnstile secret not configured — verification failing closed");
    return false;
  }

  try {
    const response = await fetch(TURNSTILE_VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret: process.env.CF_TURNSTILE_SECRET,
        response: token,
      }),
    });

    const data = await response.json();
    if (!data.success) {
      console.error("Turnstile verification failed:", JSON.stringify(data));
    }
    return data.success === true;
  } catch (err) {
    console.error("Turnstile verification failed:", err);
    return false;
  }
}
