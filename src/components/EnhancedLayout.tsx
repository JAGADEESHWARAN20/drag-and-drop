
import React from 'react';
import { useEnhancedWebsiteStore } from '../store/EnhancedWebsiteStore';
import EnhancedComponentPanel from './EnhancedComponentPanel';
import EnhancedCanvas from './EnhancedCanvas';
import EnhancedPropertyPanel from './EnhancedPropertyPanel';

const EnhancedLayout: React.FC = () => {
  const { sidebarOpen } = useEnhancedWebsiteStore();

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Component Panel */}
      <EnhancedComponentPanel />
      
      {/* Main Content Area */}
      <div className={`flex-1 flex transition-all duration-300 ${sidebarOpen ? '' : 'md:ml-0'}`}>
        {/* Canvas */}
        <EnhancedCanvas />
        
        {/* Properties Panel */}
        <EnhancedPropertyPanel />
      </div>
    </div>
  );
};

export default EnhancedLayout;
