import React, { useMemo, useCallback } from 'react';
import { useDroppable, useSensors, useSensor, PointerSensor } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useEnhancedWebsiteStore } from '../store/EnhancedWebsiteStore';
import { ComponentProps } from '../types';
import { ComponentRegistry } from '../utils/ComponentRegistry';
import DroppableContainer from './unused/DroppableContainer';
import { motion } from 'framer-motion';
import { MessageSquare, Smartphone, Tablet, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

  const getCanvasWidth = useCallback(() => {
    switch (currentBreakpoint) {
      case 'mobile':
        return 'canvas-mobile';
      case 'tablet':
        return 'canvas-tablet';
      case 'desktop':
        return 'canvas-desktop';
      default:
        return 'canvas-desktop';
    }
  }, [currentBreakpoint]);

  return (
    <div className="canvas-container dark:canvas-container">
      <div className="absolute top-4 right-4 flex gap-2 z-20">
        <Button
          variant={currentBreakpoint === 'mobile' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onBreakpointChange('mobile')}
          title="Mobile view"
          className="h-9 w-9 p-0"
        >
          <Smartphone className="h-4 w-4" />
        </Button>
        <Button
          variant={currentBreakpoint === 'tablet' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onBreakpointChange('tablet')}
          title="Tablet view"
          className="h-9 w-9 p-0"
        >
          <Tablet className="h-4 w-4" />
        </Button>
        <Button
          variant={currentBreakpoint === 'desktop' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onBreakpointChange('desktop')}
          title="Desktop view"
          className="h-9 w-9 p-0"
        >
          <Monitor className="h-4 w-4" />
        </Button>
      </div>
      <div className="absolute top-4 left-4 z-20">
        <Button variant="outline" size="sm" className="h-9 gap-1">
          <MessageSquare className="h-4 w-4" />
          <span>Comments</span>
        </Button>
      </div>
      <div className={`canvas-content ${isLeftPanelOpen ? 'sidebar-open' : ''}`}>
        <div
          ref={setCanvasDroppableRef}
          className={`canvas-drop-area dark:canvas-drop-area ${isPreviewMode ? 'preview' : ''} ${isOverCanvas && !isPreviewMode ? 'is-over' : ''}`}
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
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg border border-blue-300 dark:border-blue-700">
                <p className="text-blue-600 dark:text-blue-400 flex items-center gap-2">
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
  );
};

export default ModernCanvas;