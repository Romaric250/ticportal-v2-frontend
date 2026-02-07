# Admin Affiliate Management API Routes - Implementation Status

This document lists all API routes for the admin affiliate management dashboard and their implementation status.

## ✅ All Routes Implemented

All routes listed below have been implemented in the backend and are ready for use.

### Core Routes (Originally Implemented)
- `GET /api/affiliate/admin/countries` - List countries
- `POST /api/affiliate/admin/countries` - Create country
- `GET /api/affiliate/admin/countries/:countryId/regions` - Get regions by country
- `POST /api/affiliate/admin/regions` - Create region
- `PUT /api/affiliate/admin/users/role` - Update user role
- `POST /api/affiliate/admin/affiliates` - Create affiliate profile
- `PATCH /api/affiliate/admin/affiliates/:affiliateId/activate` - Activate affiliate

### Admin Management Routes (Recently Implemented)

### 8. List All Affiliates ✅ IMPLEMENTED
**GET** `/api/affiliate/admin/affiliates`

**Auth:** Required | **Roles:** ADMIN

**Query Params:**
- `page` (optional): default 1
- `limit` (optional): default 20
- `status` (optional): PENDING | ACTIVE | SUSPENDED | TERMINATED
- `search` (optional): Search by name, email, or referral code
- `regionId` (optional): Filter by region
- `countryId` (optional): Filter by country

**Database Model:** `AffiliateProfile` (with `User` relation)

**Response Structure:**
```json
{
  "success": true,
  "data": {
    "affiliates": [
      {
        "id": "507f1f77bcf86cd799439011",
        "userId": "507f1f77bcf86cd799439012",
        "subRole": "AFFILIATE",
        "referralCode": "TIC-DOUALA-JOHN-2026-X1Y2",
        "referralLink": "https://app.ticportal.com/pay?ref=TIC-DOUALA-JOHN-2026-X1Y2",
        "status": "ACTIVE",
        "tier": "STANDARD",
        "region": {
          "id": "507f1f77bcf86cd799439013",
          "name": "Douala",
          "country": {
            "id": "507f1f77bcf86cd799439014",
            "name": "Cameroon",
            "code": "CM"
          }
        },
        "totalReferrals": 25,
        "activeReferrals": 20,
        "totalStudents": 25,
        "totalEarned": 11250.0,
        "totalPaid": 5000.0,
        "bankName": "Bank of Africa",
        "accountNumber": "1234567890",
        "accountName": "John Doe",
        "mobileMoneyNumber": "+237677123456",
        "mobileMoneyProvider": "MTN",
        "activatedAt": "2026-01-15T10:30:00.000Z",
        "suspendedAt": null,
        "terminatedAt": null,
        "createdAt": "2026-01-10T08:00:00.000Z",
        "updatedAt": "2026-02-07T12:30:00.000Z",
        "user": {
          "id": "507f1f77bcf86cd799439012",
          "firstName": "John",
          "lastName": "Doe",
          "email": "john.doe@example.com"
        }
      }
    ],
    "pagination": {
      "total": 150,
      "page": 1,
      "limit": 20,
      "pages": 8
    }
  }
}
```

**Field Descriptions:**
- `id`: MongoDB ObjectId string
- `userId`: Reference to User model
- `subRole`: Always "AFFILIATE" for this endpoint (coordinators use different endpoints)
- `referralCode`: Unique referral code (format: TIC-{REGION}-{NAME}-{YEAR}-{RANDOM})
- `referralLink`: Full payment URL with referral code
- `status`: PENDING | ACTIVE | SUSPENDED | TERMINATED
- `tier`: STANDARD | PREMIUM | VIP (affects commission rates)
- `totalReferrals`: Count of StudentReferral records
- `activeReferrals`: Count of referrals with status PAID or ACTIVATED
- `totalEarned`: Sum of commissionAmount from Commission records where status >= EARNED
- `totalPaid`: Sum of commissionAmount from Commission records where status = PAID
- `activatedAt`: DateTime when status changed to ACTIVE
- `suspendedAt`: DateTime when status changed to SUSPENDED (null if not suspended)
- `terminatedAt`: DateTime when status changed to TERMINATED (null if not terminated)

**Query Implementation Notes:**
- Search should query User.firstName, User.lastName, User.email, and AffiliateProfile.referralCode
- Filter by countryId should join through Region.countryId
- Include User relation for name/email display
- Include Region and Region.country relations

---

### 9. Suspend Affiliate ✅ IMPLEMENTED
**PATCH** `/api/affiliate/admin/affiliates/:affiliateId/suspend`

