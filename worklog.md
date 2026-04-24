---
Task ID: 1
Agent: Main Agent
Task: Security audit and fixes for StayEg production readiness

Work Log:
- Audited all 22 API endpoints for security
- Fixed RazorPay TypeScript build error (Razorpay.Instance type → InstanceType<typeof Razorpay>)
- Built Next.js production build successfully
- Ran /api/setup/security - all existing users have password hashes
- Ran /api/setup/storage - created 3 storage buckets (avatars, kyc-documents, pg-images)
- Created migration 003_security_hardening.sql with:
  - Missing column additions (password_hash, otp_code, otp_expires_at, kyc_status, razorpay_order_id, razorpay_payment_id)
  - Proper RLS policies replacing open USING(true) policies
  - Default password hashing for seed users
- Tested login: ✅ returns user + JWT token
- Tested signup: ✅ creates user + returns JWT token
- Tested protected APIs: ✅ JWT auth works correctly
- Tested payment order creation: ✅ (simulated mode)
- Tested file upload endpoint: ✅ auth check works

Stage Summary:
- App builds cleanly and runs on port 3000
- All code-level security is implemented (password hashing, JWT, API auth middleware, role enforcement)
- Storage buckets created
- Migration SQL file ready for manual execution in Supabase SQL Editor
- One manual step needed: run 003_security_hardening.sql in Supabase Dashboard → SQL Editor
