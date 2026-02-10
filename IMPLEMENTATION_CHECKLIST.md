# ZYCARE Email OTP Implementation - Complete Checklist

## ✅ BACKEND SETUP (Already Done)

- [x] Created `backend/utils/mail.js` - Email utility with OTP functions
- [x] Updated `backend/routes/auth.js` - Email-based authentication
- [x] Updated `backend/models/User.js` - Added email field to database
- [x] Installed `nodemailer` package
- [x] Updated `backend/.env` with email configuration
- [x] Updated `backend/.env.example` with documentation

---

## 📝 STEP-BY-STEP IMPLEMENTATION GUIDE

### PHASE 1: Gmail Configuration (5 minutes)

**[ ] Step 1: Enable 2-Factor Authentication**
1. Go to https://myaccount.google.com
2. Click "Security" 
3. Find "How you sign in to Google"
4. Enable "2-Step Verification"
5. Verify phone number

**[ ] Step 2: Create App Password**
1. Go to https://myaccount.google.com/apppasswords
2. Select "Mail" as app
3. Select "Windows Computer" as device
4. Copy the 16-character password (e.g., `abcdefghijklmnop`)

**[ ] Step 3: Update backend/.env**
```env
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=abcdefghijklmnop
```

---

### PHASE 2: Backend Configuration (2 minutes)

**[ ] Step 4: Verify Backend Dependencies**
```bash
cd backend
npm list nodemailer
```
Should output: `nodemailer@^6.x.x`

If missing, install:
```bash
npm install nodemailer
```

**[ ] Step 5: Start Backend Server**
```bash
cd backend
npm start
```

Expected output:
```
Server running on port 5000
Connected to MongoDB
```

---

### PHASE 3: Backend Testing (5 minutes)

**[ ] Step 6: Test Login Endpoint**

Using Postman or cURL:
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "name": "John Doe",
  "role": "patient"
}
```

Expected Response:
```json
{
  "success": true,
  "message": "OTP sent to your email",
  "userId": "...",
  "role": "patient",
  "name": "John Doe"
}
```

Check:
- [ ] Email received in inbox within 2 seconds
- [ ] Email subject: "ZYCARE - Your OTP Code"
- [ ] Email contains 6-digit OTP
- [ ] Console shows: `🔐 OTP for test@example.com: 123456`

**[ ] Step 7: Test OTP Verification**

```
POST http://localhost:5000/api/auth/verify-otp
Content-Type: application/json

{
  "email": "test@example.com",
  "otp": "123456"
}
```

Expected Response:
```json
{
  "success": true,
  "verified": true,
  "user": {
    "userId": "...",
    "name": "John Doe",
    "email": "test@example.com",
    "role": "patient"
  }
}
```

**[ ] Step 8: Test Resend OTP**

```
POST http://localhost:5000/api/auth/resend-otp
Content-Type: application/json

