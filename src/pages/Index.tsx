
import React, { useState } from 'react';
import { DndContext } from '@dnd-kit/core';
import { useWebsiteStore, Breakpoint } from '../store/WebsiteStore';
import Canvas from '../components/Canvas';
import ComponentPanel from '../components/ComponentPanel';
import PropertyPanel from '../components/PropertyPanel';
import Navbar from '../components/Navbar';
import { generateCode } from '../utils/CodeGenerator';
import { toast } from '@/components/ui/use-toast';
import { saveAs } from 'file-saver';

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
    components
  } = useWebsiteStore();

  const handlePageChange = (pageId: string) => {
    setCurrentPageId(pageId);
  };

  const handleAddPage = (name: string) => {
    const newPageId = addPage(name);
    setCurrentPageId(newPageId);
  };

  const handlePreviewToggle = () => {
    setIsPreviewMode(!isPreviewMode);
  };

  const handleExportCode = async () => {
    try {
      if (components.length === 0) {
        toast({
          title: "No Components",
          description: "Add some components before exporting",
          variant: "destructive"
        });
        return;
      }

      await generateCode(pages, components);
      
      toast({
        title: "Export Successful",
        description: "Your code has been exported as a ZIP file",
        variant: "success"
      });
    } catch (error) {
      console.error('Error exporting code:', error);
      toast({
        title: "Export Failed",
        description: "There was an error exporting your code",
        variant: "destructive"
      });
    }
  };

  const handleBreakpointChange = (bp: Breakpoint) => {
    setBreakpoint(bp);
  };

  return (
    <DndContext>
      <div className="flex flex-col h-screen bg-gray-50">
        <Navbar
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
        
        <div className="flex flex-1 overflow-hidden">
          {!isPreviewMode && (
            <div className="w-64 bg-white shadow-sm overflow-y-auto">
              <ComponentPanel />
            </div>
          )}
          
          <div className="flex-1 overflow-y-auto flex justify-center">
            <Canvas 
              isPreviewMode={isPreviewMode} 
              currentBreakpoint={breakpoint} 
            />
          </div>
          
          {!isPreviewMode && (
            <div className="w-72 bg-white shadow-sm overflow-y-auto">
              <PropertyPanel />
            </div>
          )}
        </div>
      </div>
    </DndContext>
  );
};

export default Index;
