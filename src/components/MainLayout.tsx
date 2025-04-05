'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useWebsiteStore, Breakpoint, Page } from '../store/WebsiteStore';
import ComponentPanel from './ComponentPanel';
import Canvas from './Canvas';
import PropertyPanel from './PropertyPanel';
import ElementHierarchyViewer from './ElementHierarchyViewer';
import { Menu, ChevronRight, ChevronLeft, X, Download, Smartphone, Tablet, Monitor, Layers, Code, Pen, Plus } from 'lucide-react';
import Button from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { v4 as uuidv4 } from 'uuid';
import { toast } from '@/components/ui/use-toast';
import { Sheet, SheetContent } from '@/components/ui/sheet'; // Removed SheetTrigger import
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { motion, AnimatePresence } from 'framer-motion';
import { Toggle } from '@/components/ui/toggle';

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
     const { components, selectedComponentId, addComponent, setSelectedComponentId } = useWebsiteStore();

     const [isComponentPanelOpen, setIsComponentPanelOpen] = useState(false);
     const [isPropertyPanelOpen, setIsPropertyPanelOpen] = useState(false);
     const [isHierarchyOpen, setIsHierarchyOpen] = useState(false);
     const [isDarkMode, setIsDarkMode] = useState(false);
     const [isPageSheetOpen, setIsPageSheetOpen] = useState(false);
     const componentPanelRef = useRef<HTMLDivElement>(null);

     // Gesture state for mobile drawer
     const [dragStartX, setDragStartX] = useState<number | null>(null);
     const [dragStartY, setDragStartY] = useState<number | null>(null);
     const dragThreshold = 20; // Pixels to swipe before triggering
     const [isDragging, setIsDragging] = useState(false);

     // State for the left sheet (opened by swipe)
     const [isLeftSheetOpen, setIsLeftSheetOpen] = useState(false);

     // Toggle dark mode
     useEffect(() => {
          if (isDarkMode) {
               document.documentElement.classList.add('dark');
          } else {
               document.documentElement.classList.remove('dark');
          }
     }, [isDarkMode]);

     // Only open panels when a component is explicitly selected (for larger screens)
     useEffect(() => {
          if (breakpoint !== 'mobile') {
               if (selectedComponentId) {
                    setIsPropertyPanelOpen(true);
                    setIsHierarchyOpen(false); // Optional: close hierarchy when property opens
               } else {
                    setIsPropertyPanelOpen(false);
                    setIsHierarchyOpen(false);
               }
          }
     }, [selectedComponentId, breakpoint]);

     const handleAddPage = () => {
          const newPageId = uuidv4();
          onAddPage(`Page ${pages.length + 1}`);
          setIsPageSheetOpen(false);
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
          setIsPageSheetOpen(false);
     };

     const handleComponentAdd = (type: string, defaultProps: Record<string, any>) => {
          const newComponentId = uuidv4();
          addComponent({
               type,
               props: defaultProps,
               id: newComponentId,
               pageId: currentPageId,
               parentId: null,
               responsiveProps: { desktop: {}, tablet: {}, mobile: {} },
          });
          toast({
               title: 'Component Added',
               description: `Added ${type} to canvas.`,
          });
          setIsComponentPanelOpen(false); // Close sheet after adding
          setSelectedComponentId(null); // Reset selection to require canvas click
     };

     const isMobile = breakpoint === 'mobile';

     // Gesture handlers for mobile drawer
     const handleTouchStart = (e: React.TouchEvent) => {
          if (!isMobile || isPreviewMode) return;
          setDragStartX(e.touches[0].clientX);
          setDragStartY(e.touches[0].clientY);
          setIsDragging(true);
     };

     const handleTouchMove = (e: React.TouchEvent) => {
          if (!isMobile || isPreviewMode || dragStartX === null || dragStartY === null || !isDragging) return;
          const currentX = e.touches[0].clientX;
          const currentY = e.touches[0].clientY;
          const deltaX = dragStartX - currentX;
          const deltaY = Math.abs(dragStartY - currentY);

          // Only trigger on horizontal swipe with minimal vertical movement
          if (Math.abs(deltaX) > dragThreshold && deltaY < dragThreshold) {
               if (deltaX > 0) { // Swipe right to left to open left sheet
                    setIsLeftSheetOpen(true);
               }
               setIsDragging(false); // Reset dragging state after action
               setDragStartX(null);
               setDragStartY(null);
          }
     };

     const handleTouchEnd = () => {
          setDragStartX(null);
          setDragStartY(null);
          setIsDragging(false);
     };

     return (
          <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900">
               {/* Navbar */}
               <nav className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 shadow-md">
                    <div className="flex items-center space-x-3">
                         <Sheet open={isComponentPanelOpen} onOpenChange={setIsComponentPanelOpen}>
                              <SheetContent
                                   side="top"
                                   className={`w-full overflow-hidden scrollbar-hidden h-auto max-h-96 p-4 flex flex-col ${isMobile ? 'min-w-[100vw]' : 'min-w-[300px]'}`}
                              >
                                   <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-2">
                                        Component Library
                                   </h2>
                                   <ComponentPanel ref={componentPanelRef} onComponentClick={handleComponentAdd} />
                              </SheetContent>
                         </Sheet>
                         <h1 className="text-lg font-bold text-black dark:text-white">WebBuilder</h1>
                    </div>

                    <div className="flex items-center space-x-3">
                         {/* Page Selector */}
                         <div className="block md:hidden">
                              <Sheet open={isPageSheetOpen} onOpenChange={setIsPageSheetOpen}>
                                   <SheetContent side="top" className="w-full p-4">
                                        <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-4">Pages</h2>
                                        <div className="space-y-2 mb-4">
                                             {pages.map((page) => (
                                                  <div key={page.id} className="flex items-center justify-between">
                                                       <Button
                                                            variant={currentPageId === page.id ? 'outline' : 'ghost'}
                                                            onClick={() => onChangePage(page.id)}
                                                            className="w-full text-left text-gray-800 dark:text-gray-200"
                                                       >
                                                            {page.name}
                                                       </Button>
                                                       {pages.length > 1 && (
                                                            <Button
                                                                 variant="ghost"
                                                                 size="sm"
                                                                 onClick={() => handleDeletePage(page.id)}
                                                                 className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-600"
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
                                   <SelectTrigger className="w-[180px] bg-white dark:bg-gray-700 text-black dark:text-white">
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
                                                            className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-600"
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
                                   <Smartphone size={18} className="text-gray-600 dark:text-gray-300" />
                              </ToggleGroupItem>
                              <ToggleGroupItem value="tablet" title="Tablet View" className="p-2">
                                   <Tablet size={18} className="text-gray-600 dark:text-gray-300" />
                              </ToggleGroupItem>
                              <ToggleGroupItem value="desktop" title="Desktop View" className="p-2">
                                   <Monitor size={18} className="text-gray-600 dark:text-gray-300" />
                              </ToggleGroupItem>
                         </ToggleGroup>

                         {/* Preview/Edit Mode Toggle */}
                         <Toggle
                              aria-label="Toggle Preview Mode"
                              pressed={isPreviewMode}
                              onPressedChange={onPreviewToggle}
                              className={`flex items-center space-x-2 data-[state=pressed]:bg-blue-600 text-gray-600 dark:text-gray-300 rounded-md px-3 py-1`}
                         >
                              {isPreviewMode ? <Pen size={16} /> : <Code size={16} />}
                         </Toggle>

                         {/* Export Code */}
                         <div className="block md:hidden">
                              <Button variant="outline" size="icon" className="rounded-full p-2" onClick={onExportCode}>
                                   <Download size={20} className="text-gray-600 dark:text-gray-300" />
                              </Button>
                         </div>
                         <div className="hidden md:flex items-center space-x-2">
                              <Button variant="outline" onClick={onExportCode} className="text-black dark:text-white">
                                   <Download size={16} className="mr-2" />
                                   Export Code
                              </Button>
                         </div>

                         {/* Dark/Light Mode Toggle */}
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

               {/* Main Content */}
               <div className="flex-1 flex overflow-hidden relative" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
                    <div className="flex-1 overflow-auto relative">
                         {/* Breakpoint Selector in Preview Mode (Mobile) */}
                         <AnimatePresence>
                              {isPreviewMode && (
                                   <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{ duration: 0.3 }}
                                        className="absolute top-4 right-4 z-50 block md:hidden"
                                   >
                                        <ToggleGroup
                                             type="single"
                                             value={breakpoint}
                                             onValueChange={(value) => value && setBreakpoint(value as Breakpoint)}
                                             className="flex flex-col space-y-2 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-md"
                                        >
                                             <ToggleGroupItem value="mobile" title="Mobile View" className="p-2">
                                                  <Smartphone size={18} className="text-gray-600 dark:text-gray-300" />
                                             </ToggleGroupItem>
                                             <ToggleGroupItem value="tablet" title="Tablet View" className="p-2">
                                                  <Tablet size={18} className="text-gray-600 dark:text-gray-300" />
                                             </ToggleGroupItem>
                                             <ToggleGroupItem value="desktop" title="Desktop View" className="p-2">
                                                  <Monitor size={18} className="text-gray-600 dark:text-gray-300" />
                                             </ToggleGroupItem>
                                        </ToggleGroup>
                                   </motion.div>
                              )}
                         </AnimatePresence>

                         {/* Left Sheet (Hierarchy or Properties based on context) */}
                         <Sheet open={isLeftSheetOpen} onOpenChange={setIsLeftSheetOpen} >
                              <SheetContent side="left" className="w-screen max-w-md p-4">
                                   <div className="flex justify-end mb-4">
                                        <Button variant="ghost" size="icon" onClick={() => setIsLeftSheetOpen(false)}>
                                             <X size={20} />
                                        </Button>
                                   </div>
                                   {selectedComponentId ? (
                                        <>
                                             <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-2">
                                                  Element Hierarchy
                                             </h2>
                                             <ElementHierarchyViewer />
                                        </>
                                   ) : (
                                        <div className="flex items-center justify-center h-full">
                                             <p className="text-gray-500 dark:text-gray-400">Select a component to view hierarchy.</p>
                                        </div>
                                   )}
                              </SheetContent>
                         </Sheet>

                         {/* Property Panel (Mobile Drawer - now triggered by right swipe) */}
                         {isMobile && !isPreviewMode && selectedComponentId && (
                              <AnimatePresence>
                                   {isPropertyPanelOpen && (
                                        <motion.div
                                             initial={{ x: '100%' }}
                                             animate={{ x: 0 }}
                                             exit={{ x: '100%' }}
                                             transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                                             className="fixed top-0 right-0 h-full w-screen bg-gray-100 dark:bg-gray-900 shadow-xl z-50 overflow-y-auto p-4"
                                        >
                                             <div className="flex justify-between items-center mb-4">
                                                  <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-300">Properties</h2>
                                                  <Button variant="ghost" size="icon" onClick={() => setIsPropertyPanelOpen(false)}>
                                                       <X size={20} />
                                                  </Button>
                                             </div>
                                             <PropertyPanel />
                                        </motion.div>
                                   )}
                              </AnimatePresence>
                         )}
                         {/* Element Hierarchy (Mobile Drawer - now triggered by left swipe) */}
                         {isMobile && !isPreviewMode && selectedComponentId && (
                              <AnimatePresence>
                                   {isHierarchyOpen && (
                                        <motion.div
                                             initial={{ x: '-100%' }}
                                             animate={{ x: 0 }}
                                             exit={{ x: '-100%' }}
                                             transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                                             className="fixed top-0 left-0 h-full w-screen bg-gray-100 dark:bg-gray-900 shadow-xl z-50 overflow-y-auto p-4"
                                        >
                                             <div className="flex justify-between items-center mb-4">
                                                  <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-300">Element Hierarchy</h2>
                                                  <Button variant="ghost" size="icon" onClick={() => setIsHierarchyOpen(false)}>
                                                       <X size={20} />
                                                  </Button>
                                             </div>
                                             <ElementHierarchyViewer />
                                        </motion.div>
                                   )}
                              </AnimatePresence>
                         )}

                         {!isMobile && !isPreviewMode && selectedComponentId && (
                              <Sheet open={isPropertyPanelOpen} onOpenChange={setIsPropertyPanelOpen}>
                                   <SheetContent side="right" className="w-80 p-4">
                                        <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-4">Properties</h2>
                                        <PropertyPanel />
                                   </SheetContent>
                              </Sheet>
                         )}

                         {/* Element Hierarchy Trigger (Large Screens) */}
                         {!isMobile && !isPreviewMode && selectedComponentId && (
                              <Sheet open={isHierarchyOpen} onOpenChange={setIsHierarchyOpen}>
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

                    {/* Mobile Gesture Tracker at the top */}
                    {isMobile && !isPreviewMode && (
                         <div
                              className="absolute top-0 left-0 w-full h-16 z-30"
                              onTouchStart={handleTouchStart}
                              onTouchMove={handleTouchMove}
                              onTouchEnd={handleTouchEnd}
                         />
                    )}
               </div>
          </div>
     );
};

export default MainLayout;