# Testing Guide for Critical Fixes

## Quick Testing Checklist (30-60 minutes)

---

## Test 1: App Startup (Fix #2) - 5 minutes

### What We're Testing:
Database initialization waits before window creation

### Steps:
1. **Close the app** if it's running
2. **Start the app** normally
3. **Watch the console** for:
   ```
   Initializing database...
   ✅ Database initialized successfully
   ```
4. **App should open** with no errors

### Success Criteria:
- ✅ App starts without crashes
- ✅ Dashboard loads properly
- ✅ No "Database not initialized" errors

### If It Fails:
- Check console for error messages
- Look for red ❌ messages
- Database file might be corrupted (delete `topnotch-sales.db` and restart)

---

## Test 2: Revenue Calculations (Fix #1) - 10 minutes

### What We're Testing:
Returns with 'approved' status now reduce revenue correctly

### Setup:
1. Create a test sale (e.g., $100)
2. Create a return for that sale:
   - Status: **'approved'** (not 'completed')
   - Refund method: **'cash'** (revenue-reducing)
   - Amount: $50

### Steps:
1. Go to **Dashboard**
2. Check **Total Revenue** (should reflect the return)
3. Check **Monthly Profit** calculations

### Success Criteria:
- ✅ Revenue is reduced by $50 (the return amount)
- ✅ Both 'completed' AND 'approved' returns are counted
- ✅ Store credit returns don't reduce revenue

### Expected Results:
```
Sale: +$100
Return (approved, cash): -$50
Net Revenue: $50 ✅
```

### If It Fails:
- Check console for calculation logs
- Look for "Revenue calculation with returns" message
- Should show `revenueReducingReturns` count

---

## Test 3: Export Data - 5 minutes

### What We're Testing:
Export includes ALL data types (including orders & returns)

### Steps:
1. Go to **Settings** → **Export Data**
2. Save the export file
3. Open the JSON file in a text editor
4. Verify it contains:
   ```json
   {
     "customers": [...],
     "products": [...],
     "sales": [...],
     "invoices": [...],
     "orders": [...],     ← Should be present!
     "returns": [...],    ← Should be present!
     "settings": {...},
     "exportedAt": "2025-...",
     "version": "1.0.0"
   }
   ```

### Success Criteria:
- ✅ `orders` array exists (even if empty)
- ✅ `returns` array exists (even if empty)
- ✅ All other data types present
- ✅ `version` field present

---

## Test 4: Import with Backup (Fix #3) - 15 minutes

This is the BIG one - tests automatic backup and rollback!

### Test 4a: Successful Import

**Steps:**
1. **Export your current data** first (Settings → Export)
2. **Import the same file** you just exported
3. **Watch for dialogs:**
   - Should show: "This will REPLACE all your current data!"
   - Should show backup path
4. **Click "Import"**
5. **Wait for success message**

**Success Criteria:**
- ✅ Warning dialog appears
- ✅ Backup created (check console for path)
- ✅ Import succeeds
- ✅ All data intact after import

**Console Output Should Show:**
```
📂 Reading import file: ...
✅ Validating import data...
   - Customers: X
   - Products: X
   - Sales: X
   - Orders: X
   - Returns: X
💾 Creating backup of current data...
✅ Backup created: /path/to/backup-TIMESTAMP.json
📥 Starting import...
   Importing X customers...
   Importing X products...
   ...
✅ Import completed successfully!
```

---

### Test 4b: Import with Invalid File (CRITICAL TEST!)

**Setup:**
1. Create a **fake JSON file** called `bad-import.json`:
   ```json
   {
     "customers": "THIS SHOULD BE AN ARRAY",
     "products": []
   }
   ```

**Steps:**
1. **Import the bad file**
2. **Should fail validation** BEFORE creating backup
3. **Should show error**: "Invalid import data: customers must be an array"

**Success Criteria:**
- ✅ Validation catches error early
- ✅ No backup created (validation failed before that step)
- ✅ Database unchanged
- ✅ User-friendly error message

---

### Test 4c: Import with Corrupted Data (CRITICAL TEST!)

This tests the automatic ROLLBACK feature!

**Setup:**
1. **Create a test database** with some data (1-2 customers, products)
2. **Export it** to get a good backup
3. **Create a partially corrupt import file:**
   ```json
   {
     "customers": [
       {
         "id": "test1",
         "name": "Test Customer"
         // Missing required fields - should cause import to fail partway through
       }
     ],
     "products": []
   }
   ```

