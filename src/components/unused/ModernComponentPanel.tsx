import React, { useState, useCallback } from 'react';
import { ComponentLibrary } from '../../data/ComponentLibrary';
import { Search, PlusCircle, Layout, Type, Image as ImageIcon, Layers, Grid3X3, MousePointerClick } from 'lucide-react';
import { useWebsiteStore } from '../../store/WebsiteStore';
import DraggableComponent from '../DraggableComponent';
import { Input } from '../ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { ComponentProps } from '../../types';

interface ComponentPanelProps {
  onComponentClick: (type: string, defaultProps: ComponentProps) => void;
}

const ModernComponentPanel: React.FC<ComponentPanelProps> = ({ onComponentClick }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { setHasDragAttempted, startDragging } = useWebsiteStore();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredComponents = (category: string) => {
    return ComponentLibrary[category]?.filter(
      (comp) => comp.label.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];
  };

  const handleDragStart = useCallback(() => {
    console.log('Drag started');
    setHasDragAttempted(true);
    startDragging();
  }, [setHasDragAttempted, startDragging]);

  const renderCategory = (category: string, icon: JSX.Element) => {
    const components = filteredComponents(category);
    
    if (components.length === 0 && searchTerm) return null;
    
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
          {icon}
          <span>{category}</span>
        </div>
        
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {components.map((component) => (
            <div
              key={component.type}
              className="group relative cursor-grab bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 transition-all hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-sm"
              onDragStart={handleDragStart}
              onClick={() => onComponentClick(component.type, component.defaultProps)}
            >
              <DraggableComponent component={component} />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 bg-blue-500/10 group-hover:opacity-100 rounded-lg transition-opacity">
                <PlusCircle className="w-5 h-5 text-blue-500" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900 p-4">
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
          <Input
            placeholder="Search components..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="pl-9 dark:bg-gray-800"
          />
        </div>
      </div>

      <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-md flex items-center justify-between">
        <div>
          <div className="flex items-center mb-2 text-blue-700 dark:text-blue-300">
            <MousePointerClick size={16} className="mr-2" />
            <span className="text-sm font-medium">Drag or click to add</span>
          </div>
          <p className="text-xs text-blue-600 dark:text-blue-400">
            Drag components to the canvas or click to add them instantly
          </p>
        </div>
      </div>

      <Tabs defaultValue="layout" className="flex-1 overflow-hidden">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="layout">Layout</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
        </TabsList>
        
        <div className="overflow-y-auto h-[calc(100%-2.5rem)] space-y-6 pr-2">
          <TabsContent value="layout" className="mt-0 space-y-6">
            {renderCategory('layout', <Layout size={16} />)}
          </TabsContent>
          
          <TabsContent value="content" className="mt-0 space-y-6">
            {renderCategory('Typography', <Type size={16} />)}
            {renderCategory('Interactive', <MousePointerClick size={16} />)}
          </TabsContent>
          
          <TabsContent value="media" className="mt-0 space-y-6">
            {renderCategory('Media', <ImageIcon size={16} />)}
            {renderCategory('Data Display', <Layers size={16} />)}
            {renderCategory('Structure', <Grid3X3 size={16} />)}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default ModernComponentPanel;