**Auth:** Required | **Roles:** ADMIN

**Request Body (Optional):**
```json
{
  "reason": "Violation of terms of service" // Optional suspension reason
}
```

**Database Model:** `AffiliateProfile`

**Response Structure:**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439012",
    "subRole": "AFFILIATE",
    "referralCode": "TIC-DOUALA-JOHN-2026-X1Y2",
    "referralLink": "https://app.ticportal.com/pay?ref=TIC-DOUALA-JOHN-2026-X1Y2",
    "status": "SUSPENDED",
    "tier": "STANDARD",
    "region": {
      "id": "507f1f77bcf86cd799439013",
      "name": "Douala",
      "country": {
        "id": "507f1f77bcf86cd799439014",
        "name": "Cameroon",
        "code": "CM"
      }
    },
    "totalReferrals": 25,
    "activeReferrals": 20,
    "totalEarned": 11250.0,
    "totalPaid": 5000.0,
    "suspendedAt": "2026-02-07T14:30:00.000Z",
    "suspendedReason": "Violation of terms of service",
    "activatedAt": "2026-01-15T10:30:00.000Z",
    "createdAt": "2026-01-10T08:00:00.000Z",
    "updatedAt": "2026-02-07T14:30:00.000Z"
  }
}
```

**Implementation:**
1. Find AffiliateProfile by `affiliateId`
2. Validate current status (cannot suspend if already SUSPENDED or TERMINATED)
3. Update fields:
   - `status` = "SUSPENDED"
   - `suspendedAt` = current timestamp
   - `suspendedReason` = request.reason (if provided)
   - `updatedAt` = current timestamp
4. Return updated AffiliateProfile

**Validation:**
- Affiliate must exist
- Status must be PENDING or ACTIVE (cannot suspend if already SUSPENDED or TERMINATED)
- Return 400 error if invalid state transition

---

### 10. Unsuspend Affiliate ✅ IMPLEMENTED
**PATCH** `/api/affiliate/admin/affiliates/:affiliateId/unsuspend`

**Auth:** Required | **Roles:** ADMIN

**Database Model:** `AffiliateProfile`

**Response Structure:**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439012",
    "subRole": "AFFILIATE",
    "referralCode": "TIC-DOUALA-JOHN-2026-X1Y2",
    "referralLink": "https://app.ticportal.com/pay?ref=TIC-DOUALA-JOHN-2026-X1Y2",
    "status": "ACTIVE",
    "tier": "STANDARD",
    "region": {
      "id": "507f1f77bcf86cd799439013",
      "name": "Douala",
      "country": {
        "id": "507f1f77bcf86cd799439014",
        "name": "Cameroon",
        "code": "CM"
      }
    },
    "totalReferrals": 25,
    "activeReferrals": 20,
    "totalEarned": 11250.0,
    "totalPaid": 5000.0,
    "suspendedAt": null,
    "suspendedReason": null,
    "activatedAt": "2026-01-15T10:30:00.000Z",
    "createdAt": "2026-01-10T08:00:00.000Z",
    "updatedAt": "2026-02-07T15:00:00.000Z"
  }
}
```

**Implementation:**
1. Find AffiliateProfile by `affiliateId`
2. Validate current status (must be SUSPENDED)
3. Update fields:
   - `status` = "ACTIVE"
   - `suspendedAt` = null
   - `suspendedReason` = null
   - `updatedAt` = current timestamp
4. Return updated AffiliateProfile

**Validation:**
- Affiliate must exist
- Status must be SUSPENDED (cannot unsuspend if TERMINATED or already ACTIVE)
- Return 400 error if invalid state transition

**State Transition Rules:**
- PENDING → ACTIVE (via activate endpoint)
- ACTIVE → SUSPENDED (via suspend endpoint)
- SUSPENDED → ACTIVE (via unsuspend endpoint)
- ACTIVE/SUSPENDED → TERMINATED (via terminate endpoint, not covered here)
- TERMINATED → (cannot be changed)

---

### 11. Financial Overview ✅ IMPLEMENTED
**GET** `/api/affiliate/admin/financial-overview`

**Auth:** Required | **Roles:** ADMIN

**Database Models:** `Payment`, `Commission`

**Response Structure:**
```json
{
  "success": true,
  "data": {
    "totalRevenue": 12450000.0,
    "commissionsOwed": 1200500.0,
    "commissionsPaid": 8400000.0,
    "ticNetFees": 2849500.0
  }
}
```

**Calculation Formulas:**

