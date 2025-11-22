# 🚀 Quick Start Guide - Authentication Setup

## Installation Steps

### Backend Setup

1. **Install Python dependencies**
   ```powershell
   cd bd
   pip install python-jose[cryptography]==3.3.0 passlib[bcrypt]==1.7.4
   ```

2. **Update database schema**
   ```python
   # The models have been updated with User table and user_id foreign keys
   # Supabase will auto-create tables on first run, OR manually run:
   
   # Create users table
   CREATE TABLE users (
       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
       email VARCHAR(255) UNIQUE NOT NULL,
       username VARCHAR(50) UNIQUE NOT NULL,
       hashed_password VARCHAR(255) NOT NULL,
       full_name VARCHAR(100),
       is_active BOOLEAN DEFAULT TRUE NOT NULL,
       created_at TIMESTAMP DEFAULT NOW() NOT NULL,
       updated_at TIMESTAMP DEFAULT NOW() NOT NULL
   );
   
   # Add user_id to existing tables
   ALTER TABLE transactions ADD COLUMN user_id UUID;
   ALTER TABLE subscriptions ADD COLUMN user_id UUID;
   ALTER TABLE bank_analyses ADD COLUMN user_id UUID;
   
   # Add foreign keys (optional but recommended)
   ALTER TABLE transactions ADD FOREIGN KEY (user_id) REFERENCES users(id);
   ALTER TABLE subscriptions ADD FOREIGN KEY (user_id) REFERENCES users(id);
   ALTER TABLE bank_analyses ADD FOREIGN KEY (user_id) REFERENCES users(id);
   
   # Add indexes for performance
   CREATE INDEX idx_transactions_user_id ON transactions(user_id);
   CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
   CREATE INDEX idx_bank_analyses_user_id ON bank_analyses(user_id);
   ```

3. **Start backend server**
   ```powershell
   cd bd
   .\venv\Scripts\activate
   uvicorn app.main:app --reload --port 8000
   ```

### Frontend Setup

1. **No new dependencies needed!**
   All required packages are already installed (react-hot-toast, react-router-dom, etc.)

2. **Start frontend development server**
   ```powershell
   cd fd
   npm run dev
   ```

---

## First Time Setup

### Create Your First User

**Option 1: Using the UI (Recommended)**
1. Open browser to `http://localhost:3002`
2. Click "Sign Up" in navigation
3. Fill in:
   - Email: your@email.com
   - Username: yourusername
   - Password: your-secure-password
   - Full Name: Your Name (optional)
4. Click "Create Account"
5. You'll be automatically logged in!

**Option 2: Using API directly**
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "password123",
    "full_name": "Test User"
  }'
```

---

## Testing Authentication

### Test Login
1. Go to `http://localhost:3002/login`
2. Enter username/email and password
3. Should redirect to Dashboard on success

### Test Protected Routes
1. Try accessing `http://localhost:3002/dashboard` without logging in
2. Should redirect to `/login`
3. After login, should show Dashboard

### Test Logout
1. Click "Logout" in navigation
2. Should redirect to home page
3. Try accessing Dashboard - should redirect to login

---

## Common Issues & Solutions

### Issue: "Module not found" errors
**Solution**: Make sure all dependencies are installed
```powershell
# Backend
cd bd
pip install -r requirements.txt

# Frontend  
cd fd
npm install
```

### Issue: Database connection errors
**Solution**: Check your Supabase connection string in `.env`
```env
DATABASE_URL=postgresql://user:password@host:port/database
```

### Issue: CORS errors in browser
**Solution**: Make sure backend is running on port 8000 and CORS is configured in `main.py`

### Issue: "401 Unauthorized" on protected routes
**Solution**: 
1. Check if token is in localStorage: Open DevTools → Application → Local Storage → Check `auth_token`
2. Token might be expired (7 days) - log in again
3. Backend might not be running

### Issue: Login/Signup not working
**Solution**:
1. Check browser console for errors
2. Check backend terminal for errors
3. Verify API base URL in `fd/.env`:
   ```env
   VITE_API_BASE_URL=http://localhost:8000/api
   ```

---

## API Testing with cURL

### Register User
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "username": "johndoe",
    "password": "securepass123",
    "full_name": "John Doe"
  }'
```

### Login
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username_or_email": "johndoe",
    "password": "securepass123"
  }'
```

### Get Current User (with token)
```bash
curl -X GET http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Create Subscription (protected)
```bash
curl -X POST http://localhost:8000/api/subscriptions \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Netflix",
    "amount": 199,
    "billing_cycle": "monthly",
    "renewal_date": "2025-12-22"
  }'
```

---

## Verification Checklist

Before considering the auth system complete, test these:

- [ ] ✅ Backend running on http://localhost:8000
- [ ] ✅ Frontend running on http://localhost:3002
- [ ] ✅ Can register new user via UI
- [ ] ✅ Can login with username
- [ ] ✅ Can login with email  
- [ ] ✅ Dashboard redirects to login when not authenticated
- [ ] ✅ After login, can access all pages
- [ ] ✅ Navbar shows username when logged in
- [ ] ✅ Logout button works
- [ ] ✅ Toast notifications appear for auth actions
- [ ] ✅ Mobile menu shows auth buttons correctly
- [ ] ✅ Page refresh maintains login session
- [ ] ✅ UPI analyzer creates user-specific transactions
- [ ] ✅ Subscriptions are user-specific
- [ ] ✅ Bank analyses are user-specific
- [ ] ✅ Cannot access other users' data

---

## Next Steps

### For Development
1. Create test users for different scenarios
2. Test all features with authentication
3. Verify data isolation between users
4. Test mobile responsiveness

### For Production
1. **CRITICAL**: Change JWT secret key in `bd/app/utils/auth.py`
   ```python
   SECRET_KEY = os.getenv("JWT_SECRET_KEY")  # Use environment variable
   ```

2. Update CORS settings in `bd/app/main.py`
   ```python
   allow_origins=["https://your-production-domain.com"]
   ```

3. Set up HTTPS for secure token transmission

4. Configure database backups

5. Set up monitoring and logging

---

## Quick Reference

### Frontend Auth Hook
```typescript
import { useAuth } from '../hooks/useAuth';

const { user, isAuthenticated, isLoading, login, register, logout } = useAuth();

// Check if logged in
if (isAuthenticated) {
  console.log(`Hello ${user.username}`);
}

// Login
await login({ username_or_email: 'john', password: 'pass' });

// Logout
await logout();
```

### Backend Auth Dependency
```python
from app.routers.auth import get_current_user
from app.models import User

@router.get("/protected")
async def protected_route(
    current_user: User = Depends(get_current_user)
):
    return {"user_id": current_user.id}
```

---

## Support

If you encounter issues:
1. Check browser DevTools console
2. Check backend terminal output
3. Review `AUTHENTICATION_IMPLEMENTATION.md` for detailed docs
4. Verify all files were created/modified correctly

---

**Authentication system is ready! 🎉**

Start both servers and visit http://localhost:3002 to begin!
