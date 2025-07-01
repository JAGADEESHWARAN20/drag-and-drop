
import React, { useMemo, useCallback } from 'react';
import { useDroppable, useSensors, useSensor, PointerSensor, DndContext, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useEnhancedWebsiteStore } from '../store/EnhancedWebsiteStore';
import { ComponentProps } from '../types';
import { ComponentRegistry } from '../utils/ComponentRegistry';
import DroppableContainer from './unused/DroppableContainer';
import { motion } from 'framer-motion';
import { MessageSquare, Smartphone, Tablet, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

interface CanvasProps {
  isPreviewMode: boolean;
  currentBreakpoint: 'mobile' | 'tablet' | 'desktop';
  onBreakpointChange: (breakpoint: 'mobile' | 'tablet' | 'desktop') => void;
  isLeftPanelOpen: boolean;
}

const ModernCanvas: React.FC<CanvasProps> = ({
  isPreviewMode,
  currentBreakpoint,
  onBreakpointChange,
  isLeftPanelOpen,
}) => {
  const {
    currentProject,
    selectedElementId,
    setSelectedElement,
    addElement,
  } = useEnhancedWebsiteStore();

  const { setNodeRef: setCanvasDroppableRef, isOver: isOverCanvas } = useDroppable({
    id: 'canvas-drop-area',
    data: {
      type: 'canvas',
      accepts: ['COMPONENT'],
    },
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
        tolerance: 5,
        delay: 100,
      },
    })
  );

  const pageComponents = useMemo(
    () => Object.values(currentProject.elements).filter((c) => !c.parentId),
    [currentProject.elements]
  );

  const getChildComponents = useCallback(
    (parentId: string | null) => {
      return Object.values(currentProject.elements).filter((c) => c.parentId === parentId);
    },
    [currentProject.elements]
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    // Check if we're dropping a component from the panel
    if (active.data.current?.type === 'COMPONENT') {
      const componentType = active.data.current.componentType;
      const defaultProps = active.data.current.defaultProps || {};
      
      // Add the component to the canvas
      const newElementId = addElement(componentType, null);
      
      toast({
        title: "Component Added",
        description: `${componentType} has been added to the canvas`,
      });
      
      // Select the new component
      setSelectedElement(newElementId);
    }
  };

  const renderComponent = useCallback(
    (componentData: any): React.ReactNode => {
      const DynamicComponent = ComponentRegistry[componentData.type as keyof typeof ComponentRegistry]?.component as React.ComponentType<ComponentProps & { children?: React.ReactNode; id: string; isPreviewMode?: boolean }>;
      if (!DynamicComponent) {
        console.warn(`Component ${componentData.type} not found in registry`);
        return null;
      }

      const responsiveProps = componentData.styles.responsive?.[currentBreakpoint] || {};
      const mergedProps = { ...componentData.properties.attributes, ...responsiveProps };
      const childComponents = getChildComponents(componentData.elementId);
      const isSelected = selectedElementId === componentData.elementId;

      return (
        <DynamicComponent {...mergedProps} id={componentData.elementId} isPreviewMode={isPreviewMode}>
          {componentData.childrenAllowed && childComponents.length > 0 && (
            <SortableContext
              items={childComponents.map((c) => c.elementId)}
              strategy={verticalListSortingStrategy}
            >
              {childComponents.map((child) => (
                <DroppableContainer
                  key={child.elementId}
                  id={child.elementId}
                  isPreviewMode={isPreviewMode}
                  isSelected={selectedElementId === child.elementId}
                  onSelect={() => setSelectedElement(child.elementId)}
                >
                  {renderComponent(child)}
                </DroppableContainer>
              ))}
            </SortableContext>
          )}
          {componentData.childrenAllowed && !isPreviewMode && childComponents.length === 0 && (
            <div className="empty-container dark:empty-container">
              Drop components here
            </div>
          )}
        </DynamicComponent>
      );
    },
    [currentBreakpoint, getChildComponents, isPreviewMode, selectedElementId, setSelectedElement]
  );

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="modern-canvas-container">
        <div className="absolute top-1em right-1em flex gap-0.5em z-20">
          <Button
            variant={currentBreakpoint === 'mobile' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onBreakpointChange('mobile')}
            title="Mobile view"
            className="h-2.25em w-2.25em p-0"
          >
            <Smartphone className="h-1em w-1em" />
          </Button>
          <Button
            variant={currentBreakpoint === 'tablet' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onBreakpointChange('tablet')}
            title="Tablet view"
            className="h-2.25em w-2.25em p-0"
          >
            <Tablet className="h-1em w-1em" />
          </Button>
          <Button
            variant={currentBreakpoint === 'desktop' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onBreakpointChange('desktop')}
            title="Desktop view"
            className="h-2.25em w-2.25em p-0"
          >
            <Monitor className="h-1em w-1em" />
          </Button>
        </div>
        <div className="absolute top-1em left-1em z-20">
          <Button variant="outline" size="sm" className="h-2.25em gap-0.25em">
            <MessageSquare className="h-1em w-1em" />
            <span>Comments</span>
          </Button>
        </div>
        <div className={`modern-canvas-content ${isLeftPanelOpen ? 'sidebar-open' : ''}`}>
          <div
            ref={setCanvasDroppableRef}
            className={`modern-canvas-drop-area ${isPreviewMode ? 'preview' : ''} ${isOverCanvas && !isPreviewMode ? 'is-over' : ''}`}
            onClick={() => !isPreviewMode && setSelectedElement(null)}
            id="canvas-drop-area"
          >
            {pageComponents.length === 0 && !isPreviewMode && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="canvas-empty"
              >
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="canvas-empty-icon">
                  <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <p>Drag components here to start building</p>
              </motion.div>
            )}
            <SortableContext
              items={pageComponents.map((c) => c.elementId)}
              strategy={verticalListSortingStrategy}
            >
              {pageComponents.map((component) => (
                <DroppableContainer
                  key={component.elementId}
                  id={component.elementId}
                  isPreviewMode={isPreviewMode}
                  isSelected={selectedElementId === component.elementId}
                  onSelect={() => setSelectedElement(component.elementId)}
                >
                  {renderComponent(component)}
                </DroppableContainer>
              ))}
            </SortableContext>
            {isOverCanvas && !isPreviewMode && (
              <div className="absolute top-0 left-0 w-full h-full bg-blue-100/30 dark:bg-blue-900/20 flex items-center justify-center pointer-events-none">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-1em shadow-lg border border-blue-300 dark:border-blue-700">
                  <p className="text-blue-600 dark:text-blue-400 flex items-center gap-0.5em">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Drop here to add component
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DndContext>
  );
};

export default ModernCanvas;
