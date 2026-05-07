# Security Specification for Findinggoodd

## Data Invariants
1. Only authenticated admins can create, update, or delete movies and configuration.
2. Any user can read movies, trending config, and submit feedback.
3. Feedback once submitted cannot be edited or deleted by users.
4. Admin status is determined by existence of a document in the `/admins/` collection matching the user's UID.
5. All movie URLs must be valid URIs.
6. Search queries are client-side, but rules must enforce secure list access.

## The Dirty Dozen Payloads (Rejects)
1. Unauthenticated movie creation.
2. Authenticated non-admin movie deletion.
3. Overwriting `createdAt` on movie update.
4. Submitting feedback with missing required fields.
5. Updating another user's feedback (not applicable since no user auth for general users, but still restricted).
6. Admin spoofing by trying to write to `/admins` collection.
7. Injecting 1MB junk into movie name.
8. Changing `isTrending` on a movie as a non-admin.
9. Modifying global config as a non-admin.
10. Listing sensitive PII if it were present (none here, but restricted nonetheless).
11. Reading specific admin documents.
12. Deleting the `trending` config doc.

## Test Strategy
- Verify public read access to `/movies` and `/config/trending`.
- Verify public write-only access to `/feedback`.
- Verify admin-only write access to `/movies` and `/config`.
- Verify admin-only read access to `/feedback`.
