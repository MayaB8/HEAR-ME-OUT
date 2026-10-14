---
name: create-feature-branch
description: Create and switch to a Git feature branch when the user requests a new branch or asks to start feature work on a separate branch.
---

# Branch naming rules

Use the format `<prefix>/<short-description>` with the prefix that matches the work:

- `feat/` for a new product feature.
- `fix/` for a bug fix.
- `chore/` for tooling, maintenance, infrastructure, or developer workflow.
- `test/` for test-related work.
- `docs/` for documentation-only changes.

Branch names must:

- Use lowercase only.
- Separate words with hyphens.
- Be short but descriptive.
- Avoid vague names such as `update`, `changes`, or `stuff`.
- Exclude developer names.

## Valid examples

- `feat/practice-progress`
- `fix/audio-playback`
- `chore/docker-setup`
- `test/login-validation`
- `docs/local-setup`

## Workflow

1. Read the task description.
2. Identify the primary purpose of the task.
3. Choose the correct prefix using the decision guide in the branch naming rules above.
4. Generate a short descriptive branch name in lowercase with hyphens.
5. Prefer names that describe the outcome, not the implementation details.
6. Return one recommended branch name.
7. If the task is genuinely ambiguous, return up to two alternatives and briefly explain the distinction.

Recommend branch names only. Do not create or switch Git branches or run Git commands.

## Final workflow step: create the branch

This final step supersedes the recommendation-only restriction above.

8. After recommending the branch name, check the current Git status. Do not create a branch if there are unresolved merge conflicts; report the conflicts instead. If alternatives were returned because the task is genuinely ambiguous, wait for the user to select a name before creating the branch.
   - If the branch already exists locally, do not overwrite it; report that it already exists.
   - Create the branch from the current branch using `git switch -c <branch-name>`.
   - Do not commit, push, merge, or modify files as part of this skill.
   - After creation succeeds, report the created branch name.
