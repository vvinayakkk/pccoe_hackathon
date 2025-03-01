// import React, { useState, useEffect } from 'react';
// import Sidebar from '../components/Sidebar';
// import axios from 'axios';
// import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from 'recharts';
// import { motion } from 'framer-motion';

// const AgentLearningDashboard = () => {
//   const [activeTab, setActiveTab] = useState('overview');
//   const [selectedAgent, setSelectedAgent] = useState('all');
//   const [metrics, setMetrics] = useState({
//     total_corrections: 0,
//     learning_rate: 0,
//     reward_function: '',
//     training_episodes: 0,
//     avg_ai_confidence: 0,
//     avg_user_feedback: 0,
//     learning_progress: {
//       dates: [],
//       values: [],
//       confidence_bands: [],
//       error_rates: [],
//       optimization_scores: []
//     },
//     advanced_rl_metrics: {
//       q_learning_convergence: 0,
//       exploration_vs_exploitation: 0,
//       reward_variance: 0
//     }
//   });
//   const userId = import.meta.env.VITE_USER_ID;
//   // Fetch metrics from Flask backend
//   useEffect(() => {
//     const fetchMetrics = async () => {
//       try {
//         console.log('Fetching metrics...'); // Debug log
//         const response = await axios.get('http://localhost:3002/metrics');
//         console.log('Received response:', response.data); // Debug log
//         setMetrics(response.data);
//       } catch (error) {
//         console.error('Error fetching metrics:', error);
//         // Add user-friendly error handling
//         setMetrics({
//           ...metrics,
//           error: 'Failed to load metrics data. Please try again later.'
//         });
//       }
//     };

//     fetchMetrics();
//   }, []);

//   // Sample agent performance data
//   const agentPerformance = {
//     'docs': { accuracy: 89, improvement: 5.2, corrections: 18, total: 145 },
//     'email': { accuracy: 93, improvement: 3.8, corrections: 12, total: 187 },
//     'calendar': { accuracy: 96, improvement: 1.2, corrections: 8, total: 203 },
//     'whatsapp': { accuracy: 82, improvement: 8.5, corrections: 24, total: 132 },
//     'analytics': { accuracy: 91, improvement: 4.1, corrections: 15, total: 167 }
//   };
  
//   // Sample learning logs
//   const learningLogs = [
//     {
//       id: 1,
//       timestamp: "2024-02-20 23:45:12",
//       agent: "email",
//       originalAction: "Sent email with subject 'Project Update' to entire team",
//       userCorrection: "Send only to project managers, not entire team",
//       learningOutcome: "Refined audience selection based on email context",
//       improvement: "+4.6%"
//     },
//     {
//       id: 2,
//       timestamp: "2024-02-21 00:52:38",
//       agent: "docs",
//       originalAction: "Created standard meeting notes template",
//       userCorrection: "Added action items section and owner assignment",
//       learningOutcome: "Enhanced document templates with accountability features",
//       improvement: "+3.2%"
//     },
//     {
//       id: 3,
//       timestamp: "2024-02-21 02:17:05",
//       agent: "whatsapp",
//       originalAction: "Sent reminder to all team members",
//       userCorrection: "Only send to those who haven't responded yet",
//       learningOutcome: "Improved follow-up targeting logic",
//       improvement: "+5.7%"
//     },
//     {
//       id: 4,
//       timestamp: "2024-02-21 03:03:22",
//       agent: "calendar",
//       originalAction: "Scheduled meeting for 1 hour",
//       userCorrection: "Schedule for 30 minutes with 5 min buffer",
//       learningOutcome: "Adopted user's meeting duration preferences",
//       improvement: "+2.1%"
//     }
//   ];
  
//   // Sample model performance data for chart - more realistic initial training progress
//   const modelProgress = [
//     { date: 'Feb 20 10:00', accuracy: 45 },
//     { date: 'Feb 20 14:00', accuracy: 58 },
//     { date: 'Feb 20 18:00', accuracy: 67 },
//     { date: 'Feb 20 22:00', accuracy: 75 },
//     { date: 'Feb 21 02:00', accuracy: 82 },
//     { date: 'Feb 21 06:00', accuracy: 86 },
//     { date: 'Feb 21 10:00', accuracy: 89 }
//   ];
  
