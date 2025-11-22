# 🚀 Quick Deployment Reference

## Backend (Render) Environment Variables

Add these in Render Dashboard → Your Web Service → Environment:

```bash
database_url=postgresql://YOUR_DB_USER:YOUR_DB_PASSWORD@YOUR_DB_HOST/YOUR_DB_NAME

GEMINI_API_KEY=your_gemini_api_key_here

PYTHON_VERSION=3.12.0
```

### Render Web Service Configuration:
- **Root Directory**: `bd`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- **Runtime**: Python 3

---

## Frontend (Vercel) Environment Variables

Add this in Vercel Dashboard → Your Project → Settings → Environment Variables:

```bash
VITE_API_BASE_URL=https://YOUR-BACKEND-NAME.onrender.com/api
```

**Replace `YOUR-BACKEND-NAME` with your actual Render backend URL!**

Example:
```bash
VITE_API_BASE_URL=https://arthos-backend.onrender.com/api
```

### Vercel Project Configuration:
- **Framework Preset**: Vite
- **Root Directory**: `fd`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

---

## Quick Deployment Steps

### 1️⃣ Deploy Backend First (Render):
1. Go to https://dashboard.render.com
2. New + → Web Service
3. Connect GitHub repo: `Savyasachi-2005/Arthos`
4. Configure as shown above
5. Add environment variables
6. Click "Create Web Service"
7. **Copy your backend URL** (e.g., `https://arthos-backend.onrender.com`)

### 2️⃣ Deploy Frontend (Vercel):
1. Go to https://vercel.com/new
2. Import Git Repository → Select `Savyasachi-2005/Arthos`
3. Configure as shown above
4. Add environment variable with YOUR backend URL
5. Click "Deploy"

---

## ⚠️ Important Notes

- **Use INTERNAL database URL** (the one without `.oregon-postgres.render.com`)
- **Backend URL must end with `/api`** in frontend environment variable
- **Deploy backend FIRST**, then use its URL in frontend
- **Redeploy frontend** if you change the backend URL
- Free tier Render services sleep after 15 minutes - first request takes 30s to wake

---

## 🧪 Test After Deployment

1. Backend health: `https://your-backend.onrender.com/health`
2. API docs: `https://your-backend.onrender.com/docs`
3. Frontend: Open your Vercel URL and try:
   - Register new account
   - Login
   - Analyze UPI messages
   - View dashboard

---

## 🐛 Common Issues

**CORS Error**: Update backend CORS to include your Vercel URL
**API Not Found**: Check `VITE_API_BASE_URL` has `/api` at the end
**Database Error**: Verify `database_url` is the INTERNAL URL
**Slow First Load**: Normal for Render free tier (30s wake time)

---

For detailed instructions, see `DEPLOYMENT_GUIDE.md`
