# Security Specification

## Data Invariants
1. A user can only create and update their own profile.
2. Only admins can change a user's role or VIP status.
3. A user can create a payment request.
4. Only admins can update payment status (approve/reject).
5. Payment requests must have a valid `userId` matching the current user.
6. `transactionId` must be unique (checked by logic, but rules should restrict write).

## The Dirty Dozen Payloads
1. **P1 (Identity Spoofing)**: Create a user profile with a different UID.
2. **P2 (Privilege Escalation)**: Create a user profile with `role: 'admin'`.
3. **P3 (Role Tampering)**: Update your own profile to `role: 'admin'`.
4. **P4 (VIP Theft)**: Update your own profile to `isVIP: true`.
5. **P5 (Payment Impersonation)**: Create a payment with someone else's `userId`.
6. **P6 (Status Hijacking)**: Create a payment with `status: 'approved'`.
7. **P7 (Process Bypassing)**: Update your own payment status from `pending` to `approved`.
8. **P8 (Resource Poisoning)**: Create a payment with a 1MB `transactionId`.
9. **P9 (PII Leak)**: Read another user's profile without being an admin.
10. **P10 (History Erasure)**: Delete a payment record.
11. **P11 (Admin Impersonation)**: Access `/payments` collection list as a normal user.
12. **P12 (Orphaned Write)**: Create a payment with a non-existent `userId`.

## Test Runner (Logic Verification)
The following tests verify that all malicious payloads are blocked.

```typescript
import { assertFails, assertSucceeds } from "@firebase/rules-unit-testing";
// ... testing logic ...
```
