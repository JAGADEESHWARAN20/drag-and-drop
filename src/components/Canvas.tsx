
import React, { useState, useMemo } from 'react';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragOverlay,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
  MouseSensor,
  TouchSensor,
  useDroppable
} from '@dnd-kit/core';
import { 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy 
} from '@dnd-kit/sortable';
import { useWebsiteStore, Breakpoint, Component } from '../store/WebsiteStore';
import { ComponentRegistry } from '../utils/ComponentRegistry';
import DroppableContainer from './DroppableContainer';
import SortableItem from './SortableItem';
import { v4 as uuidv4 } from 'uuid';
import { motion } from 'framer-motion';
import { toast } from "@/components/ui/use-toast";

interface CanvasProps {
  isPreviewMode: boolean;
  currentBreakpoint: Breakpoint;
}

const CanvasDroppable = ({ children }: { children: React.ReactNode }) => {
  const { setNodeRef } = useDroppable({
    id: 'canvas-droppable',
    data: {
      type: 'CANVAS'
    }
  });

  return (
    <div ref={setNodeRef} className="min-h-[calc(100vh-80px)] w-full">
      {children}
    </div>
  );
};

const Canvas = ({ isPreviewMode, currentBreakpoint }: CanvasProps) => {
  const {
    pages,
    currentPageId,
    components,
    addComponent,
    selectedComponentId,
    setSelectedComponentId,
    reorderComponents,
  } = useWebsiteStore();

  const [activeId, setActiveId] = useState<string | null>(null);

  const currentPage = pages.find(page => page.id === currentPageId) || pages[0];
  const pageComponents = useMemo(() => 
    components.filter(c => c.pageId === currentPage.id), 
    [components, currentPage.id]
  );
  const rootComponents = useMemo(() => 
    pageComponents.filter(c => !c.parentId), 
    [pageComponents]
  );

  const sensors = useSensors(
    useSensor(MouseSensor, {
      // Require the mouse to move by 10 pixels before activating
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(TouchSensor, {
      // Press delay of 250ms, with tolerance of 5px of movement
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, { 
      coordinateGetter: sortableKeyboardCoordinates 
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    console.log('Drag started:', active.id, active.data.current);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    console.log('Drag ended:', { active, over });
    
    if (over) {
      // If we're reordering existing components
      if (active.id.toString().startsWith('sortable-')) {
        const oldIndex = rootComponents.findIndex(c => c.id === active.id);
        const newIndex = rootComponents.findIndex(c => c.id === over.id);
        if (oldIndex !== -1 && newIndex !== -1) {
          reorderComponents(currentPage.id, oldIndex, newIndex);
        }
      } 
      // If we're dropping a new component from the library
      else if (active.data?.current?.type === 'COMPONENT') {
        const { componentType, defaultProps } = active.data.current;
        
        // If dropping into a container
        if (over.data?.current?.accepts === 'COMPONENT') {
          const containerId = over.data.current.containerId;
          
          if (containerId) {
            const newComponentId = uuidv4();
            addComponent({
              id: newComponentId,
              pageId: currentPage.id,
              parentId: containerId,
              type: componentType,
              props: { ...defaultProps },
              children: [],
              responsiveProps: {
                desktop: {},
                tablet: {},
                mobile: {}
              }
            });
            
            toast({
              title: "Component Added",
              description: `Added ${componentType} inside container`,
            });
          }
        } 
        // If dropping directly on the canvas
        else if (over.id === 'canvas-droppable' || over.data?.current?.type === 'CANVAS') {
          const newComponentId = uuidv4();
          addComponent({
            id: newComponentId,
            pageId: currentPage.id,
            parentId: null,
            type: componentType,
            props: { ...defaultProps },
            children: [],
            responsiveProps: {
              desktop: {},
              tablet: {},
              mobile: {}
            }
          });
          
          toast({
            title: "Component Added",
            description: `Added ${componentType} to canvas`,
          });
        }
      }
    }
    
    setActiveId(null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    console.log("Drag over:", { active, over });
  };

  const renderComponent = (componentData: Component) => {
    const Component = ComponentRegistry[componentData.type];
    if (!Component) return null;

    const responsiveProps = componentData.responsiveProps?.[currentBreakpoint] || {};
    const mergedProps = { ...componentData.props, ...responsiveProps };
    const childComponents = components.filter(c => c.parentId === componentData.id);

    return (
      <DroppableContainer
        key={componentData.id}
        id={componentData.id}
        isPreviewMode={isPreviewMode}
        isSelected={componentData.id === selectedComponentId}
        onSelect={() => setSelectedComponentId(componentData.id)}
      >
        <Component 
          {...mergedProps} 
          id={componentData.id} 
          isPreviewMode={isPreviewMode}
        >
          {childComponents.map(child => renderComponent(child))}
        </Component>
      </DroppableContainer>
    );
  };

  const getCanvasWidth = () => {
    switch (currentBreakpoint) {
      case 'mobile': return 'w-full max-w-[375px]';
      case 'tablet': return 'w-full max-w-[768px]';
      case 'desktop': return 'w-full';
      default: return 'w-full';
    }
  };

  return (
    <DndContext 
      sensors={sensors} 
      collisionDetection={closestCenter} 
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
    >
      <div className={`min-h-full mx-auto bg-white ${getCanvasWidth()} transition-all duration-300`}>
        <CanvasDroppable>
          <div
            className={`min-h-[calc(100vh-80px)] ${
              isPreviewMode ? 'bg-white' : 'bg-gray-50 border-dashed border-2 border-gray-300'
            } ${!isPreviewMode ? 'hover:bg-blue-50 transition-colors' : ''}`}
          >
            <SortableContext 
              items={rootComponents.map(c => c.id)} 
              strategy={verticalListSortingStrategy}
            >
              {rootComponents.length === 0 && !isPreviewMode ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full flex items-center justify-center text-gray-500 text-lg p-6"
                >
                  Drag components here to start building
                </motion.div>
              ) : (
                <div className="p-6">
                  {rootComponents.map(component => (
                    <SortableItem key={component.id} id={component.id}>
                      {renderComponent(component)}
                    </SortableItem>
                  ))}
                </div>
              )}
            </SortableContext>
          </div>
        </CanvasDroppable>
      </div>
    </DndContext>
  );
};

export default Canvas;
