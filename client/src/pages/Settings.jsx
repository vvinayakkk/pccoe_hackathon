import React, { useState } from 'react';
import { Settings, Search, Grid, MessageSquare, FileText, Image, Mail, Calendar, Video, AlertCircle, ArrowRight } from 'lucide-react';
import Sidebar from '../components/Sidebar'; // Import Sidebar

const SettingsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const agentCategories = [
    {
      name: "Productivity",
      agents: [
        { id: 'docs', name: 'Google Docs', icon: FileText, enabled: true, status: 'connected' },
        { id: 'sheets', name: 'Google Sheets', icon: Grid, enabled: true, status: 'connected' },
        { id: 'drive', name: 'Google Drive', icon: FileText, enabled: true, status: 'connected' },
        { id: 'notion', name: 'Notion', icon: FileText, enabled: false, status: 'disconnected' }
      ]
    },
    {
      name: "Communication",
      agents: [
        { id: 'whatsapp', name: 'WhatsApp', icon: MessageSquare, enabled: true, status: 'connected' },
        { id: 'gmail', name: 'Gmail', icon: Mail, enabled: true, status: 'connected' },
        { id: 'slack', name: 'Slack', icon: MessageSquare, enabled: true, status: 'connected' }
      ]
    },
    {
      name: "Meetings",
      agents: [
        { id: 'calendar', name: 'Google Calendar', icon: Calendar, enabled: true, status: 'connected' },
        { id: 'meets', name: 'Google Meet', icon: Video, enabled: true, status: 'connected' },
        { id: 'zoom', name: 'Zoom', icon: Video, enabled: false, status: 'disconnected' }
      ]
    },
    {
      name: "Media",
      agents: [
        { id: 'photos', name: 'Google Photos', icon: Image, enabled: true, status: 'connected' }
      ]
    }
  ];

  const filteredCategories = agentCategories.map(category => ({
    ...category,
    agents: category.agents.filter(agent => 
      agent.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.agents.length > 0);

  return (
    <div className="flex">
      <Sidebar /> {/* Add Sidebar component */}
      <div className="flex-1 bg-gray-50">
        <header className="bg-white border-b p-4 sticky top-0 z-10">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold">Settings</h1>
            <button className="text-sm text-indigo-600 font-medium">
              Check All Updates
            </button>
          </div>
        </header>

        <div className="p-6">
          <div className="max-w-4xl mx-auto">
            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search agents..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Agent Categories */}
            <div className="space-y-6">
              {filteredCategories.map((category) => (
                <div key={category.name} className="bg-white rounded-xl shadow-sm border overflow-hidden">
                  <div className="p-4 border-b">
                    <h2 className="font-medium">{category.name}</h2>
                  </div>
                  <div className="divide-y">
                    {category.agents.map((agent) => (
                      <div key={agent.id} className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-lg ${agent.enabled ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-500'}`}>
                            <agent.icon className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="font-medium">{agent.name}</div>
                            <div className="text-sm text-gray-500">
                              {agent.status === 'connected' ? 'Connected and active' : 'Not connected'}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {agent.status === 'connected' ? (
                            <div className="flex items-center gap-2 text-green-600 text-sm">
                              <span className="h-2 w-2 bg-green-600 rounded-full"></span>
                              Active
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-gray-400 text-sm">
                              <span className="h-2 w-2 bg-gray-400 rounded-full"></span>
                              Inactive
                            </div>
                          )}
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              className="sr-only peer"
                              checked={agent.enabled}
                              onChange={() => {}}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Warning Card */}
            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-yellow-800">Agent Permissions</h3>
                <p className="mt-1 text-sm text-yellow-700">
                  Enabling an agent will allow CommunicateAI to access and process data from that service. 
                  Make sure you review the permissions and data handling policies for each agent.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
