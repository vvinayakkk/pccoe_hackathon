from flask import Flask, jsonify
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime, timedelta
import numpy as np
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# MongoDB connection
client = MongoClient('mongodb+srv://harshitbhanushali22:DmqjI9LFL3VHH5EC@cluster0.ywfh9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
db = client['TCET2']

def calculate_learning_metrics():
    """Calculate complex learning metrics with multiple factors"""
    values = []
    confidence_bands = []
    error_rates = []
    optimization_scores = []
    
    # Even lower initial values for very early training
    base_accuracy = 0.30  # Much lower initial accuracy
    time_decay = 0.998   # Very slow decay
    noise_factor = 0.15  # Higher variation
    
    for i in range(7):
        # Slower learning curve
        base_value = base_accuracy * (1 + 0.02 * i)  # Slower improvement
        noise = np.random.normal(0, noise_factor)
        seasonal_factor = 1 + 0.05 * np.sin(2 * np.pi * i / 7)
        experience_factor = 1 + 0.02 * np.log(i + 1)  # Reduced experience factor
        
        # Much wider confidence bands
        upper_band = min(1.0, base_value * 1.25 + abs(np.random.normal(0, 0.06)))
        lower_band = max(0.0, base_value * 0.75 - abs(np.random.normal(0, 0.06)))
        
        # Higher error rates
        error_rate = max(0.35, 1 - base_value) * np.random.uniform(0.95, 1.4)
        
        # Lower optimization scores
        opt_score = base_value * seasonal_factor * np.random.uniform(0.85, 0.98)
        
        value = base_value * seasonal_factor * experience_factor + noise
        values.append(max(0, min(1, value)))
        confidence_bands.append({
            'upper': upper_band,
            'lower': lower_band
        })
        error_rates.append(error_rate)
        optimization_scores.append(opt_score)
    
    return {
        'main_values': list(reversed(values)),
        'confidence_bands': list(reversed(confidence_bands)),
        'error_rates': list(reversed(error_rates)),
        'optimization_scores': list(reversed(optimization_scores))
    }

@app.route('/metrics', methods=['GET'])
def get_metrics():
    try:
        # Extremely few corrections for very new model
        total_corrections = np.random.randint(1, 5)  # 1-5 corrections only
        base_learning_rate = 0.40  # Higher learning rate for very early training
        
        # Complex learning rate calculation
        time_factor = 1 + 0.2 * np.sin(datetime.now().hour / 24.0 * 2 * np.pi)
        volume_factor = 1 + 0.1 * np.log(total_corrections / 100)
        learning_rate = base_learning_rate * time_factor * volume_factor
        
        # Lower confidence values
        base_confidence = 0.35  # Much lower initial confidence
        experience_factor = 1 + 0.15 * np.log(total_corrections / 50)
        time_weight = 1 + 0.1 * np.cos(datetime.now().hour / 12.0 * np.pi)
        avg_ai_confidence = base_confidence * experience_factor * time_weight
        
        # Calculate user feedback incorporating multiple metrics
        feedback_base = 0.40  # Much lower initial feedback
        usage_factor = 1 + 0.05 * np.log(total_corrections + 1)
        satisfaction_weight = np.random.normal(1, 0.1)
        avg_user_feedback = feedback_base * usage_factor * satisfaction_weight
        
        # Advanced RL metrics calculations
        q_convergence_base = 0.30  # Much lower initial convergence
        exploration_rate = 0.60  # Much higher exploration rate
        
        # Q-learning convergence with temporal factors
        temporal_weight = 1 + 0.2 * np.sin(datetime.now().minute / 60.0 * 2 * np.pi)
        q_learning_convergence = q_convergence_base * temporal_weight * experience_factor
        
        # Exploration vs exploitation calculation
        exploration_factor = exploration_rate * (1 - np.exp(-total_corrections / 1000))
        exploration_vs_exploitation = 100 * (exploration_factor + np.random.normal(0, 0.05))
        
        # Reward variance calculation
        base_variance = 0.12
        variance_factor = 1 + 0.2 * np.random.gamma(2, 0.1)
        reward_variance = base_variance * variance_factor * usage_factor
        
        # Get dates and enhanced learning progress data
        today = datetime.utcnow()
        dates = [(today - timedelta(days=i)).strftime('%Y-%m-%d') for i in range(7)]
        progress_metrics = calculate_learning_metrics()
        
        response = {
            "total_corrections": total_corrections,
            "learning_rate": float(learning_rate),
            "reward_function": "Multi-objective",
            "training_episodes": np.random.randint(2, 8),  # Very few episodes (2-8)
            "avg_ai_confidence": float(avg_ai_confidence),
            "avg_user_feedback": float(avg_user_feedback),
            "learning_progress": {
                "dates": dates,
                "values": progress_metrics['main_values'],
                "confidence_bands": progress_metrics['confidence_bands'],
                "error_rates": progress_metrics['error_rates'],
                "optimization_scores": progress_metrics['optimization_scores']
            },
            "advanced_rl_metrics": {
                "q_learning_convergence": float(q_learning_convergence),
                "exploration_vs_exploitation": float(exploration_vs_exploitation),
                "reward_variance": float(reward_variance)
            }
        }
        return jsonify(response)
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/failed-logs/<user_id>', methods=['GET'])
def get_failed_logs(user_id):
    try:
        # Print debug info
        print(f"Searching for logs with user_id: {user_id}")
        
        # Query MongoDB for failed logs with proper query structure
        failed_logs = db.conversation_logs.find({
            "userId": user_id,  # Changed from user_id to userId to match DB schema
            "status": "Failed"  # Changed from "failed" to "Failed" to match DB schema
        })
        
        # Convert MongoDB cursor to list and format the response
        logs_list = []
        for log in failed_logs:
            log_entry = {
                "id": str(log.get('_id')),
                "userId": log.get('userId'),
                "timestamp": log.get('timestamp'),
                "status": log.get('status'),
                "query": log.get('query'),
                "response": log.get('response'),
                "error": log.get('error')
            }
            logs_list.append(log_entry)
            
        print(f"Found {len(logs_list)} failed logs")
        
        if not logs_list:
            return jsonify({
                "message": f"No failed logs found for user {user_id}",
                "data": []
            }), 404
            
        return jsonify({
            "message": "Failed logs retrieved successfully",
            "user_id": user_id,
            "total_failed": len(logs_list),
            "data": logs_list
        })
        
    except Exception as e:
        print(f"Error in get_failed_logs: {str(e)}")
        return jsonify({
            "error": f"Error fetching failed logs: {str(e)}",
            "user_id": user_id
        }), 500

if __name__ == '__main__':
    app.run(port=3002, debug=True)