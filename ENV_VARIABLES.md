# 📝 Environment Variables Configuration

## 🖥️ Backend (Render) Environment Variables

Set these in **Render Dashboard** → **Your Web Service** → **Environment**:

### Required Variables:

#### 1. Database URL
```bash
database_url=postgresql://YOUR_DB_USER:YOUR_DB_PASSWORD@YOUR_DB_HOST/YOUR_DB_NAME
```
- **Description**: PostgreSQL database connection string (INTERNAL URL)
- **Note**: Use your Render database internal URL for better performance
- **Get it from**: Render Dashboard → Your Database → Internal Database URL
- **Alternative**: If internal URL doesn't work, use external URL from Render dashboard

#### 2. Gemini API Key
```bash
GEMINI_API_KEY=your_gemini_api_key_here
```
- **Description**: Google Gemini AI API key for bank statement analysis
- **Get your key**: https://makersuite.google.com/app/apikey

#### 3. Python Version
```bash
PYTHON_VERSION=3.12.0
```
- **Description**: Python runtime version for Render
- **Optional**: Render will use default if not specified

### Optional Variables:

#### 4. Allowed CORS Origins
```bash
ALLOWED_ORIGINS=https://your-app.vercel.app,https://www.your-app.vercel.app
```
- **Description**: Comma-separated list of allowed frontend origins
- **Example**: `https://arthos.vercel.app,https://www.arthos.vercel.app`
- **Note**: If not set, backend allows all origins (development mode)
- **Add this AFTER deploying frontend** to get the Vercel URL

---

## 🌐 Frontend (Vercel) Environment Variables

Set these in **Vercel Dashboard** → **Your Project** → **Settings** → **Environment Variables**:

### Required Variables:

#### 1. Backend API URL
```bash
VITE_API_BASE_URL=https://YOUR-BACKEND-NAME.onrender.com/api
```

**Important Notes**:
- Replace `YOUR-BACKEND-NAME` with your actual Render backend service name
- **Must include `/api` at the end**
- Get this URL from Render after deploying backend

**Examples**:
```bash
# If your Render service is named "arthos-backend"
VITE_API_BASE_URL=https://arthos-backend.onrender.com/api

# If your Render service is named "arthos-api"
VITE_API_BASE_URL=https://arthos-api.onrender.com/api
```

---

## 🔄 Complete Setup Flow

### Step 1: Deploy Backend to Render
1. Create web service on Render
2. Add these 3 environment variables:
   - `database_url`
   - `GEMINI_API_KEY`
   - `PYTHON_VERSION`
3. Deploy and wait for completion
4. **Copy your backend URL** (e.g., `https://arthos-backend.onrender.com`)

### Step 2: Deploy Frontend to Vercel
1. Create project on Vercel
2. Add 1 environment variable:
   - `VITE_API_BASE_URL` (using your backend URL from Step 1)
3. Deploy and wait for completion
4. **Copy your frontend URL** (e.g., `https://arthos.vercel.app`)

### Step 3: Update Backend CORS (Optional but Recommended)
1. Go back to Render dashboard
2. Add environment variable:
   - `ALLOWED_ORIGINS` (using your frontend URL from Step 2)
3. Redeploy backend (Render does this automatically)

---

## 📋 Environment Variables Checklist

### Backend Checklist (Render):
- [ ] `database_url` - PostgreSQL connection string
- [ ] `GEMINI_API_KEY` - AI API key
- [ ] `PYTHON_VERSION` - Python version (3.12.0)
- [ ] `ALLOWED_ORIGINS` - Your Vercel URL (optional, add after frontend deployment)

### Frontend Checklist (Vercel):
- [ ] `VITE_API_BASE_URL` - Your Render backend URL with `/api` suffix

---

## 🔐 Security Notes

1. **Never commit `.env` files** to Git
   - Already added to `.gitignore`
   - Use `.env.example` for reference

2. **API Keys**:
   - Keep `GEMINI_API_KEY` secret
   - Don't expose in frontend code
   - Only set in backend environment

3. **Database URL**:
   - Use internal URL for better security and performance
   - Never expose database credentials publicly

4. **CORS**:
   - Restrict origins in production
   - Add `ALLOWED_ORIGINS` with your specific domains
   - Don't use `*` in production

---

## 🐛 Troubleshooting

### Backend Issues:

**"Database connection failed"**
- ✅ Check `database_url` is correct
- ✅ Try external URL if internal doesn't work
- ✅ Verify database is running (Render dashboard)

**"Gemini API error"**
- ✅ Verify `GEMINI_API_KEY` is set
- ✅ Check API key is valid at https://makersuite.google.com
- ✅ Ensure key has proper permissions

### Frontend Issues:

**"Network Error" or "Failed to fetch"**
- ✅ Verify `VITE_API_BASE_URL` is set correctly
- ✅ Ensure URL ends with `/api`
- ✅ Check backend is deployed and running
- ✅ Test backend health endpoint directly

**"CORS Error"**
- ✅ Add frontend URL to backend `ALLOWED_ORIGINS`
- ✅ Redeploy backend after adding CORS origins
- ✅ Clear browser cache

**Environment variable not working**
- ✅ Ensure variable name starts with `VITE_` for frontend
- ✅ Redeploy after adding/changing variables
- ✅ Check variable is set for the correct environment (Production/Preview/Development)

---

## 📞 Getting Environment Variable Values

### Your Render Database URL:
- Go to Render Dashboard → Your Database
- Copy the "Internal Database URL" (recommended for better performance)
- Or use "External Database URL" if internal doesn't work

### Your Gemini API Key:
- Get it from: https://makersuite.google.com/app/apikey
- Sign in with your Google account
- Create a new API key or use existing one

### To Get Your Backend URL:
1. Deploy backend to Render
2. Go to Render dashboard → Your service
3. Copy the URL at the top (e.g., `https://arthos-backend.onrender.com`)
4. Add `/api` to the end for frontend env variable

### To Get Your Frontend URL:
1. Deploy frontend to Vercel
2. Go to Vercel dashboard → Your project
3. Copy the URL from "Domains" section (e.g., `https://arthos.vercel.app`)

---

## 🎯 Quick Copy-Paste

### For Render (Backend):
```bash
database_url=YOUR_RENDER_DATABASE_URL_HERE
GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
PYTHON_VERSION=3.12.0
```

### For Vercel (Frontend):
```bash
VITE_API_BASE_URL=https://YOUR-BACKEND-NAME.onrender.com/api
```

**Remember to replace `YOUR-BACKEND-NAME` with your actual Render service name!**

---

Need help? Check `DEPLOYMENT_GUIDE.md` for detailed deployment instructions.
