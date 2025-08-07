# Anushka Microservices - PIISAFE Integration Services

A collection of specialized microservices for the PIISAFE platform, providing Gmail integration, task management, and advanced learning analytics capabilities.

## 🚀 Technology Stack

### Backend Services
- **Flask 3.0.2** with Python 3.11+
- **Flask-CORS 4.0.0** for cross-origin requests
- **python-dotenv 1.0.1** for environment management
- **composio 0.1.0** for Gmail API integration
- **PyMongo** for MongoDB integration
- **NumPy** for advanced analytics calculations

### Infrastructure
- **Docker** for containerization
- **MongoDB Atlas** for cloud database
- **Google OAuth2** for Gmail authentication

## 📁 Project Structure

```
anushka/
├── app.py              # Gmail API Authentication Service (Port: 3000)
├── app2.py             # Task Management Service (Port: 3001)
├── app3.py             # Learning Analytics Service (Port: 3002)
├── requirements.txt    # Python dependencies
├── Dockerfile         # Container configuration
├── .env.example       # Environment variables template
└── README.md          # This documentation
```

## 🛠️ Local Setup Instructions

### Prerequisites
- Python 3.11+
- MongoDB Atlas account
- Google Cloud Console project with Gmail API enabled
- Docker and Docker Compose (optional)

### Environment Setup

```bash
# Navigate to anushka directory
cd anushka

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env

# Edit environment variables
nano .env
```

### Individual Service Setup

#### 1. Gmail Authentication Service (app.py)

```bash
# Set environment variables
export GOOGLE_CLIENT_ID=your_google_client_id
export GOOGLE_CLIENT_SECRET=your_google_client_secret

# Run the service
python app.py

# Service will be available at http://localhost:3000
```

#### 2. Task Management Service (app2.py)

```bash
# Ensure MongoDB connection is configured
# Run the service
python app2.py

# Service will be available at http://localhost:3001
```

#### 3. Learning Analytics Service (app3.py)

```bash
# Run the service
python app3.py

# Service will be available at http://localhost:3002
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

Create a `.env` file in the anushka directory:

```bash
# .env.example
# Flask Configuration
FLASK_ENV=development
FLASK_DEBUG=1
SECRET_KEY=your-super-secret-key-change-this-in-production

# Google OAuth2 Configuration (for app.py)
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# MongoDB Configuration (for app2.py and app3.py)
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/
DATABASE_NAME=TCET2

# Composio API Configuration (for app.py)
COMPOSIO_API_KEY=your_composio_api_key_here

# Service URLs
GMAIL_AUTH_SERVICE_URL=http://localhost:3000
TASK_SERVICE_URL=http://localhost:3001
ANALYTICS_SERVICE_URL=http://localhost:3002

# Security
CORS_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:3002,http://localhost:5173

# Logging
LOG_LEVEL=INFO
LOG_FILE=anushka.log
```

## 🐳 Docker Configuration

### Dockerfile for Anushka Services

```dockerfile
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create non-root user for security
RUN useradd --create-home --shell /bin/bash app && \
    chown -R app:app /app
USER app

# Expose port (will be overridden by docker-compose)
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Run the application (will be overridden by docker-compose)
CMD ["python", "app.py"]
```

### Docker Compose Configuration

```yaml
version: '3.8'

services:
  # Gmail Authentication Service
  gmail-auth-service:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: anushka-gmail-auth
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - FLASK_ENV=development
      - FLASK_APP=app.py
      - FLASK_DEBUG=1
      - GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
      - GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
      - COMPOSIO_API_KEY=${COMPOSIO_API_KEY}
    volumes:
      - ./app.py:/app/app.py
      - /app/__pycache__
    networks:
      - anushka-network

  # Task Management Service
  task-service:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: anushka-task-service
    restart: unless-stopped
    ports:
      - "3001:3001"
    environment:
      - FLASK_ENV=development
      - FLASK_APP=app2.py
      - FLASK_DEBUG=1
      - MONGO_URI=${MONGO_URI}
    volumes:
      - ./app2.py:/app/app2.py
      - /app/__pycache__
    networks:
      - anushka-network

  # Learning Analytics Service
  analytics-service:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: anushka-analytics-service
    restart: unless-stopped
    ports:
      - "3002:3002"
    environment:
      - FLASK_ENV=development
      - FLASK_APP=app3.py
      - FLASK_DEBUG=1
      - MONGO_URI=${MONGO_URI}
    volumes:
      - ./app3.py:/app/app3.py
      - /app/__pycache__
    networks:
      - anushka-network

networks:
  anushka-network:
    driver: bridge
