import React from 'react';
import Layout from '../components/layout/Layout';
import ChatPage from './dashboard/admin/ChatPage';

const ChatPagePublic: React.FC = () => {
  return (
    <Layout>
      <div className="pt-24 pb-12 max-w-7xl mx-auto px-4 md:px-8 w-full">
        <ChatPage />
      </div>
    </Layout>
  );
};

export default ChatPagePublic;
