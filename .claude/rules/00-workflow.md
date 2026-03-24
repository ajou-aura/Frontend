# Workflow Contract

## Default approach
- For non-trivial work, start with a short plan before editing files.
- Prefer the smallest safe change that solves the requested problem.
- Do not mix feature work, refactoring, and cleanup in one pass unless explicitly requested.
- Read the nearest relevant files before changing code.
- Reuse existing modules, helpers, tokens, and route patterns before creating new ones.

## Execution strategy
- For architecture, routing, auth, or state-flow changes, analyze first and explain the intended change briefly before editing.
- For bug fixes, follow: reproduce -> isolate -> minimal fix -> verify.
- For refactors, preserve behavior first, then improve structure with small diffs.
- For UI work, prefer consistency with the current token system and navigation structure over introducing new patterns.
- For API work, preserve the existing request/response envelope and auth refresh flow unless the task explicitly changes backend contracts.

## Tooling discipline
- Do not rewrite large files when a scoped patch is enough.
- Avoid broad search-and-replace unless the change is mechanical and verified.
- Prefer updating the smallest relevant module boundary instead of scattering changes across unrelated files.
- If a command may be expensive, destructive, or long-running, explain it briefly before running it.

## Output style
- Keep explanations concise and implementation-focused.
- Summarize what changed, why it changed, and how it was verified.
- Do not claim tests passed unless they were actually run.

## Scope and wording discipline
- Interpret the user's wording as an execution constraint.
- Match the requested scale of work before optimizing for elegance or completeness.
- For narrowly scoped requests, prefer the nearest relevant files and the smallest safe diff.
- Do not introduce broader UX flows, extra cleanup, or cross-cutting changes unless the request clearly supports it.
- If a broader improvement is tempting, complete the requested narrow scope first and mention the broader option separately.