```

## 📡 API Usage Examples

### Gmail Authentication Service (app.py)

```bash
# Initialize Gmail integration
curl -X POST http://localhost:3000/api-auth \
  -H "Content-Type: application/json" \
  -d '{
    "api_key": "your_composio_api_key"
  }'

# Response
{
  "redirectUrl": "https://accounts.google.com/oauth/authorize?...",
  "connectedAccountId": "gmail_1"
}
```

### Task Management Service (app2.py)

```bash
# Get tasks for a user
curl -X GET "http://localhost:3001/tasks?user_id=507f1f77bcf86cd799439011"

# Response
[
  {
    "_id": "507f1f77bcf86cd799439012",
    "user_id": "507f1f77bcf86cd799439011",
    "agent_id": "507f1f77bcf86cd799439013",
    "title": "Translate document",
    "status": "pending",
    "created_at": "2024-01-15T10:30:00Z"
  }
]
```

### Learning Analytics Service (app3.py)

```bash
# Get learning metrics
curl -X GET http://localhost:3002/metrics

# Response
{
  "total_corrections": 3,
  "learning_rate": 0.42,
  "reward_function": "Multi-objective",
  "training_episodes": 5,
  "avg_ai_confidence": 0.38,
  "avg_user_feedback": 0.41,
  "learning_progress": {
    "dates": ["2024-01-15", "2024-01-14", "2024-01-13"],
    "values": [0.35, 0.32, 0.30],
    "confidence_bands": [...],
    "error_rates": [...],
    "optimization_scores": [...]
  },
  "advanced_rl_metrics": {
    "q_learning_convergence": 0.31,
    "exploration_vs_exploitation": 65.2,
    "reward_variance": 0.14
  }
}

# Get failed logs for a user
curl -X GET http://localhost:3002/failed-logs/user123

# Response
{
  "message": "Failed logs retrieved successfully",
  "user_id": "user123",
  "total_failed": 2,
  "data": [
    {
      "id": "507f1f77bcf86cd799439014",
      "userId": "user123",
      "timestamp": "2024-01-15T10:30:00Z",
      "status": "Failed",
      "query": "Translate this text",
      "response": null,
      "error": "Translation service unavailable"
    }
  ]
}
```

## 🚀 Deployment

### DockerHub Deployment

```bash
# Build and tag images
docker build -t your-username/anushka-gmail-auth:latest -f Dockerfile --target gmail-auth .
docker build -t your-username/anushka-task-service:latest -f Dockerfile --target task-service .
docker build -t your-username/anushka-analytics:latest -f Dockerfile --target analytics .

# Push to DockerHub
docker push your-username/anushka-gmail-auth:latest
docker push your-username/anushka-task-service:latest
docker push your-username/anushka-analytics:latest
```

### Render Deployment

1. **Gmail Auth Service**:
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python app.py`
   - **Environment Variables**: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `COMPOSIO_API_KEY`

2. **Task Service**:
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python app2.py`
   - **Environment Variables**: `MONGO_URI`

3. **Analytics Service**:
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python app3.py`
   - **Environment Variables**: `MONGO_URI`

### Heroku Deployment

```bash
# Create Heroku apps
heroku create anushka-gmail-auth
heroku create anushka-task-service
heroku create anushka-analytics

# Add MongoDB addon
heroku addons:create mongolab:sandbox --app anushka-task-service
heroku addons:create mongolab:sandbox --app anushka-analytics

# Deploy services
cd anushka
git init
git add .
git commit -m "Initial commit"

# Deploy Gmail Auth Service
heroku git:remote -a anushka-gmail-auth
git push heroku main

# Deploy Task Service
heroku git:remote -a anushka-task-service
git push heroku main

# Deploy Analytics Service
heroku git:remote -a anushka-analytics
git push heroku main
```

## 📊 Architecture Diagrams

### Microservices Architecture

```mermaid
graph TB
    subgraph "Frontend Layer"
        A[React App<br/>Port: 5173]
        B[Vue.js App<br/>Port: 3001]
    end
    
    subgraph "Anushka Microservices"
        C[Gmail Auth Service<br/>Port: 3000]
        D[Task Service<br/>Port: 3001]
        E[Analytics Service<br/>Port: 3002]
    end
    
    subgraph "External Services"
        F[Google OAuth2]
        G[Composio API]
        H[MongoDB Atlas]
    end
    
    subgraph "PIISAFE Core Services"
        I[Translation API<br/>Port: 5000]
        J[Dashboard API<br/>Port: 5001]
        K[Guardian Engine<br/>Port: 5002]
    end
    
    A --> C
    A --> D
    A --> E
    B --> D
    B --> E
    
    C --> F
    C --> G
    D --> H
    E --> H
    
    I --> D
    J --> E
    K --> E
```

