# Git Push Workflow

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
- No additional descriptions or mentions of tools used
- Example format: "Add user authentication feature."

### 3. Push to main
```bash
git push origin main
```

## Complete workflow example:
```bash
git add .
git commit -m "Fix navigation menu styling."
git push origin main
```
