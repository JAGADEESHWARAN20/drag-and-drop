'use client';

import React, { useState, forwardRef, useMemo, useCallback, useRef } from 'react'; // Import useRef
import { ComponentLibrary } from '../data/ComponentLibrary';
import { Search, MousePointerClick } from 'lucide-react';
import { ComponentType, SVGProps } from 'react';
import Button from '@/components/ui/button';
import {
  DndContext,
  useDndContext as useDndKitContext, // Import useDndContext
} from '@dnd-kit/core';
import {
  SortableContext,
  horizontalListSortingStrategy, // Import horizontal strategy
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useWebsiteStore } from '../store/WebsiteStore';
import { toast } from '@/components/ui/use-toast';

interface LibraryComponent {
  type: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement> & { size?: string | number }>;
  defaultProps: Record<string, string | number | boolean | string[] | string[][] | Record<string, string | number>>;
}

interface ComponentPanelProps {
  onComponentClick: (type: string, defaultProps: Record<string, any>) => void;
  onClosePanel?: () => void; // Add the onClosePanel prop here
}

const SortableLibraryComponent = ({ component, onComponentClick }: { component: LibraryComponent; onComponentClick: (type: string, defaultProps: Record<string, any>) => void }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: component.type });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: 'grab',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      key={component.type}
      onClick={() => onComponentClick(component.type, component.defaultProps)}
      className="p-2 border rounded cursor-grab bg-white flex flex-col items-center justify-center text-sm w-20 h-20 flex-shrink-0 hover:bg-gray-50 hover:border-blue-300 transition-colors dark:bg-slate-700"
    >
      <div className="text-blue-500 mb-1 dark:text-white">
        <component.icon size={20} aria-hidden="true" />
      </div>
      <span className="text-black dark:text-white text-center">{component.label}</span>
    </div>
  );
};

const ComponentPanel = forwardRef<HTMLDivElement, ComponentPanelProps>(({ onComponentClick, onClosePanel }, ref) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { componentOrder, setComponentOrder, startDragging, endDragging } = useWebsiteStore(); // Get startDragging and endDragging actions
  const { isDragging: dndKitIsDragging } = useDndKitContext(); // Get isDragging from dnd-kit
  const dragStartTimeout = useRef<NodeJS.Timeout | null>(null); // Ref for the timeout
  const isDraggingIntent = useRef(false); // Ref to track drag intent
  const [hasDraggedSignificantly, setHasDraggedSignificantly] = useState(false);
  const allComponentsArray = useMemo(() => {
    return Object.values(ComponentLibrary).flat();
  }, []);

  const orderedComponents = useMemo(() => {
    if (!componentOrder || componentOrder.length === 0) {
      return allComponentsArray;
    }
    const ordered = [];
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

  const initialDragPosition = useRef({ x: 0, y: 0 });

  const handleDragStart = useCallback((event) => {
    isDraggingIntent.current = true;
    initialDragPosition.current = event.client || { x: 0, y: 0 }; // Use event.client or adjust based on your event object
    dragStartTimeout.current = setTimeout(() => {
      if (isDraggingIntent.current && hasDraggedSignificantly) { // Only close if dragged
        startDragging();
        if (onClosePanel) {
          onClosePanel();
        }
      }
      isDraggingIntent.current = false;
      dragStartTimeout.current = null;
      setHasDraggedSignificantly(false); // Reset for the next drag
    }, 150);
  }, [startDragging, onClosePanel, setHasDraggedSignificantly]);
  const handleDragMove = useCallback((event) => {
    if (isDraggingIntent.current) {
      const currentPosition = event.client || { x: 0, y: 0 };
      const deltaX = Math.abs(currentPosition.x - initialDragPosition.current.x);
      const deltaY = Math.abs(currentPosition.y - initialDragPosition.current.y);

      // Define a threshold for significant movement
      const dragThreshold = 5; // Adjust this value

      if (deltaX > dragThreshold || deltaY > dragThreshold) {
        setHasDraggedSignificantly(true);
      }
    }
  }, [initialDragPosition, isDraggingIntent, setHasDraggedSignificantly]);

  const handleDragEnd = useCallback((event: any) => {
    isDraggingIntent.current = false;
    if (dragStartTimeout.current) {
      clearTimeout(dragStartTimeout.current);
      dragStartTimeout.current = null;
    }
    endDragging(); // Call the Zustand action to set isDragging to false
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = orderedComponents.findIndex(comp => comp.type === active.id);
      const newIndex = orderedComponents.findIndex(comp => comp.type === over?.id);

      const newOrder = Array.from(componentOrder);
      const activeIdInOrder = newOrder.find(id => id === active.id);
      const overIdInOrder = newOrder.find(id => id === over?.id);

      if (activeIdInOrder && overIdInOrder) {
        const oldOrderIndex = newOrder.indexOf(activeIdInOrder);
        const newOrderIndex = newOrder.indexOf(overIdInOrder);
        newOrder.splice(oldOrderIndex, 1);
        newOrder.splice(newOrderIndex, 0, active.id);
        setComponentOrder(newOrder);
        return;
      }

      if (activeIdInOrder && !overIdInOrder) {
        const oldOrderIndex = newOrder.indexOf(activeIdInOrder);
        newOrder.splice(oldOrderIndex, 1);
        newOrder.push(active.id);
        setComponentOrder(newOrder);
        return;
      }

      if (!activeIdInOrder && overIdInOrder) {
        const newOrderIndex = newOrder.indexOf(overIdInOrder);
        newOrder.splice(newOrderIndex, 0, active.id);
        setComponentOrder(newOrder);
        return;
      }

      if (!activeIdInOrder && !overIdInOrder) {
        setComponentOrder([...componentOrder, active.id]);
      }
    }
  }, [componentOrder, orderedComponents, setComponentOrder, startDragging, endDragging]);

  return (
    <div className="p-4 h-full flex flex-col" ref={ref}>
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

      <DndContext onDragStart={handleDragStart} onDragMove={handleDragMove} onDragEnd={handleDragEnd}>
        <SortableContext
          items={filteredComponents.map((component) => component.type)}
          strategy={horizontalListSortingStrategy} // Use horizontal sorting
        >
          <div className={`flex space-x-2 overflow-x-auto ${dndKitIsDragging ? 'overflow-x-hidden overflow-y-hidden' : ''}`} style={{ touchAction: 'pan-x' }}>
            {filteredComponents.map((component) => (
              <SortableLibraryComponent
                key={component.type}
                component={component}
                onComponentClick={onComponentClick}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {Object.keys(filteredComponents).length === 0 && searchTerm && (
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