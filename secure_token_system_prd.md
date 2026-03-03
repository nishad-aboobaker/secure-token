# Product Requirements Document (PRD)

## Product Name
Secure QR-Based Token Issuance & Verification System

---

## 1. Purpose
Build a high-security, QR-based token system where:
- Admin defines maximum token supply
- Users can register and generate tokens (subject to availability)
- Tokens are downloadable as QR codes
- Admin scans and verifies tokens
- Tokens expire after use or time limit
- No duplication, race condition, or forgery is possible

---

## 2. Goals
- Ensure strict supply control
- Prevent double redemption
- Prevent token forgery
- Provide secure, scalable backend
- Maintain full audit trail

---

## 3. Non-Goals
- Payment integration (future scope)
- Multi-tenant architecture (future scope)
- Offline verification (not supported initially)

---

## 4. User Roles

### 4.1 Admin
- Set total token supply
- Define token expiry rules
- Scan and validate tokens
- View analytics and logs
- Disable/expire tokens manually

### 4.2 User
- Register account
- Login securely
- Generate token (if available)
- Download QR code
- View token status

---

## 5. Functional Requirements

### 5.1 Authentication
- JWT-based authentication
- Role-based access control (RBAC)
- Password hashing using bcrypt
- Secure HTTPS only

### 5.2 Token Supply Management
- Admin sets total token limit
- System tracks totalGenerated count
- Atomic DB update to prevent race conditions
- No generation allowed after limit reached

### 5.3 Token Generation
- Cryptographically secure random token (minimum 32 bytes)
- Each token linked to userId
- Token status: active | used | expired
- Token expiry timestamp stored
- HMAC signature generated for integrity

### 5.4 QR Code Generation
QR contains:
- tokenId
- signature

Example format:
<tokenId>.<signature>

No business logic data stored in QR.

### 5.5 Token Validation (Admin Scan)
On scan:
- Verify signature using HMAC
- Validate token exists
- Ensure status = active
- Ensure not expired
- Atomically update status to used
- Log usedAt timestamp

Return clear response:
- Valid
- Already Used
- Expired
- Invalid

### 5.6 Expiry Handling
- Tokens expire after defined duration
- Scheduled job updates expired tokens
- Expired tokens cannot be redeemed

### 5.7 Audit Logging
Store:
- tokenId
- userId
- validation attempt time
- adminId
- IP address
- device metadata

---

## 6. Security Requirements

- Cryptographically secure random generation
- HMAC SHA256 signing
- Atomic DB operations (findOneAndUpdate with condition)
- Rate limiting on validation endpoint
- Admin-only access for scanning endpoint
- Input sanitization
- No sensitive data in QR
- HTTPS enforced
- Environment variables for secrets

Optional (Advanced):
- Redis-based rate limiter
- IP-based anomaly detection
- Brute force detection

---

## 7. Technical Stack

Backend:
- Node.js
- Express
- MongoDB
- Mongoose
- Redis (optional)

Frontend:
- React
- QR scanner library

Deployment:
- VPS or cloud VM
- Nginx reverse proxy
- SSL certificate

---

## 8. API Endpoints

### Auth
POST /register
POST /login

### Admin
POST /admin/set-token-limit
GET /admin/stats
POST /admin/verify-token

### User
POST /user/generate-token
GET /user/token-status
GET /user/download-qr

---

## 9. Database Schema Overview

Users
- _id
- name
- email
- passwordHash
- role
- createdAt

Tokens
- _id
- tokenId
- signature
- userId
- status
- createdAt
- expiresAt
- usedAt

Settings
- totalTokenLimit
- totalGenerated

AuditLogs
- tokenId
- userId
- adminId
- action
- timestamp
- metadata

---

## 10. Edge Cases

- Multiple users attempting final token generation simultaneously
- Admin scanning same token twice
- Token expiry during scan process
- Brute force token guessing

---

## 11. Success Metrics

- Zero duplicate redemptions
- Zero successful forged tokens
- Accurate supply enforcement
- <200ms validation response time

---

## 12. Future Enhancements

- Multi-event support
- User-specific token quotas
- Payment integration
- Analytics dashboard
- Multi-admin hierarchy

---

## 13. Risks & Mitigation

Risk: Token brute-force attacks  
Mitigation: Rate limiting + high entropy tokens

Risk: Race conditions  
Mitigation: Atomic DB operations

Risk: Secret key leakage  
Mitigation: Environment-based secret management

---

## 14. Open Questions

- Should users generate multiple tokens?
- Should tokens be transferable?
- Should there be per-user generation limits?
- Should validation be location restricted?

---

End of Document

