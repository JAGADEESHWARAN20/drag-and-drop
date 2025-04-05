'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useWebsiteStore, Breakpoint } from '../store/WebsiteStore';
import { Page } from '@/types';
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
import {
     Sheet,
     SheetContent,
     SheetTrigger,
     SheetTitle,
     SheetHeader
} from '@/components/ui/sheet'; // Import only necessary components
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { motion, AnimatePresence } from 'framer-motion';
import { Toggle } from '@/components/ui/toggle';
import {
     DndContext,
     DragStartEvent,
     DragEndEvent,
     useSensors,
     useSensor,
     PointerSensor,
} from '@dnd-kit/core';

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
     const { components, selectedComponentId, addComponent, setSelectedComponentId, isSheetOpen, setSheetOpen, setDraggingComponent } = useWebsiteStore();
     const [isPropertyPanelOpen, setIsPropertyPanelOpen] = useState(false);
     const [isHierarchyOpen, setIsHierarchyOpen] = useState(false);
     const [isDarkMode, setIsDarkMode] = useState(false);
     const [isPageSheetOpen, setIsPageSheetOpen] = useState(false);
     const componentPanelRef = useRef<HTMLDivElement>(null);

     useEffect(() => {
          if (isDarkMode) {
               document.documentElement.classList.add('dark');
          } else {
               document.documentElement.classList.remove('dark');
          }
     }, [isDarkMode]);

     useEffect(() => {
          if (selectedComponentId) {
               setIsPropertyPanelOpen(true);
               setIsHierarchyOpen(false);
          } else {
               setIsPropertyPanelOpen(false);
               setIsHierarchyOpen(false);
          }
     }, [selectedComponentId]);

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
          setSheetOpen(false);
          setSelectedComponentId(null);
     };

     const isMobile = breakpoint === 'mobile';

     const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { delay: 300, tolerance: 5 } }));

     const handleDragStart = (event: DragStartEvent) => {
          const { active } = event;
          console.log('Drag started:', active.id, active.data?.current); // Debug log
          if (active.data?.current?.type === 'COMPONENT') {
               const { componentType, defaultProps } = active.data.current;
               setDraggingComponent({ type: componentType, defaultProps });
               // Force sheet closure with a slight delay to ensure state update
               setSheetOpen(false)
          }
     };

     const handleDragEnd = (event: DragEndEvent) => {
          const { active, over } = event;
          console.log('Drag End:', { active, over }); // Debug log
          if (over?.id === 'canvas-drop-area' && active.data?.current?.type === 'COMPONENT') {
               const { componentType, defaultProps } = active.data.current;
               const newComponentId = uuidv4();
               addComponent({
                    type: componentType,
                    props: defaultProps || {},
                    id: newComponentId,
                    pageId: currentPageId,
                    parentId: null,
                    responsiveProps: { desktop: {}, tablet: {}, mobile: {} },
               });
               setDraggingComponent(null);
               setSelectedComponentId(newComponentId);
               toast({
                    title: 'Component Added',
                    description: `Added ${componentType} to canvas.`,
               });
              
          }
     };

     return (
          <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
               <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900">
                    <nav className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 shadow-md">
                         <div className="flex items-center space-x-3">
                              <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}> 
                                   <SheetTrigger asChild>
                                        <Button variant="ghost" className="text-gray-600 dark:text-gray-300 p-2">
                                             <Menu size={20} />
                                        </Button>
                                   </SheetTrigger>
                                   <SheetContent
                                        side="top"
                                        className={`w-full overflow-hidden scrollbar-hidden h-auto max-h-96 p-4 flex flex-col ${isMobile ? 'min-w-[100vw]' : 'min-w-[300px]'}`}
                                   >
                                        <SheetHeader>
                                             <SheetTitle className="text-lg font-semibold text-blue-900 dark:text-blue-300">
                                                  Component Library
                                             </SheetTitle>
                                        </SheetHeader>
                                        <ComponentPanel
                                             ref={componentPanelRef}
                                             onComponentClick={handleComponentAdd}
                                             onClosePanel={() => setSheetOpen(false)}
                                        />
                                   </SheetContent>
                              </Sheet>
                              <h1 className="text-lg font-bold text-black dark:text-white">WebBuilder</h1>
                         </div>

                         <div className="flex items-center space-x-3">
                              <div className="block md:hidden">
                                   <Sheet open={isPageSheetOpen} onOpenChange={setIsPageSheetOpen}>
                                        <SheetTrigger asChild>
                                             <Button
                                                  variant="outline"
                                                  size="icon"
                                                  className="rounded-full p-2"
                                                  onTouchStart={(e) => {
                                                       const timer = setTimeout(() => setIsPageSheetOpen(true), 500);
                                                       e.target?.addEventListener('touchend', () => clearTimeout(timer), { once: true });
                                                  }}
                                             >
                                                  <Plus size={20} className="text-gray-600 dark:text-gray-300" />
                                             </Button>
                                        </SheetTrigger>
                                        <SheetContent side="top" className="w-full p-4">
                                             <SheetHeader>
                                                  <SheetTitle className="text-lg font-semibold text-blue-900 dark:text-blue-300">
                                                       Pages
                                                  </SheetTitle>
                                             </SheetHeader>
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

                              <Toggle
                                   aria-label="Toggle Preview Mode"
                                   pressed={isPreviewMode}
                                   onPressedChange={onPreviewToggle}
                                   className={`flex items-center space-x-2 data-[state=pressed]:bg-blue-600 text-gray-600 dark:text-gray-300 rounded-md px-3 py-1`}
                              >
                                   {isPreviewMode ? <Pen size={16} /> : <Code size={16} />}
                              </Toggle>

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

                    <div className="flex-1 flex overflow-hidden relative">
                         <div className="flex-1 overflow-auto relative">
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

                              {!isPreviewMode && selectedComponentId && (
                                   <Sheet open={isPropertyPanelOpen} onOpenChange={setIsPropertyPanelOpen}>
                                        <SheetTrigger asChild>
                                             <Button
                                                  variant="ghost"
                                                  className="absolute bottom-2 right-5 z-50 text-gray-600 dark:text-gray-300"
                                             >
                                                  {isPropertyPanelOpen ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}
                                             </Button>
                                        </SheetTrigger>
                                        <SheetContent side="right" className="w-80 p-4">
                                             <SheetHeader>
                                                  <SheetTitle className="text-lg font-semibold text-blue-900 dark:text-blue-300">
                                                       Properties
                                                  </SheetTitle>
                                             </SheetHeader>
                                             <PropertyPanel />
                                        </SheetContent>
                                   </Sheet>
                              )}

                              {!isPreviewMode && selectedComponentId && (
                                   <Sheet open={isHierarchyOpen} onOpenChange={setIsHierarchyOpen}>
                                        <SheetTrigger asChild>
                                             <Button
                                                  variant="ghost"
                                                  className="absolute bottom-12 right-5 z-50 text-gray-600 dark:text-gray-300"
                                             >
                                                  <Layers size={24} />
                                             </Button>
                                        </SheetTrigger>
                                        <SheetContent side="right" className="w-80 p-4">
                                             <SheetHeader>
                                                  <SheetTitle className="text-lg font-semibold text-blue-900 dark:text-blue-300">
                                                       Element Hierarchy
                                                  </SheetTitle>
                                             </SheetHeader>
                                             <ElementHierarchyViewer />
                                        </SheetContent>
                                   </Sheet>
                              )}

                              <Canvas isPreviewMode={isPreviewMode} currentBreakpoint={breakpoint} />
                         </div>
                    </div>
               </div>
          </DndContext>
     );
};

export default MainLayout;