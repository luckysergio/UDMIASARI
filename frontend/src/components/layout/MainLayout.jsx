import React from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';

const MainLayout = ({ children }) => {
  // Tidak perlu activeTab karena Sidebar sudah handle sendiri
  return (
    <div className="flex h-screen overflow-hidden bg-linear-to-br from-slate-900 to-slate-800">
      <Sidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden bg-linear-to-br from-slate-800 to-slate-900">
        
        {/* Main Content dengan Scrollbar Custom */}
        <main className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <div className="container mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>

      <style>{`
        /* Custom Scrollbar untuk Main Content */
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1e293b;
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #475569;
          border-radius: 10px;
          transition: all 0.2s ease;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #6366f1;
        }

        /* Untuk Firefox */
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #475569 #1e293b;
        }
      `}</style>
    </div>
  );
};

export default MainLayout;