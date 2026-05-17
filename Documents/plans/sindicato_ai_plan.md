# Sindicato — AI Feature Implementation Plan
**Version 1.0 | May 2026**
**Stack:** OpenRouter → Kimi K2 Instant / DeepSeek V3 / DeepSeek R1
**Principle:** Stateless inference only. Zero data retention. Zero liability.

---

## Core Architecture Principle

Every AI call in Sindicato is completely stateless. No conversation history stored. No user profiles. No persistent context. Each interaction is born and dies in a single API call. The user's input goes in, the AI output comes out, nothing is written to disk or database on your end.

This is not just a cost decision — it is the liability architecture. You cannot be held responsible for data you never stored.

```
Worker input → OpenRouter → Model → Response → Worker browser
                                                      ↑
                                            Nothing stored here
```

---

## Tech Stack

### Primary Gateway
**OpenRouter** — unified API gateway, single integration, swap models by changing one string

### Models by Task

| Task | Model | Why |
|------|-------|-----|
| Writing assistant | `moonshot/kimi-k2-instant` | Fast, cheap, strong at text structuring |
| Translation | `moonshot/kimi-k2-instant` | Excellent multilingual, your own validated choice |
| Report generation | `deepseek/deepseek-v3` | Cheap, fast, good structured output |
| Pattern detection | `deepseek/deepseek-r1` | Reasoning model, runs nightly batch |
| Case triage | `deepseek/deepseek-v3` | Classification task, low latency |
| Case strength indicator | `deepseek/deepseek-v3` | Simple scoring, cheap |

### Infrastructure
- All AI calls proxied through your backend — API key never exposed to client
- Each call independent, no session state
- Nightly batch jobs (pattern detection, report refresh) run via cron on your Hetzner VPS
- Response caching for read-heavy outputs (translated cases, cluster reports) — cache in Redis or simple file cache, not user data

---

## Feature 1 — Claim Writing Assistant
**Priority:** Ship at launch
**Estimated build time:** 1 day
**Model:** Kimi K2 Instant
**Cost per interaction:** ~$0.001

### What it does
Worker fills in the basic structured fields (dates, amounts, projects, number of contact attempts). They then write their story in a free text box — possibly in broken English, their native language, bullet points, or emotional fragments. The AI helps them turn this into a clear, structured, professional testimony without changing any facts.

### User Flow
```
1. Worker fills structured fields (date, amount, project, contacts)
2. Worker writes raw story in free text — any language, any format
3. Worker clicks "Help me write this clearly"
4. AI returns a structured, professional version
5. Worker reads, edits freely, approves
6. Worker submits under their own attestation
```

### System Prompt
```
You are a writing assistant for Sindicato, a labor rights platform.
Your job is to help workers clearly and professionally express 
their experience of unpaid work or wage theft.

Rules you must follow without exception:
- Never invent, assume, or add facts not provided by the worker
- Never give legal advice or predict legal outcomes
- Never make claims on behalf of the worker — only help them 
  express what they have already told you
- If the worker writes in another language, respond in that 
  same language
- Keep the worker's voice — do not make it sound like a 
  legal document, keep it human and personal
- Structure: what work was done, when, what was owed, 
  what happened when they asked for payment
- Maximum 400 words output
- End with a reminder: "Please review this carefully. 
  Only submit if every word reflects your own experience."
```

### API Call Pattern
```javascript
async function writingAssistant(structuredFields, rawStory) {
  const context = `
    Project: ${structuredFields.project}
    Date range: ${structuredFields.dateRange}  
    Amount owed: ${structuredFields.amount}
    Contact attempts: ${structuredFields.contactAttempts}
    Worker's raw account: ${rawStory}
  `;

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "moonshot/kimi-k2-instant",
      messages: [
        { role: "system", content: WRITING_ASSISTANT_SYSTEM_PROMPT },
        { role: "user", content: context }
      ],
      max_tokens: 600,
      temperature: 0.3  // Low temperature — factual task, minimal creativity
    })
  });

  const data = await response.json();
  return data.choices[0].message.content;
  // Nothing stored. Response returned to browser. Done.
}
```

### UI Notes
- Button: "Help me express this clearly" — not "AI Write My Claim"
- Show original and AI version side by side
- Large "Edit freely" prompt above the AI output
- Attestation checkbox only appears after worker has reviewed
- Disclaimer beneath button: *"AI helps you structure your own words. It never invents facts."*

---

## Feature 2 — Multilingual Translation
**Priority:** Ship at launch
**Estimated build time:** 1 day
**Model:** Kimi K2 Instant
**Cost per case translated:** ~$0.002

### What it does
Workers submit in any language. The public Cases Wall displays in English by default for maximum reach — journalists, solicitors, and regulators can read every case regardless of origin. Workers can toggle to view in original language. Translations are generated once at submission and cached — no per-view API cost.

