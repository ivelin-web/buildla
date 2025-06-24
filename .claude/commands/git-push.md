# Git Push Workflow

## Pre-commit validation (run these first):

### 1. Check for lint errors
```bash
pnpm run lint
```
*Fix any linting issues before proceeding*

### 2. Check for TypeScript errors
```bash
npx tsc --noEmit
```
*Fix any TypeScript compilation errors before proceeding*

### 3. Verify project builds successfully
```bash
pnpm run build
```
*Ensure the project builds without errors before proceeding*

---

## Steps to follow when ready to push changes:

### 1. Add changes
```bash
git add .
```
*Or if targeting a specific file:*
```bash
git add <filename>
```

### 2. Create commit
```bash
git commit -m "Commit message."
```

**Commit message rules:**
- Start with capital letter
- End with a period
- One-line only (short and concise)
- Describe WHAT was changed, not HOW
- No additional descriptions or mentions of tools used - don't mention things like "🤖 Generated with [Claude Code](https://claude.ai/code)"
- Example format: "Add user authentication feature."

### 3. Push to main
```bash
git push origin main
```

## Complete workflow example:
```bash
# Pre-commit validation
pnpm run lint
npx tsc --noEmit
pnpm run build

# Git workflow
git add .
git commit -m "Fix navigation menu styling."
git push origin main
```