1. **totalRevenue**:
   ```sql
   SELECT SUM(amount) 
   FROM Payment 
   WHERE status = 'CONFIRMED'
   ```
   - Sum of all Payment.amount where Payment.status = 'CONFIRMED'
   - This represents all successful student payments

2. **commissionsOwed**:
   ```sql
   SELECT SUM(commissionAmount)
   FROM Commission
   WHERE status = 'APPROVED' AND payoutBatchId IS NULL
   ```
   - Sum of Commission.commissionAmount where:
     - Commission.status = 'APPROVED'
     - Commission.payoutBatchId IS NULL (not yet included in a payout batch)
   - These are commissions ready to be paid but not yet processed

3. **commissionsPaid**:
   ```sql
   SELECT SUM(commissionAmount)
   FROM Commission
   WHERE status = 'PAID'
   ```
   - Sum of Commission.commissionAmount where Commission.status = 'PAID'
   - These commissions have been successfully paid out

4. **ticNetFees**:
   ```
   ticNetFees = totalRevenue - (allCommissions)
   ```
   Where `allCommissions` = sum of all Commission.commissionAmount regardless of status
   - Platform profit after all commissions
   - Can also be calculated as: totalRevenue - commissionsPaid - commissionsOwed - pendingCommissions

**Example Calculation:**
- Total Revenue: 12,450,000 XAF
- Commissions Owed (Approved): 1,200,500 XAF
- Commissions Paid: 8,400,000 XAF
- Pending Commissions: 1,849,500 XAF (EARNED but not APPROVED)
- TIC Net Fees: 12,450,000 - (1,200,500 + 8,400,000 + 1,849,500) = 1,000,000 XAF

---

### 12. System Ledger ✅ IMPLEMENTED
**GET** `/api/affiliate/admin/system-ledger`

**Auth:** Required | **Roles:** ADMIN

**Query Params:**
- `page` (optional): default 1
- `limit` (optional): default 20
- `startDate` (optional): ISO date string (e.g., "2026-01-01T00:00:00.000Z")
- `endDate` (optional): ISO date string (e.g., "2026-12-31T23:59:59.999Z")

**Database Models:** `Payment`, `StudentReferral`, `Commission`, `User` (Student)

**Response Structure:**
```json
{
  "success": true,
  "data": {
    "entries": [
      {
        "id": "507f1f77bcf86cd799439020",
        "transactionId": "TXN-49202",
        "student": {
          "id": "507f1f77bcf86cd799439021",
          "firstName": "Amadou",
          "lastName": "Diallo",
          "email": "amadou.diallo@example.com"
        },
        "payment": {
          "id": "507f1f77bcf86cd799439022",
          "amount": 5300.0,
          "status": "CONFIRMED",
          "verifiedAt": "2026-02-05T10:30:00.000Z"
        },
        "referral": {
          "id": "507f1f77bcf86cd799439023",
          "referralCode": "TIC-DOUALA-JOHN-2026-X1Y2"
        },
        "affiliateCommission": 500.0,
        "regionalCommission": 300.0,
        "nationalCommission": 200.0,
        "ticNet": 4300.0,
        "status": "completed",
        "createdAt": "2026-02-05T10:30:00.000Z"
      },
      {
        "id": "507f1f77bcf86cd799439024",
        "transactionId": "TXN-49199",
        "student": {
          "id": "507f1f77bcf86cd799439025",
          "firstName": "Jean",
          "lastName": "Pierre",
          "email": "jean.pierre@example.com"
        },
        "payment": {
          "id": "507f1f77bcf86cd799439026",
          "amount": 5300.0,
          "status": "FAILED",
          "verifiedAt": null
        },
        "referral": null,
        "affiliateCommission": null,
        "regionalCommission": null,
        "nationalCommission": null,
        "ticNet": 0.0,
        "status": "error",
        "createdAt": "2026-02-04T14:20:00.000Z"
      }
    ],
    "pagination": {
      "total": 2450,
      "page": 1,
      "limit": 20,
      "pages": 123
    }
  }
}
```

**Data Structure Details:**

**Entry Fields:**
- `id`: Unique ledger entry ID (can be Payment.id or a generated ID)
- `transactionId`: Payment.id or Payment.transactionReference (for display)
- `student`: User object (the student who made the payment)
- `payment`: Payment object with amount and status
- `referral`: StudentReferral object if payment had a referral code (null otherwise)
- `affiliateCommission`: Commission.commissionAmount where Commission.type = 'AFFILIATE' for this payment
- `regionalCommission`: Commission.commissionAmount where Commission.type = 'REGIONAL' for this payment
- `nationalCommission`: Commission.commissionAmount where Commission.type = 'NATIONAL' for this payment
- `ticNet`: Calculated as `payment.amount - (affiliateCommission + regionalCommission + nationalCommission)`
- `status`: "completed" if payment.status = 'CONFIRMED' and commissions exist, "error" otherwise
- `createdAt`: Payment.createdAt or Payment.verifiedAt

