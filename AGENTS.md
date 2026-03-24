# Project Instructions

Primary project instructions live in `CLAUDE.md`.

Additional modular rules live under `.claude/rules/`.
Read the relevant rule files before making changes.

Default behavior:
- Match the requested scope before optimizing for completeness
- Prefer the nearest relevant files and the smallest safe diff
- Reuse existing local patterns
- Run the narrowest useful validation
- If validation cannot run, mark the result as unverified
