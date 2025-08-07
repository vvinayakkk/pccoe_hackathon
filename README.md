# PIISAFE - Privacy-Preserving AI Communication Platform

A fullstack web application that provides secure, privacy-preserving communication with AI assistance, featuring multi-language translation, offline capabilities, and comprehensive dashboard analytics.

## 🚀 Technology Stack

### Frontend
- **React 19** with Vite for fast development
- **Vue.js 3** with TypeScript for file management interface
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **React Router** for navigation
- **Axios** for API communication

### Backend
- **Flask** with Python 3.11+
- **Flask-CORS** for cross-origin requests
- **PyMongo** for MongoDB integration
- **python-dotenv** for environment management

### Infrastructure
- **Docker** for containerization
- **MongoDB** for data persistence
- **Nginx** for production serving

## 📁 Project Structure

```
pccoe_hackathon/
├── client/                 # React frontend (main app)
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/        # Page components
│   │   └── styles/       # CSS styles
│   ├── package.json
│   └── vite.config.js
├── vue-frontend/          # Vue.js file browser interface
│   ├── src/
│   │   ├── components/   # Vue components
│   │   ├── views/        # Vue pages
│   │   └── stores/       # Pinia stores
│   └── package.json
├── backend1/              # Translation API service
│   ├── app.py            # Flask translation API
│   └── requirements.txt
├── backend2/              # Dashboard & Analytics API
│   ├── dashboard.py      # Flask dashboard API
│   └── requirements.txt
├── Backend/              # Guardian Engine (PII detection)
│   └── guardian-engine/  # Privacy protection service
├── anushka/              # Integration & Analytics Microservices
│   ├── app.py           # Gmail Auth Service (Port: 3000)
│   ├── app2.py          # Task Management Service (Port: 3001)
│   ├── app3.py          # Learning Analytics Service (Port: 3002)
│   └── requirements.txt
├── Filebrowser/          # File management service
└── docker-compose.yml    # Multi-service orchestration
```

## 🛠️ Local Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- Python 3.11+
- MongoDB (local or cloud)
- Docker and Docker Compose

### Frontend Setup (React)

```bash
# Navigate to React frontend
cd client

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Frontend Setup (Vue.js)

```bash
# Navigate to Vue frontend
cd vue-frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Backend Setup

```bash
# Navigate to backend directory
cd backend1  # or backend2

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
cp .env.example .env
# Edit .env with your configuration

# Run Flask development server
python app.py  # or dashboard.py for backend2
```

### Docker Setup

```bash
# Build and start all services
docker-compose up --build

# Start in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 🔧 Environment Variables

Create a `.env` file in each backend directory:

```bash
# .env.example
FLASK_ENV=development
FLASK_APP=app.py
FLASK_DEBUG=1

# API Configuration
REACT_APP_API_URL=http://localhost:5000
REACT_APP_VUE_API_URL=http://localhost:3000

# Database
MONGO_URI=mongodb://localhost:27017/
DATABASE_NAME=TCET2

# Translation API (backend1)
AUTHORIZATION_TOKEN=your_bhashini_token
DEFAULT_SERVICE_ID=ai4bharat/indictrans--gpu-t4

# Security
SECRET_KEY=your_secret_key_here
JWT_SECRET=your_jwt_secret_here

# External Services
BHASHINI_API_URL=https://dhruva-api.bhashini.gov.in
```

## 🐳 Docker Configuration

### Dockerfile for Flask Backend

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 5000

# Run the application
CMD ["python", "app.py"]
```

### Dockerfile for React Frontend

```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

## 📡 API Usage Examples

### Translation API (backend1)

```bash
# Translate text
curl -X POST http://localhost:5000/api/translate \
  -H "Content-Type: application/json" \
  -d '{
    "source_language": "en",
    "target_language": "hi",
    "text": "Hello, how are you?",
    "service_id": "ai4bharat/indictrans--gpu-t4"
  }'

# Response
{
  "translated_text": "नमस्ते, आप कैसे हैं?",
  "source_language": "en",
  "target_language": "hi",
  "confidence": 0.95
}
```

### Dashboard API (backend2)

```bash
# Get dashboard statistics
curl -X GET http://localhost:5001/api/dashboard/stats

# Get recent communications
curl -X GET "http://localhost:5001/api/dashboard/recent-communications?limit=5"

# Get language distribution
curl -X GET http://localhost:5001/api/dashboard/language-distribution

# Get user profile
curl -X GET http://localhost:5001/api/user/profile
```

### Communication History

```bash
# Get communication history
curl -X GET "http://localhost:5001/api/communications/history?page=1&limit=10"

# Apply suggestion
curl -X POST http://localhost:5001/api/dashboard/apply-suggestion \
  -H "Content-Type: application/json" \
  -d '{
    "communication_id": "507f1f77bcf86cd799439011",
    "suggestion": "improved_text_here"
  }'
```

## 🚀 Deployment

### DockerHub Deployment

```bash
# Build and tag images
docker build -t your-username/piisafe-backend:latest ./backend1
docker build -t your-username/piisafe-frontend:latest ./client

# Push to DockerHub
docker push your-username/piisafe-backend:latest
docker push your-username/piisafe-frontend:latest
```

### Render Deployment

1. Connect your GitHub repository
2. Set environment variables in Render dashboard
3. Configure build commands:
   - **Backend**: `pip install -r requirements.txt && python app.py`
   - **Frontend**: `npm install && npm run build`

### Heroku Deployment

```bash
# Create Heroku app
heroku create piisafe-app

