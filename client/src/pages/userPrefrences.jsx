import React from 'react';
import { User, Bell, Globe, Moon, Volume2, Clock, Shield, ArrowRight } from 'lucide-react';
import Sidebar from '../components/Sidebar'; // Import Sidebar

const UserPreferencesPage = () => {
  const preferenceSections = [
    {
      title: "Personal Information",
      icon: User,
      settings: [
        {
          name: "Profile Details",
          description: "Manage your personal information and account settings",
          action: "Edit Profile"
        },
        {
          name: "Email Preferences",
          description: "Control how you receive email notifications",
          action: "Manage"
        }
      ]
    },
    {
      title: "Notifications",
      icon: Bell,
      settings: [
        {
          name: "Push Notifications",
          description: "Get real-time updates about your communications",
          toggle: true
        },
        {
          name: "Email Digests",
          description: "Receive daily or weekly summaries",
          toggle: true
        },
        {
          name: "Sound Alerts",
          description: "Play sound when new messages arrive",
          toggle: false
        }
      ]
    },
    {
      title: "Language & Region",
      icon: Globe,
      settings: [
        {
          name: "Primary Language",
          description: "English (US)",
          action: "Change"
        },
        {
          name: "Secondary Languages",
          description: "Spanish, French",
          action: "Manage"
        },
        {
          name: "Time Zone",
          description: "Pacific Time (PT)",
          action: "Change"
        }
      ]
    },
    {
      title: "Appearance",
      icon: Moon,
      settings: [
        {
          name: "Theme",
          description: "Light mode",
          action: "Change"
        },
        {
          name: "Compact Mode",
          description: "Display density of the interface",
          toggle: false

        }
      ]
    },
    {
      title: "Communication Settings",
      icon: Volume2,
      settings: [
        {
          name: "Default Voice Input Language",
          description: "English (US)",
          action: "Change"
        },
        {
          name: "Auto-Transcription",
          description: "Automatically transcribe voice messages",
          toggle: true
        },
        {
          name: "Smart Suggestions",
          description: "Get AI-powered communication suggestions",
          toggle: true
        }
      ]
    },
    {
      title: "Privacy & Security",
      icon: Shield,
      settings: [
        {
          name: "Data Privacy",
          description: "Manage how your data is collected and used",
          action: "Review"
        },
        {
          name: "Two-Factor Authentication",
          description: "Add an extra layer of security",
          toggle: true
        },
        {
          name: "Connected Devices",
          description: "Manage devices with access to your account",
          action: "View All"
        }
      ]
    }
  ];

  return (
    <div className="flex">
      <Sidebar /> {/* Add Sidebar component */}
      <div className="flex-1 bg-gray-50">
        <header className="bg-white border-b p-4 sticky top-0 z-10">
          <h1 className="text-xl font-bold">User Preferences</h1>
        </header>

        <div className="p-6">
          <div className="max-w-3xl mx-auto space-y-6">
            {preferenceSections.map((section) => (
              <div key={section.title} className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="p-4 border-b flex items-center gap-2">
                  <section.icon className="h-5 w-5 text-indigo-600" />
                  <h2 className="font-medium">{section.title}</h2>
                </div>
                
                <div className="divide-y">
                  {section.settings.map((setting, index) => (
                    <div key={index} className="p-4 flex items-center justify-between">
                      <div>
                        <div className="font-medium">{setting.name}</div>
                        <div className="text-sm text-gray-500">{setting.description}</div>
                      </div>
                      
                      {setting.toggle !== undefined ? (
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer"
                            defaultChecked={setting.toggle}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                        </label>
                      ) : (
                        <button className="text-sm text-indigo-600 font-medium flex items-center gap-1">
                          {setting.action}
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
            
            {/* Account Danger Zone */}
            <div className="bg-red-50 rounded-xl border border-red-200 p-4">
              <h3 className="text-red-800 font-medium">Danger Zone</h3>
              <p className="mt-1 text-sm text-red-700">
                These actions are permanent and cannot be undone.
              </p>
              <div className="mt-4 flex gap-3">
                <button className="px-4 py-2 bg-white text-red-600 border border-red-200 rounded-lg text-sm font-medium">
                  Deactivate Account
                </button>
                <button className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium">
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserPreferencesPage;
