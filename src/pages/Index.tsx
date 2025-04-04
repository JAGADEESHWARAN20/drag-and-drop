import React from 'react';
import { useWebsiteStore, Breakpoint } from '../store/WebsiteStore';
import MainLayout from '../components/MainLayout';
import { generateCode } from '../utils/CodeGenerator';
import { toast } from '@/components/ui/use-toast';

const Index = () => {
  const {
    pages,
    currentPageId,
    setCurrentPageId,
    addPage,
    isPreviewMode,
    setIsPreviewMode,
    breakpoint,
    setBreakpoint,
    components,
  } = useWebsiteStore();

  const handlePageChange = (pageId: string) => {
    setCurrentPageId(pageId);
  };

  const handleAddPage = (name: string) => {
    const newPage = { id: name, name }; // Create a Page object
    addPage(newPage);
    setCurrentPageId(newPage.id);
    toast({
      title: 'Page Added',
      description: `Added ${newPage.name}`,
    });
  };

  const handlePreviewToggle = () => {
    setIsPreviewMode(!isPreviewMode);
  };

  const handleExportCode = async () => {
    try {
      if (components.length === 0) {
        toast({
          title: 'No Components',
          description: 'Add some components before exporting',
          variant: 'destructive',
        });
        return;
      }

      await generateCode(pages, components);

      toast({
        title: 'Export Successful',
        description: 'Your code has been exported as a ZIP file',
        variant: 'default',
      });
    } catch (error) {
      console.error('Error exporting code:', error);
      toast({
        title: 'Export Failed',
        description: 'There was an error exporting your code',
        variant: 'destructive',
      });
    }
  };

  const handleBreakpointChange = (bp: Breakpoint) => {
    setBreakpoint(bp);
  };

  return (
    <MainLayout
      pages={pages}
      currentPageId={currentPageId}
      onChangePage={handlePageChange}
      onAddPage={handleAddPage}
      onPreviewToggle={handlePreviewToggle}
      isPreviewMode={isPreviewMode}
      onExportCode={handleExportCode}
      breakpoint={breakpoint}
      setBreakpoint={handleBreakpointChange}
    />
  );
};

export default Index;