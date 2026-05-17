---
name: province-industry-auto-publisher
description: End-to-end workflow for optimizing and deploying local province/city industry websites with automated article publishing. Use when the user wants to build or refine a website for a location plus industry such as "贵阳定制", "贵州导游", "云南包车", "成都私家团"; set up hidden or visible SEO/GEO article sections from prompt and title files; generate content with DeepSeek; push to GitHub; configure GitHub Actions; deploy through Cloudflare R2/Worker or Cloudflare Pages; and bind a custom domain.
---

# Province Industry Auto Publisher

Use this skill to run the repeatable chain:

**optimize website -> set up automated publishing -> push to GitHub -> deploy on Cloudflare -> verify production URLs**.

## Required User Inputs

Ask for these exact items before starting if they are missing:

1. **网站定位**
   - Required format: `地名 + 行业`
   - Examples: `贵阳定制`, `贵州导游`, `云南包车`, `成都私家团`, `西安地接`
   - Also ask for official company name, phone number, WeChat QR/logo files, and target domain if the user wants branding changes.

2. **提示词文件**
   - One or more prompt text files used for automated article generation.
   - If there are alternating prompt types, label them clearly, for example:
     - `中文提示词`
     - `带英文后缀提示词`
   - Preserve prompt files in the repo under `automation/prompts/`.

3. **标题/关键词文件**
   - A text file containing one title per line.
   - Preserve it under `automation/keywords/`.
   - Each generated article should consume one unused title and avoid duplicates.

4. **GitHub Token**
   - Fine-grained token is preferred.
   - Required permissions for the target repo:
     - Contents: Read and write
     - Actions: Read and write
   - Never commit the token.

5. **Cloudflare API Token**
   - Must be able to access the target account and zone.
   - Needed for R2 bucket/domain/Worker automation or Cloudflare Pages setup.
   - Never commit the token.

6. **DeepSeek API Key**
   - Store only as GitHub Secret named `DEEPSEEK_API_KEY`.
   - Never commit the key.

7. **Deployment Target**
   - GitHub repo URL, for example `https://github.com/user/repo.git`.
   - Cloudflare account/zone/domain, for example `sjt.gz-axy.com`.
   - R2 bucket name if using R2, for example `sjt`.

## Default Architecture

Prefer this architecture for static Astro/local-industry sites:

- GitHub repository as source of truth.
- GitHub Actions for automation:
  - scheduled visible blog publishing,
  - scheduled hidden GEO/SEO publishing,
  - build and deploy after every push.
- DeepSeek for article generation through `DEEPSEEK_API_KEY`.
- Cloudflare R2 for static assets/site output.
- Cloudflare Worker in front of R2 to map:
  - `/` -> `index.html`
  - `/path` -> `/path/index.html`
  - unknown paths -> `404.html`
- Custom domain routed to the Worker.

Use Cloudflare Pages instead of R2/Worker if the user explicitly prefers Pages or if the project already uses Pages successfully.

## Implementation Steps

### 1. Inspect The Project

- Identify framework, build command, output directory, content format, and current deployment setup.
- For Astro, expect:
  - build command: `npm run build`
  - output directory: `dist`
  - content collections in `src/content.config.ts`.

### 2. Apply Website Optimization

Make requested visible edits first:

- company name,
- phone number,
- logo/favicon,
- CTA buttons,
- contact page/booking page,
- navigation and footer.

Build locally after edits.

### 3. Add Article Automation

Create automation files:

- `automation/prompts/*.txt`
- `automation/keywords/*.txt`
- `scripts/generate-*.mjs`
- `.github/workflows/*.yml`

For visible guide/blog content:

- Use the site’s existing visible collection, usually `src/content/blog`.
- If the user asks for weekly publishing, schedule weekly.
- If the user asks for daily publishing, schedule daily.

For hidden GEO/SEO content:

- Create a separate content collection, for example `geo`.
- Create a low-visibility URL such as `/insights-lab/`.
- Do not add it to visible navigation unless the user asks.
- Generate list and detail pages.

### 4. DeepSeek Generation Rules

Use DeepSeek chat completions:

- endpoint: `https://api.deepseek.com/chat/completions`
- model: `deepseek-chat`
- secret env var: `DEEPSEEK_API_KEY`

The generator must:

- read one unused title from the title/keyword file,
- choose the prompt type according to the schedule if alternating,
- generate Markdown body only,
- add frontmatter matching the site content schema,
- avoid overwriting existing articles,
- exit non-zero on API failure,
- run a build after generation.

For alternating prompt files, use deterministic day/week parity, for example:

- even day index: `geo-with-english`
- odd day index: `geo`

### 5. GitHub Setup

Use the user’s token only transiently.

- Prefer GitHub REST API for repo secrets:
  - `DEEPSEEK_API_KEY`
  - `R2_ACCESS_KEY_ID`
  - `R2_SECRET_ACCESS_KEY`
- Use GitHub Variables for non-secret deployment values:
  - `R2_BUCKET`
  - `R2_ENDPOINT`

If local Git credential/TLS fails:

- switch Git SSL backend to OpenSSL,
- or use GitHub REST API to create blobs, trees, commits, and update `refs/heads/main`.

Never echo secrets in final responses.

### 6. Cloudflare Setup

For R2 + Worker:

- Confirm account ID with `/client/v4/accounts`.
- Confirm zone ID with `/client/v4/zones?name=<root-domain>`.
- Create/confirm R2 bucket.
- Upload `dist` via GitHub Actions.
- Create Worker with R2 bucket binding.
- Add Worker route for:
  - `<subdomain>.<domain>/*`
  - exact no-slash page routes if needed.
- Verify domain status and SSL.

If a custom domain points directly to R2 and directory paths return 404, add the Worker layer.

### 7. Verification

Always verify:

- GitHub latest commit exists.
- GitHub Actions workflows exist.
- required GitHub Secrets exist by name.
- build workflow completes successfully.
- production homepage returns `200`.
- visible blog page returns `200`.
- hidden GEO list page returns `200` if created.
- a newly generated article returns `200`.
- important phone/company text appears in production HTML.

## User-Facing Status Style

When blocked, tell the user exactly:

- what is blocked,
- why it is blocked,
- what single authorization/configuration action is needed,
- what will continue automatically afterward.

Do not ask the user to manually deploy files or manually repeat long command sequences unless there is no available API/tool path.

## Security Rules

- Never write API keys or tokens into repo files.
- Never commit `.env`.
- Store secrets only in GitHub Secrets or provider secret stores.
- After a successful setup, recommend key rotation if secrets were pasted in chat.
