# Git Scoping for Subdirectories

When working in a subdirectory (like `bostami/`, `tovo-node-16/`, or `django-admin/`), you can scope git commands to only show changes for that specific directory.

## Quick Methods

### Method 1: Using Path Filter (Recommended)

When in a subdirectory, simply add the directory path to your git commands:

```bash
# From bostami/
git diff bostami/
git status bostami/

# From tovo-node-16/
git diff tovo-node-16/
git status tovo-node-16/

# From django-admin/
git diff django-admin/
git status django-admin/
```

### Method 2: Using Helper Functions

Source the helper script in your shell:

```bash
# Add to your ~/.bashrc or ~/.zshrc
source /home/ion/awesome/.gitdiff-scoped.sh

# Then you can use:
git-scoped-diff
git-scoped-status
```

### Method 3: Using Git Alias

You can also use the git alias:

```bash
git diff-cwd
```

## For Cursor IDE

Cursor will automatically show git diffs for the entire repository by default. To see changes scoped to a directory:

1. Open the integrated terminal in Cursor
2. Use one of the methods above
3. Or install a Git extension that supports path filtering

## Example Workflow

```bash
# Work on bostami changes
cd bostami
git diff bostami/                    # See only bostami changes
git status bostami/                   # See only bostami status

# Or use the helper functions
git-scoped-diff
git-scoped-status
```

## Tips

- The path filter works with most git commands (diff, status, log, blame, etc.)
- You can also use wildcards: `git diff bostami/src/`
- Commit from the repo root as usual: changes will include the appropriate path prefix