**Steps:**
1. **Import the corrupt file**
2. **Confirm the import** (click "Import" in dialog)
3. **Watch it fail** partway through
4. **Should automatically restore** from backup!

**Success Criteria:**
- ✅ Backup created before import
- ✅ Import fails (as expected)
- ✅ **AUTOMATIC RESTORE** from backup
- ✅ Shows dialog: "Import failed, but your data was restored"
- ✅ All original data intact!

**Console Output Should Show:**
```
💾 Creating backup of current data...
✅ Backup created: /path/to/backup-TIMESTAMP.json
📥 Starting import...
❌ Import failed: [error message]
🔄 Restoring from backup...
   Restoring X customers...
   Restoring X products...
   ...
✅ Data restored from backup successfully
```

**Then Check:**
1. Go to **Customers** - your test data should still be there!
2. Go to **Products** - your test data should still be there!
3. **Nothing was lost!** ✅

---

### Test 4d: Cancel Import

**Steps:**
1. **Start import** of a valid file
2. **Click "Cancel"** in confirmation dialog
3. **Check backup folder** - backup file should be deleted

**Success Criteria:**
- ✅ Import cancelled
- ✅ Backup cleaned up (not left behind)
- ✅ Database unchanged

---

## Test 5: Database Initialization Error Handling - 5 minutes

### What We're Testing:
App handles database errors gracefully

### Steps (Advanced):
1. **Close the app**
2. **Rename the database file:**
   - From: `topnotch-sales.db`
   - To: `topnotch-sales.db.backup`
3. **Make the database folder read-only** (to simulate permission error)
4. **Start the app**

### Success Criteria:
- ✅ App shows error dialog (not crash)
- ✅ Error dialog says: "Database Initialization Error"
- ✅ Error message is user-friendly
- ✅ App quits gracefully (doesn't hang)

### Cleanup:
- Restore database file name
- Remove read-only permission

---

## Quick Smoke Test (10 minutes total)

If you're short on time, just do these:

1. **✅ Start app** - should work without errors (Test 1)
2. **✅ Create a sale, create a return, check dashboard** - revenue should update (Test 2)
3. **✅ Export data, check JSON** - should have orders & returns (Test 3)
4. **✅ Import the exported file** - should create backup and succeed (Test 4a)

---

## What to Look For

### Good Signs ✅
- Console shows emoji markers (📂, ✅, 💾, 🔄)
- Backup files appear in user data directory
- Error messages are user-friendly
- App never crashes
- Data is never lost

### Bad Signs ❌
- Console shows red error messages
- App crashes/freezes
- Data disappears after failed import
- No backup created before import
- Generic error messages like "Error: undefined"

---

## Where to Find Backup Files

### Development:
```
~/Library/Application Support/topnotch-sales-manager/
  - backup-TIMESTAMP.json
```

### Production (when built):
```
Windows: %APPDATA%/topnotch-sales-manager/
Mac: ~/Library/Application Support/topnotch-sales-manager/
Linux: ~/.config/topnotch-sales-manager/
```

---

## If Tests Fail

### Revenue Calculation Issues:
- Check console for "Revenue calculation with returns" log
- Verify return status is 'completed' or 'approved'
- Verify refund method is 'cash' or 'original_payment'

### Import Issues:
- Check console for detailed error messages
- Look for backup file in user data directory
- Try importing a freshly exported file first

### Database Issues:
- Delete database file and let it recreate
- Check file permissions
- Check disk space

---

## Success Criteria Summary

**All tests pass means:**
- ✅ App is production-ready for your use case
- ✅ Data loss risk eliminated
- ✅ Financial calculations accurate
- ✅ User experience is professional

**If 1-2 tests fail:**
- ⚠️ Investigate and fix specific issues
- ⚠️ May need minor code adjustments

**If 3+ tests fail:**
- 🔴 Something went wrong with the fixes
- 🔴 Review code changes
- 🔴 Contact for help

---

## Estimated Testing Time

- **Minimum (smoke test):** 10 minutes
- **Recommended (Tests 1-4a):** 30 minutes  
- **Comprehensive (all tests):** 60 minutes
- **With documentation:** 90 minutes

---

**Good luck with testing! You've got this!** 🚀

*Remember: The goal isn't perfection - it's confidence that your users' data is safe.*