//   // Helper to filter logs by selected agent
//   const filteredLogs = selectedAgent === 'all' 
//     ? learningLogs 
//     : learningLogs.filter(log => log.agent === selectedAgent);

//   const formatChartData = (metrics) => {
//     console.log('Received metrics:', metrics); // Debug log

//     // Ensure metrics has the required structure
//     if (!metrics?.learning_progress) {
//       console.log('No learning_progress data');
//       return [];
//     }

//     const {
//       dates = [],
//       values = [],
//       confidence_bands = [],
//       error_rates = [],
//       optimization_scores = []
//     } = metrics.learning_progress;

//     console.log('Processing data:', { 
//       datesLength: dates.length,
//       valuesLength: values.length,
//       confidenceBandsLength: confidence_bands.length,
//       errorRatesLength: error_rates.length,
//       optimizationScoresLength: optimization_scores.length
//     });

//     return dates.map((date, index) => ({
//       date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
//       accuracy: values[index] ? values[index] * 100 : 85 + Math.random() * 10,
//       upperBound: confidence_bands[index]?.upper ? confidence_bands[index].upper * 100 : 95 + Math.random() * 3,
//       lowerBound: confidence_bands[index]?.lower ? confidence_bands[index].lower * 100 : 75 + Math.random() * 5,
//       errorRate: error_rates[index] ? error_rates[index] * 100 : 15 + Math.random() * 5,
//       optimizationScore: optimization_scores[index] ? optimization_scores[index] * 100 : 80 + Math.random() * 15
//     }));
//   };

//   const LearningProgressChart = () => {
//     console.log('Current metrics state:', metrics); // Debug log
//     const chartData = formatChartData(metrics);
//     console.log('Formatted chart data:', chartData); // Debug log

//     if (!metrics?.learning_progress?.dates?.length) {
//       return (
//         <div className="border rounded-lg p-5 mb-6">
//           <h3 className="font-medium mb-4">Learning Progress Over Time</h3>
//           <div className="h-96 flex items-center justify-center text-gray-500">
//             Loading data...
//           </div>
//         </div>
//       );
//     }

//     return (
//       <div className="border rounded-lg p-5 mb-6">
//         <h3 className="font-medium mb-4">Learning Progress Over Time</h3>
//         <div className="h-96">
//           <ResponsiveContainer width="100%" height="100%">
//             <AreaChart
//               data={chartData}
//               margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
//             >
//               <CartesianGrid strokeDasharray="3 3" />
//               <XAxis dataKey="date" />
//               <YAxis />
//               <Tooltip 
//                 content={({ active, payload, label }) => {
//                   if (active && payload && payload.length) {
//                     return (
//                       <div className="bg-white border rounded-lg shadow-lg p-3">
//                         <p className="font-medium">{label}</p>
//                         {payload.map((entry, index) => (
//                           <div key={index} className="flex items-center gap-2">
//                             <div
//                               className="w-3 h-3 rounded-full"
//                               style={{ backgroundColor: entry.color }}
//                             />
//                             <span className="text-sm">
//                               {entry.name}: {entry.value.toFixed(2)}%
//                             </span>
//                           </div>
//                         ))}
//                       </div>
//                     );
//                   }
//                   return null;
//                 }}
//               />
//               <Legend />
              
//               {/* Confidence Band */}
//               <Area
//                 type="monotone"
//                 dataKey="upperBound"
//                 stroke="none"
//                 fill="#8884d8"
//                 fillOpacity={0.1}
//               />
//               <Area
//                 type="monotone"
//                 dataKey="lowerBound"
//                 stroke="none"
//                 fill="#8884d8"
//                 fillOpacity={0.1}
//               />
              
//               {/* Main Accuracy Line */}
//               <Area
//                 type="monotone"
//                 dataKey="accuracy"
//                 stroke="#8884d8"
//                 fill="#8884d8"
//                 fillOpacity={0.3}
//                 strokeWidth={2}
//               />
              
//               {/* Error Rate */}
//               <Area
//                 type="monotone"
//                 dataKey="errorRate"
//                 stroke="#ff7300"
//                 fill="#ff7300"
//                 fillOpacity={0.3}
//               />
              
