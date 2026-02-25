# Automated PR Reviews with Claude Code GitHub Action

## Overview

You can use the official [`anthropics/claude-code-action`](https://github.com/anthropics/claude-code-action) GitHub Action to automatically review pull requests. It reads your project's `CLAUDE.md` file, so all your review guidelines, tone preferences, and spec references are picked up automatically.

## Scenario: Trainees Fork the Template Repo and Submit PRs

In this setup, the GitHub Action lives on the **template repo** (`HackYourFuture/school-manager-template`). Trainees fork it, do their work on their fork, and open a PR back to the template repo. Claude reviews each PR automatically.

### Why `pull_request_target` Instead of `pull_request`

PRs from forks cannot access the base repo's secrets (like `ANTHROPIC_API_KEY`) when using the standard `pull_request` event. The `pull_request_target` event runs in the context of the **base repo**, so it has access to secrets.

**Security note:** Because `pull_request_target` has access to secrets, the workflow should only **read and review** the trainee's code, never **execute** it (e.g., don't run `npm install` or `npm test` on untrusted code in this same job). The Claude Code Action only analyzes code — it doesn't run it — so this is safe.

## Setup (on the Template Repo)

### 1. Install the Claude GitHub App

- Go to https://github.com/apps/claude
- Install it on `HackYourFuture/school-manager-template`
- Required permissions: Contents (R&W), Issues (R&W), Pull Requests (R&W)

### 2. Add Your API Key

- Go to the template repo's **Settings > Secrets and variables > Actions**
- Create a new secret named `ANTHROPIC_API_KEY`
- Paste your key from https://console.anthropic.com

### 3. Add a CLAUDE.md to the Template Repo

The action reads `CLAUDE.md` from the base repo automatically. Add one to `HackYourFuture/school-manager-template` with the review guidelines (correctness criteria, code quality expectations, tone, etc.). This is the same content currently in the `CLAUDE.md` of the `cohort55/week-7` review repo — it would need to be copied or adapted for the template repo.

### 4. Create the Workflow File

Create `.github/workflows/claude-review.yml` in the template repo (see examples below).

## Where the Review Output Can Be Stored

| Location | Description |
|---|---|
| **PR comments** (default) | Claude posts inline review comments and a summary directly on the PR. No extra config needed. |
| **On-demand via `@claude`** | Anyone can comment `@claude review this` on any PR to trigger a review. |

Note: Writing a `REVIEW.md` to the trainee's fork branch is possible but more complex with `pull_request_target` (it requires explicitly checking out the fork's head ref). PR comments are the simplest and most natural approach for this scenario.

## Workflow Examples

### Auto-Review Every Trainee PR

```yaml
name: Claude Code Review

on:
  pull_request_target:
    types: [opened, synchronize]

jobs:
  review:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write
      issues: write
    steps:
      - uses: actions/checkout@v4
        with:
          ref: ${{ github.event.pull_request.head.sha }}
          fetch-depth: 0

      - uses: anthropics/claude-code-action@v1
        with:
          prompt: |
            Review the ENTIRE codebase, not just the PR diff. This PR
            represents a trainee's complete project submission. Read and
            evaluate all source files in src/, tests/, and data/. Follow
            the review guidelines in CLAUDE.md.
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          claude_args: "--max-turns 5"
```

Key details:
- `pull_request_target` gives the workflow access to the base repo's secrets
- `ref: ${{ github.event.pull_request.head.sha }}` checks out the **trainee's code** (the fork's PR branch), not the base branch
- Explicit `permissions` follow the principle of least privilege
- The `prompt` tells Claude to review the full codebase, not just the diff — since each PR is a complete project submission

### Auto-Review + On-Demand `@claude` Mentions

```yaml
name: Claude Code Review

on:
  pull_request_target:
    types: [opened, synchronize]
  issue_comment:
    types: [created]
  pull_request_review_comment:
    types: [created]

jobs:
  review:
    if: |
      (github.event_name == 'pull_request_target') ||
      (github.event_name == 'issue_comment' && contains(github.event.comment.body, '@claude')) ||
      (github.event_name == 'pull_request_review_comment' && contains(github.event.comment.body, '@claude'))
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write
      issues: write
    steps:
      - uses: actions/checkout@v4
        with:
          ref: ${{ github.event.pull_request.head.sha }}
          fetch-depth: 0

      - uses: anthropics/claude-code-action@v1
        with:
          prompt: |
            Review the ENTIRE codebase, not just the PR diff. This PR
            represents a trainee's complete project submission. Read and
            evaluate all source files in src/, tests/, and data/. Follow
            the review guidelines in CLAUDE.md.
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          claude_args: "--max-turns 5"
```

### On-Demand Only (No Auto-Review)

If you prefer to trigger reviews manually by commenting `@claude review this`:

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
    permissions:
      contents: read
      pull-requests: write
      issues: write
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: anthropics/claude-code-action@v1
        with:
          prompt: |
            Review the ENTIRE codebase, not just the PR diff. This PR
            represents a trainee's complete project submission. Read and
            evaluate all source files in src/, tests/, and data/. Follow
            the review guidelines in CLAUDE.md.
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          claude_args: "--max-turns 5"
```

## How CLAUDE.md Is Used

The action automatically discovers and reads the `CLAUDE.md` in the repo. For the fork-based workflow, this means the `CLAUDE.md` must live in the **template repo** (`HackYourFuture/school-manager-template`). It will:

- Follow your review criteria (correctness, code quality, error handling, etc.)
- Respect your tone and audience guidelines
- Use the command spec and business rules as the benchmark
- Compare the trainee's code against the template stubs

If you want to give additional one-off instructions beyond what's in `CLAUDE.md`, use the `prompt` field in the workflow step.

## What Needs to Happen on the Template Repo

1. Add `CLAUDE.md` with review guidelines (adapted from the current one in `cohort55/week-7`)
2. Ensure `COMMAND_SPEC.md` is present (so Claude can check correctness)
3. Add `.github/workflows/claude-review.yml` (one of the examples above)
4. Add `ANTHROPIC_API_KEY` as a repository secret
5. Install the Claude GitHub App on the repo

## Cost and Usage Tips

- **Set `--max-turns`** (e.g., `--max-turns 5`) to cap API usage per review
- **Use labels** to gate reviews (e.g., only run when a `ready-for-review` label is added)
- **Choose your model** with `--model` in `claude_args` (e.g., `claude-sonnet-4-6` for faster/cheaper reviews, `claude-opus-4-6` for deeper analysis)
- **On-demand only** is the cheapest option — reviews only happen when a mentor asks for one

## References

- [claude-code-action on GitHub](https://github.com/anthropics/claude-code-action)
- [Claude Code GitHub Actions docs](https://docs.anthropic.com/en/docs/claude-code/github-actions)
- [Claude Code Action on GitHub Marketplace](https://github.com/marketplace/actions/claude-code-action-official)
