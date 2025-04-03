
import React, { useState, useMemo, useCallback } from 'react';
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
  useDroppable,
  DragMoveEvent
} from '@dnd-kit/core';
import { 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy,
  arrayMove
} from '@dnd-kit/sortable';
import { useWebsiteStore, Breakpoint, Component } from '../store/WebsiteStore';
import { ComponentRegistry } from '../utils/ComponentRegistry';
import DroppableContainer from './DroppableContainer';
import SortableItem from './SortableItem';
import { v4 as uuidv4 } from 'uuid';
import { motion } from 'framer-motion';
import { toast } from "@/components/ui/use-toast";
import { PositionType } from './DroppableContainer';

interface CanvasProps {
  isPreviewMode: boolean;
  currentBreakpoint: Breakpoint;
}

interface DragState {
  draggingComponentId: string | null;
  initialPosition: { x: number, y: number } | null;
}

class CanvasPositionManager {
  static updateComponentPosition(
    id: string, 
    updateProps: (id: string, props: Record<string, any>) => void,
    position: {
      type: PositionType;
      top?: string;
      left?: string;
      right?: string;
      bottom?: string;
      zIndex?: string;
    }
  ) {
    updateProps(id, { position });
  }

  static calculateNewPosition(e: DragEndEvent, canvasRect: DOMRect | null) {
    if (!canvasRect) return null;
    
    const { delta } = e;
    if (!delta) return null;
    
    return {
      left: `${delta.x}px`,
      top: `${delta.y}px`
    };
  }
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
    moveComponent,
    updateComponentProps
  } = useWebsiteStore();

  const [activeId, setActiveId] = useState<string | null>(null);
  const [dragState, setDragState] = useState<DragState>({
    draggingComponentId: null,
    initialPosition: null
  });
  const [canvasRef, setCanvasRef] = useState<HTMLDivElement | null>(null);

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
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 150,
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
    
    // Set the dragging component id
    setDragState({
      draggingComponentId: active.id as string,
      initialPosition: { x: event.delta.x, y: event.delta.y }
    });
    
    console.log('Drag started:', active.id, active.data.current);
  };

  const handleDragMove = (event: DragMoveEvent) => {
    // Optional: Track movement for custom positioning logic
    console.log('Drag move:', event.delta);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    console.log('Drag ended:', { active, over, delta: event.delta });
    
    if (active && active.id.toString()) {
      // If we're moving a component within the canvas
      const componentId = active.id.toString();
      
      // Get dragging component
      const component = components.find(c => c.id === componentId);
      if (component) {
        // For existing components: update position
        const canvasRect = canvasRef?.getBoundingClientRect() || null;
        
        // Update the position based on where it was dropped
        const currentPosition = component.props.position || { type: 'relative' };
        
        // Calculate the new position
        const newLeft = event.delta.x + (parseInt(currentPosition.left || '0') || 0);
        const newTop = event.delta.y + (parseInt(currentPosition.top || '0') || 0);
        
        CanvasPositionManager.updateComponentPosition(
          componentId,
          updateComponentProps,
          {
            ...currentPosition,
            type: 'absolute',
            left: `${newLeft}px`,
            top: `${newTop}px`,
            zIndex: currentPosition.zIndex || '10'
          }
        );
      }
    }
    
    if (over) {
      // If we're reordering existing components
      if (active.id.toString().startsWith('sortable-')) {
        const oldIndex = rootComponents.findIndex(c => c.id === active.id);
        const newIndex = rootComponents.findIndex(c => c.id === over.id);
        if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
          reorderComponents(currentPage.id, oldIndex, newIndex);
          toast({
            title: "Component Reordered",
            description: "The component order has been updated",
          });
        }
      }
    }
    
    // Reset drag state
    setActiveId(null);
    setDragState({
      draggingComponentId: null,
      initialPosition: null
    });
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    console.log("Drag over:", { active, over });

    // Handle container drops here if needed
    if (over && active.id !== over.id) {
      // Check if dropping into a container
      if (over.data?.current?.accepts === 'COMPONENT' && 
          over.data.current.containerId !== active.id.toString()) {
        console.log(`Hovering component ${active.id} over container ${over.data.current.containerId}`);
      }
    }
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

  const setCanvasRefCallback = useCallback((node: HTMLDivElement) => {
    setCanvasRef(node);
  }, []);

  return (
    <DndContext 
      sensors={sensors} 
      collisionDetection={closestCenter} 
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
    >
      <div className={`min-h-full mx-auto bg-white ${getCanvasWidth()} transition-all duration-300`}>
        <CanvasDroppable>
          <div
            ref={setCanvasRefCallback}
            className={`min-h-[calc(100vh-80px)] relative ${
              isPreviewMode ? 'bg-white' : 'bg-gray-50 border-dashed border-2 border-gray-300'
            } ${!isPreviewMode ? 'hover:bg-blue-50 transition-colors' : ''}`}
            onClick={() => !isPreviewMode && setSelectedComponentId(null)}
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
                  Click components to add them to the canvas
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
