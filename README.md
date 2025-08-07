# PIISAFE - Privacy-Preserving AI Communication Platform

A comprehensive fullstack web application that provides secure, privacy-preserving communication with AI assistance, featuring multi-language translation, offline capabilities, comprehensive dashboard analytics, and advanced privacy protection through PII detection and anonymization.


<img width="1024" height="1024" alt="image" src="https://github.com/user-attachments/assets/7b6a0853-67aa-4dae-80e8-4607ccf49fa6" />


## 🎯 Problem Statement

**Solving Challenges in AI Communication via Technology**

The modern digital landscape faces critical challenges in AI-assisted communication:

- **Privacy Concerns**: Sensitive personal information (PII) is often exposed during AI interactions
- **Language Barriers**: Limited access to AI services in regional languages
- **Data Security**: Lack of robust privacy protection mechanisms in AI communication platforms
- **User Experience**: Complex interfaces that don't prioritize privacy and accessibility
- **Offline Accessibility**: Limited functionality when internet connectivity is poor

PIISAFE addresses these challenges by providing a secure, multilingual AI communication platform with built-in privacy protection, real-time translation, and comprehensive analytics.

## ✨ Features

### 🔒 Privacy & Security
- **PII Detection & Anonymization**: Real-time detection and masking of sensitive information
- **Guardian Engine Integration**: Advanced privacy protection using Microsoft Presidio
- **Secure Communication**: End-to-end encryption for all data transmissions
- **Privacy Dashboard**: Comprehensive analytics on data protection metrics

### 🌐 Multi-Language Support
- **Real-time Translation**: Support for 22+ Indian languages via Bhashini API
- **Offline Capabilities**: Basic translation features without internet connectivity
- **Language Analytics**: Track usage patterns and translation accuracy
- **Regional Language Support**: Native support for Hindi, Marathi, Gujarati, and more

### 📊 Analytics & Dashboard
- **Communication Analytics**: Track translation usage and patterns
- **Performance Metrics**: Monitor system performance and user engagement
- **Learning Analytics**: AI-powered insights into communication patterns
- **Real-time Monitoring**: Live dashboard with key performance indicators

### 🎨 User Experience
- **Modern UI/UX**: React-based responsive interface with Tailwind CSS
- **File Management**: Vue.js powered file browser with advanced features
- **Mobile Responsive**: Optimized for all device sizes
- **Accessibility**: WCAG compliant design for inclusive access

### 🔧 Technical Features
- **Microservices Architecture**: Scalable, maintainable service-oriented design
- **Docker Containerization**: Easy deployment and scaling
- **MongoDB Integration**: Robust data persistence and analytics
- **API-First Design**: RESTful APIs for seamless integration

## 🛠️ Technology Stack

### Frontend Technologies
- **React 19** with Vite - Main application interface
- **Vue.js 3** with TypeScript - File management interface
- **Tailwind CSS 4.0** - Modern styling framework
- **Framer Motion** - Smooth animations and transitions
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client for API communication
- **Recharts** - Data visualization components
- **Three.js** - 3D graphics and visualizations

### Backend Technologies
- **Flask 3.0** - Python web framework for APIs
- **Flask-CORS** - Cross-origin resource sharing
- **PyMongo** - MongoDB Python driver
- **python-dotenv** - Environment variable management
- **Composio** - API integration framework

### Infrastructure & DevOps
- **Docker & Docker Compose** - Containerization and orchestration
- **MongoDB 7.0** - NoSQL database
- **Nginx** - Reverse proxy and load balancer
- **Redis** - Caching layer
- **Node.js 18+** - JavaScript runtime

### External Services
- **Bhashini API** - Government translation services
- **Google OAuth** - Authentication services
- **Microsoft Presidio** - PII detection and anonymization

## 📁 Project Structure

```
pccoe_hackathon/
├── client/                 # React frontend (Port: 3000)
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/        # Page components
│   │   └── styles/       # CSS styles
│   ├── package.json
│   └── vite.config.js
├── vue-frontend/          # Vue.js file browser (Port: 3001)
│   ├── src/
│   │   ├── components/   # Vue components
│   │   ├── views/        # Vue pages
│   │   └── stores/       # Pinia stores
│   └── package.json
├── backend1/              # Translation API (Port: 5000)
│   ├── app.py            # Flask translation API
│   └── requirements.txt
├── backend2/              # Dashboard & Analytics API (Port: 5001)
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
├── nginx/                # Nginx configuration
└── docker-compose.yml    # Multi-service orchestration
```

## 🚀 Setup Instructions

### Method 1: Manual Setup (Bash Script)

