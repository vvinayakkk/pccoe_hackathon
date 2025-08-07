// MongoDB initialization script for PIISAFE
// This script runs when the MongoDB container starts for the first time

// Switch to the TCET2 database
db = db.getSiblingDB('TCET2');

// Create collections with proper indexes
db.createCollection('communications');
db.createCollection('users');
db.createCollection('performance_metrics');
db.createCollection('languages');
db.createCollection('notifications');

// Create indexes for better performance
db.communications.createIndex({ "timestamp": -1 });
db.communications.createIndex({ "user_id": 1 });
db.communications.createIndex({ "source_language": 1 });
db.communications.createIndex({ "target_language": 1 });
db.communications.createIndex({ "offline_mode_used": 1 });

db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "username": 1 });

db.performance_metrics.createIndex({ "timestamp": -1 });

db.languages.createIndex({ "language_code": 1 }, { unique: true });
db.languages.createIndex({ "is_active": 1 });

db.notifications.createIndex({ "user_id": 1 });
db.notifications.createIndex({ "timestamp": -1 });
db.notifications.createIndex({ "read": 1 });

// Insert initial performance metrics
db.performance_metrics.insertOne({
    accuracy_rate: 95.5,
    improvement_rate: 12.3,
    languages_supported: 22,
    user_correction_rate: 8.7,
    average_refinement_time: 2.3,
    timestamp: new Date()
});

// Insert supported languages
const languages = [
    { language_code: "en", language_name: "English", is_active: true, created_at: new Date() },
    { language_code: "hi", language_name: "Hindi", is_active: true, created_at: new Date() },
    { language_code: "bn", language_name: "Bengali", is_active: true, created_at: new Date() },
    { language_code: "ta", language_name: "Tamil", is_active: true, created_at: new Date() },
    { language_code: "te", language_name: "Telugu", is_active: true, created_at: new Date() },
    { language_code: "mr", language_name: "Marathi", is_active: true, created_at: new Date() },
    { language_code: "gu", language_name: "Gujarati", is_active: true, created_at: new Date() },
    { language_code: "kn", language_name: "Kannada", is_active: true, created_at: new Date() },
    { language_code: "ml", language_name: "Malayalam", is_active: true, created_at: new Date() },
    { language_code: "pa", language_name: "Punjabi", is_active: true, created_at: new Date() },
    { language_code: "ur", language_name: "Urdu", is_active: true, created_at: new Date() },
    { language_code: "as", language_name: "Assamese", is_active: true, created_at: new Date() },
    { language_code: "brx", language_name: "Bodo", is_active: true, created_at: new Date() },
    { language_code: "doi", language_name: "Dogri", is_active: true, created_at: new Date() },
    { language_code: "ks", language_name: "Kashmiri", is_active: true, created_at: new Date() },
    { language_code: "gom", language_name: "Konkani", is_active: true, created_at: new Date() },
    { language_code: "mai", language_name: "Maithili", is_active: true, created_at: new Date() },
    { language_code: "mni", language_name: "Manipuri", is_active: true, created_at: new Date() },
    { language_code: "ne", language_name: "Nepali", is_active: true, created_at: new Date() },
    { language_code: "or", language_name: "Odia", is_active: true, created_at: new Date() },
    { language_code: "sa", language_name: "Sanskrit", is_active: true, created_at: new Date() },
    { language_code: "sat", language_name: "Santali", is_active: true, created_at: new Date() },
    { language_code: "sd", language_name: "Sindhi", is_active: true, created_at: new Date() }
];

db.languages.insertMany(languages);

// Create admin user (optional)
db.users.insertOne({
    username: "admin",
    email: "admin@piisafe.com",
    preferred_languages: ["en", "hi"],
    created_at: new Date(),
    last_login: new Date(),
    role: "admin"
});

print("MongoDB initialization completed successfully!");
print("Database: TCET2");
print("Collections created: communications, users, performance_metrics, languages, notifications");
print("Indexes created for optimal performance");
print("Initial data inserted: performance metrics, languages, admin user");