# Add MongoDB addon
heroku addons:create mongolab:sandbox

# Deploy
git push heroku main

# Set environment variables
heroku config:set FLASK_ENV=production
heroku config:set MONGO_URI=your_mongo_uri
```

## 📊 Architecture Diagrams

### Folder Structure

```mermaid
graph TD
    A[pccoe_hackathon] --> B[client]
    A --> C[vue-frontend]
    A --> D[backend1]
    A --> E[backend2]
    A --> F[Backend]
    A --> G[Filebrowser]
    
    B --> B1[src/components]
    B --> B2[src/pages]
    B --> B3[src/styles]
    
    C --> C1[src/components]
    C --> C2[src/views]
    C --> C3[src/stores]
    
    D --> D1[app.py]
    D --> D2[requirements.txt]
    
    E --> E1[dashboard.py]
    E --> E2[requirements.txt]
    
    F --> F1[guardian-engine]
    
    G --> G1[filebrowser.db]
```

### Service Architecture

```mermaid
graph TB
    subgraph "Frontend Layer"
        A[React App<br/>Port: 3000]
        B[Vue.js App<br/>Port: 3001]
    end
    
    subgraph "Backend Layer"
        C[Translation API<br/>Port: 5000]
        D[Dashboard API<br/>Port: 5001]
        E[Guardian Engine<br/>Port: 5002]
    end
    
    subgraph "Data Layer"
        F[(MongoDB<br/>Port: 27017)]
        G[File Storage]
    end
    
    subgraph "External Services"
        H[Bhashini API]
        I[AI Services]
    end
    
    A --> C
    A --> D
    B --> E
    C --> H
    D --> F
    E --> F
    E --> I
```

### Request-Response Flow

```mermaid
sequenceDiagram
    participant U as User
    participant R as React App
    participant T as Translation API
    participant B as Bhashini API
    participant D as Dashboard API
    participant M as MongoDB
    
    U->>R: Enter text for translation
    R->>T: POST /api/translate
    T->>B: Forward translation request
    B->>T: Return translated text
    T->>R: Return translation result
    R->>D: POST communication data
    D->>M: Store communication record
    D->>R: Confirm storage
    R->>U: Display translated text
```

### Database ER Diagram

```mermaid
erDiagram
    COMMUNICATIONS {
        ObjectId _id
        String original_text
        String refined_text
        String source_language
        String target_language
        Number ai_confidence_score
        Array improvements_applied
        Boolean offline_mode_used
        DateTime timestamp
        ObjectId user_id
    }
    
    USERS {
        ObjectId _id
        String username
        String email
        String preferred_languages
        DateTime created_at
        DateTime last_login
    }
    
    PERFORMANCE_METRICS {
        ObjectId _id
        Number accuracy_rate
        Number improvement_rate
        Number languages_supported
        Number user_correction_rate
        Number average_refinement_time
        DateTime timestamp
    }
    
    LANGUAGES {
        ObjectId _id
        String language_code
        String language_name
        Boolean is_active
        DateTime created_at
    }
    
    COMMUNICATIONS ||--o{ USERS : "belongs to"
    PERFORMANCE_METRICS ||--o{ USERS : "tracks"
    LANGUAGES ||--o{ COMMUNICATIONS : "supports"
```

### React Component Hierarchy

```mermaid
graph TD
    A[App.jsx] --> B[Router]
    B --> C[Home Page]
    B --> D[Translation Page]
    B --> E[Dashboard Page]
    B --> F[Agent Learning Page]
    
    C --> C1[Features.jsx]
    C --> C2[FeaturesCards.jsx]
    C --> C3[Footer.jsx]
    
    D --> D1[Translation Form]
    D --> D2[Language Selector]
    D --> D3[Result Display]
    
    E --> E1[Stats Cards]
    E --> E2[Charts]
    E --> E3[Recent Communications]
    
    F --> F1[Learning Interface]
    F --> F2[Progress Tracker]
    
    D1 --> D1a[Text Input]
    D1 --> D1b[Submit Button]
    
    E1 --> E1a[Metric Card]
    E1 --> E1b[Trend Indicator]
```

### Authentication Flow

```mermaid
stateDiagram-v2
    [*] --> Unauthenticated
    Unauthenticated --> Login: User enters credentials
    Login --> Validating: Submit form
    Validating --> Authenticated: Valid credentials
    Validating --> Login: Invalid credentials
    Authenticated --> Dashboard: Redirect
    Authenticated --> Translation: Navigate
    Dashboard --> Authenticated: Stay logged in
    Translation --> Authenticated: Stay logged in
    Authenticated --> Unauthenticated: Logout
    Unauthenticated --> [*]
```

## 🤝 Contributing

### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and commit: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Code Style

- **Python**: Follow PEP 8 guidelines
- **JavaScript/React**: Use ESLint and Prettier
- **Vue.js**: Follow Vue.js style guide
- **CSS**: Use Tailwind CSS classes

### Testing

```bash
# Backend tests
cd backend1
python -m pytest

# Frontend tests
cd client
npm test

# Vue tests
cd vue-frontend
npm run test
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Bhashini API** for translation services
- **Guardian Engine** for privacy protection
- **MongoDB** for data persistence
- **React** and **Vue.js** communities

## 📞 Support

For support and questions:
- Create an issue in the GitHub repository
- Contact the development team
- Check the documentation in `/docs` folder

---

**PIISAFE** - Making AI communication safe, secure, and accessible for everyone.