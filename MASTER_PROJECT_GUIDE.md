# Live Webinar Platform - Master Project Guide

## Overview
This document serves as the master guide and single source of truth for the **Live Webinar Platform** project.

## Permanent Project Development Rules

### Development Philosophy
- Work efficiently and avoid unnecessary repetitive steps.
- Do not divide related tasks into unnecessarily small steps.
- Complete all approved related tasks together.
- Never repeat an already completed audit without a valid reason.
- Maintain a clear record of every important operation.

### Documentation Requirements
The following documents must be maintained and updated after every approved phase:
- `MASTER_PROJECT_GUIDE.md`: Project master reference, standards, and rules.
- `PROJECT_PLAN.md`: Roadmap, milestones, phases, and status tracking.
- `ARCHITECTURE.md`: System design, tech stack, data flow, and components.
- `DECISIONS.md`: Architectural Decision Records (ADR).
- `AUDIT_LOG.md`: System audits, code reviews, and dependency checks.
- `CHANGELOG.md`: Chronological log of notable additions, changes, and fixes.
- `SECURITY_LOG.md`: Security considerations, vulnerability scans, and auth configurations.
- `BUG_TRACKER.md`: Logged bugs, steps to reproduce, root causes, and resolutions.
- `DEPLOYMENT_LOG.md`: Environments, deployment procedures, releases, and rollbacks.
- `TEST_REPORTS/`: Playwright test results, coverage, execution logs, and screenshots.

### Testing Requirements
- Use **Playwright** for browser automation and end-to-end testing.
- Capture screenshots and failure logs.
- Maintain reproducible test cases.
- Run regression tests after significant changes.
- Use Python only when it provides a practical benefit.

### Version Control
- Use Git for change tracking.
- Create meaningful commits after verified milestones.
- Never commit `.env` files, credentials, or secrets.
- Keep a clean and recoverable project history.

### Approval & Safety
- No unapproved production deployment.
- No unapproved paid subscriptions or billing.
- No destructive database or file operations without permission.
- Do not claim a feature is complete without test evidence.
- Report failures honestly.

### Communication Standard
Progress reports follow this structured format:
1. **Completed**: Finished tasks and implementation details.
2. **Tested and Passed**: Verification results with test evidence.
3. **Failed**: Blockers, test failures, or defects found.
4. **Pending**: Next steps and upcoming queue.
5. **Decisions Required**: Items needing user approval or clarification.
