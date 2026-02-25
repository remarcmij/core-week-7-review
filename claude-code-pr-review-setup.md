# Automated PR Reviews with Claude Code GitHub Action

## Overview

You can use the official [`anthropics/claude-code-action`](https://github.com/anthropics/claude-code-action) GitHub Action to automatically review pull requests. It reads your project's `CLAUDE.md` file, so all your review guidelines, tone preferences, and spec references are picked up automatically.

## Setup

### Option A: Quick Setup (Recommended)

Run this from your repo:

```bash
claude /install-github-app
```

It walks you through:
1. Installing the Claude GitHub App on your repo
2. Adding your `ANTHROPIC_API_KEY` as a repository secret
3. Creating the workflow file

### Option B: Manual Setup

#### 1. Install the GitHub App

- Go to https://github.com/apps/claude
- Install it on your repository
- Required permissions: Contents (R&W), Issues (R&W), Pull Requests (R&W)

#### 2. Add Your API Key

- Go to your repo's **Settings > Secrets and variables > Actions**
- Create a new secret named `ANTHROPIC_API_KEY`
- Paste your key from https://console.anthropic.com

#### 3. Create the Workflow File

Create `.github/workflows/claude-review.yml` in your repo (see examples below).

## Where the Review Output Can Be Stored

| Location | Description |
|---|---|
| **PR comments** (default) | Claude posts inline review comments and a summary directly on the PR. No extra config needed. |
| **REVIEW.md in the branch** | Claude writes a review file and a follow-up step commits it to the PR branch. |
| **On-demand via `@claude`** | Anyone can comment `@claude review this` on any PR to trigger a review. |

## Workflow Examples

### Basic: Review on Every PR

```yaml
name: Claude Code Review

on:
  pull_request:
    types: [opened, synchronize]
  issue_comment:
    types: [created]

jobs:
  review:
    if: |
      (github.event_name == 'pull_request') ||
      (github.event_name == 'issue_comment' && contains(github.event.comment.body, '@claude'))
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
```

### Trainee Reviews: Write REVIEW.md Per Submission

This triggers only when files under `trainees/` change, and asks Claude to write a `REVIEW.md` inside the trainee's folder.

```yaml
name: Claude Code Review for Trainees

on:
  pull_request:
    paths:
      - 'trainees/**'

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: anthropics/claude-code-action@v1
        with:
          prompt: |
            Review this trainee's submission against COMMAND_SPEC.md and the
            review guidelines in CLAUDE.md. Write a detailed REVIEW.md file
            in the trainee's folder, then post a summary as a PR comment.
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          claude_args: "--max-turns 5"
```

### On-Demand Only (No Auto-Review)

If you only want reviews when someone explicitly asks:

```yaml
name: Claude Code Review (On Demand)

on:
  issue_comment:
    types: [created]
  pull_request_review_comment:
    types: [created]

jobs:
  review:
    if: |
      (github.event_name == 'issue_comment' && contains(github.event.comment.body, '@claude')) ||
      (github.event_name == 'pull_request_review_comment' && contains(github.event.comment.body, '@claude'))
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
```

## How CLAUDE.md Is Used

The action automatically discovers and reads your project's `CLAUDE.md` file, just like the CLI does. This means:

- Your review criteria (correctness, code quality, error handling, etc.) are followed
- Your tone and audience guidelines are respected
- The command spec and business rules are used as the benchmark
- No duplication of instructions is needed in the workflow file

If you want to give additional one-off instructions beyond what's in `CLAUDE.md`, use the `prompt` field in the workflow.

## Cost and Usage Tips

- **Set `--max-turns`** (e.g., `--max-turns 5`) to cap API usage per review
- **Filter by path** (e.g., `paths: ['trainees/**']`) so reviews only trigger on relevant changes
- **Use labels** to gate reviews (e.g., only run when a `ready-for-review` label is added)
- **Choose your model** with `--model` in `claude_args` (e.g., `claude-sonnet-4-6` for faster/cheaper reviews, `claude-opus-4-6` for deeper analysis)

## References

- [claude-code-action on GitHub](https://github.com/anthropics/claude-code-action)
- [Claude Code GitHub Actions docs](https://docs.anthropic.com/en/docs/claude-code/github-actions)
- [Claude Code Action on GitHub Marketplace](https://github.com/marketplace/actions/claude-code-action-official)
