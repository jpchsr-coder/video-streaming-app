# API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication

All API endpoints (except authentication endpoints) require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description"
}
```

---

## Authentication Endpoints

### Register User
**POST** `/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "editor" // Optional: "admin", "editor", "viewer" (default: "viewer")
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "editor",
      "createdAt": "2023-09-06T12:34:56.789Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Login User
**POST** `/auth/login`

Authenticate user and get JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "editor"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Get User Profile
**GET** `/auth/profile`

Get current user's profile information.

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "editor",
      "createdAt": "2023-09-06T12:34:56.789Z"
    }
  }
}
```

---

## Video Endpoints

### Upload Video
**POST** `/videos/upload`

Upload a video file for processing.

**Headers:**
```
Authorization: Bearer <your-jwt-token>
Content-Type: multipart/form-data
```

**Request Body (multipart/form-data):**
```
video: <video-file>
title: "My Video Title" // Optional
```

**Response:**
```json
{
  "success": true,
  "message": "Video uploaded successfully. Processing started...",
  "data": {
    "video": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
      "title": "My Video Title",
      "filePath": "uploads/videos/video-1694016096789-123456789.mp4",
      "size": 52428800,
      "status": "processing",
      "sensitivity": "safe",
      "uploadedBy": "64f8a1b2c3d4e5f6a7b8c9d0",
      "originalName": "my-video.mp4",
      "mimeType": "video/mp4",
      "createdAt": "2023-09-06T12:34:56.789Z"
    }
  }
}
```

### Get Videos
**GET** `/videos`

Get list of user's videos with optional filtering and pagination.

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Query Parameters:**
- `status` (optional): Filter by status (`processing`, `completed`, `failed`)
- `sensitivity` (optional): Filter by sensitivity (`safe`, `flagged`)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Example Request:**
```
GET /videos?status=completed&page=1&limit=12
```

**Response:**
```json
{
  "success": true,
  "data": {
    "videos": [
      {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
        "title": "My Video Title",
        "filePath": "uploads/videos/video-1694016096789-123456789.mp4",
        "thumbnail": "uploads/thumbnails/thumb-video-1694016096789-123456789.jpg",
        "size": 52428800,
        "duration": 120,
        "status": "completed",
        "sensitivity": "safe",
        "uploadedBy": {
          "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
          "name": "John Doe",
          "email": "john@example.com"
        },
        "originalName": "my-video.mp4",
        "mimeType": "video/mp4",
        "createdAt": "2023-09-06T12:34:56.789Z"
      }
    ],
    "pagination": {
      "current": 1,
      "total": 1,
      "count": 1
    }
  }
}
```

### Get Video Details
**GET** `/videos/:id`

Get detailed information about a specific video.

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Path Parameters:**
- `id`: Video ID

**Response:**
```json
{
  "success": true,
  "data": {
    "video": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
      "title": "My Video Title",
      "filePath": "uploads/videos/video-1694016096789-123456789.mp4",
      "thumbnail": "uploads/thumbnails/thumb-video-1694016096789-123456789.jpg",
      "size": 52428800,
      "duration": 120,
      "status": "completed",
      "sensitivity": "safe",
      "uploadedBy": {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "originalName": "my-video.mp4",
      "mimeType": "video/mp4",
      "createdAt": "2023-09-06T12:34:56.789Z",
      "updatedAt": "2023-09-06T12:35:56.789Z"
    }
  }
}
```

### Stream Video
**GET** `/videos/stream/:id`

Stream a video file with HTTP range request support.

**Headers:**
```
Authorization: Bearer <your-jwt-token>
Range: bytes=0-1023 (optional for partial content)
```

**Path Parameters:**
- `id`: Video ID

**Response:**
- Status: `200 OK` (full file) or `206 Partial Content` (range request)
- Content-Type: `video/mp4`
- Content-Length: File size or range size
- Accept-Ranges: `bytes`
- Content-Range: `bytes start-end/total` (for range requests)

### Get Dashboard Statistics
**GET** `/videos/dashboard/stats`

Get statistics for the user's dashboard.

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalVideos": 15,
    "processingVideos": 2,
    "flaggedVideos": 1,
    "completedVideos": 12
  }
}
```

---

## Health Check

### System Health
**GET** `/health`

Check if the API server is running.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2023-09-06T12:34:56.789Z"
}
```

---

## Error Codes

### Authentication Errors
- `401 Unauthorized`: Invalid or missing token
- `403 Forbidden`: Insufficient permissions

### Validation Errors
- `400 Bad Request`: Invalid input data

### Resource Errors
- `404 Not Found`: Resource not found
- `413 Payload Too Large`: File size exceeds limit

### Server Errors
- `500 Internal Server Error`: Server error

---

## Rate Limiting

API endpoints are rate-limited to prevent abuse:
- **Limit**: 100 requests per 15 minutes per IP
- **Headers**: Rate limit information is included in response headers

---

## File Upload Limits

- **Maximum file size**: 100MB (configurable)
- **Supported formats**: MP4, MOV, AVI
- **File validation**: Server-side validation of file type and size

---

## Socket.io Events

### Client to Server Events

#### Join User Room
```javascript
socket.emit('join-user-room', userId);
```

### Server to Client Events

#### Video Processing Progress
```javascript
socket.on('video-processing-progress', (data) => {
  console.log(data);
  // {
  //   videoId: "64f8a1b2c3d4e5f6a7b8c9d1",
  //   progress: 45,
  //   message: "Extracting metadata...",
  //   timestamp: "2023-09-06T12:34:56.789Z"
  // }
});
```

#### Video Processing Complete
```javascript
socket.on('video-processing-complete', (data) => {
  console.log(data);
  // {
  //   videoId: "64f8a1b2c3d4e5f6a7b8c9d1",
  //   status: "completed"
  // }
});
```

#### Video Processing Failed
```javascript
socket.on('video-processing-failed', (data) => {
  console.log(data);
  // {
  //   videoId: "64f8a1b2c3d4e5f6a7b8c9d1",
  //   status: "failed",
  //   error: "Processing error message"
  // }
});
```

---

## Examples

### Upload Video with Progress Tracking

```javascript
// Upload video
const formData = new FormData();
formData.append('video', fileInput.files[0]);
formData.append('title', 'My Video');

const response = await fetch('/api/videos/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

const { data } = await response.json();

// Listen for processing progress
socket.emit('join-user-room', userId);

socket.on('video-processing-progress', (data) => {
  if (data.videoId === data.video._id) {
    updateProgress(data.progress);
  }
});
```

### Stream Video

```html
<video controls>
  <source src="/api/videos/stream/64f8a1b2c3d4e5f6a7b8c9d1" type="video/mp4">
</video>
```

```javascript
// With authentication
const videoElement = document.querySelector('video');
videoElement.src = '/api/videos/stream/64f8a1b2c3d4e5f6a7b8c9d1';
```

---

## Testing

Use tools like Postman or curl to test the API:

```bash
# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get videos
curl -X GET http://localhost:5000/api/videos \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```
