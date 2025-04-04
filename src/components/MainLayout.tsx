'use client';

import React, { useState, useEffect } from 'react';
import { useWebsiteStore, Breakpoint, Page } from '../store/WebsiteStore';
import ComponentPanel from './ComponentPanel';
import Canvas from './Canvas';
import PropertyPanel from './PropertyPanel';
import { Menu, ChevronLeft, ChevronRight, X, Eye, Download } from 'lucide-react';
import  Button  from '@/components/ui/button';
import {
     Select,
     SelectContent,
     SelectItem,
     SelectTrigger,
     SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { v4 as uuidv4 } from 'uuid';
import { toast } from '@/components/ui/use-toast';

interface MainLayoutProps {
     pages: Page[];
     currentPageId: string;
     onChangePage: (pageId: string) => void;
     onAddPage: (name: string) => void;
     onPreviewToggle: () => void;
     isPreviewMode: boolean;
     onExportCode: () => void;
     breakpoint: Breakpoint;
     setBreakpoint: (bp: Breakpoint) => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({
     pages,
     currentPageId,
     onChangePage,
     onAddPage,
     onPreviewToggle,
     isPreviewMode,
     onExportCode,
     breakpoint,
     setBreakpoint,
}) => {
     const { components, selectedComponentId, removePage } = useWebsiteStore();

     const [isComponentPanelOpen, setIsComponentPanelOpen] = useState(false);
     const [isPropertyPanelOpen, setIsPropertyPanelOpen] = useState(false);
     const [isDarkMode, setIsDarkMode] = useState(false);

     // Toggle dark mode by adding/removing the 'dark' class on the root element
     useEffect(() => {
          if (isDarkMode) {
               document.documentElement.classList.add('dark');
          } else {
               document.documentElement.classList.remove('dark');
          }
     }, [isDarkMode]);

     // Show PropertyPanel if a component is selected or exists on the canvas
     useEffect(() => {
          if (selectedComponentId || components.length > 0) {
               setIsPropertyPanelOpen(true);
          } else {
               setIsPropertyPanelOpen(false);
          }
     }, [selectedComponentId, components]);

     const handleAddPage = () => {
          const newPageId = uuidv4();
          onAddPage(`Page ${pages.length + 1}`);
     };

     const handleDeletePage = (pageId: string) => {
          if (pages.length === 1) {
               toast({ title: 'Cannot Delete', description: 'At least one page must exist' });
               return;
          }
          removePage(pageId);
          if (currentPageId === pageId) {
               onChangePage(pages[0].id);
          }
          toast({ title: 'Page Deleted', description: 'Page has been deleted' });
     };

     return (
          <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900">
               {/* Navbar */}
               <nav className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 shadow-md">
                    <div className="flex items-center space-x-4">
                         {!isPreviewMode && (
                              <Button
                                   variant="ghost"
                                   onClick={() => setIsComponentPanelOpen(!isComponentPanelOpen)}
                                   className="text-gray-600 dark:text-gray-300"
                              >
                                   <Menu size={24} />
                              </Button>
                         )}
                         <h1 className="text-xl font-bold text-blue-900 dark:text-blue-300">WebBuilder</h1>
                    </div>

                    <div className="flex items-center space-x-4">
                         {/* Page Dropdown */}
                         <Select value={currentPageId} onValueChange={onChangePage}>
                              <SelectTrigger className="w-[180px] bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                                   <SelectValue placeholder="Select a page" />
                              </SelectTrigger>
                              <SelectContent>
                                   {pages.map((page) => (
                                        <div key={page.id} className="flex items-center justify-between px-2 py-1">
                                             <SelectItem value={page.id}>{page.name}</SelectItem>
                                             {pages.length > 1 && (
                                                  <Button
                                                       variant="ghost"
                                                       size="sm"
                                                       onClick={() => handleDeletePage(page.id)}
                                                       className="text-red-500 hover:text-red-700"
                                                  >
                                                       <X size={16} />
                                                  </Button>
                                             )}
                                        </div>
                                   ))}
                                   <Button
                                        variant="ghost"
                                        onClick={handleAddPage}
                                        className="w-full text-left px-4 py-2 text-blue-600 dark:text-blue-400"
                                   >
                                        + Add Page
                                   </Button>
                              </SelectContent>
                         </Select>

                         {/* Breakpoint Selector */}
                         <Select
                              value={breakpoint}
                              onValueChange={(value) => setBreakpoint(value as Breakpoint)}
                         >
                              <SelectTrigger className="w-[120px] bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                                   <SelectValue placeholder="Breakpoint" />
                              </SelectTrigger>
                              <SelectContent>
                                   <SelectItem value="desktop">Desktop</SelectItem>
                                   <SelectItem value="tablet">Tablet</SelectItem>
                                   <SelectItem value="mobile">Mobile</SelectItem>
                              </SelectContent>
                         </Select>

                         {/* Preview Mode Toggle */}
                         <Button
                              variant={isPreviewMode ? 'default' : 'outline'}
                              onClick={onPreviewToggle}
                              className="text-gray-600 dark:text-gray-300"
                         >
                              <Eye size={16} className="mr-2" />
                              {isPreviewMode ? 'Edit Mode' : 'Preview Mode'}
                         </Button>

                         {/* Export Code Button */}
                         <Button
                              variant="outline"
                              onClick={onExportCode}
                              className="text-gray-600 dark:text-gray-300"
                         >
                              <Download size={16} className="mr-2" />
                              Export Code
                         </Button>

                         {/* Dark/Light Mode Toggle */}
                         <div className="flex items-center space-x-2">
                              <Label htmlFor="dark-mode" className="text-gray-600 dark:text-gray-300">
                                   {isDarkMode ? 'Dark' : 'Light'}
                              </Label>
                              <Switch
                                   id="dark-mode"
                                   checked={isDarkMode}
                                   onCheckedChange={setIsDarkMode}
                                   className="data-[state=checked]:bg-blue-600"
                              />
                         </div>
                    </div>
               </nav>

               <div className="flex flex-1 overflow-hidden relative">
                    {/* Component Panel (Slide-in Sidebar) */}
                    {!isPreviewMode && (
                         <div
                              className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out ${isComponentPanelOpen ? 'translate-x-0' : '-translate-x-full'
                                   }`}
                         >
                              <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                                   <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-300">
                                        Component Library
                                   </h2>
                                   <Button
                                        variant="ghost"
                                        onClick={() => setIsComponentPanelOpen(false)}
                                        className="text-gray-600 dark:text-gray-300"
                                   >
                                        <ChevronLeft size={24} />
                                   </Button>
                              </div>
                              <ComponentPanel />
                         </div>
                    )}

                    {/* Main Canvas Area */}
                    <div className="flex-1 overflow-auto">
                         <div className="relative">
                              {/* Property Panel Toggle Button */}
                              {!isPreviewMode && (selectedComponentId || components.length > 0) && (
                                   <Button
                                        variant="ghost"
                                        onClick={() => setIsPropertyPanelOpen(!isPropertyPanelOpen)}
                                        className="absolute top-4 right-4 z-50 text-gray-600 dark:text-gray-300"
                                   >
                                        {isPropertyPanelOpen ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}
                                   </Button>
                              )}
                              <Canvas isPreviewMode={isPreviewMode} currentBreakpoint={breakpoint} />
                         </div>
                    </div>

                    {/* Property Panel (Slide-in from Right) */}
                    {!isPreviewMode && (selectedComponentId || components.length > 0) && (
                         <div
                              className={`fixed inset-y-0 right-0 z-50 w-80 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out ${isPropertyPanelOpen ? 'translate-x-0' : 'translate-x-full'
                                   }`}
                         >
                              <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                                   <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-300">
                                        Properties
                                   </h2>
                                   <Button
                                        variant="ghost"
                                        onClick={() => setIsPropertyPanelOpen(false)}
                                        className="text-gray-600 dark:text-gray-300"
                                   >
                                        <ChevronRight size={24} />
                                   </Button>
                              </div>
                              <PropertyPanel />
                         </div>
                    )}
               </div>
          </div>
     );
};

export default MainLayout;