**Query Implementation:**
```sql
-- Pseudo-SQL for reference
SELECT 
  p.id as transactionId,
  p.amount as paymentAmount,
  p.status as paymentStatus,
  u.id as studentId,
  u.firstName,
  u.lastName,
  u.email,
  -- Aggregate commissions by type
  SUM(CASE WHEN c.type = 'AFFILIATE' THEN c.commissionAmount ELSE 0 END) as affiliateCommission,
  SUM(CASE WHEN c.type = 'REGIONAL' THEN c.commissionAmount ELSE 0 END) as regionalCommission,
  SUM(CASE WHEN c.type = 'NATIONAL' THEN c.commissionAmount ELSE 0 END) as nationalCommission,
  p.createdAt
FROM Payment p
LEFT JOIN User u ON p.userId = u.id
LEFT JOIN StudentReferral sr ON sr.paymentId = p.id
LEFT JOIN Commission c ON c.referralId = sr.id
WHERE p.status = 'CONFIRMED' -- or include all for error tracking
GROUP BY p.id, u.id
ORDER BY p.createdAt DESC
```

**Notes:**
- Only include payments with status = 'CONFIRMED' for completed entries
- Include failed payments for error tracking
- Commissions may be null if no referral code was used
- Filter by date range using Payment.createdAt or Payment.verifiedAt

---

### 13. Get Payout Batches ✅ IMPLEMENTED
**GET** `/api/affiliate/admin/payouts`

**Auth:** Required | **Roles:** ADMIN

**Query Params:**
- `page` (optional): default 1
- `limit` (optional): default 20
- `status` (optional): PENDING | PROCESSING | COMPLETED | FAILED

**Database Models:** `PayoutBatch`, `Commission`, `AffiliateProfile`, `User`

**Response Structure:**
```json
{
  "success": true,
  "data": {
    "payouts": [
      {
        "id": "507f1f77bcf86cd799439030",
        "batchNumber": "PAY-2026-001",
        "affiliateId": "507f1f77bcf86cd799439011",
        "affiliateCode": "TIC-DOUALA-JOHN-2026-X1Y2",
        "affiliateName": "John Doe",
        "affiliateEmail": "john.doe@example.com",
        "totalAmount": 125000.0,
        "commissionCount": 15,
        "status": "PENDING",
        "createdBy": "507f1f77bcf86cd799439040",
        "processedBy": null,
        "exportUrl": null,
        "notes": "Monthly payout for January 2026",
        "createdAt": "2026-02-04T08:00:00.000Z",
        "processedAt": null
      },
      {
        "id": "507f1f77bcf86cd799439031",
        "batchNumber": "PAY-2026-002",
        "affiliateId": "507f1f77bcf86cd799439015",
        "affiliateCode": "TIC-YAOUNDE-JANE-2026-A2B3",
        "affiliateName": "Jane Smith",
        "affiliateEmail": "jane.smith@example.com",
        "totalAmount": 89000.0,
        "commissionCount": 12,
        "status": "COMPLETED",
        "createdBy": "507f1f77bcf86cd799439040",
        "processedBy": "507f1f77bcf86cd799439041",
        "exportUrl": "https://storage.example.com/payouts/PAY-2026-002.csv",
        "notes": "Weekly payout",
        "createdAt": "2026-02-03T10:00:00.000Z",
        "processedAt": "2026-02-03T14:30:00.000Z"
      }
    ],
    "pagination": {
      "total": 45,
      "page": 1,
      "limit": 20,
      "pages": 3
    }
  }
}
```

**Field Descriptions:**
- `id`: PayoutBatch.id (MongoDB ObjectId)
- `batchNumber`: PayoutBatch.batchNumber (unique identifier, format: PAY-YYYY-NNN)
- `affiliateId`: AffiliateProfile.id from the commissions in this batch
- `affiliateCode`: AffiliateProfile.referralCode
- `affiliateName`: User.firstName + User.lastName from AffiliateProfile.userId
- `affiliateEmail`: User.email from AffiliateProfile.userId
- `totalAmount`: PayoutBatch.totalAmount (sum of Commission.commissionAmount in batch)
- `commissionCount`: PayoutBatch.commissionCount (count of Commission records)
- `status`: PayoutBatch.status (PENDING | PROCESSING | COMPLETED | FAILED)
- `createdBy`: User.id who created the batch (Admin)
- `processedBy`: User.id who processed the batch (null if not processed)
- `exportUrl`: PayoutBatch.exportUrl (CSV/Excel export file URL)
- `notes`: PayoutBatch.notes (admin notes)
- `createdAt`: PayoutBatch.createdAt
- `processedAt`: PayoutBatch.processedAt (null if not processed)

