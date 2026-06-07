"use client";

const WEBSITE_ID = "8674bf5b-c6a5-4cc1-8394-fa5a49cdd053";
const SCRIPT_URL = "https://cloud.umami.is/script.js";

export function UmamiScript() {
  return (
    <script
      defer
      src={SCRIPT_URL}
      data-website-id={WEBSITE_ID}
      data-auto-track="true"
    />
  );
}
