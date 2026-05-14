# Security Specification: MEEPLÁRIO Stock System

## 1. Data Invariants
- An `Item` must belong to a valid sector (`chapa`, `porcoes`, `bebidas`).
- `currentStock` cannot be negative.
- `StockLog` entry must be created alongside any stock modification (implicit in app logic, rules will enforce data integrity).
- `lastUpdatedBy` must match the authenticated user's name or ID.

## 2. The "Dirty Dozen" Payloads (Denial Scenarios)
1.  **Identity Theft**: User A tries to update User B's profile.
2.  **Negative Stock**: Setting `currentStock` to `-100`.
3.  **Invalid Sector**: Putting a "Beverage" in the "Grill" sector id.
4.  **Shadow Fields**: Adding `is_admin: true` to a profile during creation.
5.  **History Forgery**: Creating a log entry for an item that doesn't exist.
6.  **Timestamp Spoofing**: Setting a future `updatedAt`.
7.  **Resource Exhaustion**: Sending 1MB of junk text in the `name` field.
8.  **Orphaned Updates**: Updating an item without providing `lastUpdatedBy`.
9.  **ID Poisoning**: Using a 2KB string as a document ID.
10. **Privilege Escalation**: Non-authenticated user trying to read the inventory.
11. **Bulk Deletion**: Trying to delete the entire `items` collection.
12. **Price Manipulation**: (If added) changing cost fields in items.

## 3. Test Cases (Rules logic)
- `allow read: if isSignedIn();`
- `allow write: if isSignedIn() && isValidItem(incoming());`
- `allow update: if affectedKeys().hasOnly(['currentStock', 'updatedAt', 'lastUpdatedBy'])` (for quick updates).
