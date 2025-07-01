
import React, { useState } from 'react';
import { useEnhancedWebsiteStore } from '../store/EnhancedWebsiteStore';
import { LibraryComponent } from '../types/ProjectStructure';
import { 
  Search, 
  Menu, 
  X, 
  Box, 
  Layout, 
  Type, 
  MousePointerClick, 
  Image, 
  Heading,
  Grid3X3
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

const iconMap: Record<string, React.ComponentType<any>> = {
  'box': Box,
  'layout': Layout,
  'grid-3x3': Grid3X3,
  'heading': Heading,
  'type': Type,
  'mouse-pointer-click': MousePointerClick,
  'image': Image
};

interface DraggableComponentProps {
  component: LibraryComponent;
  onDragStart: (component: LibraryComponent) => void;
  onDragEnd: () => void;
}

const DraggableComponent: React.FC<DraggableComponentProps> = ({ 
  component, 
  onDragStart, 
  onDragEnd 
}) => {
  const IconComponent = iconMap[component.icon] || Box;

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('application/json', JSON.stringify(component));
    e.dataTransfer.effectAllowed = 'copy';
    onDragStart(component);
  };

  const handleDragEnd = () => {
    onDragEnd();
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className="group flex flex-col items-center p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg cursor-grab hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-sm transition-all active:cursor-grabbing"
    >
      <div className="text-blue-500 dark:text-blue-400 mb-2">
        <IconComponent size={24} />
      </div>
      <span className="text-xs text-center text-gray-700 dark:text-gray-300 font-medium">
        {component.name}
      </span>
      <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 rounded-lg transition-opacity" />
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
    startDrag, 
    endDrag,
    addElement 
  } = useEnhancedWebsiteStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('layout');

  const categories = Object.keys(currentProject.componentLibrary);
  
  const filteredComponents = React.useMemo(() => {
    const categoryData = currentProject.componentLibrary[activeCategory];
    if (!categoryData) return [];

    return Object.values(categoryData.components).filter(component =>
      component.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [currentProject.componentLibrary, activeCategory, searchTerm]);

  const handleDragStart = (component: LibraryComponent) => {
    startDrag(component, 'sidebar');
  };

  const handleDragEnd = () => {
    endDrag();
  };

  const handleComponentClick = (component: LibraryComponent) => {
    addElement(component.name);
  };

  return (
    <>
      {/* Mobile toggle button */}
      <Button
        variant="outline"
        size="sm"
        className="md:hidden fixed top-4 left-4 z-50"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
      </Button>

      {/* Sidebar */}
      <div
        className={`
          fixed md:relative top-0 left-0 h-full bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 
          transition-transform duration-300 ease-in-out z-40
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          w-80 md:w-72 flex flex-col ${className}
        `}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Components
            </h2>
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={16} />
            </Button>
          </div>

          {/* Search */}
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

        {/* Category Tabs */}
        <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-800">
          <div className="flex space-x-1 overflow-x-auto">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`
                  px-3 py-1.5 text-sm font-medium rounded-md whitespace-nowrap transition-colors
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

        {/* Drag Instructions */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center text-blue-700 dark:text-blue-300">
            <MousePointerClick size={16} className="mr-2" />
            <span className="text-sm font-medium">Drag to Canvas</span>
          </div>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
            Drag components to the canvas or click to add instantly
          </p>
        </div>

        {/* Components Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredComponents.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {filteredComponents.map((component) => (
                <div
                  key={component.id}
                  onClick={() => handleComponentClick(component)}
                >
                  <DraggableComponent
                    component={component}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                  />
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

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  );
};

export default EnhancedComponentPanel;