### Supported Languages at Launch
Portuguese (BR + PT), Spanish, Hindi, Filipino/Tagalog, Romanian, Polish, French, German — covering the primary nationalities targeted by uberization platforms.

### Translation Call Pattern
```javascript
async function translateCase(caseText, sourceLanguage) {
  // Only called once at submission — result cached, not regenerated
  
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST", 
    headers: {
      "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "moonshot/kimi-k2-instant",
      messages: [
        {
          role: "system",
          content: `Translate the following worker testimony from ${sourceLanguage} 
                   to English. Preserve the worker's voice and emotional tone exactly. 
                   Do not sanitize, soften, or professionalize the language. 
                   Translate faithfully, not diplomatically.`
        },
        { role: "user", content: caseText }
      ],
      max_tokens: 800,
      temperature: 0.1  // Faithful translation, minimal interpretation
    })
  });

  const data = await response.json();
  const translatedText = data.choices[0].message.content;
  
  // Store translation result in case record — this is the output, not user data
  await db.updateCase(caseId, { translatedText, translationLanguage: "en" });
  
  return translatedText;
}
```

### Language Detection
Use a lightweight library (franc or langdetect) to auto-detect submission language before the translation call. Worker can also manually select — useful when auto-detection fails on short texts.

---

## Feature 3 — Automated Cluster Report Generation
**Priority:** Ship at launch
**Estimated build time:** 2 days
**Model:** DeepSeek V3
**Cost per report:** ~$0.01–0.05 depending on cluster size

### What it does
When a lawyer or company pays for access, the platform auto-generates a structured PDF summary of the case cluster. No manual work from you. Payment triggers generation. PDF delivered within seconds.

Two report variants:
- **Lawyer Report** — case-focused, legal framing, claimant contact list
- **Company Report** — pattern-focused, resolution framing, aggregate figures

### Report Generation Call
```javascript
async function generateClusterReport(companyName, cases, reportType) {
  const casesSummary = cases.map(c => `
    - ${c.displayName} (${c.country}): ${c.amount} owed, 
      project: ${c.project}, period: ${c.dateRange}, 
      contact attempts: ${c.contactAttempts}
      testimony excerpt: "${c.testimony.substring(0, 200)}..."
  `).join("\n");

  const systemPrompts = {
    lawyer: `You are generating a case cluster summary for a labor law firm 
             evaluating potential collective action. Be precise, factual, 
             and legally structured. Focus on: pattern consistency, 
             timeline, financial exposure, and plaintiff readiness.
             All figures are self-reported by individual contributors.`,
    
    company: `You are generating a case summary for a company reviewing 
              reported claims against them. Be neutral and factual. 
              Focus on: pattern description, date ranges, projects affected, 
              and resolution pathway. Do not assign blame. 
              Frame as information for internal review.`
  };

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "deepseek/deepseek-v3",
      messages: [
        { role: "system", content: systemPrompts[reportType] },
        { 
          role: "user", 
          content: `Company: ${companyName}
                   Total cases: ${cases.length}
                   Total reported unpaid: ${calculateTotal(cases)}
                   Date range: ${getDateRange(cases)}
                   
                   Individual cases:
                   ${casesSummary}
                   
                   Generate a structured report with sections:
                   1. Executive Summary
                   2. Pattern Analysis  
                   3. Timeline
                   4. Financial Exposure
                   5. ${reportType === 'lawyer' ? 'Plaintiff Readiness Assessment' : 'Resolution Recommendations'}
                   
                   Include disclaimer: All figures represent individual 
                   self-reported claims. Sindicato does not verify claims.`
        }
      ],
      max_tokens: 2000,
      temperature: 0.2
    })
  });

  const data = await response.json();
  const reportContent = data.choices[0].message.content;
  
  // Convert to PDF using puppeteer or similar
  return await generatePDF(reportContent, companyName, reportType);
}
```

---

## Feature 4 — Case Strength Indicator
**Priority:** Week 1 post-launch
**Estimated build time:** 2 days
**Model:** DeepSeek V3
**Cost per evaluation:** ~$0.001

### What it does
After a worker submits, they see a simple signal showing which elements strengthen their case — not legal advice, just pattern matching against what makes cases actionable. Helps workers understand what additional information to include.

### Output Example
```
Your case includes:
✓ Specific work period documented
✓ Named projects
✓ Specific amount claimed  
✓ Multiple contact attempts recorded
✗ No mention of written contract or agreement
✗ No mention of platform policies referenced

Cases with 4+ of these elements are typically flagged for solicitor review.
Adding contract or policy references significantly strengthens cases.

This is not legal advice. It is pattern analysis only.
```

### Scoring Prompt
```javascript
const SCORING_SYSTEM_PROMPT = `
You are analyzing a worker's case submission for completeness and 
pattern strength. You are NOT giving legal advice or predicting outcomes.