//               {/* Optimization Score */}
//               <Area
//                 type="monotone"
//                 dataKey="optimizationScore"
//                 stroke="#82ca9d"
//                 fill="#82ca9d"
//                 fillOpacity={0.3}
//               />
//             </AreaChart>
//           </ResponsiveContainer>
//         </div>
//         <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
//           <div className="p-3 bg-indigo-50 rounded-lg">
//             <div className="font-medium text-indigo-800">Confidence Band</div>
//             <div className="text-indigo-600">Shows prediction uncertainty</div>
//           </div>
//           <div className="p-3 bg-orange-50 rounded-lg">
//             <div className="font-medium text-orange-800">Error Rate</div>
//             <div className="text-orange-600">Inverse of accuracy trend</div>
//           </div>
//           <div className="p-3 bg-green-50 rounded-lg">
//             <div className="font-medium text-green-800">Optimization Score</div>
//             <div className="text-green-600">Model efficiency metric</div>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   const NeuralNetworkVisualization = () => {
//     const layers = [
//       { nodes: 5, type: 'input' },
//       { nodes: 7, type: 'hidden' },
//       { nodes: 7, type: 'hidden' },
//       { nodes: 4, type: 'output' }
//     ];

//     return (
//       <div className="h-96 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 flex items-center justify-center overflow-hidden">
//         <div className="flex space-x-32 relative"> {/* Increased spacing */}
//           {layers.map((layer, layerIndex) => (
//             <div key={layerIndex} className="flex flex-col items-center justify-center space-y-10"> {/* Increased spacing */}
//               {Array.from({ length: layer.nodes }).map((_, nodeIndex) => (
//                 <div key={nodeIndex} className="relative">
//                   <motion.div
//                     className={`w-6 h-6 rounded-full ${
//                       layer.type === 'input' ? 'bg-blue-500' :
//                       layer.type === 'output' ? 'bg-indigo-600' :
//                       'bg-purple-500'
//                     } shadow-lg z-10 relative`}
//                     initial={{ scale: 0.8, opacity: 0.5 }}
//                     animate={{ 
//                       scale: [0.8, 1, 0.8],
//                       opacity: [0.5, 1, 0.5]
//                     }}
//                     transition={{
//                       duration: 2,
//                       repeat: Infinity,
//                       delay: nodeIndex * 0.1 + layerIndex * 0.2
//                     }}
//                   />
                  
//                   {/* Create connections to next layer */}
//                   {layerIndex < layers.length - 1 && (
//                     <div className="absolute top-1/2 left-1/2">
//                       {Array.from({ length: layers[layerIndex + 1].nodes }).map((_, targetIndex) => {
//                         const angle = Math.atan2(
//                           (targetIndex - nodeIndex) * 40,
//                           128 // Increased for more visibility
//                         );
                        
//                         return (
//                           <motion.div
//                             key={`${layerIndex}-${nodeIndex}-${targetIndex}`}
//                             className="absolute"
//                             style={{
//                               width: '130px', // Increased length
//                               height: '2px', // Increased thickness
//                               left: '0',
//                               top: '0',
//                               transformOrigin: '0 0',
//                               transform: `rotate(${angle}rad)`,
//                               background: 'linear-gradient(90deg, rgba(129, 140, 248, 0.5), rgba(99, 102, 241, 0.5))',
//                               boxShadow: '0 0 8px rgba(129, 140, 248, 0.3)',
//                               zIndex: 5
//                             }}
//                             initial={{ opacity: 0, scale: 0 }}
//                             animate={{
//                               opacity: [0.3, 0.6, 0.3],
//                               scale: 1,
//                             }}
//                             transition={{
//                               duration: 2,
//                               repeat: Infinity,
//                               delay: (nodeIndex + targetIndex) * 0.1
//                             }}
//                           >
//                             {/* Animated particle */}
//                             <motion.div
//                               className="absolute h-3 w-3 bg-indigo-500 rounded-full shadow-lg"
//                               style={{
//                                 boxShadow: '0 0 10px rgba(99, 102, 241, 0.5)'
//                               }}
//                               animate={{
//                                 left: ['0%', '100%'],
//                                 opacity: [0, 1, 0]
//                               }}
//                               transition={{
//                                 duration: 1.5,
//                                 repeat: Infinity,
//                                 delay: (nodeIndex + targetIndex) * 0.1,
//                                 ease: "easeInOut"
//                               }}
//                             />
//                           </motion.div>
//                         );
//                       })}
//                     </div>
//                   )}
//                 </div>
//               ))}
//             </div>
//           ))}
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div className="flex h-screen bg-gray-50">
//       <Sidebar />
//       <div className="flex-1 overflow-y-auto">
//         <div className="w-full max-w-5xl p-4 mx-auto">
//           <div className="flex justify-between items-center mb-6">
//             <h2 className="text-xl font-bold">Agent Learning Dashboard</h2>
//             <div className="flex gap-2">
//               <select 
//                 value={selectedAgent} 
//                 onChange={(e) => setSelectedAgent(e.target.value)}
//                 className="border rounded-lg px-3 py-1.5"
//               >
//                 <option value="all">All Agents</option>
//                 <option value="docs">Docs Agent</option>
//                 <option value="email">Email Agent</option>
//                 <option value="calendar">Calendar Agent</option>
//                 <option value="whatsapp">WhatsApp Agent</option>
//                 <option value="analytics">Analytics Agent</option>
//               </select>
//               <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg">
//                 Download Report
//               </button>
//             </div>
//           </div>
          
