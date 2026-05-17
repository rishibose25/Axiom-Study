/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Shell } from './components/layout/Shell';
import { Dashboard } from './components/dashboard/Dashboard';
import { AiTutor } from './components/ai-tutor/AiTutor';
import { Wellness } from './components/wellness/Wellness';
import { Planner } from './components/planner/Planner';
import { TestLog } from './components/tests/TestLog';
import { Settings } from './components/profile/Settings';
import { Auth } from './components/auth/Auth';
import { useAuth } from './hooks/useAuth';
import { SyllabusExplorer } from './components/subjects/SyllabusExplorer';

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <Shell>
      {(activeTab) => {
        switch (activeTab) {
          case 'dashboard':
            return <Dashboard />;
          case 'tutor':
            return <AiTutor />;
          case 'wellness':
          case 'focus':
            return <Wellness />;
          case 'planner':
          case 'plan':
            return <Planner />;
          case 'tests':
            return <TestLog />;
          case 'syllabus':
            return <SyllabusExplorer mode="tracking" />;
          case 'custom-syllabus':
            return <SyllabusExplorer mode="custom" />;
          case 'syllabus-preview':
            return <SyllabusExplorer mode="preview" />;
          case 'settings':
            return <Settings />;
          case 'profile':
            return <Settings />;
          default:
            return <Dashboard />;
        }
      }}
    </Shell>
  );
}
