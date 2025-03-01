# Communication AI Dashboard - Flask API Setup

## Setup Instructions

1. **Install dependencies**

```bash
pip install flask flask-cors pymongo python-dotenv
```

2. **Environment Variables**

Create a `.env` file in your project root with the following variables:

```
MONGO_URI=mongodb://username:password@hostname:port/communication_ai_db
FLASK_ENV=development
```

3. **Run the server**

```bash
flask run
```

## API Endpoints

The following endpoints are available to power your Communication AI Dashboard:

### Dashboard Stats
- **URL**: `/api/dashboard/stats`
- **Method**: GET
- **Description**: Returns performance metrics and statistics for the dashboard

### Recent Communications
- **URL**: `/api/dashboard/recent-communications`
- **Method**: GET
- **Parameters**: `limit` (optional, default=3)
- **Description**: Returns recent communications with their original and refined text

### Context Suggestions
- **URL**: `/api/dashboard/context-suggestions`
- **Method**: GET
- **Description**: Returns smart suggestions based on communication context

### Language Distribution
- **URL**: `/api/dashboard/language-distribution`
- **Method**: GET
- **Description**: Returns language usage distribution statistics

### Offline Status
- **URL**: `/api/dashboard/offline-status`
- **Method**: GET
- **Parameters**: `user_id` (required)
- **Description**: Returns offline mode status and last sync time

### Learning Progress
- **URL**: `/api/dashboard/learning-progress`
- **Method**: GET
- **Description**: Returns AI learning progress metrics

### Trigger Sync
- **URL**: `/api/dashboard/sync`
- **Method**: POST
- **Body**: `{ "user_id": "user_id_here" }`
- **Description**: Triggers manual sync for offline data

### Apply Suggestion
- **URL**: `/api/dashboard/apply-suggestion`
- **Method**: POST
- **Body**: `{ "suggestion_id": "suggestion_id_here" }`
- **Description**: Applies a smart suggestion

## Integration with React Dashboard

Update your React components to fetch data from these endpoints. Example:

```javascript
// In your React component
useEffect(() => {
  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/dashboard/stats');
      const data = await response.json();
      setPerformanceMetrics(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };
  
  fetchStats();
}, []);
```

## Error Handling

All endpoints include proper error handling and will return appropriate status codes with error messages when issues occur.