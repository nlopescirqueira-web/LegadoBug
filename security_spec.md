# Security Specification - Portfolio/Schedule App

## Data Invariants
1. A user document must have a UID that matches its path.
2. Only Admins can modify the global `schedules` (PDF URLs).
3. Students can only update their own progress (`user_progress`).
4. Role 'admin' can only be set if verified against a trusted list or by an existing admin.
5. All IDs must follow tactical naming conventions (no junk IDs).

## The "Dirty Dozen" Payloads (Denial Expected)
1. `{ "role": "admin", "uid": "victim_uid" }` - Create admin doc without auth.
2. `{ "pdfUrls": { "1": "http://malicious.com/virus.pdf" } }` - Unauthorized schedule update.
3. `{ "unlockedWeeks": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] }` - Student unlocking all weeks without purchase/admin.
4. `{ "role": "student", "email": "attacker@gmail.com" }` - Creating user doc at someone else's ID.
5. `{ "role": "admin", "email": "admin@trusted.com" }` - Spoofing admin create.
6. `{ "lastLogin": "2020-01-01" }` - Bypassing server timestamp for sync.
7. `{ "pdfUrls": { "large_key": "...." } }` - Bloating schedule doc with junk.
8. `{ "unlockedWeeks": [ "not_a_number" ] }` - Schema corruption in progress.
9. `get(/user_progress/some_other_user/...)` - Unauthorized progress read.
10. `list(/users)` - Unauthorized user scraping (if sensitive data exists).
11. `update(/schedules/prf, { "pdfUrls.1": null })` - Unauthorized deletion of global data.
12. `create(/users/some_id, { "role": "admin" })` - Privilege escalation.

## The Test Runner (Conceptual)
All payloads above MUST return `PERMISSION_DENIED`.
Rules must enforce:
- `isOwner(uid)` for user sync.
- `isAdmin()` for schedule management.
- `isAdmin()` for unlocking weeks (as indicated in `Schedule.tsx` logic where `handleUnlock` checks `isAdmin`).
- `isAuthenticated()` for most reads.
