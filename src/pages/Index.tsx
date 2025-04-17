
import React, { useState, useCallback } from 'react';
import MainLayout from '../components/MainLayout';
import { useWebsiteStore } from '../store/WebsiteStore';
import { toast } from '@/components/ui/use-toast';

const Index = () => {
  const { 
    pages, 
    currentPageId,
    setCurrentPageId,
    addPage,
    breakpoint,
    setBreakpoint,
  } = useWebsiteStore();
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const handleChangePage = useCallback((pageId: string) => {
    setCurrentPageId(pageId);
    toast({
      title: 'Page Changed',
      description: `Switched to ${pages.find(p => p.id === pageId)?.name || 'Unknown page'}.`,
    });
  }, [pages, setCurrentPageId]);

  const handleAddPage = useCallback((name: string) => {
    const id = addPage(name);
    toast({
      title: 'Page Added',
      description: `Added new page: ${name}`,
    });
    return id;
  }, [addPage]);

  const togglePreviewMode = useCallback(() => {
    setIsPreviewMode(prev => !prev);
    toast({
      title: isPreviewMode ? 'Edit Mode' : 'Preview Mode',
      description: isPreviewMode ? 'Now editing the website.' : 'Previewing how the website will look.',
    });
  }, [isPreviewMode]);

  const handleExportCode = useCallback(() => {
    // In a real application, this would generate and export the code
    // For now, we'll just show a toast notification
    toast({
      title: 'Code Export',
      description: 'Exporting the code is not implemented in this demo.',
    });
  }, []);

  return (
    <MainLayout
      pages={pages}
      currentPageId={currentPageId}
      onChangePage={handleChangePage}
      onAddPage={handleAddPage}
      onPreviewToggle={togglePreviewMode}
      isPreviewMode={isPreviewMode}
      onExportCode={handleExportCode}
      breakpoint={breakpoint}
      setBreakpoint={setBreakpoint}
    />
  );
};

export default Index;
