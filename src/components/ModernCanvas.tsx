
import React, { useState, useMemo, useCallback } from 'react';
import {
  DndContext,
  DragStartEvent,
  DragEndEvent,
  useDroppable,
  DragOverlay,
  useSensors,
  useSensor,
  PointerSensor,
  closestCenter, 
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { useWebsiteStore, Breakpoint } from '../store/WebsiteStore';
import { Component } from '../types';
import { ComponentRegistry } from '../utils/ComponentRegistry';
import DroppableContainer from './DroppableContainer';
import { toast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import SelectionManager from './SelectionManager';
import { MessageSquare, Smartphone, Tablet, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CanvasProps {
  isPreviewMode: boolean;
  currentBreakpoint: Breakpoint;
  onBreakpointChange: (breakpoint: Breakpoint) => void;
}

const ModernCanvas: React.FC<CanvasProps> = ({ 
  isPreviewMode, 
  currentBreakpoint,
  onBreakpointChange
}) => {
  const {
    pages,
    currentPageId,
    components,
    selectedComponentId,
    setSelectedComponentId,
    draggingComponent,
    setDraggingComponent,
    addComponent,
    updateComponentParent,
    updateComponentOrder,
  } = useWebsiteStore();

  const { selectedIds, handleComponentClick } = SelectionManager();
  const [activeId, setActiveId] = useState<string | null>(null);
  
  const { setNodeRef: setCanvasDroppableRef, isOver: isOverCanvas } = useDroppable({ id: 'canvas-drop-area' });
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { delay: 300, tolerance: 5 } }));

  const currentPage = useMemo(
    () => pages.find((page) => page.id === currentPageId) || pages[0],
    [pages, currentPageId]
  );
  
  const pageComponents = useMemo(
    () => components.filter((c) => c.pageId === currentPage.id),
    [components, currentPage.id]
  );
  
  const rootComponents = useMemo(
    () => pageComponents.filter((c) => !c.parentId),
    [pageComponents]
  );

  const getChildComponents = useCallback(
    (parentId: string | null): Component[] => {
      return components.filter((c) => c.parentId === parentId);
    },
    [components]
  );

  const renderComponent = useCallback(
    (componentData: Component): React.ReactNode => {
      const DynamicComponent = ComponentRegistry[componentData.type as keyof typeof ComponentRegistry]?.component as React.ComponentType<any>;
      if (!DynamicComponent) return null;

      const responsiveProps = componentData.responsiveProps?.[currentBreakpoint] || {};
      const mergedProps = { ...componentData.props, ...responsiveProps };
      const childComponents = getChildComponents(componentData.id);
      const isSelected = selectedIds.includes(componentData.id);

      return (
        <>
          <DynamicComponent {...mergedProps} id={componentData.id} isPreviewMode={isPreviewMode}>
            {componentData.allowChildren && childComponents.length > 0 && (
              <SortableContext
                items={childComponents.map((c) => c.id)}
                strategy={verticalListSortingStrategy}
              >
                {childComponents.map((child) => (
                  <DroppableContainer
                    key={child.id}
                    id={child.id}
                    isPreviewMode={isPreviewMode}
                    isSelected={isSelected}
                    onSelect={(e) => handleComponentClick(child.id, e)}
                  >
                    {renderComponent(child)}
                  </DroppableContainer>
                ))}
              </SortableContext>
            )}
            {ComponentRegistry[componentData.type as keyof typeof ComponentRegistry]?.allowChildren && !isPreviewMode && childComponents.length === 0 && (
              <div
                className="border-dashed border-2 border-gray-300 rounded-md p-4 text-gray-500 text-center dark:border-gray-700 dark:text-gray-400"
                style={{ minHeight: '40px' }}
              >
                Drop components here
              </div>
            )}
          </DynamicComponent>
        </>
      );
    },
    [components, currentBreakpoint, getChildComponents, handleComponentClick, isPreviewMode, selectedIds]
  );

  const getCanvasWidth = useCallback(() => {
    switch (currentBreakpoint) {
      case 'mobile':
        return 'w-full min-w-[320px] max-w-[375px]';
      case 'tablet':
        return 'w-full min-w-[640px] max-w-[768px]';
      case 'desktop':
        return 'w-full max-w-[1200px]';
      default:
        return 'w-full max-w-[1200px]';
    }
  }, [currentBreakpoint]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    const activeComponent = components.find(c => c.id === event.active.id);
    if (activeComponent) {
      setDraggingComponent({ type: activeComponent.type, defaultProps: activeComponent.props });
    }
  }, [components, setDraggingComponent]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setDraggingComponent(null);

    if (!active || !over || active.id === over.id) {
      return;
    }

    const activeIdStr = active.id as string;
    const overId = over.id as string;

    const activeComponent = components.find((c) => c.id === activeIdStr);
    const overComponent = components.find((c) => c.id === overId);

    if (!activeComponent) return;

    // Reordering within the same parent
    if (activeComponent.parentId === overComponent?.parentId) {
      const parentId = activeComponent.parentId;
      const siblings = getChildComponents(parentId).map(c => c.id);
      const oldIndex = siblings.indexOf(activeIdStr);
      const newIndex = siblings.indexOf(overId);

      if (oldIndex !== -1 && newIndex !== -1) {
        const updatedOrder = arrayMove(siblings, oldIndex, newIndex);
        updateComponentOrder(parentId, updatedOrder);
        toast({ title: 'Component Reordered', description: 'Components have been reordered.' });
      }
    }
    // Moving to a new parent
    else if (overComponent && overComponent.allowChildren) {
      updateComponentParent(activeIdStr, overComponent.id);
      const newChildrenOrder = [...getChildComponents(overComponent.id).map(c => c.id), activeIdStr];
      updateComponentOrder(overComponent.id, newChildrenOrder);
      toast({ title: 'Component Moved', description: `Moved ${activeComponent.type} into ${overComponent.type}.` });
    }
    // Moving to the root level
    else if (overId === 'canvas-drop-area') {
      updateComponentParent(activeIdStr, null);
      const rootSiblings = getChildComponents(null).map(c => c.id);
      const updatedOrder = [...rootSiblings.filter(id => id !== activeIdStr), activeIdStr];
      updateComponentOrder(null, updatedOrder);
      toast({ title: 'Component Moved', description: `${activeComponent.type} moved to canvas.` });
    }
  }, [components, getChildComponents, setDraggingComponent, updateComponentParent, updateComponentOrder]);

  const renderDragOverlay = useCallback(() => {
    if (!activeId || !draggingComponent) return null;
    const componentType = draggingComponent.type;
    const DynamicComponent = ComponentRegistry[componentType as keyof typeof ComponentRegistry]?.component as React.ComponentType<any>;
    if (!DynamicComponent) return null;

    return (
      <DragOverlay>
        <div className="bg-white dark:bg-gray-800 p-2 rounded shadow-lg opacity-70">
          <DynamicComponent {...draggingComponent.defaultProps} isPreviewMode={false} />
        </div>
      </DragOverlay>
    );
  }, [activeId, draggingComponent]);

  return (
    <div className="relative flex-1 overflow-auto bg-gray-100 dark:bg-gray-800 p-6">
      {/* Breakpoint selector */}
      <div className="absolute top-4 right-4 flex space-x-2 z-20">
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

      {/* Comments toggle button */}
      <div className="absolute top-4 left-4 z-20">
        <Button variant="outline" size="sm" className="h-9 gap-1">
          <MessageSquare className="h-4 w-4" />
          <span>Comments</span>
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        collisionDetection={closestCenter}
      >
        <div className="flex justify-center pt-16">
          <div
            className={`transition-all duration-300 mx-auto ${getCanvasWidth()}`}
            style={{ 
              minHeight: 'calc(100vh - 10rem)',
            }}
          >
            <div
              ref={setCanvasDroppableRef}
              className={`
                relative h-full rounded-lg overflow-hidden
                ${isPreviewMode ? 'bg-white dark:bg-gray-900' : 'bg-white dark:bg-gray-900 border-2 border-dashed border-gray-300 dark:border-gray-700'} 
                overflow-x-auto p-6
                ${isOverCanvas && !isPreviewMode ? 'border-blue-500 bg-blue-50/30 dark:bg-blue-900/10' : ''}
              `}
              onClick={() => !isPreviewMode && setSelectedComponentId(null)}
              id="canvas-drop-area"
            >
              {rootComponents.length === 0 && !isPreviewMode && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full flex items-center justify-center text-gray-400 text-lg p-6 flex-col gap-3"
                >
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-40">
                    <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <p>Drag components here to start building</p>
                </motion.div>
              )}
              <SortableContext
                items={rootComponents.map((c) => c.id)}
                strategy={verticalListSortingStrategy}
              >
                {rootComponents.map((component) => (
                  <DroppableContainer
                    key={component.id}
                    id={component.id}
                    isPreviewMode={isPreviewMode}
                    isSelected={selectedIds.includes(component.id)}
                    onSelect={(e) => handleComponentClick(component.id, e)}
                  >
                    {renderComponent(component)}
                  </DroppableContainer>
                ))}
              </SortableContext>
              {rootComponents.length === 0 && !isPreviewMode && isOverCanvas && draggingComponent && (
                <div className="absolute top-0 left-0 w-full h-full bg-blue-100/30 dark:bg-blue-900/20 flex items-center justify-center">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg border border-blue-300 dark:border-blue-700">
                    <p className="text-blue-600 dark:text-blue-400 flex items-center gap-2">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Drop here to add component
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        {renderDragOverlay()}
      </DndContext>
    </div>
  );
};

export default ModernCanvas;
