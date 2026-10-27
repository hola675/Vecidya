# P1e: audit of saved diagnostic sessions

## Verified behavior
The existing V3 session stores answers by question ID and uses schema version 2. It does not persist the question version per answer.

The serializer writes the session JSON unchanged. The parser reads each saved answer and validates it against the currently supplied question bank. Invalid options cause the entire session to be rejected. The browser store then clears the rejected session.

## V9 menu risk
The historical menu question v1 accepts not_applicable. The isolated menu v2 proposal removes that option and introduces not_published. Substituting v2 directly into the bank can therefore reject a saved v1 session containing not_applicable.

## Required gate
Do not switch the active bank. First design an explicit version-aware resume contract, preserve historical v1 semantics, and add focused tests covering old-session restoration and replay. Do not silently map not_applicable to not_published.

This is an audit document only. No runtime, V8, migration, scoring, or production changes.
