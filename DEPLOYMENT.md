# 🚀 Deployment Guide - GRAMA INVEST

Complete guide for deploying the GRAMA INVEST platform to production.

## 📋 Table of Contents

- [Pre-deployment Checklist](#pre-deployment-checklist)
- [Environment Setup](#environment-setup)
- [Database Setup](#database-setup)
- [Deployment Options](#deployment-options)
- [Post-deployment Steps](#post-deployment-steps)
- [Monitoring & Maintenance](#monitoring--maintenance)

## ✅ Pre-deployment Checklist

Before deploying, ensure you have:

- [ ] All environment variables configured
- [ ] MongoDB database ready (local or Atlas)
- [ ] API keys for Groq AI and Hume AI
- [ ] Domain name (optional but recommended)
- [ ] SSL certificate (usually provided by hosting platform)
- [ ] Git repository accessible
- [ ] All dependencies tested locally

## 🔧 Environment Setup

### Production Environment Variables

Create production-ready environment variables:

**Backend (.env.production)**
```env
NODE_ENV=production
PORT=3000

# Database - Use MongoDB Atlas for production
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/grama_invest?retryWrites=true&w=majority

# Strong JWT Secret (generate with: openssl rand -base64 32)
JWT_SECRET=your_production_jwt_secret_key_at_least_32_characters

# Redis Cloud (optional but recommended for production)
REDIS_HOST=your-redis-host.redis.cloud
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

# API Keys
GROQ_API_KEY=your_groq_api_key
HUME_API_KEY=your_hume_api_key
HUME_SECRET_KEY=your_hume_secret_key
HUME_CONFIG_ID=your_hume_config_id

# CORS - Set to your frontend URL
FRONTEND_URL=https://your-frontend-domain.com
```

**Frontend (.env.production)**
```env
VITE_API_URL=https://your-backend-domain.com
VITE_SOCKET_URL=https://your-backend-domain.com
```

## 🗄️ Database Setup

### MongoDB Atlas (Recommended for Production)

1. **Create Atlas Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up for free tier

2. **Create Cluster**
   ```
   - Click "Build a Cluster"
   - Choose Free Tier (M0)
   - Select region closest to your hosting
   - Click "Create Cluster"
   ```

3. **Configure Network Access**
   ```
   - Go to Network Access
   - Click "Add IP Address"
   - Allow access from anywhere (0.0.0.0/0) for cloud deployments
   ```

4. **Create Database User**
   ```
   - Go to Database Access
   - Add New Database User
   - Username: admin
   - Password: Generate secure password
   - Database User Privileges: Atlas Admin
   ```

5. **Get Connection String**
   ```
   - Click "Connect"
   - Choose "Connect your application"
   - Copy connection string
   - Replace <password> with your password
   ```

### Redis Setup (Optional but Recommended)

**Redis Cloud (Free Tier)**
1. Go to [Redis Cloud](https://redis.com/try-free/)
2. Create free database
3. Copy host, port, and password
4. Add to environment variables

## 🌐 Deployment Options

### Option 1: Vercel (Frontend) + Render (Backend)

#### Deploy Backend to Render

1. **Create Render Account**
   - Go to [Render](https://render.com/)
   - Sign up with GitHub

2. **Create New Web Service**
   ```
   - Click "New +" → "Web Service"
   - Connect GitHub repository
   - Select Mini-Project repository
   - Configure:
     - Name: grama-invest-backend
     - Region: Choose nearest
     - Branch: main (or eco-system)
     - Root Directory: backend
     - Environment: Node
     - Build Command: npm install
     - Start Command: npm start
   ```

3. **Add Environment Variables**
   ```
   Go to Environment tab and add all backend env variables
   ```

4. **Deploy**
   ```
   Click "Create Web Service"
   Wait for deployment (5-10 minutes)
   Note your backend URL: https://grama-invest-backend.onrender.com
   ```

#### Deploy Frontend to Vercel

1. **Install Vercel CLI** (optional)
   ```bash
   npm install -g vercel
   ```

2. **Deploy via Vercel Dashboard**
   ```
   - Go to [Vercel](https://vercel.com/)
   - Click "Import Project"
   - Select GitHub repository
   - Configure:
     - Framework Preset: Vite
     - Root Directory: frontend
     - Build Command: npm run build
     - Output Directory: dist
   ```

3. **Add Environment Variables**
   ```
   VITE_API_URL=https://grama-invest-backend.onrender.com
   VITE_SOCKET_URL=https://grama-invest-backend.onrender.com
   ```

4. **Deploy**
   ```
   Click "Deploy"
   Your frontend URL: https://your-project.vercel.app
   ```

5. **Update Backend CORS**
   ```
   Update FRONTEND_URL in Render environment variables
   FRONTEND_URL=https://your-project.vercel.app
   ```

### Option 2: Railway (Full Stack)

1. **Create Railway Account**
   - Go to [Railway](https://railway.app/)
   - Sign in with GitHub

2. **Deploy Backend**
   ```
   - New Project → Deploy from GitHub repo
   - Select repository
   - Add service → Backend
   - Root directory: backend
   - Add all environment variables
   - Deploy
   ```

3. **Deploy Frontend**
   ```
   - Add service → Frontend
   - Root directory: frontend
   - Add environment variables
   - Deploy
   ```

4. **Add MongoDB**
   ```
   - Add service → Database → MongoDB
   - Copy connection string to backend env
   ```

### Option 3: Heroku

1. **Install Heroku CLI**
   ```bash
   npm install -g heroku
   heroku login
   ```

2. **Deploy Backend**
   ```bash
   cd backend
   heroku create grama-invest-backend
   
   # Add MongoDB
   heroku addons:create mongolab:sandbox
   
   # Set environment variables
   heroku config:set JWT_SECRET=your_secret
   heroku config:set GROQ_API_KEY=your_key
   
   # Deploy
   git push heroku main
   ```

3. **Deploy Frontend**
   ```bash
   cd frontend
   heroku create grama-invest-frontend
   heroku buildpacks:set heroku/nodejs
   
   # Set env variables
   heroku config:set VITE_API_URL=https://grama-invest-backend.herokuapp.com
   
   # Deploy
   git push heroku main
   ```

### Option 4: DigitalOcean App Platform

1. **Create DigitalOcean Account**
   - Go to [DigitalOcean](https://www.digitalocean.com/)

2. **Create App**
   ```
   - Click "Create" → "Apps"
   - Connect GitHub repository
   - Select branch
   ```

3. **Configure Backend Component**
   ```
   - Type: Web Service
   - Source Directory: backend
   - Environment: Node.js
   - Build Command: npm install
   - Run Command: npm start
   - Add environment variables
   ```

4. **Configure Frontend Component**
   ```
   - Type: Static Site
   - Source Directory: frontend
   - Build Command: npm run build
   - Output Directory: dist
   - Add environment variables
   ```

5. **Add Database**
   ```
   - Add MongoDB database component
   - Copy connection string
   ```

### Option 5: AWS (Advanced)

#### Backend on EC2 or Elastic Beanstalk

1. **Create EC2 Instance**
   ```bash
   # SSH into instance
   ssh -i your-key.pem ubuntu@your-instance-ip
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Clone repository
   git clone https://github.com/Tanishk0109/Mini-Project.git
   cd Mini-Project/backend
   
   # Install dependencies
   npm install
   
   # Install PM2
   sudo npm install -g pm2
   
   # Create .env file
   nano .env
   # Add all environment variables
   
   # Start with PM2
   pm2 start server.js --name grama-invest
   pm2 save
   pm2 startup
   ```

2. **Configure Nginx**
   ```bash
   sudo apt-get install nginx
   sudo nano /etc/nginx/sites-available/grama-invest
   ```
   
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
   
   ```bash
   sudo ln -s /etc/nginx/sites-available/grama-invest /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

#### Frontend on S3 + CloudFront

1. **Build Frontend**
   ```bash
   cd frontend
   npm run build
   ```

2. **Create S3 Bucket**
   ```bash
   aws s3 mb s3://grama-invest-frontend
   aws s3 sync dist/ s3://grama-invest-frontend
   ```

3. **Configure CloudFront**
   - Create distribution
   - Origin: S3 bucket
   - Enable HTTPS
   - Add custom domain

## 🔒 Security Best Practices

1. **Use HTTPS**
   - Enable SSL/TLS on all hosting platforms
   - Most platforms provide free SSL certificates

2. **Environment Variables**
   - Never commit .env files
   - Use platform environment variable features
   - Rotate secrets regularly

3. **Database Security**
   - Use strong passwords
   - Enable IP whitelisting
   - Regular backups

4. **API Keys**
   - Restrict API key domains/IPs where possible
   - Monitor usage
   - Set up rate limiting

## 🔍 Post-deployment Steps

1. **Test All Features**
   ```bash
   # Test backend health
   curl https://your-backend-url/health
   
   # Test frontend
   Open browser to https://your-frontend-url
   ```

2. **Monitor Logs**
   - Check application logs for errors
   - Set up error tracking (Sentry, LogRocket)

3. **Set Up Analytics**
   - Google Analytics
   - Mixpanel
   - PostHog

4. **Configure Domain (Optional)**
   - Purchase domain from Namecheap, GoDaddy, etc.
   - Point DNS to hosting platform
   - Update environment variables

5. **Enable Monitoring**
   - Uptime monitoring (UptimeRobot, Pingdom)
   - Performance monitoring (New Relic, Datadog)
   - Error tracking (Sentry)

## 📊 Monitoring & Maintenance

### Health Checks

Add a health check endpoint in `backend/app.js`:

```javascript
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});
```

### Logs

```bash
# View logs on Render
render logs -s service-name

# View logs on Heroku
heroku logs --tail -a app-name

# View PM2 logs
pm2 logs grama-invest
```

### Backups

**MongoDB Backups**
```bash
# Manual backup
mongodump --uri="mongodb+srv://..." --out=./backup

# Restore
mongorestore --uri="mongodb+srv://..." ./backup
```

**Automated Backups**
- MongoDB Atlas: Enable automated backups in settings
- Use cron jobs for regular backups

### Performance Optimization

1. **Enable Compression**
   ```javascript
   import compression from 'compression';
   app.use(compression());
   ```

2. **Cache Static Assets**
   ```javascript
   app.use(express.static('public', {
     maxAge: '1d',
     etag: false
   }));
   ```

3. **Database Indexing**
   ```javascript
   // Add indexes to frequently queried fields
   userSchema.index({ email: 1 });
   studyroomSchema.index({ createdAt: -1 });
   ```

## 🆘 Troubleshooting

### Common Issues

**Issue: CORS Errors**
```javascript
// Ensure CORS is properly configured
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
```

**Issue: WebSocket Connection Fails**
```javascript
// Configure Socket.IO for production
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"]
  },
  transports: ['websocket', 'polling']
});
```

**Issue: Environment Variables Not Loading**
```bash
# Verify .env is loaded
console.log('Env loaded:', process.env.NODE_ENV);

# Check if dotenv is required
import 'dotenv/config';
```

## 📞 Support

If you encounter issues:
1. Check logs first
2. Review documentation
3. Search existing GitHub issues
4. Create new issue with detailed information

---

**Deployment Checklist**
- ✅ MongoDB Atlas configured
- ✅ Environment variables set
- ✅ Backend deployed and healthy
- ✅ Frontend deployed and accessible
- ✅ CORS configured correctly
- ✅ WebSocket connections working
- ✅ File uploads working
- ✅ All features tested
- ✅ Monitoring enabled
- ✅ Backups configured

Happy Deploying! 🚀
