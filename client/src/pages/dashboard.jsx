import React, { useState, useEffect } from 'react';
import { Bell, MessageSquare, Mic, Settings, User, BarChart2, Globe, Zap, Layers, Clock, ChevronRight, Edit3, Check } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Header from '../components/header';
import axios from 'axios';

const CommunicationAIDashboard = () => {
  const [activeSuggestion, setActiveSuggestion] = useState(null);
  const [recentCommunications, setRecentCommunications] = useState([]); // Initialize as an empty array
  const [performanceMetrics, setPerformanceMetrics] = useState({});
  const [contextSuggestions, setContextSuggestions] = useState([]);
  const [recentLanguages, setRecentLanguages] = useState([]);
  const [offlineStatus, setOfflineStatus] = useState({});
  const [learningProgress, setLearningProgress] = useState({});

  const formatNumber = (value) => {
    if (value === undefined || value === null) {
      return 0;
    }
    const numValue = Number(value);
    if (isNaN(numValue)) {
      return 0;
    }
    if (Number.isInteger(numValue)) {
      return numValue;
    }
    return numValue.toFixed(4);
  };

  // Fetch data from Flask backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsResponse = await axios.get('http://127.0.0.1:6001/api/dashboard/stats');
        setPerformanceMetrics(statsResponse.data);

        const commsResponse = await axios.get('http://127.0.0.1:6001/api/dashboard/recent-communications');
        setRecentCommunications(Array.isArray(commsResponse.data) ? commsResponse.data : []); // Ensure data is an array

        const suggestionsResponse = await axios.get('http://127.0.0.1:6001/api/dashboard/context-suggestions');
        setContextSuggestions(Array.isArray(suggestionsResponse.data) ? suggestionsResponse.data : []);

        const languagesResponse = await axios.get('http://127.0.0.1:6001/api/dashboard/language-distribution');
        setRecentLanguages(Array.isArray(languagesResponse.data.languages) ? languagesResponse.data.languages : []);

        const offlineResponse = await axios.get(`http://127.0.0.1:6001/api/dashboard/offline-status?user_id=67b7a32acc78837076f0a7d6`); // Replace USER_ID
        setOfflineStatus(offlineResponse.data || {});

        const progressResponse = await axios.get('http://127.0.0.1:6001/api/dashboard/learning-progress');
        setLearningProgress(progressResponse.data || {});
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <Header />

        <div className="p-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-5 gap-6 mb-6">
            <div className="bg-white rounded-xl shadow-sm p-4 border">
              <div className="text-sm text-gray-500 mb-1">Accuracy Rate</div>
              <div className="text-2xl font-bold">{formatNumber(performanceMetrics.accuracy_rate)}%</div>
              <div className="mt-2 text-xs text-green-600">
                +{formatNumber(performanceMetrics.improvement_rate)}% this month
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4 border">
              <div className="text-sm text-gray-500 mb-1">Languages</div>
              <div className="text-2xl font-bold">{performanceMetrics.languages_supported}</div>
              <div className="mt-2 text-xs text-blue-600">
                {performanceMetrics.new_languages_added} new languages added
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4 border">
              <div className="text-sm text-gray-500 mb-1">User Corrections</div>
              <div className="text-2xl font-bold">{formatNumber(performanceMetrics.user_correction_rate)}%</div>
              <div className="mt-2 text-xs text-green-600">
                Down 2.3% from last week
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4 border">
              <div className="text-sm text-gray-500 mb-1">Avg. Refinement</div>
              <div className="text-2xl font-bold">{formatNumber(performanceMetrics.average_refinement_time)}s</div>
              <div className="mt-2 text-xs text-orange-600">
                Faster on mobile devices
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4 border">
              <div className="text-sm text-gray-500 mb-1">Offline Sessions</div>
              <div className="text-2xl font-bold">{performanceMetrics.offline_sessions}</div>
              <div className="mt-2 text-xs text-purple-600">
                {formatNumber(performanceMetrics.offline_percentage)}% of total usage
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-3 gap-6">
            {/* Recent Communications */}
            <div className="col-span-2 bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="p-4 border-b bg-gradient-to-r from-indigo-600 to-blue-500 text-white">
                <h2 className="text-lg font-medium">Recent Communications</h2>
              </div>
              <div className="divide-y">
                {recentCommunications.map(comm => (
                  <div key={comm.id} className="p-4">
                    <div className="flex justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {comm.type === 'voice-to-text' ? (
                          <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">Voice Refined</span>
                        ) : (
                          <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full">Translated</span>
                        )}
                        <span className="text-sm text-gray-500">{comm.timestamp}</span>
                      </div>

                      <div className="flex gap-2">
                        <button className="p-1 text-gray-400 hover:text-gray-600">
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-gray-600">
                          <MessageSquare className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="mb-2">
                      <div className="flex items-start gap-2 mb-2">
                        <div className="bg-gray-100 p-2 rounded-lg text-sm text-gray-700 flex-1">
                          "{comm.original}"
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <div className="bg-indigo-50 p-2 rounded-lg text-sm text-indigo-800 flex-1">
                          "{comm.refined}"
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4 text-xs text-gray-500">
                      {comm.type === 'voice-to-text' && (
                        <div>{comm.improvements} improvements applied</div>
                      )}
                      {comm.type === 'translation' && (
                        <div>{comm.sourceLanguage} → {comm.targetLanguage}</div>
                      )}
                      <div>AI confidence: {formatNumber(comm.confidence)}%</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 border-t bg-gray-50 text-center">
                <button className="text-indigo-600 text-sm font-medium">
                  View All Communications
                </button>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Context-Aware Suggestions */}
              <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="p-4 border-b">
                  <h2 className="text-lg font-medium">Smart Suggestions</h2>
                </div>
                <div className="p-4 space-y-3">
                  {contextSuggestions.map(suggestion => (
                    <div
                      key={suggestion.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        activeSuggestion === suggestion.id
                          ? 'bg-indigo-50 border-indigo-200'
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setActiveSuggestion(
                        activeSuggestion === suggestion.id ? null : suggestion.id
                      )}
                    >
                      <div className="flex justify-between items-center">
                        <div className="font-medium">{suggestion.text}</div>
                        <div className={`p-1 rounded-full ${
                          activeSuggestion === suggestion.id
                            ? 'bg-indigo-100 text-indigo-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}>
                          <ChevronRight className="h-4 w-4" />
                        </div>
                      </div>
                      <div className="flex justify-between mt-2 text-xs">
                        <span className="text-gray-500">Context: {suggestion.context}</span>
                        <span className="text-green-600">{formatNumber(suggestion.confidence)}% match</span>
                      </div>

                      {activeSuggestion === suggestion.id && (
                        <div className="mt-3 pt-3 border-t flex gap-2">
                          <button className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg flex-1">
                            Apply Suggestion
                          </button>
                          <button className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-lg">
                            Edit First
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Language Distribution */}
              <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="p-4 border-b">
                  <h2 className="text-lg font-medium">Language Distribution</h2>
                </div>
                <div className="p-4">
                  {recentLanguages.map(item => (
                    <div key={item.language} className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span>{item.language}</span>
                        <span className="font-medium">{formatNumber(item.percentage)}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 rounded-full"
                          style={{ width: `${formatNumber(item.percentage)}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                  <div className="mt-4 text-sm text-center text-gray-500">
                    {performanceMetrics.otherLanguagesCount} other languages detected this month
                  </div>
                </div>
              </div>

              {/* Offline Mode Status */}
              <div className="bg-white rounded-xl shadow-sm border p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">Offline Mode</div>
                    <div className="text-sm text-gray-500">Last sync: {offlineStatus.last_sync_minutes_ago} minutes ago</div>
                  </div>
                  <div className="w-12 h-6 bg-green-100 rounded-full p-1 flex items-center">
                    <div className="w-4 h-4 bg-green-600 rounded-full ml-auto"></div>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-gray-500">
                    <Clock className="h-4 w-4" />
                    <span>Auto-sync every {offlineStatus.sync_frequency}</span>
                  </div>
                  <button className="text-indigo-600 font-medium">Sync Now</button>
                </div>
              </div>
            </div>
          </div>

          {/* Learning Progress Overview */}
          <div className="mt-6 bg-white rounded-xl shadow-sm border p-5">
            <h2 className="text-lg font-medium mb-4">AI Learning Progress</h2>
            <div className="grid grid-cols-3 gap-6">
              <div className="space-y-4">
                <div className="font-medium">Voice Pattern Recognition</div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-3 bg-indigo-600 rounded-full" style={{ width: `${formatNumber(learningProgress.voice_pattern_recognition?.accuracy || 0)}%` }}></div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">{formatNumber(learningProgress.voice_pattern_recognition?.accuracy || 0)}% accuracy</span>
                  <span className="text-green-600">+{formatNumber(learningProgress.voice_pattern_recognition?.improvement || 0)}% this week</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="font-medium">Contextual Understanding</div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-3 bg-indigo-600 rounded-full" style={{ width: `${formatNumber(learningProgress.contextual_understanding?.accuracy || 0)}%` }}></div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">{formatNumber(learningProgress.contextual_understanding?.accuracy || 0)}% accuracy</span>
                  <span className="text-green-600">+{formatNumber(learningProgress.contextual_understanding?.improvement || 0)}% this week</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="font-medium">Translation Precision</div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-3 bg-indigo-600 rounded-full" style={{ width: `${formatNumber(learningProgress.translation_precision?.accuracy || 0)}%` }}></div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">{formatNumber(learningProgress.translation_precision?.accuracy || 0)}% accuracy</span>
                  <span className="text-green-600">+{formatNumber(learningProgress.translation_precision?.improvement || 0)}% this week</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunicationAIDashboard;