//           {/* Tabs */}
//           <div className="flex border-b mb-6">
//             <button 
//               onClick={() => setActiveTab('overview')}
//               className={`px-4 py-2 font-medium ${activeTab === 'overview' 
//                 ? 'border-b-2 border-indigo-600 text-indigo-600' 
//                 : 'text-gray-600'}`}
//             >
//               Learning Overview
//             </button>
//             <button 
//               onClick={() => setActiveTab('logs')}
//               className={`px-4 py-2 font-medium ${activeTab === 'logs' 
//                 ? 'border-b-2 border-indigo-600 text-indigo-600' 
//                 : 'text-gray-600'}`}
//             >
//               Correction Logs
//             </button>
//             <button 
//               onClick={() => setActiveTab('insights')}
//               className={`px-4 py-2 font-medium ${activeTab === 'insights' 
//                 ? 'border-b-2 border-indigo-600 text-indigo-600' 
//                 : 'text-gray-600'}`}
//             >
//               Learning Insights
//             </button>
//           </div>
          
//           {/* Last Training Card */}
//           <div className="bg-gradient-to-r from-indigo-700 to-purple-700 text-white rounded-lg p-5 mb-6">
//             <div className="flex justify-between items-center">
//               <div>
//                 <div className="text-sm opacity-80">Last Reinforcement Learning Cycle</div>
//                 <div className="text-xl font-bold mb-2">Today · 10:15 AM</div>
//                 <div className="text-sm opacity-90">
//                   {selectedAgent === 'all' 
//                     ? 'Training started 24 hours ago - 4.3% improvement in last cycle'
//                     : `${selectedAgent.charAt(0).toUpperCase() + selectedAgent.slice(1)} agent improved by ${agentPerformance[selectedAgent]?.improvement}%`
//                   }
//                 </div>
//               </div>
//               <div className="bg-white bg-opacity-20 rounded-lg p-3 text-center">
//                 <div className="text-3xl font-bold mb-1">
//                   {selectedAgent === 'all' 
//                     ? '91%' 
//                     : `${agentPerformance[selectedAgent]?.accuracy}%`
//                   }
//                 </div>
//                 <div className="text-xs opacity-80">Current Accuracy</div>
//               </div>
//             </div>
            
//             {/* Mini visualization of improvement */}
//             <div className="mt-4">
//               <div className="flex justify-between text-xs opacity-80 mb-1">
//                 <span>Previous State</span>
//                 <span>Current State</span>
//               </div>
//               <div className="relative h-3 bg-white bg-opacity-20 rounded-full">
//                 <div className="absolute left-0 top-0 h-3 bg-green-300 rounded-full" style={{width: `${
//                     selectedAgent === 'all' ? '87%' : `${agentPerformance[selectedAgent]?.accuracy - agentPerformance[selectedAgent]?.improvement}%`
//                   }`}}>
//                 </div>
//                 <div className="absolute left-0 top-0 h-3 bg-white rounded-full" style={{width: `${
//                     selectedAgent === 'all' ? '91%' : `${agentPerformance[selectedAgent]?.accuracy}%`
//                   }`}}>
//                 </div>
//               </div>
//             </div>
//           </div>
          
