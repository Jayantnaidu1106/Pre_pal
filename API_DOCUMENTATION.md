# 📡 API Documentation - GRAMA INVEST

Complete API reference for the GRAMA INVEST platform.

## Base URL

```
Development: http://localhost:3000
Production: https://your-backend-domain.com
```

## Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Success message"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "details": "Additional error details"
}
```

---

## 🔐 Authentication Endpoints

### Register User

**POST** `/api/auth/register`

Create a new user account.

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response:** `201 Created`
```json
{
  "user": {
    "_id": "user_id",
    "username": "johndoe",
    "email": "john@example.com"
  },
  "token": "jwt_token_here"
}
```

**Errors:**
- `400` - Validation error (missing fields, invalid email)
- `409` - User already exists

---

### Login

**POST** `/api/auth/login`

Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response:** `200 OK`
```json
{
  "user": {
    "_id": "user_id",
    "username": "johndoe",
    "email": "john@example.com"
  },
  "token": "jwt_token_here"
}
```

**Errors:**
- `400` - Invalid credentials
- `404` - User not found

---

### Get Profile

**GET** `/api/auth/profile`

Get current user's profile information.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "_id": "user_id",
  "username": "johndoe",
  "email": "john@example.com",
  "createdAt": "2025-01-01T00:00:00.000Z"
}
```

**Errors:**
- `401` - Unauthorized (invalid/missing token)

---

## 📚 Study Room Endpoints

### List Study Rooms

**GET** `/api/studyrooms`

Get all available study rooms.

**Query Parameters:**
- `limit` (optional) - Number of results (default: 20)
- `page` (optional) - Page number (default: 1)
- `search` (optional) - Search by name or description

**Response:** `200 OK`
```json
{
  "studyrooms": [
    {
      "_id": "room_id",
      "name": "JavaScript Study Group",
      "description": "Learning JS together",
      "participants": 5,
      "maxParticipants": 10,
      "createdBy": "user_id",
      "isActive": true,
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ],
  "total": 25,
  "page": 1,
  "pages": 2
}
```

---

### Create Study Room

**POST** `/api/studyrooms`

Create a new study room.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Python Learning Group",
  "description": "Learning Python from scratch",
  "maxParticipants": 10,
  "isPrivate": false,
  "password": "optional_password"
}
```

**Response:** `201 Created`
```json
{
  "_id": "room_id",
  "name": "Python Learning Group",
  "description": "Learning Python from scratch",
  "maxParticipants": 10,
  "participants": [],
  "createdBy": "user_id",
  "isActive": true,
  "createdAt": "2025-01-01T00:00:00.000Z"
}
```

**Errors:**
- `400` - Validation error
- `401` - Unauthorized

---

### Get Study Room Details

**GET** `/api/studyrooms/:id`

Get detailed information about a specific study room.

**Response:** `200 OK`
```json
{
  "_id": "room_id",
  "name": "Python Learning Group",
  "description": "Learning Python from scratch",
  "participants": [
    {
      "_id": "user_id",
      "username": "johndoe",
      "joinedAt": "2025-01-01T00:00:00.000Z"
    }
  ],
  "messages": [...],
  "files": [...],
  "createdBy": {
    "_id": "user_id",
    "username": "creator_name"
  }
}
```

**Errors:**
- `404` - Study room not found

---

### Join Study Room

**POST** `/api/studyrooms/:id/join`

Join an existing study room.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body (for private rooms):**
```json
{
  "password": "room_password"
}
```

**Response:** `200 OK`
```json
{
  "message": "Joined study room successfully",
  "studyroom": { ... }
}
```

**Errors:**
- `400` - Room is full or incorrect password
- `401` - Unauthorized
- `404` - Study room not found

---

### Leave Study Room

**POST** `/api/studyrooms/:id/leave`

Leave a study room.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "message": "Left study room successfully"
}
```

---

### Update Study Room

**PUT** `/api/studyrooms/:id`

Update study room details (creator only).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Updated Name",
  "description": "Updated description",
  "maxParticipants": 15
}
```

**Response:** `200 OK`

**Errors:**
- `401` - Unauthorized
- `403` - Not the creator
- `404` - Study room not found

---

### Delete Study Room

**DELETE** `/api/studyrooms/:id`

Delete a study room (creator only).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "message": "Study room deleted successfully"
}
```

**Errors:**
- `401` - Unauthorized
- `403` - Not the creator
- `404` - Study room not found

---

## 🎤 Mock Interview Endpoints

### Create Interview Session

**POST** `/api/interview/create`

Create a new mock interview session.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "role": "Software Engineer",
  "experience": 3,
  "company": "Google",
  "difficulty": "medium"
}
```

**Response:** `201 Created`
```json
{
  "_id": "interview_id",
  "userId": "user_id",
  "role": "Software Engineer",
  "experience": 3,
  "status": "created",
  "createdAt": "2025-01-01T00:00:00.000Z"
}
```

---

### Generate Questions

**POST** `/api/interview/generate-questions`

Generate interview questions for a session.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "interviewId": "interview_id",
  "numberOfQuestions": 5,
  "topics": ["algorithms", "system-design"]
}
```

**Response:** `200 OK`
```json
{
  "questions": [
    {
      "id": "q1",
      "question": "Explain how you would design a URL shortener",
      "type": "system-design",
      "difficulty": "medium"
    }
  ]
}
```