**Query Implementation:**
```sql
-- Pseudo-SQL
SELECT 
  pb.id,
  pb.batchNumber,
  pb.totalAmount,
  pb.commissionCount,
  pb.status,
  pb.createdAt,
  pb.processedAt,
  -- Get affiliate info from first commission in batch
  ap.id as affiliateId,
  ap.referralCode as affiliateCode,
  u.firstName || ' ' || u.lastName as affiliateName,
  u.email as affiliateEmail
FROM PayoutBatch pb
LEFT JOIN Commission c ON c.payoutBatchId = pb.id
LEFT JOIN AffiliateProfile ap ON c.affiliateProfileId = ap.id
LEFT JOIN User u ON ap.userId = u.id
WHERE pb.status = ? -- filter by status if provided
GROUP BY pb.id, ap.id, u.id
ORDER BY pb.createdAt DESC
```

**Notes:**
- Each payout batch contains commissions for ONE affiliate
- Status mapping: PENDING → PENDING, PROCESSING → PROCESSING, COMPLETED → PAID, FAILED → FAILED
- Include affiliate info for display purposes

---

### 14. Get Fraud Flags ✅ IMPLEMENTED
**GET** `/api/affiliate/admin/fraud-flags`

**Auth:** Required | **Roles:** ADMIN

**Query Params:**
- `page` (optional): default 1
- `limit` (optional): default 20
- `severity` (optional): LOW | MEDIUM | HIGH | CRITICAL
- `resolved` (optional): boolean (true = RESOLVED or DISMISSED, false = PENDING or INVESTIGATING)
- `type` (optional): DUPLICATE_ACCOUNT | FAKE_PAYMENT | PAYMENT_REUSE | IP_ANOMALY | VELOCITY_ABUSE | SUSPICIOUS_PATTERN | OTHER

**Database Models:** `FraudFlag`, `User`, `AffiliateProfile`, `StudentReferral`, `Payment`

**Response Structure:**
```json
{
  "success": true,
  "data": {
    "flags": [
      {
        "id": "507f1f77bcf86cd799439050",
        "userId": "507f1f77bcf86cd799439012",
        "type": "VELOCITY_ABUSE",
        "severity": "CRITICAL",
        "title": "High-Velocity Signup",
        "description": "Affiliate 'TIC-DOUALA-JOHN-2026-X1Y2' detected 50+ signups from the same IP range in 5 minutes.",
        "reason": "Unusual signup velocity detected from IP range 192.168.1.0/24",
        "evidence": {
          "ipAddresses": ["192.168.1.10", "192.168.1.11", "192.168.1.12"],
          "signupCount": 52,
          "timeWindow": "5 minutes",
          "affiliateCode": "TIC-DOUALA-JOHN-2026-X1Y2"
        },
        "status": "PENDING",
        "affiliateId": "507f1f77bcf86cd799439011",
        "affiliateCode": "TIC-DOUALA-JOHN-2026-X1Y2",
        "affiliateName": "John Doe",
        "referralId": null,
        "transactionId": null,
        "flaggedBy": "507f1f77bcf86cd799439040",
        "flaggedAt": "2026-02-07T10:25:00.000Z",
        "resolvedBy": null,
        "resolvedAt": null,
        "resolution": null,
        "createdAt": "2026-02-07T10:25:00.000Z",
        "updatedAt": "2026-02-07T10:25:00.000Z"
      },
      {
        "id": "507f1f77bcf86cd799439051",
        "userId": "507f1f77bcf86cd799439021",
        "type": "TIER_DISCREPANCY",
        "severity": "WARNING",
        "title": "Tier Discrepancy",
        "description": "Regional commission paid for TXN-49195 exceeds student net fee after deductions.",
        "reason": "Commission calculation error detected",
        "evidence": {
          "paymentId": "507f1f77bcf86cd799439022",
          "transactionId": "TXN-49195",
          "paymentAmount": 5300.0,
          "commissionAmount": 3500.0,
          "expectedMax": 3000.0
        },
        "status": "INVESTIGATING",
        "affiliateId": null,
        "affiliateCode": null,
        "affiliateName": null,
        "referralId": "507f1f77bcf86cd799439023",
        "transactionId": "TXN-49195",
        "flaggedBy": "507f1f77bcf86cd799439040",
        "flaggedAt": "2026-02-06T14:30:00.000Z",
        "resolvedBy": null,
        "resolvedAt": null,
        "resolution": null,
        "createdAt": "2026-02-06T14:30:00.000Z",
        "updatedAt": "2026-02-06T15:00:00.000Z"
      },
      {
        "id": "507f1f77bcf86cd799439052",
        "userId": "507f1f77bcf86cd799439025",
        "type": "PAYMENT_REUSE",
        "severity": "CRITICAL",
        "title": "Chargeback Risk",
        "description": "Multiple failed payment attempts for card ending in *9902 across 3 accounts.",
        "reason": "Same payment method used across multiple accounts",
        "evidence": {
          "cardLast4": "9902",
          "accountCount": 3,
          "failedAttempts": 8,
          "accounts": ["user1@example.com", "user2@example.com", "user3@example.com"]
        },
        "status": "RESOLVED",
        "affiliateId": null,
        "affiliateCode": null,
        "affiliateName": null,
        "referralId": null,
        "transactionId": null,
        "flaggedBy": "507f1f77bcf86cd799439040",
        "flaggedAt": "2026-02-05T09:15:00.000Z",
        "resolvedBy": "507f1f77bcf86cd799439041",
        "resolvedAt": "2026-02-05T11:30:00.000Z",
        "resolution": "Blocked card and suspended accounts",
        "createdAt": "2026-02-05T09:15:00.000Z",
        "updatedAt": "2026-02-05T11:30:00.000Z"
      }
    ],
    "pagination": {
      "total": 23,
      "page": 1,
      "limit": 20,
      "pages": 2
    }
  }
}
```

