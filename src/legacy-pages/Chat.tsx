import React from 'react';
import SEO from '../components/SEO';
import AIAssistant from '../components/AIAssistant';

const Chat: React.FC = () => (
  <div className="bg-pm-dark min-h-screen text-pm-off-white">
    <SEO title="Assistant IA" noIndex />
    <div className="page-container">
      <h1 className="text-4xl font-playfair font-black italic mb-8">Assistant IA</h1>
      <AIAssistant />
    </div>
  </div>
);

export default Chat;
