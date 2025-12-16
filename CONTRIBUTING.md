# 🤝 Contributing to GRAMA INVEST

Thank you for your interest in contributing to GRAMA INVEST! This document provides guidelines and instructions for contributing.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Process](#development-process)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)

## 📜 Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inspiring community for all. We pledge to:

- Use welcoming and inclusive language
- Be respectful of differing viewpoints and experiences
- Gracefully accept constructive criticism
- Focus on what is best for the community
- Show empathy towards other community members

### Unacceptable Behavior

- Harassment or discrimination of any kind
- Trolling, insulting/derogatory comments, and personal attacks
- Public or private harassment
- Publishing others' private information without permission
- Other conduct which could reasonably be considered inappropriate

## 🚀 Getting Started

### Prerequisites

Before contributing, ensure you have:

- Node.js (v18+)
- MongoDB
- Git
- Code editor (VS Code recommended)

### Setting Up Development Environment

1. **Fork the Repository**
   ```bash
   # Click "Fork" button on GitHub
   # Clone your fork
   git clone https://github.com/YOUR_USERNAME/Mini-Project.git
   cd Mini-Project
   ```

2. **Add Upstream Remote**
   ```bash
   git remote add upstream https://github.com/Tanishk0109/Mini-Project.git
   ```

3. **Install Dependencies**
   ```bash
   # Backend
   cd backend
   npm install
   
   # Frontend
   cd ../frontend
   npm install
   ```

4. **Configure Environment**
   ```bash
   # Copy example env files
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   
   # Edit with your values
   ```

5. **Start Development Servers**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev
   
   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

## 🔄 Development Process

### Branching Strategy

We use Git Flow branching model:

- **main** - Production-ready code
- **develop** - Development branch
- **feature/** - New features
- **bugfix/** - Bug fixes
- **hotfix/** - Urgent production fixes

### Creating a Feature Branch

```bash
# Update your local repo
git checkout develop
git pull upstream develop

# Create feature branch
git checkout -b feature/your-feature-name

# Make your changes
# Commit your changes
git add .
git commit -m "feat: add amazing feature"

# Push to your fork
git push origin feature/your-feature-name
```

### Commit Message Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

**Examples:**
```bash
feat(studyroom): add real-time chat functionality
fix(auth): resolve JWT token expiration issue
docs(readme): update installation instructions
refactor(ai): optimize question generation algorithm
```

## 📝 Pull Request Process

### Before Submitting

1. **Update from Upstream**
   ```bash
   git checkout develop
   git pull upstream develop
   git checkout your-feature-branch
   git rebase develop
   ```

2. **Test Your Changes**
   ```bash
   # Run backend tests
   cd backend
   npm test
   
   # Run frontend tests
   cd frontend
   npm test
   
   # Test manually in browser
   ```

3. **Lint Your Code**
   ```bash
   # Backend
   cd backend
   npm run lint
   
   # Frontend
   cd frontend
   npm run lint
   ```

### Submitting Pull Request

1. **Push Your Changes**
   ```bash
   git push origin your-feature-branch
   ```

2. **Create Pull Request**
   - Go to your fork on GitHub
   - Click "New Pull Request"
   - Select: `base: develop` ← `compare: your-feature-branch`
   - Fill in the template:

   ```markdown
   ## Description
   Brief description of changes
   
   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update
   
   ## Testing
   - [ ] Tested locally
   - [ ] Added new tests
   - [ ] All tests passing
   
   ## Screenshots (if applicable)
   Add screenshots here
   
   ## Checklist
   - [ ] Code follows project style guidelines
   - [ ] Self-reviewed my code
   - [ ] Commented complex code sections
   - [ ] Updated documentation
   - [ ] No new warnings
   ```

3. **Address Review Comments**
   - Respond to feedback promptly
   - Make requested changes
   - Push updates to same branch

### Review Process

- Maintainers will review your PR within 3-5 days
- At least one approval required before merging
- All CI checks must pass
- Conflicts must be resolved

## 🎨 Coding Standards

### JavaScript/React Standards

**General Rules:**
- Use ES6+ features
- Use meaningful variable names
- Keep functions small and focused
- Add comments for complex logic
- Use async/await over promises

**React Best Practices:**
```javascript
// ✅ Good
const UserProfile = ({ user }) => {
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    fetchUserData();
  }, [user.id]);
  
  return <div>{user.name}</div>;
};

// ❌ Bad
const comp = (props) => {
  const [x, setX] = useState(false);
  useEffect(() => { getData(); });
  return <div>{props.data}</div>;
};
```

**Backend Best Practices:**
```javascript
// ✅ Good
export const createStudyRoom = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    // Validate input
    if (!name) {
      return res.status(400).json({ error: 'Name required' });
    }
    
    // Business logic
    const room = await StudyRoom.create({ name, description });
    
    res.status(201).json(room);
  } catch (error) {
    console.error('Create room error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// ❌ Bad
export const createRoom = async (req, res) => {
  const r = await Room.create(req.body);
  res.json(r);
};
```

### File Naming Conventions

```
components/     - PascalCase: UserProfile.jsx
screens/        - PascalCase: StudyRoom.jsx
utils/          - camelCase: formatDate.js
services/       - camelCase: ai.service.js
controllers/    - camelCase: user.controller.js
models/         - camelCase: user.model.js
```

### Code Formatting

We use ESLint and Prettier:

```bash
# Auto-format code
npm run format

# Check linting
npm run lint

# Fix linting issues
npm run lint:fix
```

## 🧪 Testing Guidelines

### Writing Tests

**Backend Tests (Jest)**
```javascript
describe('StudyRoom Controller', () => {
  it('should create a new study room', async () => {
    const roomData = {
      name: 'Test Room',
      description: 'Test description'
    };
    
    const res = await request(app)
      .post('/api/studyrooms')
      .send(roomData)
      .expect(201);
    
    expect(res.body.name).toBe(roomData.name);
  });
});
```

**Frontend Tests (React Testing Library)**
```javascript
import { render, screen } from '@testing-library/react';
import UserProfile from './UserProfile';

describe('UserProfile', () => {
  it('renders user name', () => {
    const user = { name: 'John Doe' };
    render(<UserProfile user={user} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

## 📚 Documentation

### Code Comments

```javascript
/**
 * Generates interview questions based on job role and experience
 * @param {string} role - Job role (e.g., "Software Engineer")
 * @param {number} experience - Years of experience
 * @param {string} difficulty - Question difficulty level
 * @returns {Promise<Array>} Array of generated questions
 */
async function generateQuestions(role, experience, difficulty) {
  // Implementation
}
```

### API Documentation

When adding new endpoints, update API docs:

```markdown
### POST /api/endpoint

**Description:** Brief description

**Request:**
```json
{
  "param1": "value1",
  "param2": "value2"
}
```

**Response:**
```json
{
  "data": "result"
}
```

**Errors:**
- 400: Bad Request
- 401: Unauthorized
- 500: Server Error
```

### README Updates

Update README.md when:
- Adding new features
- Changing configuration
- Updating dependencies
- Modifying setup process

## 🐛 Bug Reports

### Before Reporting

1. Search existing issues
2. Verify it's reproducible
3. Check if it's already fixed

### Bug Report Template

```markdown
**Describe the bug**
Clear description of the bug

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What should happen

**Screenshots**
If applicable

**Environment:**
- OS: [e.g., Windows 10]
- Browser: [e.g., Chrome 120]
- Node version: [e.g., 18.0.0]

**Additional context**
Any other relevant information
```

## 💡 Feature Requests

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
Description of the problem

**Describe the solution you'd like**
Clear description of desired feature

**Describe alternatives you've considered**
Alternative solutions or features

**Additional context**
Mockups, examples, or other context
```

## 🏆 Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Given credit in documentation

## 📞 Getting Help

- **Discord:** [Join our community](https://discord.gg/example)
- **Email:** support@example.com
- **GitHub Issues:** For bug reports and features
- **Discussions:** For questions and ideas

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to GRAMA INVEST! 🎉