### Service Communication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant G as Gmail Auth
    participant T as Task Service
    participant A as Analytics
    participant M as MongoDB
    participant C as Composio
    
    U->>F: Request Gmail integration
    F->>G: POST /api-auth
    G->>C: Create integration
    C->>G: Return redirect URL
    G->>F: Return auth URL
    F->>U: Redirect to Google OAuth
    
    U->>F: Complete OAuth
    F->>T: GET /tasks?user_id=123
    T->>M: Query tasks
    M->>T: Return tasks
    T->>F: Return task list
    
    F->>A: GET /metrics
    A->>M: Query analytics data
    M->>A: Return data
    A->>A: Calculate metrics
    A->>F: Return analytics
```

### Data Flow Architecture

```mermaid
graph LR
    subgraph "User Interface"
        A[React Dashboard]
        B[Vue.js Interface]
    end
    
    subgraph "Anushka Services"
        C[Gmail Auth]
        D[Task Manager]
        E[Analytics Engine]
    end
    
    subgraph "Data Layer"
        F[(MongoDB Atlas)]
        G[Google APIs]
        H[Composio Platform]
    end
    
    subgraph "External Integrations"
        I[Gmail API]
        J[OAuth2 Flow]
        K[Learning Metrics]
    end
    
    A --> C
    A --> D
    A --> E
    B --> D
    B --> E
    
    C --> G
    C --> H
    D --> F
    E --> F
    E --> K
    
    G --> I
    H --> J
```

### Database Schema

```mermaid
erDiagram
    TASKS {
        ObjectId _id
        ObjectId user_id
        ObjectId agent_id
        String title
        String description
        String status
        DateTime created_at
        DateTime updated_at
        String priority
        String category
    }
    
    CONVERSATION_LOGS {
        ObjectId _id
        String userId
        DateTime timestamp
        String status
        String query
        String response
        String error
        ObjectId task_id
    }
    
    LEARNING_METRICS {
        ObjectId _id
        String user_id
        Number total_corrections
        Number learning_rate
        Number avg_ai_confidence
        Number avg_user_feedback
        DateTime timestamp
        Object task_id
    }
    
    GMAIL_INTEGRATIONS {
        ObjectId _id
        String user_id
        String connected_account_id
        String integration_id
        DateTime created_at
        String status
        Object auth_config
    }
    
    TASKS ||--o{ CONVERSATION_LOGS : "generates"
    TASKS ||--o{ LEARNING_METRICS : "tracks"
    GMAIL_INTEGRATIONS ||--o{ TASKS : "supports"
```

### Service Dependencies

```mermaid
graph TD
    subgraph "Core Services"
        A[Gmail Auth Service<br/>app.py]
        B[Task Service<br/>app2.py]
        C[Analytics Service<br/>app3.py]
    end
    
    subgraph "Dependencies"
        D[Flask Framework]
        E[Composio SDK]
        F[PyMongo]
        G[NumPy]
        H[python-dotenv]
    end
    
    subgraph "External APIs"
        I[Google OAuth2]
        J[Gmail API]
        K[MongoDB Atlas]
        L[Composio Platform]
    end
    
    A --> D
    A --> E
    A --> H
    A --> I
    A --> J
    A --> L
    
    B --> D
    B --> F
    B --> H
    B --> K
    
    C --> D
    C --> F
    C --> G
    C --> H
    C --> K
```

### Authentication Flow

```mermaid
stateDiagram-v2
    [*] --> Unauthenticated
    Unauthenticated --> InitiateAuth: User requests Gmail integration
    InitiateAuth --> OAuthRedirect: Create Composio integration
    OAuthRedirect --> GoogleAuth: Redirect to Google OAuth
    GoogleAuth --> AuthCallback: User authorizes
    AuthCallback --> Connected: Store integration details
    Connected --> Authenticated: Integration complete
    Authenticated --> TaskManagement: Access task features
    Authenticated --> Analytics: View learning metrics
    TaskManagement --> Authenticated: Continue using
    Analytics --> Authenticated: Continue using
    Authenticated --> Unauthenticated: Logout/Revoke
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
- **Flask**: Use Flask best practices
- **API Design**: Follow RESTful conventions
- **Error Handling**: Implement proper exception handling

### Testing

```bash
# Install test dependencies
pip install pytest pytest-flask

# Run tests
pytest tests/

# Run with coverage
pytest --cov=app tests/
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Composio** for Gmail integration capabilities
- **Google Cloud** for OAuth2 and Gmail APIs
- **MongoDB Atlas** for cloud database services
- **Flask** community for the web framework

## 📞 Support

For support and questions:
- Create an issue in the GitHub repository
- Contact the development team
- Check the documentation in `/docs` folder

---

**Anushka Microservices** - Powering PIISAFE with specialized integration and analytics capabilities.
