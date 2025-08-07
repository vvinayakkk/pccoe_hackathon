# PIISAFE Deployment Guide

This guide covers deployment options for the PIISAFE application across different platforms and environments.

## 🚀 Quick Start with Docker

### Prerequisites
- Docker and Docker Compose installed
- At least 4GB RAM available
- 10GB free disk space

### Local Development Deployment

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
# Main App: http://localhost
# File Browser: http://localhost/filebrowser
# API Health: http://localhost/health
```

### Production Deployment

```bash
# Set production environment
export FLASK_ENV=production
export FLASK_DEBUG=0

# Build and start with production settings
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f
```

## ☁️ Cloud Deployment Options

### 1. DockerHub + VPS Deployment

#### Build and Push Images

```bash
# Login to DockerHub
docker login

# Build images
docker build -t your-username/piisafe-backend1:latest ./backend1
docker build -t your-username/piisafe-backend2:latest ./backend2
docker build -t your-username/piisafe-react:latest ./client
docker build -t your-username/piisafe-vue:latest ./vue-frontend

# Push to DockerHub
docker push your-username/piisafe-backend1:latest
docker push your-username/piisafe-backend2:latest
docker push your-username/piisafe-react:latest
docker push your-username/piisafe-vue:latest
```

#### VPS Setup

```bash
# On your VPS
sudo apt update
sudo apt install docker.io docker-compose

# Clone repository
git clone <repository-url>
cd pccoe_hackathon

# Create production docker-compose
cat > docker-compose.prod.yml << EOF
version: '3.8'
services:
  translation-api:
    image: your-username/piisafe-backend1:latest
    environment:
      - FLASK_ENV=production
      - MONGO_URI=mongodb://admin:password123@mongodb:27017/
  
  dashboard-api:
    image: your-username/piisafe-backend2:latest
    environment:
      - FLASK_ENV=production
      - MONGO_URI=mongodb://admin:password123@mongodb:27017/
  
  react-frontend:
    image: your-username/piisafe-react:latest
  
  vue-frontend:
    image: your-username/piisafe-vue:latest
EOF

# Start services
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### 2. Render Deployment

#### Backend Services

1. **Connect GitHub Repository**
2. **Create New Web Service**
3. **Configure Settings:**
   - **Name**: `piisafe-translation-api`
   - **Environment**: `Python`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python app.py`
   - **Root Directory**: `backend1`

4. **Environment Variables:**
   ```
   FLASK_ENV=production
   MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/
   AUTHORIZATION_TOKEN=your_token
   ```

5. **Repeat for Dashboard API** (backend2)

#### Frontend Services

1. **Create Static Site**
2. **Configure Settings:**
   - **Name**: `piisafe-react`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
   - **Root Directory**: `client`

3. **Environment Variables:**
   ```
   REACT_APP_API_URL=https://piisafe-translation-api.onrender.com
   REACT_APP_DASHBOARD_API_URL=https://piisafe-dashboard-api.onrender.com
   ```

### 3. Heroku Deployment

#### Backend Deployment

```bash
# Install Heroku CLI
curl https://cli-assets.heroku.com/install.sh | sh

# Login to Heroku
heroku login

# Create apps
heroku create piisafe-translation-api
heroku create piisafe-dashboard-api

# Add MongoDB addon
heroku addons:create mongolab:sandbox --app piisafe-translation-api
heroku addons:create mongolab:sandbox --app piisafe-dashboard-api

# Deploy backend1
cd backend1
git init
git add .
git commit -m "Initial commit"
heroku git:remote -a piisafe-translation-api
git push heroku main

# Deploy backend2
cd ../backend2
git init
git add .
git commit -m "Initial commit"
heroku git:remote -a piisafe-dashboard-api
git push heroku main

# Set environment variables
heroku config:set FLASK_ENV=production --app piisafe-translation-api
heroku config:set AUTHORIZATION_TOKEN=your_token --app piisafe-translation-api
```

#### Frontend Deployment

```bash
# Create React app
heroku create piisafe-react --buildpack mars/create-react-app

# Deploy React app
cd client
git init
git add .
git commit -m "Initial commit"
heroku git:remote -a piisafe-react
git push heroku main

# Set environment variables
heroku config:set REACT_APP_API_URL=https://piisafe-translation-api.herokuapp.com --app piisafe-react
```

### 4. AWS Deployment

#### ECS (Elastic Container Service)

```yaml
# task-definition.json
{
  "family": "piisafe",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "1024",
  "memory": "2048",
  "executionRoleArn": "arn:aws:iam::account:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "translation-api",
      "image": "your-username/piisafe-backend1:latest",
      "portMappings": [{"containerPort": 5000}],
      "environment": [
        {"name": "FLASK_ENV", "value": "production"},
        {"name": "MONGO_URI", "value": "mongodb://..."}
      ]
    },
    {
      "name": "react-frontend",
      "image": "your-username/piisafe-react:latest",
      "portMappings": [{"containerPort": 80}]
    }
  ]
}
```

#### EKS (Elastic Kubernetes Service)

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: piisafe-translation-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: translation-api
  template:
    metadata:
      labels:
        app: translation-api
    spec:
      containers:
      - name: translation-api
        image: your-username/piisafe-backend1:latest
        ports:
        - containerPort: 5000
        env:
        - name: FLASK_ENV
          value: "production"
        - name: MONGO_URI
          valueFrom:
            secretKeyRef:
              name: mongo-secret
              key: uri
```

### 5. Google Cloud Platform

#### Cloud Run

