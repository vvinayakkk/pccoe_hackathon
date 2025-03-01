from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo import MongoClient
from bson.objectid import ObjectId
from datetime import datetime, timedelta
import os
import traceback

app = Flask(__name__)
CORS(app)

# MongoDB Connection
mongo_uri = os.environ.get('MONGO_URI', 'mongodb://localhost:27017/')
client = MongoClient(mongo_uri)
db = client['TCET2']\

def serialize_document(doc):
    """Convert ObjectId and datetime fields to JSON serializable format."""
    if '_id' in doc:
        doc['_id'] = str(doc['_id'])  # Convert _id to string
    if 'user_id' in doc and isinstance(doc['user_id'], ObjectId):
        doc['user_id'] = str(doc['user_id'])  # Convert user_id to string
    if 'timestamp' in doc and isinstance(doc['timestamp'], datetime):
        doc['timestamp'] = doc['timestamp'].isoformat()  # Convert datetime to ISO format
    return doc

@app.route('/api/dashboard/stats', methods=['GET'])
def get_dashboard_stats():
    """Get dashboard overview statistics"""
    try:
        # Get the latest performance metrics
        performance_metrics = db.performance_metrics.find_one(
            {}, sort=[('timestamp', -1)]
        )
        
        # Get count of offline sessions
        offline_sessions = db.communications.count_documents({
            'offline_mode_used': True,
            'timestamp': {'$gte': datetime.now() - timedelta(days=30)}
        })
        
        # Calculate percentage of offline usage
        total_communications = db.communications.count_documents({
            'timestamp': {'$gte': datetime.now() - timedelta(days=30)}
        })
        
        offline_percentage = 0
        if total_communications > 0:
            offline_percentage = round((offline_sessions / total_communications) * 100)
        
        # Get count of new languages added
        month_ago = datetime.now() - timedelta(days=30)
        new_languages = db.languages.count_documents({
            'created_at': {'$gte': month_ago}
        })
        
        return jsonify({
            'accuracy_rate': performance_metrics.get('accuracy_rate', 0),
            'improvement_rate': performance_metrics.get('improvement_rate', 0),
            'languages_supported': performance_metrics.get('languages_supported', 0),
            'user_correction_rate': performance_metrics.get('user_correction_rate', 0),
            'average_refinement_time': performance_metrics.get('average_refinement_time', 0),
            'offline_sessions': offline_sessions,
            'offline_percentage': offline_percentage,
            'new_languages_added': new_languages
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/dashboard/recent-communications', methods=['GET'])
def get_recent_communications():
    """Get recent communications for dashboard display"""
    try:
        limit = int(request.args.get('limit', 3))
        
        pipeline = [
            {'$sort': {'timestamp': -1}},
            {'$limit': limit},
            {'$project': {
                '_id': 0,  # Exclude original _id
                'id': {'$toString': '$_id'},  # Convert _id to string
                'type': 1,
                'original': '$original_text',
                'refined': '$refined_text',
                'timestamp': 1,
                'improvements': '$improvements_applied',
                'language': 1,
                'sourceLanguage': '$source_language',
                'targetLanguage': '$target_language',
                'confidence': '$ai_confidence_score'
            }}
        ]
        
        communications = list(db.communications.aggregate(pipeline))
        
        # Format timestamps to string
        now = datetime.now()
        for comm in communications:
            if isinstance(comm.get('timestamp'), datetime):
                comm_time = comm['timestamp']
                
                if now.date() == comm_time.date():
                    comm['timestamp'] = comm_time.strftime('%I:%M %p')
                elif now.date() - comm_time.date() == timedelta(days=1):
                    comm['timestamp'] = 'Yesterday'
                else:
                    comm['timestamp'] = comm_time.strftime('%b %d')
        
        return jsonify(communications)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/dashboard/context-suggestions', methods=['GET'])
def get_context_suggestions():
    """Get context-aware suggestions for the dashboard"""
    try:
        # Get top 3 suggestions ordered by confidence score
        suggestions_cursor = db.suggestions.find(
            {'status': 'pending'},
            {
                '_id': 1,  # Include _id (it will be converted later)
                'text': '$suggestion_text',
                'context': 1,
                'confidence': '$confidence_score'
            }
        ).sort('confidence_score', -1).limit(3)

        # Convert ObjectId to string using list comprehension
        suggestions = [serialize_document(doc) for doc in suggestions_cursor]

        return jsonify(suggestions)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/dashboard/language-distribution', methods=['GET'])
def get_language_distribution():
    """Get language distribution statistics"""
    try:
        # Aggregate language usage over the past month
        month_ago = datetime.now() - timedelta(days=30)
        
        pipeline = [
            {'$match': {'timestamp': {'$gte': month_ago}}},
            {'$group': {
                '_id': '$language',
                'count': {'$sum': 1}
            }},
            {'$sort': {'count': -1}},
            {'$limit': 10}
        ]
        
        language_counts = list(db.communications.aggregate(pipeline))
        
        # Calculate percentages
        total_count = sum(item['count'] for item in language_counts)
        
        languages_data = []
        other_languages_count = 0
        
        # Get top 5 for display
        for i, lang in enumerate(language_counts):
            if i < 5:
                percentage = round((lang['count'] / total_count) * 100)
                languages_data.append({
                    'language': lang['_id'],
                    'percentage': percentage
                })
            else:
                other_languages_count += 1
        
        return jsonify({
            'languages': languages_data,
            'otherLanguagesCount': other_languages_count
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/dashboard/offline-status', methods=['GET'])
def get_offline_status():
    """Get offline mode status information"""
    try:
        user_id = request.args.get('user_id')
        if not user_id:
            return jsonify({'error': 'User ID required'}), 400
            
        # Get user settings
        user_settings = db.settings.find_one({'user_id': ObjectId(user_id)})
        
        if not user_settings:
            return jsonify({'error': 'User settings not found'}), 404
            
        # Get last sync time
        last_sync = db.communications.find_one(
            {'user_id': ObjectId(user_id), 'offline_mode_used': True},
            sort=[('timestamp', -1)]
        )
        
        last_sync_time = None
        if last_sync and 'timestamp' in last_sync:
            # Calculate minutes since last sync
            time_diff = datetime.now() - last_sync['timestamp']
            last_sync_time = int(time_diff.total_seconds() / 60)
        
        return jsonify({
            'offline_mode_enabled': user_settings.get('offline_mode_enabled', False),
            'sync_frequency': user_settings.get('sync_frequency', 'Hourly'),
            'last_sync_minutes_ago': last_sync_time
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/dashboard/learning-progress', methods=['GET'])
def get_learning_progress():
    """Get AI learning progress metrics"""
    try:
        # Get language metrics
        languages = db.languages.find({})
        
        # Calculate averages
        voice_recognition_total = 0
        contextual_understanding_total = 0
        translation_precision_total = 0
        language_count = 0
        
        for lang in languages:
            voice_recognition_total += lang.get('voice_recognition_accuracy', 0)
            contextual_understanding_total += lang.get('contextual_understanding_score', 0)
            translation_precision_total += lang.get('translation_accuracy', 0)
            language_count += 1
        
        # Calculate weekly improvement
        week_ago = datetime.now() - timedelta(days=7)
        previous_week = datetime.now() - timedelta(days=14)
        
        # This week's metrics
        current_metrics = db.performance_metrics.find_one(
            {'timestamp': {'$gte': week_ago}},
            sort=[('timestamp', -1)]
        )
        
        # Last week's metrics
        previous_metrics = db.performance_metrics.find_one(
            {'timestamp': {'$gte': previous_week, '$lt': week_ago}},
            sort=[('timestamp', -1)]
        )
        
        # Calculate improvements
        voice_improvement = 0
        context_improvement = 0
        translation_improvement = 0
        
        if current_metrics and previous_metrics:
            # These calculations depend on how you store these metrics
            # This is a simplified example
            voice_improvement = round((current_metrics.get('voice_recognition_rate', 0) - 
                                       previous_metrics.get('voice_recognition_rate', 0)), 1)
            context_improvement = round((current_metrics.get('contextual_understanding_rate', 0) - 
                                         previous_metrics.get('contextual_understanding_rate', 0)), 1)
            translation_improvement = round((current_metrics.get('translation_accuracy_rate', 0) - 
                                            previous_metrics.get('translation_accuracy_rate', 0)), 1)
        
        # Prepare data
        if language_count > 0:
            return jsonify({
                'voice_pattern_recognition': {
                    'accuracy': round(voice_recognition_total / language_count, 1),
                    'improvement': voice_improvement
                },
                'contextual_understanding': {
                    'accuracy': round(contextual_understanding_total / language_count, 1),
                    'improvement': context_improvement
                },
                'translation_precision': {
                    'accuracy': round(translation_precision_total / language_count, 1),
                    'improvement': translation_improvement
                }
            })
        else:
            return jsonify({
                'voice_pattern_recognition': {'accuracy': 0, 'improvement': 0},
                'contextual_understanding': {'accuracy': 0, 'improvement': 0},
                'translation_precision': {'accuracy': 0, 'improvement': 0}
            })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/dashboard/sync', methods=['POST'])
def trigger_sync():
    """Trigger manual sync for offline data"""
    try:
        user_id = request.json.get('user_id')
        if not user_id:
            return jsonify({'error': 'User ID required'}), 400
            
        # In a real implementation, you would trigger an actual sync process
        # For this example, we'll just update the last sync timestamp
        
        db.settings.update_one(
            {'user_id': ObjectId(user_id)},
            {'$set': {'last_sync': datetime.now()}}
        )
        
        return jsonify({
            'success': True,
            'message': 'Sync triggered successfully',
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/dashboard/apply-suggestion', methods=['POST'])
def apply_suggestion():
    """Apply a suggestion from the dashboard"""
    try:
        suggestion_id = request.json.get('suggestion_id')
        if not suggestion_id:
            return jsonify({'error': 'Suggestion ID required'}), 400
            
        # Update suggestion status
        db.suggestions.update_one(
            {'_id': ObjectId(suggestion_id)},
            {
                '$set': {
                    'status': 'applied',
                    'applied_at': datetime.now()
                }
            }
        )
        
        return jsonify({
            'success': True,
            'message': 'Suggestion applied successfully'
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/user/profile', methods=['GET'])
def get_user_profile():
    """Get user profile information for dashboard header"""
    try:
        user_id = request.args.get('user_id')
        if not user_id:
            return jsonify({'error': 'User ID required'}), 400
            
        user = db.users.find_one(
            {'_id': ObjectId(user_id)},
            {
                'username': 1,
                'first_name': 1,
                'last_name': 1,
                'email': 1,
                'profile_picture_url': 1,
                'preferred_language': 1,
                'subscription_plan': 1
            }
        )
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
            
        # Convert ObjectId to string
        user['id'] = str(user['_id'])
        del user['_id']
        
        return jsonify(user)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@app.route('/api/notifications/recent', methods=['GET'])
def get_recent_notifications():
    """Get recent notifications for dashboard header"""
    try:
        user_id = request.args.get('user_id')
        if not user_id:
            return jsonify({'error': 'User ID required'}), 400
            
        limit = int(request.args.get('limit', 5))
        
        notifications = list(db.notifications.find(
            {'user_id': ObjectId(user_id), 'status': 'unread'},
            {
                'id': {'$toString': '$_id'},
                'message': 1,
                'type': 1,
                'timestamp': 1,
                'priority': 1,
                'action_required': 1
            }
        ).sort('timestamp', -1).limit(limit))
        
        # Format timestamps
        for notification in notifications:
            if 'timestamp' in notification and isinstance(notification['timestamp'], datetime):
                notification['timestamp'] = notification['timestamp'].isoformat()
        
        # Count total unread
        unread_count = db.notifications.count_documents({
            'user_id': ObjectId(user_id),
            'status': 'unread'
        })
        
        return jsonify({
            'notifications': notifications,
            'unread_count': unread_count
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/agents/performance', methods=['GET']) 
def get_agent_performance():
    """Get agent performance metrics"""
    try:
        # Get active agents with performance metrics
        agents_cursor = db.agents.find(
            {'status': 'active'},
            {
                'agent_name': 1,
                'total_tasks_completed': 1,
                'total_tasks_failed': 1,
                'average_processing_time': 1,
                'error_rate': 1,
                'user_rating': 1
            }
        ).sort('total_tasks_completed', -1)
        
        # Convert ObjectId to string
        agents = []
        for agent in agents_cursor:
            agent['_id'] = str(agent['_id'])  # Convert ObjectId to string
            agents.append(agent)

        return jsonify(agents)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

    
@app.route('/api/dashboard/feedback-summary', methods=['GET'])
def get_feedback_summary():
    """Get summary of user feedback"""
    try:
        # Calculate average rating
        pipeline = [
            {'$group': {
                '_id': None,
                'average_rating': {'$avg': '$rating'},
                'count': {'$sum': 1}
            }}
        ]
        
        rating_summary = list(db.feedback.aggregate(pipeline))
        avg_rating = rating_summary[0]['average_rating'] if rating_summary else 0
        feedback_count = rating_summary[0]['count'] if rating_summary else 0
        
        # Get recent trends (last 30 days)
        month_ago = datetime.now() - timedelta(days=30)
        pipeline = [
            {'$match': {'timestamp': {'$gte': month_ago}}},
            {'$group': {
                '_id': {'$dateToString': {'format': '%Y-%m-%d', 'date': '$timestamp'}},
                'average_rating': {'$avg': '$rating'},
                'count': {'$sum': 1}
            }},
            {'$sort': {'_id': 1}}
        ]
        
        daily_ratings = list(db.feedback.aggregate(pipeline))
        
        return jsonify({
            'average_rating': round(avg_rating, 1),
            'feedback_count': feedback_count,
            'daily_trends': daily_ratings
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@app.route('/api/dashboard/tasks-overview', methods=['GET'])
def get_tasks_overview():
    """Get overview of tasks in the system"""
    try:
        # Count tasks by status
        pipeline = [
            {'$group': {
                '_id': '$status',
                'count': {'$sum': 1}
            }}
        ]
        
        task_counts = list(db.tasks.aggregate(pipeline))
        
        # Format result as object
        result = {}
        for item in task_counts:
            result[item['_id']] = item['count']
            
        # Get high priority pending tasks
        high_priority_count = db.tasks.count_documents({
            'status': {'$in': ['pending', 'in_progress']},
            'priority': 'High'
        })
        
        result['high_priority_pending'] = high_priority_count
        
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@app.route('/api/user/usage-stats', methods=['GET'])
def get_user_usage_stats():
    """Get user usage statistics"""
    try:
        user_id = request.args.get('user_id')
        if not user_id:
            return jsonify({'error': 'User ID required'}), 400
            
        user = db.users.find_one({'_id': ObjectId(user_id)})
        if not user:
            return jsonify({'error': 'User not found'}), 404
            
        # Get usage metrics
        month_ago = datetime.now() - timedelta(days=30)
        
        voice_inputs = db.communications.count_documents({
            'user_id': ObjectId(user_id),
            'type': 'voice-to-text',
            'timestamp': {'$gte': month_ago}
        })
        
        translations = db.communications.count_documents({
            'user_id': ObjectId(user_id),
            'type': 'translation',
            'timestamp': {'$gte': month_ago}
        })
        
        suggestions_used = db.suggestions.count_documents({
            'user_id': ObjectId(user_id),
            'status': 'applied',
            'applied_at': {'$gte': month_ago}
        })
        
        return jsonify({
            'voice_inputs': voice_inputs,
            'translations': translations,
            'suggestions_used': suggestions_used,
            'total_corrections': user.get('total_corrections_made', 0),
            'usage_limit': 500 if user.get('subscription_plan') == 'Premium' else 100,
            'total_usage': voice_inputs + translations
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@app.route('/api/communications/history', methods=['GET'])
def get_communication_history():
    """Get paginated communication history with filtering"""
    try:
        user_id = request.args.get('user_id')
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 10))
        comm_type = request.args.get('type')

        # Build query
        query = {}
        if user_id:
            try:
                query['user_id'] = ObjectId(user_id)  # Convert to ObjectId
            except:
                return jsonify({'error': 'Invalid user_id format'}), 400

        if comm_type:
            query['type'] = comm_type

        # Pagination
        skip = (page - 1) * limit

        # Fetch data
        communications_cursor = db.communications.find(query).sort('timestamp', -1).skip(skip).limit(limit)
        
        # Convert cursor to list with proper serialization
        communications = [serialize_document(comm) for comm in communications_cursor]

        # Count total for pagination
        total = db.communications.count_documents(query)

        return jsonify({
            'communications': communications,
            'total': total,
            'page': page,
            'limit': limit,
            'pages': (total + limit - 1) // limit
        })
    except Exception as e:
        import traceback
        print("Error:", str(e))
        print(traceback.format_exc())  # Print full error details
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=6001)