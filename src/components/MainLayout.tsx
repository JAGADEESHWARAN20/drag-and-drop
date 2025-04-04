'use client';

import React, { useState, useEffect } from 'react';
import { useWebsiteStore, Breakpoint, Page } from '../store/WebsiteStore';
import ComponentPanel from './ComponentPanel';
import Canvas from './Canvas';
import PropertyPanel from './PropertyPanel';
import ElementHierarchyViewer from './ElementHierarchyViewer';
import { Menu, ChevronDown, ChevronLeft, ChevronRight,X, Download, Smartphone, Tablet, Monitor, Layers } from 'lucide-react';
import  Button  from '@/components/ui/button';
import {
     Select,
     SelectContent,
     SelectItem,
     SelectTrigger,
     SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { v4 as uuidv4 } from 'uuid';
import { toast } from '@/components/ui/use-toast';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

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
     const { components, selectedComponentId } = useWebsiteStore();

     const [isComponentPanelOpen, setIsComponentPanelOpen] = useState(false);
     const [isPropertyPanelOpen, setIsPropertyPanelOpen] = useState(false);
     const [isHierarchyOpen, setIsHierarchyOpen] = useState(false);
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
          useWebsiteStore.getState().removePage(pageId);
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
                         <Sheet open={isComponentPanelOpen} onOpenChange={setIsComponentPanelOpen}>
                              <SheetTrigger asChild>
                                   <Button variant="ghost" className="text-gray-600 dark:text-gray-300">
                                        <Menu size={24} />
                                   </Button>
                              </SheetTrigger>
                              <SheetContent side="left" className="w-64 p-4">
                                   <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-4">
                                        Component Library
                                   </h2>
                                   <ComponentPanel />
                              </SheetContent>
                         </Sheet>
                         <h1 className="text-xl font-bold text-black">WebBuilder</h1>
                    </div>

                    <div className="flex items-center space-x-4">
                         {/* Page Selector (Icon on Mobile, Select on Desktop) */}
                         <div className="block md:hidden">
                              <Sheet>
                                   <SheetTrigger asChild>
                                        <Button variant="outline" size="icon" className="rounded-full">
                                             <ChevronDown size={20} />
                                        </Button>
                                   </SheetTrigger>
                                   <SheetContent side="top" className="w-full p-4">
                                        <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-4">
                                             Pages
                                        </h2>
                                        <div className="space-y-2 mb-4">
                                             {pages.map((page) => (
                                                  <div key={page.id} className="flex items-center justify-between">
                                                       <Button
                                                            variant={currentPageId === page.id ? 'outline' : 'ghost'}
                                                            onClick={() => onChangePage(page.id)}
                                                            className="w-full text-left"
                                                       >
                                                            {page.name}
                                                       </Button>
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
                                                  className="w-full text-left text-blue-600 dark:text-blue-400"
                                             >
                                                  + Add Page
                                             </Button>
                                        </div>
                                   </SheetContent>
                              </Sheet>
                         </div>
                         <div className="hidden md:block">
                              <Select value={currentPageId} onValueChange={onChangePage}>
                                   <SelectTrigger className="w-[180px] bg-white dark:bg-gray-700 text-black">
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
                         </div>

                         {/* Breakpoint Selector */}
                         <ToggleGroup
                              type="single"
                              value={breakpoint}
                              onValueChange={(value) => value && setBreakpoint(value as Breakpoint)}
                              className="hidden md:flex space-x-2"
                         >
                              <ToggleGroupItem value="mobile" title="Mobile View" className="p-2">
                                   <Smartphone size={18} />
                              </ToggleGroupItem>
                              <ToggleGroupItem value="tablet" title="Tablet View" className="p-2">
                                   <Tablet size={18} />
                              </ToggleGroupItem>
                              <ToggleGroupItem value="desktop" title="Desktop View" className="p-2">
                                   <Monitor size={18} />
                              </ToggleGroupItem>
                         </ToggleGroup>

                         {/* Preview/Edit Mode Toggle */}
                         <Button
                              variant={isPreviewMode ? 'default' : 'outline'}
                              onClick={onPreviewToggle}
                              className="text-black"
                         >
                              {isPreviewMode ? 'Edit Mode' : 'Preview Mode'}
                         </Button>

                         {/* Export Code (Icon on Mobile, Button on Desktop) */}
                         <div className="block md:hidden">
                              <Button
                                   variant="outline"
                                   size="icon"
                                   className="rounded-full"
                                   onClick={onExportCode}
                              >
                                   <Download size={20} />
                              </Button>
                         </div>
                         <div className="hidden md:flex items-center space-x-2">
                              <Button
                                   variant="outline"
                                   onClick={onExportCode}
                                   className="text-black"
                              >
                                   <Download size={16} className="mr-2" />
                                   Export Code
                              </Button>
                         </div>

                         {/* Dark/Light Mode Toggle (No Label) */}
                         <div className="flex items-center">
                              <Switch
                                   id="dark-mode"
                                   checked={isDarkMode}
                                   onCheckedChange={setIsDarkMode}
                                   className="data-[state=checked]:bg-blue-600"
                              />
                         </div>
                    </div>
               </nav>

               {/* Main Content (Canvas Takes Full Screen) */}
               <div className="flex-1 flex overflow-hidden">
                    <div className="flex-1 overflow-auto relative">
                         {/* Property Panel Toggle Button */}
                         {!isPreviewMode && (selectedComponentId || components.length > 0) && (
                              <Sheet open={isPropertyPanelOpen} onOpenChange={setIsPropertyPanelOpen}>
                                   <SheetTrigger asChild>
                                        <Button
                                             variant="ghost"
                                             className="absolute top-4 right-12 z-50 text-gray-600 dark:text-gray-300"
                                        >
                                             {isPropertyPanelOpen ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}
                                        </Button>
                                   </SheetTrigger>
                                   <SheetContent side="right" className="w-80 p-4">
                                        <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-4">
                                             Properties
                                        </h2>
                                        <PropertyPanel />
                                   </SheetContent>
                              </Sheet>
                         )}

                         {/* Element Hierarchy Toggle Button */}
                         {!isPreviewMode && (
                              <Sheet open={isHierarchyOpen} onOpenChange={setIsHierarchyOpen}>
                                   <SheetTrigger asChild>
                                        <Button
                                             variant="ghost"
                                             className="absolute top-4 right-4 z-50 text-gray-600 dark:text-gray-300"
                                        >
                                             <Layers size={24} />
                                        </Button>
                                   </SheetTrigger>
                                   <SheetContent side="right" className="w-80 p-4">
                                        <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-4">
                                             Element Hierarchy
                                        </h2>
                                        <ElementHierarchyViewer />
                                   </SheetContent>
                              </Sheet>
                         )}

                         <Canvas isPreviewMode={isPreviewMode} currentBreakpoint={breakpoint} />
                    </div>
               </div>
          </div>
     );
};

export default MainLayout;