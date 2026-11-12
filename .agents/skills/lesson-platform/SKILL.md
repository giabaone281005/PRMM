---
name: lesson-platform
description: Implement and verify this workspace's React lesson studio, Flutter player, declarative scenes and Supabase lesson persistence. Use for learning-platform work; preserve the unrelated REA tool.
---

Read `docs/architecture/BRILLIANT_INTERACTIVE_LEARNING_MASTER_SPEC.md` and `docs/architecture/audit.md` from workspace root.
Keep canonical lesson schema/fixtures in learning-platform/contracts. Changes to checkpoint evaluation require matching TypeScript and Dart tests.
Keep canvas identity across checkpoints; gestures update normalized metrics, never content-supplied executable code.
Database target must be established from project configuration or user selection before remote mutations. Published versions are immutable; private progress stays scoped to auth.uid().
Track remaining work in task.md and record PASS/FAIL/BLOCKED/NOT RUN in docs/qa/verification-report.md. Local preview is not production acceptance.