**Field Descriptions:**
- `id`: FraudFlag.id (MongoDB ObjectId)
- `userId`: User.id who triggered the flag (may be affiliate or student)
- `type`: FraudFlag.type enum (DUPLICATE_ACCOUNT | FAKE_PAYMENT | PAYMENT_REUSE | IP_ANOMALY | VELOCITY_ABUSE | SUSPICIOUS_PATTERN | OTHER)
- `severity`: FraudFlag.severity enum (LOW | MEDIUM | HIGH | CRITICAL)
- `title`: Human-readable title (generated from type and context)
- `description`: Human-readable description (generated from reason and evidence)
- `reason`: FraudFlag.reason (detailed reason text)
- `evidence`: FraudFlag.evidence (JSON object with relevant data)
- `status`: FraudFlag.status enum (PENDING | INVESTIGATING | RESOLVED | DISMISSED)
- `affiliateId`: AffiliateProfile.id if flag is related to an affiliate (from evidence or userId lookup)
- `affiliateCode`: AffiliateProfile.referralCode (for display)
- `affiliateName`: User name from AffiliateProfile.userId (for display)
- `referralId`: StudentReferral.id if flag is related to a referral
- `transactionId`: Payment.id or Payment.transactionReference (for display)
- `flaggedBy`: User.id who created the flag (system or admin)
- `flaggedAt`: FraudFlag.flaggedAt
- `resolvedBy`: User.id who resolved the flag (null if not resolved)
- `resolvedAt`: FraudFlag.resolvedAt (null if not resolved)
- `resolution`: FraudFlag.resolution (resolution notes, null if not resolved)
- `createdAt`: FraudFlag.createdAt
- `updatedAt`: FraudFlag.updatedAt

**Title/Description Generation:**
- Generate `title` and `description` from `type`, `reason`, and `evidence` for user-friendly display
- Examples:
  - VELOCITY_ABUSE → "High-Velocity Signup" → "Affiliate 'X' detected Y signups from same IP in Z minutes"
  - TIER_DISCREPANCY → "Tier Discrepancy" → "Commission exceeds expected amount for transaction"
  - PAYMENT_REUSE → "Chargeback Risk" → "Same payment method used across multiple accounts"

