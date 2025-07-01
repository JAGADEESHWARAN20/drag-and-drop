
import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import EnhancedComponentPanel from '@/components/EnhancedLayout';

const Editor: React.FC = () => {
  return (
    <div className="modern-layout">
      <EnhancedComponentPanel />
      <Toaster />
    </div>
  );
};

export default Editor;