```bash
#!/bin/bash
# setup.sh - Manual setup script

echo "🚀 Setting up PIISAFE Platform..."

# Clone repository (if not already done)
# git clone <repository-url>
# cd pccoe_hackathon

# Install Node.js dependencies
echo "📦 Installing React dependencies..."
cd client
npm install
cd ..

echo "📦 Installing Vue.js dependencies..."
cd vue-frontend
npm install
cd ..

# Install Python dependencies
echo "🐍 Installing Python dependencies..."
cd backend1
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cd ..

cd backend2
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cd ..

cd anushka
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cd ..

# Setup environment variables
echo "🔧 Setting up environment variables..."
cp env.example .env
# Edit .env with your configuration

# Start MongoDB (if not using Docker)
echo "🗄️ Starting MongoDB..."
# mongod --dbpath ./data/db &

# Start services
echo "🚀 Starting all services..."

# Start backend services
cd backend1
python app.py &
cd ../backend2
python dashboard.py &
cd ../anushka
python app.py &
python app2.py &
python app3.py &
cd ..

# Start frontend services
cd client
npm run dev &
cd ../vue-frontend
npm run dev &

echo "✅ PIISAFE Platform is running!"
echo "🌐 React App: http://localhost:3000"
echo "📁 Vue App: http://localhost:3001"
echo "🔧 Translation API: http://localhost:5000"
echo "📊 Dashboard API: http://localhost:5001"
```

### Method 2: Docker Compose Setup

```bash
# Prerequisites
# - Docker and Docker Compose installed
# - Git repository cloned

# Clone and navigate to project
git clone <repository-url>
cd pccoe_hackathon

# Create environment file
cp env.example .env
# Edit .env with your configuration

# Build and start all services
docker-compose up --build

# Start in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Clean up volumes (if needed)
docker-compose down -v
```

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```bash
# API Configuration
REACT_APP_API_URL=http://localhost:5000
REACT_APP_DASHBOARD_API_URL=http://localhost:5001
REACT_APP_GUARDIAN_API_URL=http://localhost:5002
VUE_APP_API_URL=http://localhost:5002

# Database Configuration
MONGO_URI=mongodb://admin:password123@localhost:27017/
DATABASE_NAME=TCET2

# Translation API (backend1)
AUTHORIZATION_TOKEN=your_bhashini_token
DEFAULT_SERVICE_ID=ai4bharat/indictrans--gpu-t4
BHASHINI_API_URL=https://dhruva-api.bhashini.gov.in

# Security
SECRET_KEY=your_secret_key_here
JWT_SECRET=your_jwt_secret_here

# Google OAuth (anushka services)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
COMPOSIO_API_KEY=your_composio_api_key

# Flask Configuration
FLASK_ENV=development
FLASK_DEBUG=1
```

## 📊 Architecture Diagrams

### 1. System Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        A[React App<br/>Port: 3000]
        B[Vue.js App<br/>Port: 3001]
        C[Mobile App]
    end
    
    subgraph "Load Balancer"
        D[Nginx<br/>Port: 80/443]
    end
    
    subgraph "API Gateway Layer"
        E[API Gateway]
    end
    
    subgraph "Microservices Layer"
        F[Translation API<br/>Port: 5000]
        G[Dashboard API<br/>Port: 5001]
        H[Guardian Engine<br/>Port: 5002]
        I[Gmail Auth Service<br/>Port: 3000]
        J[Task Management<br/>Port: 3001]
        K[Learning Analytics<br/>Port: 3002]
    end
    
    subgraph "Data Layer"
        L[(MongoDB<br/>Port: 27017)]
        M[(Redis Cache<br/>Port: 6379)]
        N[File Storage]
    end
    
    subgraph "External Services"
        O[Bhashini API]
        P[Google OAuth]
        Q[Microsoft Presidio]
    end
    
    A --> D
    B --> D
    C --> D
    D --> E
    E --> F
    E --> G
    E --> H
    E --> I
    E --> J
    E --> K
    
    F --> L
    G --> L
    H --> L
    I --> L
    J --> L
    K --> L
    
    F --> M
    G --> M
    
    F --> O
    I --> P
    H --> Q
```

### 2. API Flow (Frontend → Backend)

```mermaid
sequenceDiagram
    participant U as User
    participant R as React App
    participant V as Vue App
    participant N as Nginx
    participant T as Translation API
    participant D as Dashboard API
    participant G as Guardian Engine
    participant B as Bhashini API
    participant M as MongoDB
    
    U->>R: Enter text for translation
    R->>N: POST /api/translate
    N->>T: Forward request
    T->>G: Check for PII
    G->>T: Return sanitized text
    T->>B: Request translation
    B->>T: Return translated text
    T->>M: Store communication
    T->>N: Return response
    N->>R: Display result
    
    U->>V: Upload file
    V->>N: POST /api/files
    N->>G: Process file for PII
    G->>V: Return processed file
    V->>M: Store file metadata
    
    U->>R: View dashboard
    R->>N: GET /api/dashboard/stats
    N->>D: Forward request
    D->>M: Query analytics
    M->>D: Return data
    D->>N: Return response
    N->>R: Display dashboard