Evaluate the submission against these elements:
1. Specific work dates provided
2. Named project or task type  
3. Specific monetary amount claimed
4. Number of contact attempts documented
5. Reference to written contract, agreement, or platform policy
6. Clear description of what work was completed
7. Description of company response or non-response
8. Mention of any evidence they hold (logs, screenshots, emails)

Return JSON only:
{
  "present": ["element names present"],
  "missing": ["element names missing"],  
  "score": 0-8,
  "strengthMessage": "one sentence, factual, no legal prediction",
  "improvementTip": "one specific thing they could add to strengthen"
}
`;
```

---

## Feature 5 — Nightly Pattern Detection
**Priority:** Week 2 post-launch
**Estimated build time:** 3 days
**Model:** DeepSeek R1
**Cost per nightly run:** ~$0.10–0.50 depending on case volume
**Runs:** Cron job, 2am UTC

### What it does
Runs across all cases nightly. Detects patterns invisible to human review at scale:
- Same company, same project, same timeframe — systematic not individual
- Similar retaliation sequences across companies — industry-wide tactic
- Seasonal non-payment patterns — tied to funding cycles or fiscal quarters
- Geographic clustering — targeting specific worker populations
- Threshold alerts — clusters approaching class action viability (20/50/100 cases)

### Output
Updates dashboard statistics automatically. Sends internal alerts when thresholds crossed. No worker data exposed — analysis runs on aggregate, outputs are statistics.

```javascript
async function runNightlyPatternDetection() {
  // Pull aggregate case data — no PII, no testimony
  const aggregateData = await db.getAggregatePatternData();
  // Returns: {company, project, dateRange, country, amount_range} arrays
  // No names, no emails, no testimony text

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "deepseek/deepseek-r1",
      messages: [
        {
          role: "system",
          content: `You are a labor data analyst identifying patterns 
                   in gig worker payment disputes. Analyze aggregate 
                   case data for systematic patterns. Return structured 
                   JSON analysis only.`
        },
        {
          role: "user",
          content: `Aggregate case data: ${JSON.stringify(aggregateData)}
                   
                   Identify:
                   1. Clusters by company + project + timeframe
                   2. Cross-company tactic patterns
                   3. Seasonal patterns
                   4. Geographic worker targeting patterns
                   5. Clusters at 20, 50, 100 case thresholds
                   
                   Return JSON with findings and recommended 
                   dashboard updates.`
        }
      ],
      max_tokens: 3000,
      temperature: 0.1
    })
  });

  const patterns = JSON.parse(response.data.choices[0].message.content);
  await updateDashboardPatterns(patterns);
  await sendThresholdAlerts(patterns.thresholdAlerts);
}
```

---

## Feature 6 — Legal Triage Pre-Screening
**Priority:** When legal partnerships active
**Estimated build time:** 2 days
**Model:** DeepSeek V3
**Cost per screening:** ~$0.002

### What it does
When a worker opts into the legal support programme, AI does initial pre-screening before passing to the partner lawyer. Lawyer receives a pre-assessed case, not raw submission. Their one-hour consultation is spent on legal strategy, not admin triage.

### Pre-screening Output to Lawyer
```
SINDICATO PRE-SCREEN SUMMARY
Worker: [anonymous ID until lawyer engagement]
Jurisdiction: Portugal / EU
Platform: Alignerr (Labelbox Inc, Delaware)

Completeness score: 7/8
Missing: Written contract reference

Key elements present:
- Work period: March–September 2024
- Projects: CC Review, CHP Claude Code, NEXT  
- Amount: €[X] reported
- Evidence mentioned: Hubstaff logs, AutoQA results, Discord screenshots
- Contact attempts: 12 documented
- Retaliation: Documented sequence described

Preliminary jurisdiction notes:
- Company incorporated Delaware, California operations
- Worker located EU — potential EU Platform Work Directive applicability
- Small claims California limit: $12,500

This pre-screen is AI-generated pattern analysis only.
Legal assessment is entirely your professional judgment.
```

---

## Cost Projection

### Monthly at 500 active workers

| Feature | Calls/month | Cost/call | Monthly cost |
|---------|-------------|-----------|--------------|
| Writing assistant | 300 | $0.001 | $0.30 |
| Translation | 500 | $0.002 | $1.00 |
| Report generation | 20 | $0.03 | $0.60 |
| Case strength | 500 | $0.001 | $0.50 |
| Pattern detection | 30 runs | $0.20 | $6.00 |
| Legal triage | 50 | $0.002 | $0.10 |
| **Total** | | | **~$8.50/month** |

### Monthly at 5,000 active workers
Roughly linear scaling: **~$85/month**

One lawyer referral fee at €500 covers approximately 6 months of AI costs at 500 workers. The AI layer is essentially free relative to the revenue it enables.

