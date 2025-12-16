# 🎓 PRE PAL - AI-Powered Collaborative Learning Platform

A comprehensive real-time collaborative learning platform with AI-powered features including study rooms, mock interviews, quizzes, and interactive whiteboards.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![React](https://img.shields.io/badge/react-19.1.0-blue.svg)

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Environment Variables](#-environment-variables)
- [Running the Application](#-running-the-application)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

### 🏠 Core Features
- **User Authentication** - Secure JWT-based authentication with bcrypt password hashing
- **Real-time Collaboration** - Socket.IO powered real-time communication
- **File Management** - Upload and manage project files with support for PDF, DOCX, and images

### 📚 Study Rooms
- Create and join collaborative study rooms
- Real-time chat with AI-powered moderation
- Interactive whiteboard for visual collaboration
- Screen sharing and file sharing capabilities
- AI assistant for instant help and explanations

### 🎤 Mock Interviews
- AI-powered interview question generation
- Support for various job roles and experience levels
- Real-time feedback and evaluation
- Voice interaction using Hume AI
- Performance analytics and suggestions

### 📝 Quizzes
- Auto-generated quizzes based on topics
- Multiple difficulty levels
- Real-time scoring and feedback
- Performance tracking and analytics
- Adaptive learning recommendations

### 🎨 Interactive Whiteboard
- Real-time collaborative drawing
- Multiple tools: pen, eraser, shapes, text
- Color palette and stroke width customization
- Undo/redo functionality
- Export and share drawings

## 🛠 Tech Stack

### Frontend
- **React 19.1.0** - UI library
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Socket.IO Client** - Real-time communication
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Three.js** - 3D graphics library

### Backend
- **Node.js** - Runtime environment
- **Express.js 5.1.0** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **Socket.IO** - Real-time bidirectional communication
- **Redis** - Caching and session management
- **JWT** - Authentication tokens
- **Groq AI** - AI-powered features
- **Hume AI** - Voice interaction and emotion detection

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher)
- **npm** or **yarn**
- **MongoDB** (v6.0 or higher)
- **Redis** (optional, for caching)
- **Git**

## 🚀 Installation

### 1. Clone the repository

```bash
git clone https://github.com/Tanishk0109/Mini-Project.git
cd Mini-Project
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

## 🔐 Environment Variables

### Backend (.env)

Create a `.env` file in the `backend` directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/grama_invest

# Authentication
JWT_SECRET=your_super_secret_jwt_key_change_this

# Redis Configuration (Optional)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# AI Services
# Get free Groq API key at: https://console.groq.com/keys
GROQ_API_KEY=your_groq_api_key

# Feature-specific keys (optional - defaults to GROQ_API_KEY if not set)
STUDY_ROOM_API_KEY=
MOCK_INTERVIEW_API_KEY=
QUIZ_API_KEY=

# Hume AI Configuration (Optional - for voice features)
# Get free API key at: https://platform.hume.ai
HUME_API_KEY=your_hume_api_key
HUME_SECRET_KEY=your_hume_secret_key
HUME_CONFIG_ID=your_hume_config_id

# CORS Configuration
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)

Create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:3000
VITE_SOCKET_URL=http://localhost:3000
```

## 🏃 Running the Application

### Development Mode

1. **Start MongoDB**
   ```bash
   # Windows
   net start MongoDB
   
   # Linux/Mac
   sudo systemctl start mongod
   ```

2. **Start Redis (Optional)**
   ```bash
   # Windows - Install via Memurai or WSL
   redis-server
   
   # Linux/Mac
   redis-server
   ```

3. **Start Backend Server**
   ```bash
   cd backend
   npm run dev
   ```
   Backend will run on http://localhost:3000

4. **Start Frontend Development Server**
   ```bash
   cd frontend
   npm run dev
   ```
   Frontend will run on http://localhost:5173

### Production Build

1. **Build Frontend**
   ```bash
   cd frontend
   npm run build
   ```

2. **Start Backend in Production Mode**
   ```bash
   cd backend
   NODE_ENV=production npm start
   ```

## 📁 Project Structure

```
Mini-Project/
├── backend/
│   ├── controllers/         # Request handlers
│   ├── models/             # MongoDB schemas
│   ├── routes/             # API routes
│   ├── services/           # Business logic
│   ├── middlewares/        # Custom middleware
│   ├── modules/            # Feature modules
│   │   ├── interview/      # Mock interview feature
│   │   └── quiz/          # Quiz feature
│   ├── db/                # Database connection
│   ├── uploads/           # File uploads
│   ├── app.js             # Express app setup
│   └── server.js          # Server entry point
│
├── frontend/
│   ├── src/
│   │   ├── screens/       # Page components
│   │   ├── components/    # Reusable components
│   │   ├── routes/        # Route configuration
│   │   ├── context/       # React context
│   │   ├── auth/          # Authentication logic
│   │   ├── config/        # Configuration files
│   │   └── utils/         # Utility functions
│   ├── public/            # Static assets
│   └── index.html         # HTML template
│
└── docs/                  # Documentation
    ├── API.md            # API documentation
    ├── DEPLOYMENT.md     # Deployment guide
    └── CONTRIBUTING.md   # Contribution guidelines
```

## 📚 API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile

### Study Rooms
- `GET /api/studyrooms` - List all study rooms
- `POST /api/studyrooms` - Create new study room
- `GET /api/studyrooms/:id` - Get study room details
- `PUT /api/studyrooms/:id` - Update study room
- `DELETE /api/studyrooms/:id` - Delete study room
- `POST /api/studyrooms/:id/join` - Join study room

### Mock Interviews
- `POST /api/interview/create` - Create interview session
- `POST /api/interview/generate-questions` - Generate interview questions
- `POST /api/interview/:id/submit-answer` - Submit interview answer
- `GET /api/interview/:id/feedback` - Get interview feedback

### Quizzes
- `POST /api/quiz/create` - Create quiz
- `GET /api/quiz/:id` - Get quiz details
- `POST /api/quiz/:id/submit` - Submit quiz answers
- `GET /api/quiz/:id/results` - Get quiz results

### AI Chat
- `POST /api/ai/chat` - Send message to AI
- `POST /api/ai/moderate` - Moderate content

For detailed API documentation, see [API.md](./docs/API.md)

## 🌐 Deployment

### Deployment Options

1. **Vercel** (Frontend) + **Render/Railway** (Backend)
2. **Netlify** (Frontend) + **Heroku** (Backend)
3. **AWS** (Full stack)
4. **DigitalOcean** (Full stack)

For detailed deployment instructions, see [DEPLOYMENT.md](./docs/DEPLOYMENT.md)

### Quick Deploy Steps

1. **Deploy Backend**
   - Set up MongoDB Atlas
   - Deploy to Render/Railway/Heroku
   - Configure environment variables
   
2. **Deploy Frontend**
   - Update API URLs in environment
   - Build the application
   - Deploy to Vercel/Netlify

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guidelines.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 👥 Authors

- **Tanishk0109** - *Initial work* - [GitHub](https://github.com/Tanishk0109)

## 🙏 Acknowledgments

- Groq AI for powering intelligent features
- Hume AI for voice interaction capabilities
- Socket.IO for real-time communication
- The open-source community

## 📞 Support

For support, email your-email@example.com or open an issue in the repository.

## 🔗 Links

- [Live Demo](https://pre-pal-phi.vercel.app/)
- [Documentation](https://github.com/Tanishk0109/Mini-Project/wiki)
- [Issue Tracker](https://github.com/Tanishk0109/Mini-Project/issues)

---

Made with ❤️ by the GRAMA INVEST Team