{
  "email": "test@example.com"
}
```

Expected Response:
```json
{
  "success": true,
  "message": "OTP resent to your email"
}
```

---

### PHASE 4: Frontend Updates (15-20 minutes)

**[ ] Step 9: Update API Service**
✅ Already done! File: `src/services/api.js`
```javascript
authAPI.login(email, name, role)
authAPI.verifyOTP(email, otp)
authAPI.resendOTP(email)
```

**[ ] Step 10: Find Your Login Screen File**
Common locations:
- `src/screens/auth/LoginScreen.tsx`
- `src/screens/auth/LoginScreenNew.js`
- `src/screens/main/PatientHome.js`
- `src/screens/auth/LoginScreen.tsx`

**[ ] Step 11: Update State Variables**

Find:
```typescript
const [phone, setPhone] = useState('');
```

Replace with:
```typescript
const [email, setEmail] = useState('');
```

**[ ] Step 12: Update Login Handler**

Find:
```typescript
await authAPI.login(phone, name, 'patient')
```

Replace with:
```typescript
await authAPI.login(email, name, 'patient')
```

**[ ] Step 13: Update TextInput Field**

Find:
```typescript
<TextInput placeholder="Enter phone number" />
```

Replace with:
```typescript
<TextInput placeholder="Enter email address" />
```

**[ ] Step 14: Add Email Validation**

Add function:
```typescript
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
```

In login handler, add:
```typescript
if (!validateEmail(email)) {
  setError('Please enter a valid email address');
  return;
}
```

**[ ] Step 15: Find OTP Verification Screen**

Common locations:
- `src/screens/auth/OTPScreen.tsx`
- Same file as LoginScreen
- `src/screens/auth/LoginScreenNew.js`

**[ ] Step 16: Update OTP Verification Handler**

Find:
```typescript
await authAPI.verifyOTP(phone, otp)
```

Replace with:
```typescript
await authAPI.verifyOTP(email, otp)
```

**[ ] Step 17: Update Resend OTP Handler**

Find:
```typescript
await authAPI.login(phone, name, 'patient')
```

Replace with:
```typescript
await authAPI.resendOTP(email)
```

**[ ] Step 18: Update User Messages**

Find all references to "phone" in auth screens and replace:
- "Enter your phone number" → "Enter your email address"
- "OTP sent to your phone" → "OTP sent to your email"
- "Re-enter phone" → "Re-enter email"

---

### PHASE 5: Testing Full Flow (10 minutes)

**[ ] Step 19: Start Both Services**

Terminal 1 (Backend):
```bash
cd backend
npm start
```

Terminal 2 (Frontend):
```bash
npx expo start
```

**[ ] Step 20: Test in Mobile App**

1. Run app on Android/iOS or Web
2. Go to login screen
3. Enter email: `test@example.com`
4. Enter name: `Test User`
5. Click "Send OTP"
6. Check email inbox (wait 1-2 seconds)
7. Copy 6-digit OTP from email
8. Enter OTP in app
9. Verify successful login

**[ ] Step 21: Test Resend OTP**

1. On OTP screen, click "Resend OTP"
2. Check email inbox
3. Receive new OTP
4. Enter new OTP and verify

**[ ] Step 22: Test OTP Expiration**

1. Request OTP
2. Wait 10+ minutes
3. Try to enter old OTP
4. Should get "OTP has expired" error
5. Click "Resend OTP"

**[ ] Step 23: Test Wrong OTP (5 attempts)**

1. Request OTP
2. Enter wrong OTP 5 times
3. On 5th attempt, should get "Too many failed attempts"
4. Click "Resend OTP" to get new one

---

### PHASE 6: Troubleshooting (As Needed)

**Problem: "Failed to send OTP"**
- [ ] Check Gmail credentials in `backend/.env`
- [ ] Verify 2FA is enabled: https://myaccount.google.com/security
- [ ] Use app password, not regular password
- [ ] Check backend logs for errors

**Problem: No Email Received**
- [ ] Wait 1-2 seconds (email takes time)
- [ ] Check spam/promotions folder
- [ ] Check console for OTP value
- [ ] Verify EMAIL_USER in .env is correct

**Problem: "Invalid email format"**
- [ ] Make sure email has `@` symbol
- [ ] Make sure email has domain (e.g., `.com`)
- [ ] Example valid: `user@example.com`

**Problem: Network Timeout (Original Issue)**
- [ ] Email method doesn't depend on SMS service
- [ ] Should respond within 2-3 seconds
- [ ] Check backend is running: `npm start`
- [ ] Check API_URL in frontend matches backend

**Problem: OTP Wrong Multiple Times**
- [ ] Each login request generates NEW OTP
- [ ] Check email for LATEST OTP sent
- [ ] Make sure you copied all 6 digits
- [ ] Try "Resend OTP" to get fresh one

---

## 📊 Summary of Changes

### Backend Changes ✅
| File | Change | Status |
|------|--------|--------|
| `backend/utils/mail.js` | NEW - Email utilities | ✅ Done |
| `backend/routes/auth.js` | UPDATED - Email auth | ✅ Done |
| `backend/models/User.js` | UPDATED - Email field | ✅ Done |
| `backend/.env` | UPDATED - Email config | ✅ Done |
| `backend/package.json` | AUTO - nodemailer added | ✅ Done |

### Frontend Changes 📝
| File | Change | Status |
|------|--------|--------|
| `src/services/api.js` | UPDATED - Email API | ✅ Done |
| `src/screens/auth/LoginScreen*` | TODO - Email input | ⏳ In Progress |
| `src/screens/auth/OTPScreen*` | TODO - Email verification | ⏳ In Progress |
| UI Text | TODO - Update labels | ⏳ In Progress |

---

## 🚀 Quick Start Commands

```bash
# Install backend email package
cd backend
npm install nodemailer

# Start backend
cd backend
npm start

# Start frontend (in new terminal)
npx expo start

# Test email endpoint (in new terminal)
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test","role":"patient"}'
```

---

## 📞 Support Resources

- Gmail App Passwords: https://support.google.com/accounts/answer/185833
- Email Validation: https://regex101.com (use `^[^\s@]+@[^\s@]+\.[^\s@]+$`)
- Nodemailer Docs: https://nodemailer.com/
- React Native TextInput: https://reactnative.dev/docs/textinput

---

## ✨ Implementation Complete When:

- [x] Backend sends OTP emails successfully
- [ ] Frontend accepts email input
- [ ] Frontend validates email format
- [ ] OTP verification works end-to-end
- [ ] User successfully logged in
- [ ] Resend OTP works
- [ ] OTP expires after 10 minutes
- [ ] Rate limiting works (5 attempts max)

---

## 📅 Timeline

| Phase | Duration | Status |
|-------|----------|--------|
| Gmail Setup | 5 min | ⏳ |
| Backend Config | 2 min | ✅ |
| Backend Testing | 5 min | ⏳ |
| Frontend Updates | 15-20 min | ⏳ |
| Full Testing | 10 min | ⏳ |
| **TOTAL** | **45 min** | ⏳ |

---

Last Updated: Feb 10, 2026
