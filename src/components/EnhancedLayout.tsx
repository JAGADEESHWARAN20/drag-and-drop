
import React, { useState } from 'react';
import { useEnhancedWebsiteStore } from '../store/EnhancedWebsiteStore';
import { LibraryComponent } from '../types/ProjectStructure';
import { Search, Menu, X, Box, Layout, Type, MousePointerClick, Image, Heading, Grid3X3, Layers, MoveRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';
import { useDraggable } from '@dnd-kit/core';
import ModernCanvas from './ModernCanvas';
import ElementHierarchy from './ElementHierarchy';
import MainNavigation from './MainNavigation';
import { useUndoRedo } from '../hooks/useUndoRedo';

type LucideIcon = React.ComponentType<{ size?: number | string; className?: string }>;

const iconMap: Record<string, LucideIcon> = {
  box: Box,
  layout: Layout,
  'grid-3x3': Grid3X3,
  heading: Heading,
  type: Type,
  'mouse-pointer-click': MousePointerClick,
  image: Image,
};

interface DraggableComponentProps {
  component: LibraryComponent;
}

const DraggableComponent: React.FC<DraggableComponentProps> = ({ component }) => {
  const IconComponent = iconMap[component.icon] || Box;
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `draggable-${component.name.toLowerCase()}`,
    data: {
      type: 'COMPONENT',
      componentType: component.name,
      defaultProps: component.defaultProps,
    },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`component-item dark:component-item ${isDragging ? 'dragging' : ''}`}
    >
      <IconComponent size={24} className="component-item-icon dark:component-item-icon" />
      <span className="component-item-name dark:component-item-name">{component.name}</span>
      <div className="component-item-overlay" />
    </div>
  );
};

const EnhancedLayout: React.FC = () => {
  const {
    currentProject,
    sidebarOpen,
    setSidebarOpen,
    addElement,
  } = useEnhancedWebsiteStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('layout');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [currentBreakpoint, setCurrentBreakpoint] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  
  // Undo/Redo functionality
  const { undo, redo, canUndo, canRedo } = useUndoRedo(currentProject);

  const categories = Object.keys(currentProject.componentLibrary);

  const filteredComponents = React.useMemo(() => {
    const categoryData = currentProject.componentLibrary[activeCategory];
    if (!categoryData) return [];

    return Object.values(categoryData.components).filter((component) =>
      component.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [currentProject.componentLibrary, activeCategory, searchTerm]);

  const handleComponentClick = (component: LibraryComponent) => {
    addElement(component.name, null);
    toast({
      title: 'Component Added',
      description: `${component.name} added to canvas.`,
    });
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <MainNavigation 
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
      />
      
      <div className="flex-1 flex overflow-hidden">
        {!isPreviewMode && (
          <div className="w-18em border-r border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden">
            <Tabs defaultValue="components" className="flex flex-col h-full">
              <div className="border-b border-gray-200 dark:border-gray-800">
                <TabsList className="p-0 justify-start border-0 bg-transparent h-auto">
                  <TabsTrigger
                    value="components"
                    className="flex-1 rounded-none border-b-0.125em border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                  >
                    <Layers className="h-1em w-1em mr-0.5em" />
                    Components
                  </TabsTrigger>
                  <TabsTrigger
                    value="layers"
                    className="flex-1 rounded-none border-b-0.125em border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                  >
                    <MoveRight className="h-1em w-1em mr-0.5em" />
                    Layers
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="components" className="flex-1 overflow-hidden m-0 border-0">
                <div className="p-1em border-b border-gray-200 dark:border-gray-800">
                  <div className="relative">
                    <Search className="absolute left-0.75em top-0.625em h-1em w-1em text-gray-400" />
                    <Input
                      placeholder="Search components..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-2.25em"
                    />
                  </div>
                </div>
                <div className="px-1em py-0.5em border-b border-gray-200 dark:border-gray-800">
                  <div className="flex gap-0.25em overflow-x-auto">
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => setActiveCategory(category)}
                        className={`
                          px-0.75em py-0.375em text-0.875rem font-medium rounded-0.375em whitespace-nowrap
                          ${activeCategory === category
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                          }
                        `}
                      >
                        {currentProject.componentLibrary[category]?.category || category}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-1em">
                  {filteredComponents.length > 0 ? (
                    <div className="grid grid-cols-2 gap-0.75em">
                      {filteredComponents.map((component) => (
                        <div
                          key={component.id}
                          onClick={() => handleComponentClick(component)}
                        >
                          <DraggableComponent component={component} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 dark:text-gray-400 py-2em">
                      <Box size={32} className="mx-auto mb-0.5em opacity-50" />
                      <p className="text-0.875rem">No components found</p>
                      {searchTerm && (
                        <p className="text-0.75rem mt-0.25em">Try a different search term</p>
                      )}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="layers" className="flex-1 overflow-auto m-0 border-0">
                <ElementHierarchy />
              </TabsContent>
            </Tabs>
          </div>
        )}

        <div className="flex-1 flex overflow-hidden">
          <ModernCanvas
            isPreviewMode={isPreviewMode}
            currentBreakpoint={currentBreakpoint}
            onBreakpointChange={setCurrentBreakpoint}
            isLeftPanelOpen={!isPreviewMode}
          />
        </div>
      </div>
    </div>
  );
};

export default EnhancedLayout;
