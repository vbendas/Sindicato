"use client";

const WEBSITE_ID = "8674bf5b-c6a5-4cc1-8394-fa5a49cdd053";
const SCRIPT_URL = "https://cloud.umami.is/script.js";

function getTrackScript(): string {
  return `
    (function() {
      function trackPageview() {
        var path = window.location.pathname;
        var match = path.match(/^\\/(?:en|es|pt|fr|it|de|hi|fil|vi|sw|ne|am|ar)?\\/(cases|workers|gig)\\/(.+)$/);
        if (!match) return;
        
        var entityType = match[1] === 'cases' ? 'case' : 'company';
        var entityId = match[2];
        
        fetch('/api/track/pageview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ entityType: entityType, entityId: entityId }),
          keepalive: true
        }).catch(function() {});
      }
      
      if (document.readyState === 'complete') {
        trackPageview();
      } else {
        window.addEventListener('load', trackPageview);
      }
    })();
  `;
}

export function UmamiScript() {
  return (
    <>
      <script
        defer
        src={SCRIPT_URL}
        data-website-id={WEBSITE_ID}
        data-auto-track="true"
      />
      <script dangerouslySetInnerHTML={{ __html: getTrackScript() }} />
    </>
  );
}