**Query Implementation:**
```sql
-- Pseudo-SQL
SELECT 
  ff.id,
  ff.userId,
  ff.type,
  ff.severity,
  ff.reason,
  ff.evidence,
  ff.status,
  ff.flaggedAt,
  ff.resolvedAt,
  ff.resolution,
  -- Lookup affiliate if userId matches an affiliate
  ap.id as affiliateId,
  ap.referralCode as affiliateCode,
  u_aff.firstName || ' ' || u_aff.lastName as affiliateName
FROM FraudFlag ff
LEFT JOIN AffiliateProfile ap ON ff.userId = ap.userId
LEFT JOIN User u_aff ON ap.userId = u_aff.id
WHERE ff.severity = ? -- filter by severity
  AND (ff.status IN ('RESOLVED', 'DISMISSED')) = ? -- filter by resolved
ORDER BY 
  CASE ff.severity 
    WHEN 'CRITICAL' THEN 1 
    WHEN 'HIGH' THEN 2 
    WHEN 'MEDIUM' THEN 3 
    ELSE 4 
  END,
  ff.flaggedAt DESC
```

**Notes:**
- Map severity: CRITICAL → CRITICAL, HIGH → WARNING, MEDIUM/LOW → INFO (for frontend display)
- `resolved` filter: true = status IN ('RESOLVED', 'DISMISSED'), false = status IN ('PENDING', 'INVESTIGATING')
- Include affiliate info when userId matches an AffiliateProfile

---

### 15. Get Commission Tier Configuration ✅ IMPLEMENTED
**GET** `/api/affiliate/admin/commission-tiers`

**Auth:** Required | **Roles:** ADMIN

**Database Model:** `SystemConfig` (key: "commission_tiers") or `Country` (for country-specific rates)

**Response Structure:**
```json
{
  "success": true,
  "data": {
    "standard": {
      "affiliateRate": 0.09,
      "regionalRate": 0.06,
      "nationalRate": 0.05
    },
    "premium": {
      "affiliateRate": 0.12,
      "regionalRate": 0.08,
      "nationalRate": 0.06
    },
    "vip": {
      "affiliateRate": 0.15,
      "regionalRate": 0.10,
      "nationalRate": 0.08
    }
  }
}
```

**Data Structure:**
- Rates are stored as decimals (0.09 = 9%, 0.12 = 12%)
- Can be stored in `SystemConfig` table with key "commission_tiers" and value as JSON
- Or can be calculated from `Country` table fields (affiliateCommissionRate, regionalCommissionRate, nationalCommissionRate) with tier multipliers

**Storage Options:**

**Option 1: SystemConfig Table**
```json
{
  "key": "commission_tiers",
  "value": {
    "standard": {
      "affiliateRate": 0.09,
      "regionalRate": 0.06,
      "nationalRate": 0.05
    },
    "premium": {
      "affiliateRate": 0.12,
      "regionalRate": 0.08,
      "nationalRate": 0.06
    },
    "vip": {
      "affiliateRate": 0.15,
      "regionalRate": 0.10,
      "nationalRate": 0.08
    }
  }
}
```

**Option 2: Calculated from Country + Tier Multipliers**
```sql
-- Base rates from Country table
-- Tier multipliers: STANDARD = 1.0, PREMIUM = 1.33, VIP = 1.67
SELECT 
  'standard' as tier,
  country.affiliateCommissionRate * 1.0 as affiliateRate,
  country.regionalCommissionRate * 1.0 as regionalRate,
  country.nationalCommissionRate * 1.0 as nationalRate
FROM Country
WHERE country.code = 'CM' -- or use default country
```

**Default Values (if not configured):**
- STANDARD: Affiliate 9%, Regional 6%, National 5%
- PREMIUM: Affiliate 12%, Regional 8%, National 6%
- VIP: Affiliate 15%, Regional 10%, National 8%

---

### 16. Update Commission Tier Configuration ✅ IMPLEMENTED
**PUT** `/api/affiliate/admin/commission-tiers`

**Auth:** Required | **Roles:** ADMIN

**Request Structure:**
```json
{
  "tier": "STANDARD",
  "affiliateRate": 0.09,
  "regionalRate": 0.06,
  "nationalRate": 0.05
}
```

**Validation Rules:**
- `tier`: Must be "STANDARD" | "PREMIUM" | "VIP"
- `affiliateRate`: Decimal between 0 and 1 (0.0 to 1.0)
- `regionalRate`: Decimal between 0 and 1 (0.0 to 1.0)
- `nationalRate`: Decimal between 0 and 1 (0.0 to 1.0)
- Sum of all rates should not exceed 1.0 (100%) for a single transaction
- Rates should be positive numbers

**Response Structure:**
```json
{
  "success": true,
  "data": {
    "standard": {
      "affiliateRate": 0.09,
      "regionalRate": 0.06,
      "nationalRate": 0.05
    },
    "premium": {
      "affiliateRate": 0.12,
      "regionalRate": 0.08,
      "nationalRate": 0.06
    },
    "vip": {
      "affiliateRate": 0.15,
      "regionalRate": 0.10,
      "nationalRate": 0.08
    }
  }
}
```