---

## Privacy and Liability Architecture

### What is processed but never stored
- Raw worker testimony during writing assistant session
- Case text during translation (translation output is stored, not source)
- Aggregate statistics during pattern detection

### What is stored (not AI-related, standard platform data)
- Submitted case fields (worker chose to make these public)
- Translated case text (output, not source conversation)
- Pattern detection outputs (statistics, not individual data)
- Generated reports (PDFs tied to paid transactions)

### API Key Security
- OpenRouter API key lives only in server environment variables
- Never exposed to client
- All AI calls proxied through your backend
- Rate limiting per IP to prevent abuse of writing assistant

### Terms of Service Addition
One paragraph covering AI processing:

> *"Sindicato uses AI language models to assist workers in expressing their cases, translate submissions, and analyze aggregate patterns. AI processing is stateless — no conversation history or personal data is retained by AI providers beyond the duration of a single request. Workers are never identified to AI providers. AI features are assistive tools only; all submitted content represents the worker's own words and attestation."*

---

## Build Order

### Week 1 — Launch Features
- Day 1: Writing assistant (backend endpoint + frontend UI)
- Day 1: Language detection + translation pipeline
- Day 2–3: Report generation + PDF output
- Day 3: OpenRouter integration with model routing

### Week 2 — Enhancement Layer
- Day 1–2: Case strength indicator
- Day 3–4: Nightly pattern detection cron job
- Day 5: Dashboard auto-update from pattern outputs

### Week 3–4 — Legal Programme Integration
- Legal triage pre-screening
- Partner lawyer delivery format
- Threshold alert system for class action viability

---

## Redaction Utility — Public Display

**Priority:** Ship at launch (required by every public-facing endpoint)
**Not AI-driven** — pure backend utility function applied to all case data before rendering.

### Rules

| Field | Public Display | Paid Lead Data |
|-------|---------------|----------------|
| Name | `Vic*****` (first 3 chars + asterisks) | Full name |
| Email | `v*****@g***.com` (first char + asterisks + domain char + asterisks + TLD) | Full email |
| Country | Full | Full |
| Project, dates, amount, story | Full | Full |

### Implementation

```javascript
function redactName(fullName) {
  if (!fullName || fullName.length < 3) return '***';
  return fullName.substring(0, 3) + '*****';
}

function redactEmail(email) {
  if (!email) return '';
  const [local, domain] = email.split('@');
  const domainParts = domain.split('.');
  const domainName = domainParts[0];
  const tld = domainParts.slice(1).join('.');
  return local[0] + '*****@' + domainName[0] + '***.' + tld;
}
```

Applied server-side to all case data returned to public endpoints. Paid lead data endpoints return unredacted fields only after verifying: fee paid + non-retaliation agreement signed + verified company/lawyer account.

---

## Resolution Follow-Up Cron

**Priority:** Week 2 post-launch
**Not AI-driven** — simple database query + email template.
**Runs:** Cron job, daily at 10am UTC

### What it does
Sends a periodic email to workers with active cases older than 30 days, asking them to update their case status if resolved. Keeps dashboards accurate without manual follow-up.

```javascript
async function sendResolutionFollowUps() {
  const activeCases = await db.query(`
    SELECT c.id, c.workerEmail, c.companyName, c.createdAt
    FROM cases c
    WHERE c.status = 'active'
      AND c.createdAt < NOW() - INTERVAL '30 days'
      AND c.lastFollowUpSentAt < NOW() - INTERVAL '30 days'
  `);

  for (const case of activeCases) {
    await sendEmail({
      to: case.workerEmail,
      subject: `Your case against ${case.companyName} is still active`,
      template: 'resolution-follow-up',
      data: { companyName: case.companyName, caseId: case.id }
    });
    await db.update(case.id, { lastFollowUpSentAt: new Date() });
  }
}
```

Throttled to max one follow-up per case per 30 days. Workers can opt out of follow-up emails in their account settings.

---

## Environment Setup

```bash
# .env
OPENROUTER_API_KEY=your_key_here
DEFAULT_MODEL=moonshot/kimi-k2-instant
REASONING_MODEL=deepseek/deepseek-r1  
FAST_MODEL=deepseek/deepseek-v3

# Model routing config — change without touching code
WRITING_MODEL=moonshot/kimi-k2-instant
TRANSLATION_MODEL=moonshot/kimi-k2-instant
REPORT_MODEL=deepseek/deepseek-v3
PATTERN_MODEL=deepseek/deepseek-r1
TRIAGE_MODEL=deepseek/deepseek-v3
```

Single environment variable change to swap any model. If a cheaper or better model drops tomorrow, one line update, deploy, done.

---

*All AI features are assistive infrastructure. Workers attest to their own words. Sindicato never asserts, verifies, or endorses any claim. AI is the pipe, not the voice.*
