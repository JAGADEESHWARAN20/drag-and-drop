'use client';

import React, { useState, forwardRef, useMemo, useCallback } from 'react';
import { ComponentLibrary } from '../data/ComponentLibrary';
import { Search, MousePointerClick } from 'lucide-react';
import { ComponentType, SVGProps } from 'react';
import Button from '@/components/ui/button';
import {
  SortableContext,
  horizontalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useWebsiteStore } from '../store/WebsiteStore';
import DraggableComponent from './DraggableComponent';
import { UniqueIdentifier } from '@dnd-kit/core';
import { ComponentProps } from '../types';

interface LibraryComponent {
  type: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement> & { size?: string | number }>;
  defaultProps: ComponentProps;
}

interface ComponentPanelProps {
  onComponentClick: (type: string, defaultProps: ComponentProps) => void;
}

interface SortableLibraryComponentProps {
  component: LibraryComponent;
  onComponentClick: (type: string, defaultProps: ComponentProps) => void;
}

const SortableLibraryComponent = ({ component, onComponentClick }: SortableLibraryComponentProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: component.type });
  // Only set style if transform or transition is present
  const dynamicStyle: React.CSSProperties = {};
  if (transform) dynamicStyle.transform = CSS.Transform.toString(transform);
  if (transition) dynamicStyle.transition = transition;
  const dynamicClass = transform ? ' will-change-transform' : '';

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={Object.keys(dynamicStyle).length ? dynamicStyle : undefined}
      className={
        `p-2 border rounded cursor-grab bg-white flex flex-col items-center justify-center text-sm w-20 h-20 flex-shrink-0 hover:bg-gray-50 hover:border-blue-300 transition-colors dark:bg-slate-700${dynamicClass}`
      }
      onClick={() => onComponentClick(component.type, component.defaultProps)}
    >
      <DraggableComponent component={component} />
    </div>
  );
};

const ComponentPanel = forwardRef<HTMLDivElement, ComponentPanelProps>(({ onComponentClick }, ref) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { componentOrder, setComponentOrder, setDraggingComponent, setHasDragAttempted, startDragging } = useWebsiteStore();

  const allComponentsArray = useMemo(() => Object.values(ComponentLibrary).flat(), []);

  const orderedComponents = useMemo(() => {
    if (!componentOrder || componentOrder.length === 0) {
      return allComponentsArray;
    }
    const ordered: LibraryComponent[] = [];
    const remaining = new Map(allComponentsArray.map(comp => [comp.type, comp]));
    for (const type of componentOrder) {
      const comp = remaining.get(type);
      if (comp) {
        ordered.push(comp);
        remaining.delete(type);
      }
    }
    ordered.push(...remaining.values());
    return ordered;
  }, [allComponentsArray, componentOrder]);

  const filteredComponents = useMemo(() => {
    return orderedComponents.filter((comp) =>
      comp.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [orderedComponents, searchTerm]);

  const handleSearchButtonClick = () => {
    setIsSearchOpen(!isSearchOpen);
    if (!isSearchOpen) {
      setTimeout(() => {
        document.querySelector<HTMLInputElement>('.component-panel-search-input')?.focus();
      }, 100);
    } else {
      setSearchTerm('');
    }
  };

  // Listener for drag start in ComponentPanel
  const handleDragStart = useCallback(() => {
    setHasDragAttempted(true);
    startDragging();
  }, [setHasDragAttempted, startDragging]);

  return (
    <div className="p-4 flex flex-col h-full" ref={ref}>
      <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-md flex items-center justify-between">
        <div>
          <div className="flex items-center mb-2 text-blue-700 dark:text-blue-300">
            <MousePointerClick size={16} className="mr-2" />
            <span className="text-sm font-medium">Drag to reorder, Click to add</span>
          </div>
          <p className="text-xs text-blue-600 dark:text-blue-400">
            Drag and drop components to change their order in the panel. Click to add to the canvas.
          </p>
        </div>
        <Button
          variant="outline"
          size="icon"
          className="rounded-full"
          onClick={handleSearchButtonClick}
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>

      {isSearchOpen && (
        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search components..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="component-panel-search-input w-full p-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
          </div>
        </div>
      )}

      <SortableContext
        items={filteredComponents.map((component) => component.type as UniqueIdentifier)}
        strategy={horizontalListSortingStrategy}
      >
        <div
          className="flex space-x-2 overflow-x-auto overflow-y-hidden min-h-0 flex-1 touch-pan-x"
          onDragStart={handleDragStart}
        >
          {filteredComponents.map((component) => (
            <SortableLibraryComponent
              key={component.type}
              component={component}
              onComponentClick={onComponentClick}
            />
          ))}
        </div>
      </SortableContext>

      {filteredComponents.length === 0 && searchTerm && (
        <div className="text-center text-gray-500 dark:text-gray-400">
          No components found matching "{searchTerm}"
        </div>
      )}
      {Object.keys(ComponentLibrary).length > 0 && filteredComponents.length === 0 && !searchTerm && !isSearchOpen && (
        <div className="text-center text-gray-500 dark:text-gray-400">
          Drag and drop to reorder components. Click to add to the canvas.
        </div>
      )}
      {Object.keys(ComponentLibrary).length === 0 && (
        <div className="text-center text-gray-500 dark:text-gray-400">
          No components available in the library.
        </div>
      )}
    </div>
  );
});

ComponentPanel.displayName = 'ComponentPanel';

export default ComponentPanel;
