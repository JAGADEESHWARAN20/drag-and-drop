'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useWebsiteStore, Breakpoint } from '../store/WebsiteStore';
import { Page, ComponentProps } from '@/types';
import ComponentPanel from './ComponentPanel';
import Canvas from './unused/Canvas';
import PropertyPanel from './PropertyPanel';
import { Menu, ChevronRight, ChevronLeft, X, Download, Smartphone, Tablet, Monitor, Layers, Code, Pen, Plus } from 'lucide-react';
import Button from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { v4 as uuidv4 } from 'uuid';
import { toast } from '@/components/ui/use-toast';
import {
     Drawer,
     DrawerTrigger,
     DrawerContent,
     DrawerClose,
     DrawerTitle,
     DrawerHeader,
} from '@/components/ui/drawer';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { motion, AnimatePresence } from 'framer-motion';
import {
     DndContext,
     DragStartEvent,
     DragEndEvent,
     useSensors,
     useSensor,
     PointerSensor,
     UniqueIdentifier,
} from '@dnd-kit/core';
import { useSwipeable } from 'react-swipeable';
import ElementHierarchyViewer from './ElementHierarchyViewer';

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
     const {
          components,
          selectedComponentId,
          addComponent,
          setSelectedComponentId,
          isSheetOpen,
          setSheetOpen,
          setDraggingComponent,
          draggingComponent,
     } = useWebsiteStore();

     const [isPropertyPanelOpen, setIsPropertyPanelOpen] = useState(false);
     const [isHierarchyOpen, setIsHierarchyOpen] = useState(false);
     const [isDarkMode, setIsDarkMode] = useState(false);
     const [isPageSheetOpen, setIsPageSheetOpen] = useState(false);
     const componentPanelRef = useRef<HTMLDivElement>(null);
     const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);

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
               setIsHierarchyOpen(true);
          } else {
               setIsPropertyPanelOpen(false);
               setIsHierarchyOpen(false);
          }
     }, [selectedComponentId]);

     useEffect(() => {
          if (draggingComponent) {
               setSheetOpen(false);
          }
     }, [draggingComponent, setSheetOpen]);

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

     const handleComponentAdd = (type: string, defaultProps: ComponentProps) => {
          const newId = uuidv4();
          addComponent({
                // Assign a unique ID immediately
               type,
               props: defaultProps || {},
               pageId: currentPageId,
               parentId: null,
               responsiveProps: { desktop: {}, tablet: {}, mobile: {} },
               allowChildren: true,
               children: [],
          });
          toast({
               title: 'Component Added',
               description: `Added ${type} to canvas.`,
          });
          setSheetOpen(false);
          setSelectedComponentId(newId);
     };

     const isMobile = breakpoint === 'mobile';

     const sensors = useSensors(
          useSensor(PointerSensor, {
               activationConstraint: {
                    delay: 150,
                    tolerance: 8,
                    distance: 5,
               },
          })
     );

     const handleDragStart = (event: DragStartEvent) => {
          const { active } = event;
          setActiveId(active.id);

          if (active.data?.current?.type === 'COMPONENT_LIB_ITEM') {
               const { componentType, defaultProps } = active.data.current;
               setDraggingComponent({ type: componentType, defaultProps });
               
               if (componentPanelRef.current) {
                    componentPanelRef.current.style.pointerEvents = 'none';
                    setSheetOpen(false);
               }
          }
     };

     const handleDragEnd = (event: DragEndEvent) => {
          const { active, over } = event;
          setActiveId(null);

          if (componentPanelRef.current) {
               componentPanelRef.current.style.pointerEvents = 'auto';
          }

          if (active?.data?.current?.type === 'COMPONENT_LIB_ITEM' && over?.id === 'canvas-drop-area') {
               const newComponentId = uuidv4();
               addComponent({
                    
                    type: active.data.current.componentType,
                    props: active.data.current.defaultProps || {},
                    pageId: currentPageId,
                    parentId: null,
                    responsiveProps: { desktop: {}, tablet: {}, mobile: {} },
                    allowChildren: true,
                    children: [],
               });
               setDraggingComponent(null);
               setSelectedComponentId(newComponentId);
               toast({
                    title: 'Component Added',
                    description: `Added ${active.data.current.componentType} to canvas.`,
               });
          }

          setDraggingComponent(null);
     };

     const swipeHandlers = useSwipeable({
          onSwipedLeft: (eventData) => {
               if (eventData.initial[1] > window.innerHeight * 0.7) {
                    setIsPropertyPanelOpen(true);
               } else if (eventData.initial[1] < window.innerHeight * 0.3) {
                    setIsHierarchyOpen(true);
               }
          },
          onSwipedRight: (eventData) => {
               if (eventData.initial[1] > window.innerHeight * 0.7) {
                    setIsPropertyPanelOpen(false);
               } else if (eventData.initial[1] < window.innerHeight * 0.3) {
                    setIsHierarchyOpen(false);
               }
          },
          trackTouch: true,
     });

     return (
          <DndContext
               sensors={sensors}
               onDragStart={handleDragStart}
               onDragEnd={handleDragEnd}
          >
               <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900" {...swipeHandlers}>
                    <nav className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 shadow-md">
                         <div className="flex items-center space-x-3">
                              <Drawer open={isSheetOpen} onOpenChange={setSheetOpen}>
                                   <DrawerTrigger asChild>
                                        <Button variant="ghost" className="text-gray-600 dark:text-gray-300 p-2">
                                             <Menu size={20} />
                                        </Button>
                                   </DrawerTrigger>
                                   <DrawerContent className="bottom-0 left-0 right-0 top-auto h-[40vh] max-h-[50vh] p-4">
                                        <DrawerHeader>
                                             <DrawerTitle className="text-lg font-semibold text-blue-900 dark:text-blue-300">
                                                  Component Library
                                             </DrawerTitle>
                                             <DrawerClose asChild>
                                                  <Button variant="ghost" className="absolute right-4 top-4 text-gray-600 dark:text-gray-300">
                                                       <X size={20} />
                                                  </Button>
                                             </DrawerClose>
                                        </DrawerHeader>
                                        <ComponentPanel onComponentClick={handleComponentAdd} ref={componentPanelRef} />
                                   </DrawerContent>
                              </Drawer>
                              <h1 className="text-lg font-bold text-black dark:text-white">QuickSite</h1>
                         </div>

                         <div className="flex items-center space-x-3">
                              <div className="block md:hidden">
                                   <Drawer open={isPageSheetOpen} onOpenChange={setIsPageSheetOpen}>
                                        <DrawerTrigger asChild>
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
                                        </DrawerTrigger>
                                        <DrawerContent className="bottom-0 left-0 right-0 top-auto h-[50vh] max-h-[50vh] p-4">
                                             <DrawerHeader>
                                                  <DrawerTitle className="text-lg font-semibold text-blue-900 dark:text-blue-300">
                                                       Pages
                                                  </DrawerTitle>
                                                  <DrawerClose asChild>
                                                       <Button variant="ghost" className="absolute right-4 top-4 text-gray-600 dark:text-gray-300">
                                                            <X size={20} />
                                                       </Button>
                                                  </DrawerClose>
                                             </DrawerHeader>
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
                                        </DrawerContent>
                                   </Drawer>
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

                              <Button
                                   aria-label="Toggle Preview Mode"
                                   variant={isPreviewMode ? "default" : "outline"}
                                   onClick={onPreviewToggle}
                                   className="flex items-center space-x-2"
                                   size="sm"
                              >
                                   {isPreviewMode ? <Pen size={16} className="mr-1" /> : <Code size={16} className="mr-1" />}
                                   {isPreviewMode ? "Edit" : "Preview"}
                              </Button>

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
                                   <Drawer open={isPropertyPanelOpen} onOpenChange={setIsPropertyPanelOpen}>
                                        <DrawerTrigger asChild>
                                             <Button
                                                  variant="ghost"
                                                  className="absolute bottom-2 right-5 z-50 text-gray-600 dark:text-gray-300"
                                             >
                                                  {isPropertyPanelOpen ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}
                                             </Button>
                                        </DrawerTrigger>
                                        <DrawerContent className="right-0 top-0 bottom-0 w-80 p-4">
                                             <DrawerHeader>
                                                  <DrawerTitle className="text-lg font-semibold text-blue-900 dark:text-blue-300">
                                                       Properties
                                                  </DrawerTitle>
                                                  <DrawerClose asChild>
                                                       <Button variant="ghost" className="absolute right-4 top-4 text-gray-600 dark:text-gray-300">
                                                            <X size={20} />
                                                       </Button>
                                                  </DrawerClose>
                                             </DrawerHeader>
                                             <PropertyPanel />
                                        </DrawerContent>
                                   </Drawer>
                              )}

                              {!isPreviewMode && (
                                   <Drawer open={isHierarchyOpen} onOpenChange={setIsHierarchyOpen}>
                                        <DrawerTrigger asChild>
                                             <Button
                                                  variant="ghost"
                                                  className={`absolute bottom-12 right-5 z-50 text-gray-600 dark:text-gray-300 ${isMobile ? 'left-5 right-auto' : ''}`}
                                             >
                                                  <Layers size={24} />
                                             </Button>
                                        </DrawerTrigger>
                                        <DrawerContent className={`top-0 bottom-0 ${isMobile ? 'left-0 right-0' : 'right-0'} w-full md:w-80 p-4`}>
                                             <DrawerHeader>
                                                  <DrawerTitle className="text-lg font-semibold text-blue-900 dark:text-blue-300">
                                                       Element Hierarchy
                                                  </DrawerTitle>
                                                  <DrawerClose asChild>
                                                       <Button variant="ghost" className="absolute right-4 top-4 text-gray-600 dark:text-gray-300">
                                                            <X size={20} />
                                                       </Button>
                                                  </DrawerClose>
                                             </DrawerHeader>
                                             <ElementHierarchyViewer />
                                        </DrawerContent>
                                   </Drawer>
                              )}

                              <Canvas isPreviewMode={isPreviewMode} currentBreakpoint={breakpoint} />
                         </div>
                    </div>
               </div>
          </DndContext>
     );
};

export default MainLayout;