**Implementation Notes:**
- Update `SystemConfig` record with key "commission_tiers"
- Or update tier multipliers if using Country-based calculation
- Validate that rates are reasonable (e.g., affiliateRate > regionalRate > nationalRate)
- Log the change with `updatedBy` field
- Return the complete configuration after update

**Example Update Flow:**
1. Validate request (tier exists, rates are valid)
2. Load current config from SystemConfig
3. Update the specified tier's rates
4. Save to SystemConfig
5. Return complete updated configuration

---

---

## Additional Implementation Notes

### Database Relationships

**AffiliateProfile → User:**
- `AffiliateProfile.userId` → `User.id` (one-to-one)
- Include User relation for name/email display

**Commission → Payment (via StudentReferral):**
- `Commission.referralId` → `StudentReferral.id`
- `StudentReferral.paymentId` → `Payment.id`
- Join through StudentReferral to get payment info

**PayoutBatch → Commission:**
- `Commission.payoutBatchId` → `PayoutBatch.id` (many-to-one)
- Each payout batch contains multiple commissions

**FraudFlag → User:**
- `FraudFlag.userId` → `User.id` (many-to-one)
- User can be affiliate or student

### Common Patterns

**Pagination:**
All list endpoints should support pagination:
```typescript
{
  page: number;      // Current page (1-indexed)
  limit: number;     // Items per page
  total: number;     // Total items
  pages: number;     // Total pages (Math.ceil(total / limit))
}
```

**Date Filtering:**
Use ISO 8601 format: `"2026-01-01T00:00:00.000Z"`
- Filter by `createdAt` or `updatedAt` fields
- Support both `startDate` and `endDate` query params

**Search Implementation:**
- Search across multiple fields (name, email, code)
- Use case-insensitive matching
- Consider full-text search for better performance

**Status Mapping:**
- Map database enums to frontend-friendly strings
- Ensure consistency across all endpoints

---

## Summary

**Total Routes: 16 (All Implemented ✅)**

### Core Routes (7)
1. ✅ **List Countries** - GET `/api/affiliate/admin/countries`
2. ✅ **Create Country** - POST `/api/affiliate/admin/countries`
3. ✅ **Get Regions by Country** - GET `/api/affiliate/admin/countries/:countryId/regions`
4. ✅ **Create Region** - POST `/api/affiliate/admin/regions`
5. ✅ **Update User Role** - PUT `/api/affiliate/admin/users/role`
6. ✅ **Create Affiliate Profile** - POST `/api/affiliate/admin/affiliates`
7. ✅ **Activate Affiliate** - PATCH `/api/affiliate/admin/affiliates/:affiliateId/activate`

### Admin Management Routes (9)
8. ✅ **List All Affiliates** - GET `/api/affiliate/admin/affiliates`
9. ✅ **Suspend Affiliate** - PATCH `/api/affiliate/admin/affiliates/:id/suspend`
10. ✅ **Unsuspend Affiliate** - PATCH `/api/affiliate/admin/affiliates/:id/unsuspend`
11. ✅ **Financial Overview** - GET `/api/affiliate/admin/financial-overview`
12. ✅ **System Ledger** - GET `/api/affiliate/admin/system-ledger`
13. ✅ **Get Payout Batches** - GET `/api/affiliate/admin/payouts`
14. ✅ **Get Fraud Flags** - GET `/api/affiliate/admin/fraud-flags`
15. ✅ **Get Commission Tier Configuration** - GET `/api/affiliate/admin/commission-tiers`
16. ✅ **Update Commission Tier Configuration** - PUT `/api/affiliate/admin/commission-tiers`

### Standard API Response Format

**Success Response:**
```json
{
  "success": true,
  "data": {...}
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message"
  }
}
```

**Validation Error Response:**
```json
{
  "success": false,
  "error": [
    {
      "code": "invalid_value",
      "path": ["fieldName"],
      "message": "Field validation error",
      "values": ["valid", "values"]
    }
  ]
}
```

### Testing Checklist

For each endpoint, ensure:
- [ ] Authentication/Authorization works (Admin role required)
- [ ] Pagination works correctly
- [ ] Filters/search work as expected
- [ ] Date range filtering works (where applicable)
- [ ] Error handling returns proper error format
- [ ] Data relationships are properly loaded (includes)
- [ ] Calculations are accurate (financial overview, ledger)
- [ ] Status updates persist correctly (suspend/unsuspend)
- [ ] Validation prevents invalid data (commission tiers)