```

### 3. User Authentication State Machine

```mermaid
stateDiagram-v2
    [*] --> Unauthenticated
    
    Unauthenticated --> Login: User clicks login
    Login --> Validating: Submit credentials
    Validating --> Authenticated: Valid credentials
    Validating --> Login: Invalid credentials
    Validating --> Error: Network error
    
    Authenticated --> Dashboard: Redirect after login
    Authenticated --> Translation: Navigate to translation
    Authenticated --> FileManager: Navigate to files
    Authenticated --> Settings: Navigate to settings
    
    Dashboard --> Authenticated: Stay logged in
    Translation --> Authenticated: Stay logged in
    FileManager --> Authenticated: Stay logged in
    Settings --> Authenticated: Stay logged in
    
    Authenticated --> Profile: View profile
    Profile --> Authenticated: Return to previous
    
    Authenticated --> Logout: User clicks logout
    Logout --> Unauthenticated: Clear session
    
    Error --> Login: Retry login
    Error --> Unauthenticated: Return to start
```

### 4. Database ER Diagram

```mermaid
erDiagram
    USERS {
        ObjectId _id PK
        String username
        String email
        String password_hash
        Array preferred_languages
        ObjectId profile_id FK
        DateTime created_at
        DateTime last_login
        Boolean is_active
        String role
    }
    
    USER_PROFILES {
        ObjectId _id PK
        String full_name
        String avatar_url
        String phone_number
        String timezone
        ObjectId user_id FK
        DateTime updated_at
    }
    
    COMMUNICATIONS {
        ObjectId _id PK
        String original_text
        String translated_text
        String source_language
        String target_language
        Number confidence_score
        Array pii_detected
        Array improvements_applied
        Boolean offline_mode_used
        ObjectId user_id FK
        DateTime timestamp
        String session_id
    }
    
    FILES {
        ObjectId _id PK
        String filename
        String file_path
        String file_type
        Number file_size
        String checksum
        Array pii_detected
        String processed_content
        ObjectId user_id FK
        DateTime uploaded_at
        DateTime processed_at
    }
    
    ANALYTICS {
        ObjectId _id PK
        String metric_name
        Number metric_value
        String metric_unit
        ObjectId user_id FK
        DateTime timestamp
        String category
    }
    
    TASKS {
        ObjectId _id PK
        String title
        String description
        String status
        String priority
        ObjectId assigned_to FK
        ObjectId created_by FK
        DateTime due_date
        DateTime created_at
        DateTime updated_at
    }
    
    LEARNING_SESSIONS {
        ObjectId _id PK
        ObjectId user_id FK
        String session_type
        Number duration_minutes
        Number accuracy_score
        Array exercises_completed
        DateTime started_at
        DateTime completed_at
    }
    
    USERS ||--o{ USER_PROFILES : "has"
    USERS ||--o{ COMMUNICATIONS : "creates"
    USERS ||--o{ FILES : "uploads"
    USERS ||--o{ ANALYTICS : "generates"
    USERS ||--o{ TASKS : "assigned"
    USERS ||--o{ LEARNING_SESSIONS : "participates"
```

### 5. Deployment Flow (Local/Dev/Prod)

```mermaid
graph TD
    subgraph "Development Environment"
        A[Local Development]
        B[Code Changes]
        C[Local Testing]
        D[Git Commit]
    end
    
    subgraph "Staging Environment"
        E[Git Push to Dev Branch]
        F[Automated Tests]
        G[Staging Deployment]
        H[Integration Testing]
    end
    
    subgraph "Production Environment"
        I[Git Push to Main Branch]
        J[Production Tests]
        K[Blue-Green Deployment]
        L[Production Monitoring]
    end
    
    subgraph "Infrastructure"
        M[Docker Build]
        N[Container Registry]
        O[Load Balancer]
        P[Auto Scaling]
    end
    
    A --> B
    B --> C
    C --> D
    D --> E
    E --> F
    F --> G
    G --> H
    H --> I
    I --> J
    J --> K
    K --> L
    
    E --> M
    M --> N
    N --> G
    G --> O
    O --> P
```

### 6. Microservice Communication

```mermaid
graph LR
    subgraph "API Gateway"
        A[Gateway Service]
    end
    
    subgraph "Core Services"
        B[Translation Service]
        C[Dashboard Service]
        D[Guardian Service]
    end
    
    subgraph "Integration Services"
        E[Gmail Auth Service]
        F[Task Management Service]
        G[Learning Analytics Service]
    end
    
    subgraph "External APIs"
        H[Bhashini API]
        I[Google OAuth]
        J[Microsoft Presidio]
    end
    
    subgraph "Data Stores"
        K[(MongoDB)]
        L[(Redis Cache)]
        M[File Storage]
    end
    
    A --> B
    A --> C
    A --> D
    A --> E
    A --> F
    A --> G
    
    B --> H
    B --> K
    B --> L
    
    C --> K
    C --> L
    
    D --> J
    D --> K
    
    E --> I
    E --> K
    
    F --> K
    F --> L
    
    G --> K
    G --> L
    
    B -.->|Event| C
    C -.->|Event| G
    D -.->|Event| C
```

### 7. CI/CD Pipeline Overview

```mermaid
graph TD
    subgraph "Source Control"
        A[Git Repository]
        B[Feature Branch]
        C[Pull Request]
    end
    
    subgraph "CI Pipeline"
        D[Code Push]
        E[Lint & Format]
        F[Unit Tests]
        G[Integration Tests]
        H[Security Scan]
        I[Build Docker Images]
    end
    
    subgraph "CD Pipeline"
        J[Deploy to Staging]
        K[Automated Testing]
        L[Manual Review]
        M[Deploy to Production]
        N[Health Checks]
        O[Rollback if needed]
    end
    
    subgraph "Monitoring"
        P[Application Monitoring]
        Q[Infrastructure Monitoring]
        R[Error Tracking]
        S[Performance Metrics]
    end
    
    A --> B
    B --> C
    C --> D
    D --> E
    E --> F
    F --> G
    G --> H
    H --> I
    I --> J
    J --> K
    K --> L
    L --> M
    M --> N
    N --> O
    
    M --> P
    M --> Q
    P --> R
    Q --> S
```

## 🚀 Quick Start

### Using Docker Compose (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd pccoe_hackathon

# Copy environment file
cp env.example .env

# Edit environment variables
nano .env

# Start all services
docker-compose up --build

# Access the application
# React App: http://localhost:3000
# Vue App: http://localhost:3001
# API Docs: http://localhost:5000/docs
```

### Manual Setup

```bash
# Install dependencies
cd client && npm install && cd ..
cd vue-frontend && npm install && cd ..
cd backend1 && pip install -r requirements.txt && cd ..
cd backend2 && pip install -r requirements.txt && cd ..
cd anushka && pip install -r requirements.txt && cd ..

# Start services
# Terminal 1: React app
cd client && npm run dev

# Terminal 2: Vue app
cd vue-frontend && npm run dev

# Terminal 3: Translation API
cd backend1 && python app.py

# Terminal 4: Dashboard API
cd backend2 && python dashboard.py

# Terminal 5: Microservices
cd anushka && python app.py
cd anushka && python app2.py
cd anushka && python app3.py
```

## 📡 API Documentation

### Translation API Endpoints

```bash
# Translate text
POST /api/translate
{
  "source_language": "en",
  "target_language": "hi",
  "text": "Hello, how are you?",
  "service_id": "ai4bharat/indictrans--gpu-t4"
}

# Get supported languages
GET /api/languages

# Get translation history
GET /api/translations/history?page=1&limit=10
```

### Dashboard API Endpoints

```bash
# Get dashboard statistics
GET /api/dashboard/stats

# Get recent communications
GET /api/dashboard/recent-communications?limit=5

# Get language distribution
GET /api/dashboard/language-distribution

# Get user profile
GET /api/user/profile
```

### Guardian Engine Endpoints

```bash
# Analyze text for PII
POST /api/analyze
{
  "text": "My name is John Doe and my email is john@example.com"
}

# Anonymize text
POST /api/anonymize
{
  "text": "Contact John Doe at john@example.com",
  "entities": ["PERSON", "EMAIL"]
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and commit: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines

- Follow PEP 8 for Python code
- Use ESLint and Prettier for JavaScript/React
- Follow Vue.js style guide for Vue components
- Write comprehensive tests for new features
- Update documentation for API changes

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Bhashini API** for translation services
- **Microsoft Presidio** for privacy protection
- **MongoDB** for data persistence
- **React** and **Vue.js** communities
- **Tailwind CSS** for styling framework

## 📞 Support

For support and questions:
- Create an issue in the GitHub repository
- Contact the development team
- Check the documentation in `/docs` folder

---

**PIISAFE** - Making AI communication safe, secure, and accessible for everyone. 🚀
