
import React from 'react';

import { Toaster } from "@/components/ui/toaster";
import ModernLayout from '@/components/ModernLayout';

const Index: React.FC = () => {
  return (
    <div className="modern-layout">
      <ModernLayout />
      <Toaster />
    </div>
  );
};

export default Index;