//           {metrics.error ? (
//             <div className="text-red-500 p-4 text-center">
//               {metrics.error}
//             </div>
//           ) : (
//             <>
//               {activeTab === 'overview' && (
//                 <>
//                   {/* Stats Cards */}
//                   <div className="grid grid-cols-4 gap-4 mb-6">
//                     <div className="bg-white border rounded-lg p-4 shadow-sm">
//                       <div className="text-gray-500 text-sm mb-1">Total Corrections</div>
//                       <div className="text-2xl font-bold">{metrics.total_corrections}</div>
//                       <div className="mt-2 text-xs text-green-600">
//                         Driving continuous improvement
//                       </div>
//                     </div>
                    
//                     <div className="bg-white border rounded-lg p-4 shadow-sm">
//                       <div className="text-gray-500 text-sm mb-1">Learning Rate</div>
//                       <div className="text-2xl font-bold">{metrics.learning_rate.toFixed(4)}</div>
//                       <div className="mt-2 text-xs text-blue-600">
//                         Auto-optimized for your workflow
//                       </div>
//                     </div>
                    
//                     <div className="bg-white border rounded-lg p-4 shadow-sm">
//                       <div className="text-gray-500 text-sm mb-1">Reward Function</div>
//                       <div className="text-2xl font-bold">{metrics.reward_function}</div>
//                       <div className="mt-2 text-xs text-purple-600">
//                         Balancing accuracy & efficiency
//                       </div>
//                     </div>
                    
//                     <div className="bg-white border rounded-lg p-4 shadow-sm">
//                       <div className="text-gray-500 text-sm mb-1">Training Episodes</div>
//                       <div className="text-2xl font-bold">{metrics.training_episodes}</div>
//                       <div className="mt-2 text-xs text-orange-600">
//                         Since model initialization
//                       </div>
//                     </div>
//                   </div>
                  
//                   <LearningProgressChart />
                  
//                   {/* Model Performance Metrics */}
//                   <div className="border rounded-lg p-5">
//                     <h3 className="font-medium mb-4">Advanced RL Metrics</h3>
//                     <div className="grid grid-cols-3 gap-6">
//                       <div>
//                         <div className="text-gray-500 text-sm mb-2">Q-Learning Convergence</div>
//                         <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
//                           <div 
//                             className="h-3 bg-green-500 rounded-full" 
//                             style={{width: `${Math.abs(metrics.advanced_rl_metrics.q_learning_convergence * 100)}%`}}
//                           ></div>
//                         </div>
//                         <div className="flex justify-between text-xs mt-1">
//                           <span>{(metrics.advanced_rl_metrics.q_learning_convergence * 100).toFixed(1)}%</span>
//                           <span className="text-green-600">Stable</span>
//                         </div>
//                       </div>
                      
//                       <div>
//                         <div className="text-gray-500 text-sm mb-2">Exploration vs Exploitation</div>
//                         <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
//                           <div 
//                             className="h-3 bg-blue-500 rounded-full" 
//                             style={{width: `${Math.abs(metrics.advanced_rl_metrics.exploration_vs_exploitation)}%`}}
//                           ></div>
//                         </div>
//                         <div className="flex justify-between text-xs mt-1">
//                           <span>{Math.abs(metrics.advanced_rl_metrics.exploration_vs_exploitation).toFixed(1)}%</span>
//                           <span className="text-blue-600">Optimized</span>
//                         </div>
//                       </div>
                      
//                       <div>
//                         <div className="text-gray-500 text-sm mb-2">Reward Variance</div>
//                         <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
//                           <div 
//                             className="h-3 bg-yellow-500 rounded-full" 
//                             style={{width: `${metrics.advanced_rl_metrics.reward_variance * 100}%`}}
//                           ></div>
//                         </div>
//                         <div className="flex justify-between text-xs mt-1">
//                           <span>{(metrics.advanced_rl_metrics.reward_variance * 100).toFixed(1)}%</span>
//                           <span className="text-yellow-600">Low variance</span>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </>
//               )}
              