---

### Submit Answer

**POST** `/api/interview/:id/submit-answer`

Submit an answer to an interview question.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "questionId": "q1",
  "answer": "I would use a hash function to...",
  "timeSpent": 600
}
```

**Response:** `200 OK`
```json
{
  "feedback": "Good understanding of...",
  "score": 8,
  "suggestions": [...]
}
```

---

### Get Interview Feedback

**GET** `/api/interview/:id/feedback`

Get complete feedback for an interview session.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "overallScore": 7.5,
  "strengths": ["Problem solving", "Communication"],
  "areasToImprove": ["Time complexity analysis"],
  "detailedFeedback": { ... }
}
```

---

## 📝 Quiz Endpoints

### Create Quiz

**POST** `/api/quiz/create`

Create a new quiz.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "JavaScript Basics",
  "topic": "javascript",
  "difficulty": "easy",
  "numberOfQuestions": 10,
  "timeLimit": 600
}
```

**Response:** `201 Created`
```json
{
  "_id": "quiz_id",
  "title": "JavaScript Basics",
  "questions": [...],
  "createdAt": "2025-01-01T00:00:00.000Z"
}
```

---

### Get Quiz

**GET** `/api/quiz/:id`

Get quiz details and questions.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "_id": "quiz_id",
  "title": "JavaScript Basics",
  "questions": [
    {
      "id": "q1",
      "question": "What is closure in JavaScript?",
      "options": ["A", "B", "C", "D"],
      "type": "multiple-choice"
    }
  ],
  "timeLimit": 600
}
```

---

### Submit Quiz

**POST** `/api/quiz/:id/submit`

Submit quiz answers.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "answers": {
    "q1": "A",
    "q2": "C",
    "q3": "B"
  },
  "timeSpent": 480
}
```

**Response:** `200 OK`
```json
{
  "score": 8,
  "totalQuestions": 10,
  "correctAnswers": 8,
  "percentage": 80,
  "passed": true
}
```

---

### Get Quiz Results

**GET** `/api/quiz/:id/results`

Get detailed results for a quiz attempt.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "score": 8,
  "answers": [
    {
      "questionId": "q1",
      "yourAnswer": "A",
      "correctAnswer": "A",
      "isCorrect": true
    }
  ],
  "timeSpent": 480,
  "completedAt": "2025-01-01T00:00:00.000Z"
}
```

---

## 🤖 AI Chat Endpoints

### Send Message

**POST** `/api/ai/chat`

Send a message to the AI assistant.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "message": "Explain recursion in simple terms",
  "context": {
    "studyroomId": "room_id",
    "previousMessages": []
  }
}
```

**Response:** `200 OK`
```json
{
  "response": "Recursion is a technique where...",
  "messageId": "msg_id",
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

---

### Moderate Content

**POST** `/api/ai/moderate`

Moderate user-generated content.

**Request Body:**
```json
{
  "content": "Message to moderate"
}
```

**Response:** `200 OK`
```json
{
  "isSafe": true,
  "categories": {
    "hate": 0.01,
    "violence": 0.02,
    "spam": 0.05
  }
}
```

---

## 📁 File Upload Endpoints

### Upload File

**POST** `/api/files/upload`

Upload a file to a study room or project.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body:**
```
file: [binary]
studyroomId: "room_id"
description: "Lecture notes"
```

**Response:** `200 OK`
```json
{
  "file": {
    "_id": "file_id",
    "filename": "notes.pdf",
    "originalName": "Lecture Notes.pdf",
    "size": 1024000,
    "mimetype": "application/pdf",
    "url": "/uploads/studyrooms/notes.pdf",
    "uploadedBy": "user_id",
    "uploadedAt": "2025-01-01T00:00:00.000Z"
  }
}
```

**Errors:**
- `400` - No file uploaded or invalid file type
- `413` - File too large (max 10MB)

---

## 🔌 WebSocket Events

### Connection

```javascript
const socket = io('http://localhost:3000', {
  auth: { token: 'your_jwt_token' }
});
```

### Study Room Events

**Join Room**
```javascript
socket.emit('join-studyroom', { studyroomId: 'room_id' });
```

**Send Message**
```javascript
socket.emit('send-message', {
  studyroomId: 'room_id',
  message: 'Hello everyone!'
});
```

**Receive Message**
```javascript
socket.on('new-message', (data) => {
  console.log(data.message, data.sender);
});
```

**Whiteboard Update**
```javascript
socket.emit('whiteboard-draw', {
  studyroomId: 'room_id',
  drawData: { x: 100, y: 200, color: '#000' }
});

socket.on('whiteboard-update', (drawData) => {
  // Update canvas
});
```

---

## 📊 Rate Limits

- **Authentication**: 5 requests per minute
- **AI endpoints**: 10 requests per minute
- **File uploads**: 5 uploads per minute
- **General API**: 100 requests per minute

---

## 🔧 Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Missing/invalid token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Resource already exists |
| 413 | Payload Too Large - File too big |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |
| 503 | Service Unavailable - AI service down |

---

## 📝 Notes

- All timestamps are in ISO 8601 format (UTC)
- File uploads limited to 10MB
- WebSocket connections auto-reconnect on disconnect
- JWT tokens expire after 7 days
- API supports CORS for configured origins

---

For more information, visit [GitHub Repository](https://github.com/Tanishk0109/Mini-Project)
