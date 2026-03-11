# Linting and Formatting with Biome

## Overview

This project uses **Biome** for fast, modern linting and formatting. Biome is a performant toolchain that replaces ESLint and Prettier with a single, unified tool.

**Why Biome?**
- ⚡ **Fast** - Written in Rust, 10-100x faster than ESLint/Prettier
- 🔧 **All-in-one** - Linting, formatting, and import sorting in one tool
- 🎯 **Zero config** - Works out of the box with sensible defaults
- 🔄 **Compatible** - Supports ESLint and Prettier migration
- 📦 **Small** - Single dependency instead of multiple tools

## Installation

Biome is already installed as a dev dependency:

```json
{
  "devDependencies": {
    "@biomejs/biome": "^2.4.6"
  }
}
```

## Configuration

The project is configured via `biome.json`:

```json
{
  "$schema": "https://biomejs.dev/schemas/2.4.6/schema.json",
  "vcs": {
    "enabled": true,
    "clientKind": "git",
    "useIgnoreFile": true
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true
    }
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "double",
      "semicolons": "always",
      "trailingCommas": "es5",
      "arrowParentheses": "always"
    }
  }
}
```

### Key Settings

- **Indent**: 2 spaces
- **Line width**: 100 characters
- **Quotes**: Double quotes
- **Semicolons**: Always
- **Trailing commas**: ES5 style
- **Arrow parentheses**: Always use parentheses
- **VCS integration**: Respects `.gitignore`

## Available Scripts

### Check Everything

```bash
bun run check
```

Runs both linting and formatting checks without making changes.

**Output:**
```
Checked 26 files in 7ms. No fixes applied.
```

### Auto-fix Everything

```bash
bun run check:fix
```

Automatically fixes all linting and formatting issues.

**What it fixes:**
- ✅ Code formatting (indentation, spacing, line breaks)
- ✅ Import organization (alphabetical sorting)
- ✅ Lint violations (where safe)
- ✅ Unused variables (with `--unsafe` flag)

### Lint Only

```bash
# Check for lint errors
bun run lint

# Fix lint errors
bun run lint:fix
```

Runs only the linter, checking for code quality issues.

### Format Only

```bash
# Check formatting
bun run format

# Fix formatting
bun run format:fix
```

Runs only the formatter, checking code style.

## Common Workflows

### Before Committing

```bash
# Check everything
bun run check

# Or auto-fix everything
bun run check:fix
```

### During Development

Most editors have Biome extensions that format on save:

- **VS Code**: [Biome Extension](https://marketplace.visualstudio.com/items?itemName=biomejs.biome)
- **IntelliJ**: Built-in support
- **Neovim**: Via LSP

### In CI/CD

```yaml
# GitHub Actions example
- name: Check code quality
  run: bun run check
```

## What Biome Checks

### Linting Rules

Biome enforces recommended rules including:

**Correctness:**
- No unused variables
- No constant conditions
- No unreachable code
- Proper use of `isNaN()`
- No const reassignment

**Suspicious:**
- No debugger statements (warning)
- No async promise executor
- No duplicate keys/cases
- No misleading character classes

**Style:**
- Use `const` over `let` where possible
- No `var` declarations
- Prefer template literals
- No `arguments` object

**Complexity:**
- No useless catch blocks
- No useless constructors
- No useless labels

### Formatting Rules

**Spacing:**
- 2-space indentation
- Consistent spacing around operators
- Proper spacing in objects/arrays

**Line Breaks:**
- Max 100 characters per line
- Consistent line breaks in objects
- Proper blank lines between statements

**Quotes & Semicolons:**
- Double quotes for strings
- Semicolons always required
- ES5 trailing commas

**Imports:**
- Alphabetically sorted
- Grouped by source (external, internal, relative)
- Unused imports removed

## Examples

### Before Biome

```typescript
import { Hono } from "hono";
import { auth } from "@/utils/auth";
import { cors } from "hono/cors";

const app = new Hono()

app.get('/health', (c) => {
    return c.json({status: 'ok'})
});
```

### After Biome

```typescript
import { Hono } from "hono";
import { cors } from "hono/cors";
import { auth } from "@/utils/auth";

const app = new Hono();

app.get("/health", (c) => {
  return c.json({ status: "ok" });
});
```

**Changes:**
- ✅ Imports sorted alphabetically
- ✅ Semicolons added
- ✅ Double quotes used
- ✅ Consistent spacing
- ✅ Proper indentation

## Ignoring Files

Biome automatically respects `.gitignore`. To ignore additional files, add them to `biome.json`:

```json
{
  "files": {
    "ignore": [
      "node_modules",
      "dist",
      "old-express"
    ]
  }
}
```

## Ignoring Specific Rules

### In Code

```typescript
// biome-ignore lint/suspicious/noExplicitAny: Legacy code
const data: any = getLegacyData();
```

### In Config

```json
{
  "linter": {
    "rules": {
      "suspicious": {
        "noExplicitAny": "off"
      }
    }
  }
}
```

## Editor Integration

### VS Code

1. Install the [Biome extension](https://marketplace.visualstudio.com/items?itemName=biomejs.biome)
2. Add to `.vscode/settings.json`:

```json
{
  "editor.defaultFormatter": "biomejs.biome",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "quickfix.biome": "explicit",
    "source.organizeImports.biome": "explicit"
  }
}
```

### Cursor/Windsurf

Same as VS Code - the Biome extension works automatically.

## Comparison with ESLint/Prettier

| Feature | Biome | ESLint + Prettier |
|---------|-------|-------------------|
| Speed | ⚡ 10-100x faster | Slower |
| Dependencies | 1 package | 10+ packages |
| Config files | 1 file | 2-3 files |
| Setup time | < 1 minute | 10-30 minutes |
| Memory usage | Low | High |
| Import sorting | Built-in | Needs plugin |

## Troubleshooting

### "No fixes applied" but code looks wrong

Run with unsafe fixes:
```bash
bun run check:fix -- --unsafe
```

### Biome conflicts with Prettier

Remove Prettier and its config files:
```bash
bun remove prettier
rm .prettierrc .prettierignore
```

### Too many errors

Fix incrementally:
```bash
# Fix formatting first
bun run format:fix

# Then fix linting
bun run lint:fix

# Finally check everything
bun run check
```

### Editor not formatting

1. Check Biome extension is installed
2. Verify `biome.json` exists
3. Restart editor
4. Check output panel for errors

## Migration from ESLint/Prettier

If you're migrating from ESLint/Prettier:

```bash
# Migrate ESLint config
bunx @biomejs/biome migrate eslint --write

# Migrate Prettier config  
bunx @biomejs/biome migrate prettier --write

# Remove old tools
bun remove eslint prettier @typescript-eslint/parser @typescript-eslint/eslint-plugin
rm .eslintrc.js .prettierrc
```

## Pre-commit Hooks

### Using Husky

```bash
# Install husky
bun add -D husky

# Setup pre-commit hook
echo "bun run check" > .husky/pre-commit
chmod +x .husky/pre-commit
```

### Using lint-staged

```bash
# Install lint-staged
bun add -D lint-staged

# Add to package.json
{
  "lint-staged": {
    "*.{ts,tsx,js,jsx}": ["biome check --write"]
  }
}
```

## Performance

Biome is extremely fast:

```bash
# Check 26 files
Checked 26 files in 7ms. No fixes applied.

# Fix 21 files
Checked 26 files in 12ms. Fixed 21 files.
```

**Comparison:**
- ESLint: ~2-5 seconds for same files
- Prettier: ~1-2 seconds for same files
- **Biome: ~7-12ms** ⚡

## CI/CD Integration

### GitHub Actions

```yaml
name: Code Quality

on: [push, pull_request]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: oven-sh/setup-bun@v1
        with:
          bun-version: latest
      
      - run: bun install
      
      - name: Run Biome
        run: bun run check
```

### Pre-push Hook

```bash
#!/bin/sh
# .git/hooks/pre-push

bun run check
if [ $? -ne 0 ]; then
  echo "❌ Biome check failed. Please fix errors before pushing."
  exit 1
fi
```

## Best Practices

1. **Run checks before committing**
   ```bash
   bun run check:fix
   ```

2. **Enable format on save in your editor**
   - Automatic formatting as you type
   - No manual formatting needed

3. **Use Biome in CI/CD**
   - Catch issues before merge
   - Enforce code quality

4. **Keep config minimal**
   - Use recommended rules
   - Only customize when needed

5. **Fix issues incrementally**
   - Don't ignore all errors
   - Fix a few at a time

## Resources

- **Official Docs**: https://biomejs.dev
- **VS Code Extension**: https://marketplace.visualstudio.com/items?itemName=biomejs.biome
- **GitHub**: https://github.com/biomejs/biome
- **Discord**: https://biomejs.dev/chat

## Summary

✅ **Biome is installed and configured**
✅ **All code is formatted and linted**
✅ **Scripts available for checking and fixing**
✅ **Editor integration recommended**
✅ **CI/CD ready**

Use `bun run check:fix` before committing to ensure code quality! 🚀