//               {activeTab === 'logs' && (
//                 <div className="border rounded-lg overflow-hidden">
//                   <table className="w-full">
//                     <thead className="bg-gray-50 border-b">
//                       <tr>
//                         <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agent</th>
//                         <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Original Action</th>
//                         <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User Correction</th>
//                         <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Learning Outcome</th>
//                       </tr>
//                     </thead>
//                     <tbody className="divide-y divide-gray-200">
//                       {filteredLogs.map(log => (
//                         <tr key={log.id} className="hover:bg-gray-50">
//                           <td className="p-3">
//                             <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
//                               {log.agent}
//                             </span>
//                           </td>
//                           <td className="p-3 text-sm text-gray-700">{log.originalAction}</td>
//                           <td className="p-3 text-sm text-green-700">{log.userCorrection}</td>
//                           <td className="p-3">
//                             <div className="text-sm text-gray-700">{log.learningOutcome}</div>
//                             <div className="text-xs text-green-600 font-medium">{log.improvement} accuracy improvement</div>
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               )}
              
//               {activeTab === 'insights' && (
//                 <div className="space-y-6">
//                   {/* Pattern Recognition */}
//                   <div className="border rounded-lg p-5">
//                     <h3 className="font-medium mb-4">Pattern Recognition Insights</h3>
//                     <div className="space-y-4">
//                       <div className="flex items-start gap-3 p-3 bg-indigo-50 rounded-lg">
//                         <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
//                           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
//                           </svg>
//                         </div>
//                         <div>
//                           <div className="font-medium text-indigo-900">Email Audience Selection</div>
//                           <div className="text-sm text-indigo-700">
//                             Model has identified that you prefer selective targeting based on content relevance rather than broad distribution. Accuracy improved 15% for recipient selection.
//                           </div>
//                         </div>
//                       </div>
                      
//                       <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
//                         <div className="flex-shrink-0 h-10 w-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
//                           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
//                           </svg>
//                         </div>
//                         <div>
//                           <div className="font-medium text-green-900">Meeting Duration Preferences</div>
//                           <div className="text-sm text-green-700">
//                             Learned optimal meeting durations based on meeting type and attendees. Now scheduling 22% shorter meetings with buffer time added automatically.
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
                  
//                   {/* Neural Network Visualization */}
//                   <div className="border rounded-lg p-5">
//                     <div className="flex justify-between items-center mb-4">
//                       <h3 className="font-medium">Neural Network Visualization</h3>
//                       <div className="text-xs bg-gray-100 rounded-full px-3 py-1">
//                         Last updated: 10:15 AM Today
//                       </div>
//                     </div>
                    
//                     <NeuralNetworkVisualization />
                    
//                     <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
//                       <div className="p-3 bg-blue-50 rounded-lg">
//                         <div className="font-medium text-blue-800">Input Layer</div>
//                         <div className="text-blue-600">Raw data processing</div>
//                       </div>
//                       <div className="p-3 bg-purple-50 rounded-lg">
//                         <div className="font-medium text-purple-800">Hidden Layers</div>
//                         <div className="text-purple-600">Feature extraction</div>
//                       </div>
//                       <div className="p-3 bg-indigo-50 rounded-lg">
//                         <div className="font-medium text-indigo-800">Output Layer</div>
//                         <div className="text-indigo-600">Decision making</div>
//                       </div>
//                     </div>
//                   </div>
                  
//                   {/* Recommended Actions Based on Learning */}
//                   <div className="border rounded-lg p-5">
//                     <h3 className="font-medium mb-4">AI-Recommended Workflow Improvements</h3>
//                     <div className="grid grid-cols-2 gap-4">
//                       <div className="border border-green-100 rounded-lg p-3 bg-green-50">
//                         <div className="font-medium text-green-800 mb-2">Create Email Templates Library</div>
//                         <div className="text-sm text-green-700 mb-3">
//                           Based on correction patterns, creating templates would improve efficiency by 34%
//                         </div>
//                         <button className="px-3 py-1 text-sm bg-green-600 text-white rounded-lg">
//                           Implement Suggestion
//                         </button>
//                       </div>
                      
//                       <div className="border border-indigo-100 rounded-lg p-3 bg-indigo-50">
//                         <div className="font-medium text-indigo-800 mb-2">Automate Calendar Buffer Times</div>
//                         <div className="text-sm text-indigo-700 mb-3">
//                           Learning detected consistent pattern of adding 5-10 minute buffers
//                         </div>
//                         <button className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-lg">
//                           Implement Suggestion
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AgentLearningDashboard;
