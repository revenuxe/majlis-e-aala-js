# Environment variable safety

Real environment files are intentionally ignored by Git. Commit only
`.env.example`, which contains placeholders and no credentials.

## Variables that are allowed in the browser

`NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, and
`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` are deliberately exposed to visitors.
The Supabase URL and publishable/anon key are identifiers for a browser client,
not server secrets. Supabase Row Level Security must protect all data that the
browser can access.

## Variables that must remain server-only

Never prefix the following with `NEXT_PUBLIC_`, never put them in source code,
and never add them to `.env.example`:

- `SUPABASE_SERVICE_ROLE_KEY`
- database passwords
- API tokens, private keys, webhooks, or email-provider credentials

Set these only in Vercel's Environment Variables settings, separately for
Production, Preview, and Development as appropriate. Rotate a value at its
provider immediately if it was ever committed or pasted into a public issue.

The service-role Supabase client is protected by Next.js's `server-only`
boundary and must only be imported from server-side code.