```bash
# Build and deploy to Cloud Run
gcloud builds submit --tag gcr.io/PROJECT_ID/piisafe-backend1
gcloud run deploy piisafe-translation-api \
  --image gcr.io/PROJECT_ID/piisafe-backend1 \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars FLASK_ENV=production
```

#### GKE (Google Kubernetes Engine)

```bash
# Create cluster
gcloud container clusters create piisafe-cluster \
  --num-nodes=3 \
  --zone=us-central1-a

# Deploy application
kubectl apply -f k8s/
```

## 🔧 Environment Configuration

### Development Environment

```bash
# .env.development
FLASK_ENV=development
FLASK_DEBUG=1
MONGO_URI=mongodb://localhost:27017/
REACT_APP_API_URL=http://localhost:5000
DEBUG_MODE=true
```

### Staging Environment

```bash
# .env.staging
FLASK_ENV=staging
FLASK_DEBUG=0
MONGO_URI=mongodb+srv://staging:pass@cluster.mongodb.net/
REACT_APP_API_URL=https://staging-api.piisafe.com
DEBUG_MODE=false
```

### Production Environment

```bash
# .env.production
FLASK_ENV=production
FLASK_DEBUG=0
MONGO_URI=mongodb+srv://prod:pass@cluster.mongodb.net/
REACT_APP_API_URL=https://api.piisafe.com
DEBUG_MODE=false
ENABLE_METRICS=true
```

## 📊 Monitoring and Logging

### Application Monitoring

```bash
# Install monitoring tools
docker-compose -f docker-compose.yml -f docker-compose.monitoring.yml up -d

# Access monitoring dashboards
# Prometheus: http://localhost:9090
# Grafana: http://localhost:3000
# Jaeger: http://localhost:16686
```

### Log Aggregation

```bash
# ELK Stack
docker-compose -f docker-compose.yml -f docker-compose.logging.yml up -d

# Access Kibana
# http://localhost:5601
```

## 🔒 Security Configuration

### SSL/TLS Setup

```bash
# Generate SSL certificates
mkdir -p nginx/ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/key.pem \
  -out nginx/ssl/cert.pem

# Update nginx configuration
# Uncomment HTTPS server block in nginx/nginx.conf
```

### Firewall Configuration

```bash
# UFW (Ubuntu)
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# iptables (CentOS/RHEL)
sudo iptables -A INPUT -p tcp --dport 80 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 443 -j ACCEPT
sudo service iptables save
```

## 🚀 Performance Optimization

### Database Optimization

```javascript
// MongoDB indexes
db.communications.createIndex({ "timestamp": -1 });
db.communications.createIndex({ "user_id": 1, "timestamp": -1 });
db.users.createIndex({ "email": 1 }, { unique: true });
```

### Caching Strategy

```bash
# Redis configuration
docker run -d --name redis-cache \
  -p 6379:6379 \
  redis:7-alpine \
  redis-server --appendonly yes
```

### CDN Setup

```bash
# Cloudflare configuration
# 1. Add domain to Cloudflare
# 2. Update DNS records
# 3. Enable CDN and caching
# 4. Configure SSL/TLS
```

## 📈 Scaling Strategies

### Horizontal Scaling

```yaml
# docker-compose.scale.yml
version: '3.8'
services:
  translation-api:
    deploy:
      replicas: 3
    environment:
      - FLASK_ENV=production
  
  dashboard-api:
    deploy:
      replicas: 2
    environment:
      - FLASK_ENV=production
```

### Load Balancing

```nginx
# nginx load balancer configuration
upstream backend {
    server backend1:5000;
    server backend2:5000;
    server backend3:5000;
}

server {
    location /api/ {
        proxy_pass http://backend;
    }
}
```

## 🔄 CI/CD Pipeline

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Build and push Docker images
      run: |
        docker build -t your-username/piisafe-backend1:${{ github.sha }} ./backend1
        docker push your-username/piisafe-backend1:${{ github.sha }}
    
    - name: Deploy to production
      run: |
        ssh user@server "cd /app && docker-compose pull && docker-compose up -d"
```

### GitLab CI

```yaml
# .gitlab-ci.yml
stages:
  - test
  - build
  - deploy

test:
  stage: test
  script:
    - cd backend1 && python -m pytest
    - cd client && npm test

build:
  stage: build
  script:
    - docker build -t $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA .
    - docker push $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA

deploy:
  stage: deploy
  script:
    - kubectl set image deployment/piisafe $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA
```

## 🆘 Troubleshooting

### Common Issues

1. **Port Conflicts**
   ```bash
   # Check port usage
   netstat -tulpn | grep :5000
   
   # Kill process using port
   sudo kill -9 $(lsof -t -i:5000)
   ```

2. **Database Connection Issues**
   ```bash
   # Test MongoDB connection
   docker exec -it piisafe-mongodb mongosh
   
   # Check logs
   docker-compose logs mongodb
   ```

3. **Memory Issues**
   ```bash
   # Check memory usage
   docker stats
   
   # Increase memory limits
   docker-compose down
   docker system prune -a
   ```

### Health Checks

```bash
# Check all services
curl http://localhost/health

# Check individual services
curl http://localhost/health/translation
curl http://localhost/health/dashboard
curl http://localhost/health/react
curl http://localhost/health/vue
```

## 📞 Support

For deployment issues:
1. Check the logs: `docker-compose logs -f`
2. Verify environment variables: `docker-compose config`
3. Test individual services: `docker-compose exec service-name bash`
4. Create an issue in the GitHub repository

---

**Happy Deploying! 🚀**
