# Release Playbook

## Overview

We use a **release branch pattern** to selectively promote changes from `dev` to `main` (production). Dev is never modified during this process. GitHub Pages deploys from `main` automatically.

```
dev ──→ release/<name> ──→ main (prod)
         (hide/unhide)
```

## Release Steps

```bash
# 1. Start from latest dev
git checkout dev && git pull origin dev

# 2. Create release branch
git checkout -b release/<name>   # e.g. release/prod-update

# 3. Make hiding/unhiding changes using PROD-HIDE markers (see below)

# 4. Verify
node -c <modified-js-file>       # JS syntax check
# Visually inspect HTML comments are well-formed (no nesting, no unclosed)
# python3 -m http.server 5500    # Optional: local visual check

# 5. Commit
git add -A && git commit -m "release: <description>"

# 6. Merge to main and push
git checkout main
git merge release/<name>
git push origin main

# 7. Verify on edwardstone.design (~60s deploy)

# 8. Clean up
git branch -d release/<name>
```

## PROD-HIDE Marker Conventions

**HTML:**
```html
<!-- PROD-HIDE: Flip 7 strip
<section>...</section>
END PROD-HIDE -->
```

**Single-line HTML:**
```html
<!-- PROD-HIDE: Fair Share learn more link -->
<!-- <a href="...">Learn more</a> -->
<!-- END PROD-HIDE -->
```

**JS:**
```js
const NAV_LINKS = [
  /* PROD-HIDE: Project and Resume nav items
  { text: 'Projects', children: [...] },
  { text: 'Resume', href: '/resume.html' }
  END PROD-HIDE */
];
```

Rules:
- Always include a short description after `PROD-HIDE:`
- Ensure JS arrays/objects remain syntactically valid after commenting (no trailing commas)
- All markers are searchable: `grep -r "PROD-HIDE" --include="*.html" --include="*.js"`

## Rollback

**Safe (creates a revert commit):**
```bash
git revert <merge-commit> && git push origin main
```

**Nuclear (rewrites history):**
```bash
git reset --hard <previous-commit> && git push --force origin main
```

## Currently Hidden on Prod

As of `b22ef31` (`release/prod-update`, 2025-02-12). On dev, strips and toolbox may be visible; release branch comments these out for main.

| Item | File | Marker |
|------|------|--------|
| Toolbox section | `index.html` | `PROD-HIDE: Toolbox` |
| Flip 7 strip | `index.html` | `PROD-HIDE: Flip 7 strip` |
| Fair Share "Learn More" link | `index.html` | `PROD-HIDE: Fair Share learn more link` |
| SCP Reader "Learn More" link | `index.html` | `PROD-HIDE: SCP Reader learn more link` |
| All NAV_LINKS (Fair Share, SCP Reader, Resume) | `assets/js/dev-projects/nav-component.js` | `PROD-HIDE: Project and Resume nav items` |
