# Setup Guide

This guide will walk you through setting up the Video Upload, Processing, and Streaming Application on your local machine.

## 📋 Prerequisites Checklist

Before you begin, ensure you have the following installed:

- [ ] Node.js (v18 or higher) - [Download](https://nodejs.org/)
- [ ] MongoDB (v4.4 or higher) - [Download](https://www.mongodb.com/try/download/community)
- [ ] FFmpeg - [Download](https://ffmpeg.org/download.html)
- [ ] Git - [Download](https://git-scm.com/)
- [ ] Code editor (VS Code recommended)

---

## 🚀 Quick Start

### 1. Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd video-streaming-app

# Install all dependencies
npm run install-all
```

### 2. Environment Setup

```bash
# Copy environment template
cd backend
cp .env.example .env

# Edit the .env file with your configuration
nano .env  # or use your preferred editor
```

### 3. Start Services

```bash
# Start MongoDB (if not running as service)
mongod

# Start the application
cd ..
npm run dev
```

Visit http://localhost:3000 to access the application.

---

## 🔧 Detailed Setup Instructions

### Step 1: Install Node.js

#### Windows
1. Download Node.js from [nodejs.org](https://nodejs.org/)
2. Run the installer (LTS version recommended)
3. Verify installation:
```bash
node --version
npm --version
```

#### macOS
```bash
# Using Homebrew
brew install node

# Or download from nodejs.org
```

#### Linux (Ubuntu/Debian)
```bash
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Step 2: Install MongoDB

#### Windows
1. Download MongoDB Community Server from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Run the installer
3. Configure MongoDB as a Windows service (optional)

#### macOS
```bash
# Using Homebrew
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

#### Linux (Ubuntu/Debian)
```bash
# Import MongoDB public key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Install MongoDB
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

#### Using Docker (Alternative)
```bash
# Pull and run MongoDB container
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Or with data persistence
docker run -d -p 27017:27017 -v mongodb_data:/data/db --name mongodb mongo:latest
```

### Step 3: Install FFmpeg

#### Windows
1. Download FFmpeg from [ffmpeg.org](https://ffmpeg.org/download.html)
2. Extract to a folder (e.g., `C:\ffmpeg`)
3. Add the `bin` folder to your PATH environment variable
4. Verify installation:
```bash
ffmpeg -version
```

#### macOS
```bash
# Using Homebrew
brew install ffmpeg
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install ffmpeg
```

### Step 4: Configure Environment

Create `backend/.env` file:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/video-streaming-app

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# Server Configuration
PORT=5000
NODE_ENV=development

# File Upload Configuration
MAX_FILE_SIZE=104857600
UPLOAD_PATH=./uploads

# CORS Configuration
FRONTEND_URL=http://localhost:3000
```

**Important Security Notes:**
- Change `JWT_SECRET` to a strong, unique string
- In production, use environment-specific values
- Ensure `MONGODB_URI` points to your MongoDB instance

### Step 5: Install Dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Return to root directory
cd ..
```

Or use the shortcut:
```bash
npm run install-all
```

### Step 6: Start the Application

#### Development Mode
```bash
# Start both backend and frontend
npm run dev
```

This will start:
- Backend server on http://localhost:5000
- Frontend development server on http://localhost:3000

#### Individual Services
```bash
# Start backend only
npm run server

# Start frontend only (in separate terminal)
npm run client
```

#### Production Mode
```bash
# Build frontend for production
npm run build

# Start backend in production mode
npm start
```

---

## 🧪 Verify Installation

### 1. Check Backend Health
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2023-09-06T12:34:56.789Z"
}
```

### 2. Test Frontend
- Open http://localhost:3000 in your browser
- You should see the login page

### 3. Create Test Account
1. Navigate to http://localhost:3000/register
2. Create an account with:
   - Name: Test User
   - Email: test@example.com
   - Password: password123
   - Role: Editor

### 4. Test Video Upload
1. Login with your test account
2. Navigate to Upload page
3. Upload a small video file (under 100MB)
4. Monitor the processing progress

---

## 🔍 Troubleshooting

### Common Issues and Solutions

#### Port Already in Use
```bash
# Find process using port 5000
lsof -i :5000  # macOS/Linux
netstat -ano | findstr :5000  # Windows

# Kill the process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows
```

#### MongoDB Connection Failed
```bash
# Check if MongoDB is running
sudo systemctl status mongod  # Linux
brew services list | grep mongodb  # macOS

# Start MongoDB
sudo systemctl start mongod  # Linux
brew services start mongodb-community  # macOS
```

#### FFmpeg Not Found
```bash
# Check FFmpeg installation
ffmpeg -version

# If not found, reinstall FFmpeg
# or add to PATH manually
export PATH=$PATH:/path/to/ffmpeg/bin
```

#### Permission Errors
```bash
# Fix file permissions for uploads directory
chmod -R 755 backend/uploads
```

#### Node Modules Issues
```bash
# Clear npm cache
npm cache clean --force

# Remove and reinstall node_modules
rm -rf node_modules package-lock.json
npm install
```

### Development Tips

#### Hot Reload Issues
- If frontend doesn't auto-refresh, try clearing browser cache
- Restart the development server if needed

#### Database Issues
- Use MongoDB Compass to inspect the database
- Check connection string in .env file
- Ensure MongoDB service is running

#### Video Processing Issues
- Verify FFmpeg is installed and accessible
- Check uploads directory permissions
- Monitor backend console for processing errors

---

## 📁 Project Structure Overview

```
video-streaming-app/
├── backend/                 # Node.js backend
│   ├── config/             # Database configuration
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Express middleware
│   ├── models/            # Mongoose models
│   ├── routes/            # API routes
│   ├── services/          # Business logic
│   ├── uploads/           # File storage
│   └── server.js          # Server entry point
├── frontend/              # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── context/       # React context
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   └── App.jsx       # Main app component
│   └── public/           # Static assets
├── package.json           # Root package configuration
└── README.md             # Project documentation
```

---

## 🚀 Next Steps

After successful setup:

1. **Explore Features**
   - Test user registration and login
   - Upload and process videos
   - Explore the video library
   - Test real-time updates

2. **Review Code**
   - Examine the API structure
   - Review React components
   - Understand the database schema

3. **Customize**
   - Modify the UI theme
   - Add new features
   - Configure upload limits
   - Customize processing pipeline

4. **Deploy**
   - Set up production environment
   - Configure reverse proxy
   - Enable HTTPS
   - Set up monitoring

---

## 📞 Getting Help

If you encounter issues:

1. Check the [troubleshooting section](#-troubleshooting)
2. Review the [API documentation](./API_DOCUMENTATION.md)
3. Check the main [README.md](./README.md)
4. Create an issue on the project repository

---

## 🎯 Success Checklist

- [ ] Node.js installed and verified
- [ ] MongoDB running and accessible
- [ ] FFmpeg installed and working
- [ ] Application dependencies installed
- [ ] Environment variables configured
- [ ] Backend server starts successfully
- [ ] Frontend loads in browser
- [ ] User registration works
- [ ] Video upload functions
- [ ] Real-time updates working

Congratulations! Your video streaming application is now set up and ready to use. 🎉
