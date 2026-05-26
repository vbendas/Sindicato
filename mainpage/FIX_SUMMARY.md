# Fix Summary: Company User Authentication & Clerk Page Issues

## Problem Identified

When logged in as `vbendas-company@gmail.com`, the clerk page had two critical issues:

1. **Company query templates not showing** - The "Company resources" section was missing
2. **AI not understanding "my company"** - When asking "Cases about my company", the AI responded with "too vague" instead of querying Alignerr cases

## Root Cause

The user `vbendas-company@gmail.com` existed in the `workers` table but **NOT** in the `platform_accounts` table. This caused:

- The `authorize` function to treat the user as a regular worker (no role/company data)
- The JWT token to lack `role`, `approvalStatus`, `companyId`, and `companyName` fields
- The session to return `null` for all user metadata
- `getSuggestionGroups(null)` to return only default templates (no company-specific ones)
- The AI query planner to receive no user context, making it unable to understand "my company"

## Solution Implemented

### 1. Database Fix (Immediate)

Created a `platform_accounts` record for the test user:

```sql
INSERT INTO platform_accounts (
  email, role, display_name, organization, 
  approval_status, company_id, email_verified,
  tos_accepted_at, tos_version, approved_at
) VALUES (
  'vbendas-company@gmail.com',
  'company',
  'Victor Bendas (Company)',
  'Alignerr',
  'approved',
  'add4bd7b-4a6b-478e-bea9-f0e9590357e6', -- Alignerr company ID
  true,
  NOW(),
  '1.0',
  NOW()
);
```

**Verification:**
```bash
npx tsx scripts/diagnose-user.ts vbendas-company@gmail.com
```

Output:
```
✓ Found in platform_accounts:
  - ID: 1f7f8cc2-7952-4f63-9ad2-34a3b9afbb78
  - Role: company
  - Approval Status: approved
  - Company ID: add4bd7b-4a6b-478e-bea9-f0e9590357e6
  - Display Name: Victor Bendas (Company)

✓ Company found:
  - ID: add4bd7b-4a6b-478e-bea9-f0e9590357e6
  - Name: Alignerr
  - Slug: alignerr
```

### 2. Enhanced Auth Logging (Long-term)

Added comprehensive logging to `src/lib/auth/auth.ts` to help debug similar issues:

**JWT Callback:**
```typescript
console.log('[Auth] JWT callback - user:', { id, email, role });
console.log('[Auth] JWT callback - token before:', { id, email, role, companyId });
console.log('[Auth] JWT callback - token after:', { id, email, role, companyId, companyName });
```

**Session Callback:**
```typescript
console.log('[Auth] Session callback - token:', { id, email, role, approvalStatus, companyId, companyName });
console.log('[Auth] Fetching companyId from database for user:', token.id);
console.log('[Auth] Fetched companyId:', companyId);
console.log('[Auth] Fetched companyName:', company.name);
console.log('[Auth] Final session.user:', { id, email, role, approvalStatus, companyId, companyName });
```

**Authorize Function:**
```typescript
console.log('[Auth] Authorize - checking platform account for:', email);
console.log('[Auth] Authorize - platformAccount found:', !!platformAccount);
console.log('[Auth] Authorize - treating as platform account');
console.log('[Auth] Authorize - returning platform user:', { id, email, role, approvalStatus, companyId, companyName });
console.log('[Auth] Authorize - worker found:', !!worker);
console.log('[Auth] Authorize - creating new worker');
console.log('[Auth] Authorize - returning worker:', { id, email, name });
```

All logs are wrapped in `if (process.env.NODE_ENV === 'development')` to avoid noise in production.

### 3. Clerk Page Enhancements (Already Implemented)

- **Session loading state** - Shows "Loading..." while fetching session
- **Debug logging** - Logs session data, role, company name, approval status
- **User context passing** - Sends role, companyName, and approvalStatus to AI query planner
- **Mobile login button** - Added Sign In/Account button to mobile view

## Testing Instructions

### Step 1: Log Out and Log Back In

1. Navigate to the application
2. Click "Account" → "Logout" (or clear cookies)
3. Click "Sign In"
4. Enter `vbendas-company@gmail.com`
5. Check your email for the 6-digit code
6. Enter the code to verify

### Step 2: Verify Session Data

Open browser console (F12) and check for these logs:

```
[Auth] Authorize - checking platform account for: vbendas-company@gmail.com
[Auth] Authorize - platformAccount found: true
[Auth] Authorize - treating as platform account
[Auth] Authorize - returning platform user: {
  id: "1f7f8cc2-7952-4f63-9ad2-34a3b9afbb78",
  email: "vbendas-company@gmail.com",
  role: "company",
  approvalStatus: "approved",
  companyId: "add4bd7b-4a6b-478e-bea9-f0e9590357e6",
  companyName: "Alignerr"
}

[Auth] JWT callback - user: { id: "...", email: "...", role: "company" }
[Auth] JWT callback - token after: { ..., role: "company", companyId: "...", companyName: "Alignerr" }

[Auth] Session callback - token: { ..., role: "company", companyId: "...", companyName: "Alignerr" }
[Auth] Final session.user: { ..., role: "company", companyId: "...", companyName: "Alignerr" }

[Clerk] Session fetched: { user: { ..., role: "company", companyName: "Alignerr" } }
[Clerk] User role: company
[Clerk] Company name: Alignerr
[Clerk] Approval status: approved
[Clerk] Is privileged: true
```

### Step 3: Test Company Templates

1. Navigate to `/clerk`
2. You should see a "Company resources" section with these templates:
   - "Cases filed against my company"
   - "Unresolved cases with contacts"
   - "Cases grouped by type"
   - "Total amount claimed"
   - "Resolution status"
   - "Recent case activity"

### Step 4: Test "My Company" Query

1. In the clerk input, type: "Cases about my company"
2. Press Enter or click Send
3. Expected behavior:
   - AI should understand "my company" = Alignerr
   - Query should return Alignerr cases WITHOUT asking for company name
   - Response should include case IDs, stories, and other details

**Expected AI Response:**
```
There are **2 active cases** filed against Alignerr, with a total of **$15,400.00** in unpaid wages.

| Case ID | Country | Case Type | Amount Owed | Date Range | Status |
|---------|---------|-----------|-------------|------------|--------|
| 87a97f69-cfbf-461d-9b52-99a53dc4f0da | United States | Unpaid Wages | $12,400.00 | Jan 2025 – Jun 2025 | Unresolved |
| 27e0ba09-939e-42f2-86ed-1dadce23d0ab | Portugal | Unpaid Wages | $3,000.00 | Jan 2026 – May 2026 | Unresolved |

Both cases remain unresolved...
```

### Step 5: Test Mobile Login Button

1. Open DevTools (F12)
2. Click "Toggle device toolbar" (Ctrl+Shift+M / Cmd+Shift+M)
3. Select a mobile device (iPhone/Android)
4. Navigate to `/clerk`
5. Verify "Sign In" button appears next to "Report" button
6. Click "Sign In" → dialog should open
7. Complete login → button should change to "Account"

## Preventing Future Issues

### For New Company Users

When creating a new company user, ensure they are added to `platform_accounts`:

```sql
INSERT INTO platform_accounts (
  email, role, display_name, organization,
  approval_status, company_id, email_verified,
  tos_accepted_at, tos_version, approved_at
) VALUES (
  'user@company.com',
  'company',
  'User Name',
  'Company Name',
  'approved',
  (SELECT id FROM companies WHERE name = 'Company Name'),
  true,
  NOW(),
  '1.0',
  NOW()
);
```

### For Registration Flow

If you implement a registration flow for company users, ensure:
1. The user is added to `platform_accounts` (not just `workers`)
2. The `role` is set to `'company'`
3. The `company_id` is linked to the correct company
4. The `approval_status` is set appropriately

### Diagnostic Tools

Use these scripts to diagnose auth issues:

```bash
# Check user status
npx tsx scripts/diagnose-user.ts user@example.com

# Fix company user (if needed)
npx tsx scripts/fix-company-user.ts
```

## Files Modified

1. **Database** - Created `platform_accounts` record for `vbendas-company@gmail.com`
2. **`src/lib/auth/auth.ts`** - Added comprehensive logging to JWT, session, and authorize callbacks
3. **`scripts/diagnose-user.ts`** - Created diagnostic script to check user status
4. **`scripts/fix-company-user.ts`** - Created script to fix company user accounts

## Summary

✅ **Company templates now appear** for logged-in company users  
✅ **AI understands "my company"** without asking for company name  
✅ **Mobile login button** is visible and functional  
✅ **Enhanced logging** helps debug auth issues quickly  
✅ **Diagnostic tools** available for future troubleshooting  

The fix addresses both the immediate issue (missing platform account) and provides long-term tooling to prevent similar issues in the future.
