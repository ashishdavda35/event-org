'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  PlusIcon, 
  ChartBarIcon, 
  UsersIcon, 
  ClockIcon,
  CheckCircleIcon,
  StarIcon
} from '@heroicons/react/24/outline';

export default function HomePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [pollCode, setPollCode] = useState('');

  const handleJoinPoll = (e: React.FormEvent) => {
    e.preventDefault();
    if (pollCode.trim()) {
      router.push(`/poll/${pollCode.trim().toUpperCase()}`);
    }
  };

  const features = [
    {
      icon: PlusIcon,
      title: 'Create Polls',
      description: 'Multiple question types including multiple choice, rating, open-ended, word cloud, and ranking.'
    },
    {
      icon: ChartBarIcon,
      title: 'Real-time Results',
      description: 'See results update live as participants respond with beautiful charts and visualizations.'
    },
    {
      icon: UsersIcon,
      title: 'Easy Sharing',
      description: 'Generate unique links to share with participants. No registration required for participants.'
    },
    {
      icon: ClockIcon,
      title: 'Live Updates',
      description: 'WebSocket-powered real-time updates ensure everyone sees the latest results instantly.'
    },
    {
      icon: CheckCircleIcon,
      title: 'Export Data',
      description: 'Download results as CSV files for further analysis and reporting.'
    },
    {
      icon: StarIcon,
      title: 'Mobile Friendly',
      description: 'Responsive design works perfectly on all devices - desktop, tablet, and mobile.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-indigo-600">Event Org</h1>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  <span className="text-gray-700">Welcome, {user.name}</span>
                  <Link
                    href="/dashboard"
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Dashboard
                  </Link>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link
                    href="/auth/login"
                    className="text-gray-700 hover:text-indigo-600 transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    href="/auth/register"
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Interactive Polling
            <span className="text-indigo-600"> Made Simple</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Create engaging polls, collect real-time responses, and visualize results with our 
            powerful yet simple polling platform. Perfect for events, meetings, and education.
          </p>
          
          {/* Join Poll Form */}
          <div className="max-w-md mx-auto mb-12">
            <form onSubmit={handleJoinPoll} className="flex gap-2">
              <input
                type="text"
                value={pollCode}
                onChange={(e) => setPollCode(e.target.value.toUpperCase())}
                placeholder="Enter poll code"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 bg-white"
                maxLength={6}
              />
              <button
                type="submit"
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                Join Poll
              </button>
            </form>
          </div>

          {user && (
            <div className="mb-12">
              <Link
                href="/create-poll"
                className="inline-flex items-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-lg hover:bg-indigo-700 transition-colors font-medium text-lg"
              >
                <PlusIcon className="w-5 h-5" />
                Create New Poll
              </Link>
            </div>
          )}
        </div>

        {/* Features Grid */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Everything you need for engaging polls
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <feature.icon className="w-8 h-8 text-indigo-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 bg-indigo-600 rounded-2xl p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Ready to create your first poll?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of users creating engaging interactive experiences
          </p>
          {user ? (
            <Link
              href="/create-poll"
              className="inline-flex items-center gap-2 bg-white text-indigo-600 px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors font-medium text-lg"
            >
              <PlusIcon className="w-5 h-5" />
              Create Poll Now
            </Link>
          ) : (
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-2 bg-white text-indigo-600 px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors font-medium text-lg"
            >
              Get Started Free
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}