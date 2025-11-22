# 🚀 Deployment Guide - Arthos

Complete guide for deploying Arthos frontend to Vercel and backend to Render.

---

## 📋 Prerequisites

- GitHub account with your Arthos repository
- Vercel account (sign up at https://vercel.com)
- Render account (sign up at https://render.com)
- Render PostgreSQL database already set up

---

## 🖥️ Backend Deployment (Render)

### Step 1: Prepare Backend for Deployment

The backend is already configured for Render deployment with:
- ✅ `requirements.txt` with all dependencies
- ✅ Database configuration with environment variable support
- ✅ CORS middleware configured
- ✅ Health check endpoint

### Step 2: Deploy to Render

1. **Go to Render Dashboard**: https://dashboard.render.com

2. **Create New Web Service**:
   - Click "New +" → "Web Service"
   - Connect your GitHub repository: `Savyasachi-2005/Arthos`
   - Grant Render access to the repository

3. **Configure Web Service**:
   ```
   Name: arthos-backend (or your preferred name)
   Region: Oregon (USA) - Same as your database
   Branch: main
   Root Directory: bd
   Runtime: Python 3
   Build Command: pip install -r requirements.txt
   Start Command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
   Instance Type: Free (or paid for better performance)
   ```

4. **Add Environment Variables** (Critical - Add these in Render dashboard):
   
   Click "Environment" → "Add Environment Variable":
   
   ```bash
   # Database URL (INTERNAL URL - faster, no external network charges)
   database_url=postgresql://arthos_user:4T3q0o6rvyQEr7usmc8JgePEgiFh5MrM@dpg-d4gl2aqli9vc73dmcngg-a/arthos
   
   # Gemini API Key for AI features
   GEMINI_API_KEY=AIzaSyC7UAP5ipL9GpUK6BHjEd9KAgir2G_-grQ
   
   # Python environment
   PYTHON_VERSION=3.12.0
   ```

5. **Deploy**:
   - Click "Create Web Service"
   - Render will automatically build and deploy
   - Wait for deployment to complete (5-10 minutes)
   - Your backend URL will be: `https://arthos-backend.onrender.com` (or your chosen name)

### Step 3: Verify Backend Deployment

Once deployed, test these endpoints:
- Health Check: `https://your-backend-url.onrender.com/health`
- API Docs: `https://your-backend-url.onrender.com/docs`
- Root: `https://your-backend-url.onrender.com/`

---

## 🌐 Frontend Deployment (Vercel)

### Step 1: Update Frontend Environment Variable

**IMPORTANT**: Before deploying, you need to update the API URL to point to your Render backend.

Update `fd/.env`:
```bash
VITE_API_BASE_URL=https://your-backend-url.onrender.com/api
```

Replace `your-backend-url` with your actual Render backend URL (e.g., `arthos-backend.onrender.com`).

**Commit this change**:
```bash
git add fd/.env
git commit -m "Update API URL for production"
git push
```

### Step 2: Deploy to Vercel

#### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Go to Vercel**: https://vercel.com/new

2. **Import Project**:
   - Click "Add New..." → "Project"
   - Select "Import Git Repository"
   - Connect your GitHub account
   - Select repository: `Savyasachi-2005/Arthos`

3. **Configure Project**:
   ```
   Project Name: arthos (or your preferred name)
   Framework Preset: Vite
   Root Directory: fd
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   Node Version: 18.x
   ```

4. **Add Environment Variables**:
   
   In "Environment Variables" section, add:
   
   ```bash
   # Backend API URL (use your actual Render backend URL)
   VITE_API_BASE_URL=https://your-backend-url.onrender.com/api
   ```
   
   Example:
   ```bash
   VITE_API_BASE_URL=https://arthos-backend.onrender.com/api
   ```

5. **Deploy**:
   - Click "Deploy"
   - Vercel will build and deploy automatically (2-3 minutes)
   - Your frontend URL will be: `https://arthos.vercel.app` (or custom domain)

#### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to frontend directory
cd fd

# Login to Vercel
vercel login

# Deploy
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? arthos
# - Directory? ./
# - Override settings? No

# Deploy to production
vercel --prod
```

### Step 3: Update Backend CORS Settings

After deploying frontend, update backend CORS to allow your Vercel domain.

**In Render Dashboard** → Your Backend Service → Environment:

Add environment variable:
```bash
ALLOWED_ORIGINS=https://your-frontend.vercel.app,https://www.your-frontend.vercel.app
```

Or update `bd/app/main.py` to include your Vercel URL:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Local development
        "https://your-frontend.vercel.app",  # Production
        "https://*.vercel.app"  # All Vercel preview deployments
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 🔐 Environment Variables Summary

### Backend (Render) Environment Variables:
```bash
database_url=postgresql://arthos_user:4T3q0o6rvyQEr7usmc8JgePEgiFh5MrM@dpg-d4gl2aqli9vc73dmcngg-a/arthos
GEMINI_API_KEY=AIzaSyC7UAP5ipL9GpUK6BHjEd9KAgir2G_-grQ
PYTHON_VERSION=3.12.0
```

### Frontend (Vercel) Environment Variables:
```bash
VITE_API_BASE_URL=https://your-backend-url.onrender.com/api
```

**Example with actual URL**:
```bash
VITE_API_BASE_URL=https://arthos-backend.onrender.com/api
```

---

## ✅ Post-Deployment Checklist

### Backend (Render):
- [ ] Service is running (green status)
- [ ] Health endpoint responds: `/health`
- [ ] API docs accessible: `/docs`
- [ ] Database connection working (check logs)
- [ ] Environment variables set correctly
- [ ] No build errors in logs

### Frontend (Vercel):
- [ ] Deployment successful
- [ ] Website loads correctly
- [ ] Can access all pages (Home, Login, Signup, Dashboard)
- [ ] API calls work (try login/signup)
- [ ] No console errors
- [ ] Environment variable set correctly

### Integration Testing:
- [ ] User registration works
- [ ] User login works
- [ ] Dashboard loads transaction data
- [ ] UPI analyzer parses messages
- [ ] Bank analyzer processes statements
- [ ] Subscriptions feature works

---

## 🐛 Troubleshooting

### Backend Issues:

**Database Connection Failed**:
- Verify `database_url` environment variable is correct
- Use INTERNAL database URL (starts with `dpg-...`)
- Check database is in same region as web service
- Verify database credentials

**API Not Responding**:
- Check Render logs: Dashboard → Your Service → Logs
- Verify start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Check if service is running (not sleeping on free tier)
- Free tier sleeps after inactivity - first request takes 30s to wake

**CORS Errors**:
- Update CORS origins to include Vercel URL
- Redeploy backend after CORS changes

### Frontend Issues:

**API Calls Failing**:
- Verify `VITE_API_BASE_URL` is set correctly
- Must include `/api` at the end
- Check backend URL is accessible
- Redeploy frontend after environment variable changes

**404 on Refresh**:
- Vercel should handle SPA routing automatically with `vercel.json`
- Check `vercel.json` exists in root directory

**Build Failures**:
- Check build logs in Vercel dashboard
- Verify all dependencies in `package.json`
- Try building locally: `cd fd && npm run build`

---

## 🔄 Continuous Deployment

Both Render and Vercel automatically redeploy when you push to GitHub:

1. **Make changes locally**
2. **Commit and push**:
   ```bash
   git add .
   git commit -m "Your changes"
   git push origin main
   ```
3. **Automatic deployment**:
   - Render: Rebuilds backend automatically
   - Vercel: Rebuilds frontend automatically

---

## 💰 Free Tier Limitations

### Render Free Tier:
- ⚠️ Service sleeps after 15 minutes of inactivity
- First request after sleep takes ~30 seconds
- 750 hours/month free
- Limited CPU and RAM

**Solution**: Upgrade to paid tier ($7/month) for always-on service

### Vercel Free Tier:
- 100GB bandwidth/month
- Unlimited deployments
- Serverless function executions limited

---

## 🔗 Useful Links

- **Render Dashboard**: https://dashboard.render.com
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs

---

## 📞 Support

If you encounter issues:
1. Check deployment logs (Render/Vercel dashboards)
2. Verify all environment variables
3. Test backend health endpoint
4. Check browser console for frontend errors
5. Review CORS configuration

---

## 🎉 Success!

Once deployed, your application will be live at:
- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://your-backend.onrender.com`
- **API Docs**: `https://your-backend.onrender.com/docs`

Share your live application and enjoy! 🚀
