# Video Upload, Processing, and Streaming Application

A production-ready full-stack application for video upload, processing, and streaming with real-time updates, multi-tenant architecture, and role-based access control.

## 🚀 Features

### Core Features
- **JWT Authentication** with role-based access control (Admin, Editor, Viewer)
- **Multi-tenant Architecture** - User data isolation at database level
- **Video Upload System** with file validation and secure storage
- **Video Processing Pipeline** using FFmpeg for metadata extraction and thumbnail generation
- **Real-time Updates** via Socket.io for upload/processing progress
- **Video Streaming** with HTTP range requests for efficient playback
- **Sensitivity Analysis** with content classification (safe/flagged)
- **Responsive Design** with Tailwind CSS

### Technical Features
- **Backend**: Node.js, Express.js, MongoDB (Mongoose)
- **Frontend**: React, Vite, Tailwind CSS
- **Real-time**: Socket.io
- **File Processing**: FFmpeg, Multer
- **Authentication**: JWT with bcrypt password hashing
- **Security**: Helmet, CORS, Rate limiting, Input validation

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB (v4.4 or higher)
- FFmpeg (for video processing)
- Git

## 🛠️ Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd video-streaming-app
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install all dependencies (backend + frontend)
npm run install-all
```

### 3. Environment Setup

#### Backend Environment
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` with your configuration:
```env
# Database
MONGODB_URI=mongodb://localhost:27017/video-streaming-app

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# Server
PORT=5000
NODE_ENV=development

# File Upload
MAX_FILE_SIZE=104857600
UPLOAD_PATH=./uploads

# CORS
FRONTEND_URL=http://localhost:3000
```

### 4. Install FFmpeg

#### macOS
```bash
brew install ffmpeg
```

#### Ubuntu/Debian
```bash
sudo apt update
sudo apt install ffmpeg
```

#### Windows
Download from [FFmpeg Official Website](https://ffmpeg.org/download.html) and add to PATH

### 5. Start MongoDB
```bash
# Start MongoDB service
sudo systemctl start mongod

# Or use Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

## 🚀 Running the Application

### Development Mode
```bash
# Start both backend and frontend concurrently
npm run dev

# Or start individually:
npm run server  # Backend only
npm run client  # Frontend only
```

### Production Mode
```bash
# Build frontend
npm run build

# Start backend
npm start
```

## 📱 Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Documentation**: http://localhost:5000/api/health

## 👥 User Roles & Permissions

### Admin
- Full access to all features
- User management
- System administration

### Editor
- Upload and manage videos
- View all videos
- Cannot manage users

### Viewer
- Read-only access
- View videos only
- Cannot upload or manage

## 📁 Project Structure

```
video-streaming-app/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── authController.js
│   │   └── videoController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   └── upload.js
│   ├── models/
│   │   ├── User.js
│   │   └── Video.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── videos.js
│   ├── services/
│   │   └── videoProcessor.js
│   ├── uploads/
│   │   ├── videos/
│   │   └── thumbnails/
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.jsx
│   │   │   └── LoadingSpinner.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── SocketContext.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Upload.jsx
│   │   │   ├── VideoLibrary.jsx
│   │   │   └── VideoPlayer.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── vite.config.js
├── package.json
└── README.md
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Videos
- `POST /api/videos/upload` - Upload video (Admin/Editor only)
- `GET /api/videos` - List user's videos with filters
- `GET /api/videos/:id` - Get video details
- `GET /api/videos/stream/:id` - Stream video
- `GET /api/videos/dashboard/stats` - Get dashboard statistics

### Query Parameters for Videos List
- `status` - Filter by status (processing, completed, failed)
- `sensitivity` - Filter by sensitivity (safe, flagged)
- `page` - Pagination page number
- `limit` - Items per page

## 🔄 Real-time Events

### Socket.io Events
- `join-user-room` - Join user-specific room
- `video-processing-progress` - Processing progress updates
- `video-processing-complete` - Processing completed
- `video-processing-failed` - Processing failed

## 🛡️ Security Features

- JWT token-based authentication
- Password hashing with bcrypt
- Rate limiting for API endpoints
- File upload validation
- CORS configuration
- Helmet security headers
- Input validation with express-validator
- Role-based access control

## 📊 Database Schema

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (admin/editor/viewer),
  timestamps: true
}
```

### Video Model
```javascript
{
  title: String,
  filePath: String,
  thumbnail: String,
  size: Number,
  duration: Number,
  status: String (processing/completed/failed),
  sensitivity: String (safe/flagged),
  uploadedBy: ObjectId (ref: User),
  originalName: String,
  mimeType: String,
  timestamps: true
}
```

## 🎯 Usage Guide

### 1. Register and Login
- Create an account with appropriate role
- Login to access the dashboard

### 2. Upload Videos (Admin/Editor)
- Navigate to Upload page
- Drag and drop or select video files
- Add titles and upload
- Monitor real-time processing progress

### 3. View Videos
- Browse video library with filters
- View video details and metadata
- Stream videos with custom player

### 4. Dashboard
- View statistics and overview
- Quick access to main features
- System status monitoring

## 🔧 Configuration

### Environment Variables
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `JWT_EXPIRE` - Token expiration time
- `PORT` - Backend server port
- `MAX_FILE_SIZE` - Maximum file upload size
- `FRONTEND_URL` - Frontend URL for CORS

### File Upload Limits
- Default max file size: 100MB
- Supported formats: MP4, MOV, AVI
- Configurable via environment variables

## 🐛 Troubleshooting

### Common Issues

1. **FFmpeg not found**
   - Ensure FFmpeg is installed and in PATH
   - Check system environment variables

2. **MongoDB connection failed**
   - Verify MongoDB is running
   - Check connection string in .env

3. **File upload errors**
   - Check file size limits
   - Verify upload directory permissions
   - Ensure supported file formats

4. **Socket.io connection issues**
   - Check CORS configuration
   - Verify frontend URL in .env

### Debug Mode
```bash
# Enable debug logging
DEBUG=* npm run dev
```

## 📈 Performance Considerations

- Video processing is asynchronous to prevent blocking
- Streaming uses HTTP range requests for efficient playback
- Database indexes for optimal query performance
- File cleanup for failed uploads
- Rate limiting to prevent abuse

## 🚀 Deployment

### Docker Deployment
```dockerfile
# Add Dockerfile configuration
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

### Environment Setup
- Set NODE_ENV=production
- Use secure JWT secrets
- Configure proper file storage
- Set up reverse proxy (nginx)
- Enable HTTPS

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📞 Support

For issues and questions:
- Create an issue on GitHub
- Check existing documentation
- Review troubleshooting section

---

**Built with ❤️ using Node.js, React, and modern web technologies**
