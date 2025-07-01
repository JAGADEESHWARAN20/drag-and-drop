import React, { useState } from 'react';
import { useEnhancedWebsiteStore } from '../store/EnhancedWebsiteStore';
import { LibraryComponent } from '../types/ProjectStructure';
import { Search, Menu, X, Box, Layout, Type, MousePointerClick, Image, Heading, Grid3X3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { useDraggable } from '@dnd-kit/core';

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

interface EnhancedComponentPanelProps {
  className?: string;
}

const EnhancedComponentPanel: React.FC<EnhancedComponentPanelProps> = ({ className = '' }) => {
  const {
    currentProject,
    sidebarOpen,
    setSidebarOpen,
    addElement,
  } = useEnhancedWebsiteStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('layout');

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
    <>
      <Button
        variant="outline"
        size="sm"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
      </Button>
      <div
        className={`sidebar dark:sidebar ${sidebarOpen ? 'open' : ''} ${className}`}
        onDragStart={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Components</h2>
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={16} />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search components..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-800">
          <div className="flex gap-1 overflow-x-auto">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`
                  px-3 py-1.5 text-sm font-medium rounded-md whitespace-nowrap
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
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center text-blue-700 dark:text-blue-300">
            <MousePointerClick size={16} className="mr-2" />
            <span className="text-sm font-medium">Drag to Canvas</span>
          </div>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
            Drag components to the canvas or click to add instantly
          </p>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {filteredComponents.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
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
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              <Box size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">No components found</p>
              {searchTerm && (
                <p className="text-xs mt-1">Try a different search term</p>
              )}
            </div>
          )}
        </div>
      </div>
      {sidebarOpen && (
        <div
          className="sheet-overlay md:hidden"
          onClick={() => setSidebarOpen(false)}
          onDragStart={(e) => e.stopPropagation()}
        />
      )}
    </>
  );
};

export default EnhancedComponentPanel;