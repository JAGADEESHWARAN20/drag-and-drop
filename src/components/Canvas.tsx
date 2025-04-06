'use client';

import React, { useState, useMemo, useCallback, useRef } from 'react';
import {
  DndContext,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  useDroppable,
  DragOverlay,
} from '@dnd-kit/core'; // Added DragStartEvent to imports
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useWebsiteStore, Breakpoint } from '../store/WebsiteStore';
import { Component } from '../types';
import { ComponentRegistry } from '../utils/ComponentRegistry';
import DroppableContainer from './DroppableContainer';
import SortableItem from './SortableItem';
import { toast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import Button from '@/components/ui/button';
import SelectionManager from './SelectionManager';
import ContextMenu from './ContextMenu';
import { X } from 'lucide-react';
import { useSensors, useSensor, PointerSensor } from '@dnd-kit/core';

interface CanvasProps {
  isPreviewMode: boolean;
  currentBreakpoint: Breakpoint;
}

const Canvas: React.FC<CanvasProps> = ({ isPreviewMode, currentBreakpoint }) => {
  const {
    pages,
    currentPageId,
    components,
    selectedComponentId,
    setSelectedComponentId,
    setAllowChildren,
    draggingComponent,
    setDraggingComponent,
    addComponent,
    reorderComponents,
    setHasDragAttempted,
  } = useWebsiteStore();

  const { selectedIds, handleComponentClick, setSelectedIds } = SelectionManager();
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const { setNodeRef, isOver } = useDroppable({ id: 'canvas-drop-area' }); // Destructured correctly
  const [activeId, setActiveId] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
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

  const handleRightClick = useCallback((event: React.MouseEvent) => {
    if (isPreviewMode) return;
    event.preventDefault();
    setContextMenu({ x: event.clientX, y: event.clientY });
  }, [isPreviewMode]);

  const renderComponent = useCallback(
    (componentData: Component) => {
      const DynamicComponent = (ComponentRegistry[componentData.type as keyof typeof ComponentRegistry]?.component) as React.ComponentType<any>;
      if (!DynamicComponent) return null;

      const responsiveProps = componentData.responsiveProps?.[currentBreakpoint] || {};
      const mergedProps = { ...componentData.props, ...responsiveProps };
      const childComponents = components.filter((c) => c.parentId === componentData.id);
      const isSelected = selectedIds.includes(componentData.id);

      return (
        <DroppableContainer
          key={componentData.id}
          id={componentData.id}
          isPreviewMode={isPreviewMode}
          isSelected={isSelected}
          onSelect={(e) => handleComponentClick(componentData.id, e)}
        >
          <DynamicComponent {...mergedProps} id={componentData.id} isPreviewMode={isPreviewMode}>
            {childComponents.length > 0 && (
              <SortableContext
                items={childComponents.map((c) => c.id)}
                strategy={verticalListSortingStrategy}
              >
                {childComponents.map((child) => (
                  <SortableItem key={child.id} id={child.id}>
                    {renderComponent(child)}
                  </SortableItem>
                ))}
              </SortableContext>
            )}
            {(ComponentRegistry[componentData.type as keyof typeof ComponentRegistry]?.allowChildren) && !isPreviewMode && (
              <div
                className="border-dashed border-2 p-2 border-gray-400 text-gray-500 text-center"
                style={{ minHeight: '40px' }}
              >
                Child area
              </div>
            )}
          </DynamicComponent>
          
          {componentData.type === 'Container' && !isPreviewMode && (
            <div className="mt-2">
              <Button
                variant={(ComponentRegistry[componentData.type as keyof typeof ComponentRegistry]?.allowChildren) ? 'default' : 'outline'}
                onClick={() => setAllowChildren(componentData.id, !(ComponentRegistry[componentData.type as keyof typeof ComponentRegistry]?.allowChildren))}
              >
                {(ComponentRegistry[componentData.type as keyof typeof ComponentRegistry]?.allowChildren) ? 'Disable Children' : 'Enable Children'}
              </Button>
            </div>
          )}
        </DroppableContainer>
      );
    },
    [components, currentBreakpoint, isPreviewMode, selectedIds, handleComponentClick, setAllowChildren, rootComponents, currentPageId, reorderComponents]
  );

  const getCanvasWidth = useCallback(() => {
    switch (currentBreakpoint) {
      case 'mobile':
        return 'w-full min-w-[320px] max-w-[375px] mx-auto';
      case 'tablet':
        return 'w-full min-w-[640px] max-w-[768px] mx-auto';
      case 'desktop':
        return 'w-full max-w-[1200px] mx-auto';
      default:
        return 'w-full max-w-[1200px] mx-auto';
    }
  }, [currentBreakpoint]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { over } = event;
    if (over?.id === 'canvas-drop-area' && draggingComponent) {
      setHasDragAttempted(true);
      const canvasRect = canvasRef.current?.getBoundingClientRect();
      const dragElement = document.querySelector('[data-cypress="draggable-item"]') as HTMLElement | null;
      if (canvasRect && dragElement) {
        const dragRect = dragElement.getBoundingClientRect();
        const isClose = Math.abs(dragRect.left - canvasRect.right) < 50 || Math.abs(dragRect.right - canvasRect.left) < 50;
        if (isClose) {
          dragElement.classList.add('opacity-60'); // Use class instead of style
          setNodeRef(dragElement); // Pass node to setNodeRef
        } else {
          dragElement.classList.remove('opacity-60');
          setNodeRef(dragElement); // Reset node
        }
      }
    }
  }, [draggingComponent, setHasDragAttempted, setNodeRef]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    const dragElement = document.querySelector('[data-cypress="draggable-item"]') as HTMLElement | null;
    if (dragElement) {
      dragElement.classList.remove('opacity-60'); // Reset class
    }
    setNodeRef(null); // Reset droppable ref

    if (active?.data?.current?.type === 'COMPONENT' && over?.id === 'canvas-drop-area') {
      addComponent({
        type: active.data.current.componentType,
        props: active.data.current.defaultProps || {},
        pageId: currentPageId,
        parentId: null,
        responsiveProps: { desktop: {}, tablet: {}, mobile: {} },
      });
      setSelectedComponentId(
        useWebsiteStore.getState().components.find((c) => c.type === active.data.current.componentType && c.pageId === currentPageId)?.id || null
      );
      toast({
        title: 'Component Added',
        description: `Added ${active.data.current.componentType} to canvas.`,
      });
    }
    setHasDragAttempted(false);
    setActiveId(null);
  };

  const renderDragOverlay = () => {
    if (!activeId || !draggingComponent) return null;
    const componentType = draggingComponent.type;
    const DynamicComponent = ComponentRegistry[componentType as keyof typeof ComponentRegistry]?.component as React.ComponentType<any>;
    if (!DynamicComponent) return null;

    return (
      <DragOverlay>
        <div className="bg-white dark:bg-gray-800 p-2 rounded shadow-lg opacity-70" data-cypress="draggable-item">
          <DynamicComponent {...draggingComponent.defaultProps} isPreviewMode={false} />
        </div>
      </DragOverlay>
    );
  };

  return (
    <div className="relative">
      <div
        ref={canvasRef}
        className={`h-[90%] mt-5 mx-auto bg-gray-200 ${getCanvasWidth()} transition-all duration-300 ${isOver ? 'bg-green-100' : ''}`}
      >
        <div
          ref={setNodeRef}
          className={`relative h-[90%] ${isPreviewMode ? 'bg-white' : 'border-dashed border-2 border-gray-400'} overflow-x-auto p-6 ${isOver ? 'border-4 border-blue-500' : ''}`} // Moved border logic to class
          onClick={() => !isPreviewMode && setSelectedComponentId(null)}
          onContextMenu={handleRightClick}
          id="canvas-drop-area"
        >
          {rootComponents.length === 0 && !isPreviewMode && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-full flex items-center justify-center text-gray-500 text-lg p-6"
            >
              Click to Drop Your component here or Drag a component to add here
            </motion.div>
          )}
          <SortableContext
            items={rootComponents.map((c) => c.id)}
            strategy={verticalListSortingStrategy}
          >
            {rootComponents.map((component) => (
              <SortableItem key={component.id} id={component.id}>
                {renderComponent(component)}
              </SortableItem>
            ))}
          </SortableContext>
          {rootComponents.length === 0 && !isPreviewMode && isOver && draggingComponent && (
            <div className="absolute top-0 left-0 w-full h-full bg-green-100 opacity-50 flex items-center justify-center text-green-500">
              Drop here to add component
            </div>
          )}
        </div>
        {contextMenu && (
          <ContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            selectedIds={selectedIds}
            onClose={() => setContextMenu(null)}
            onAddToParent={(parentId) =>
              selectedIds.forEach((id) => useWebsiteStore.getState().updateComponentParent(id, parentId))
            }
            onMoveAbove={(componentId) =>
              reorderComponents(
                currentPageId,
                rootComponents.findIndex((c) => c.id === String(componentId)),
                rootComponents.findIndex((c) => c.id === String(componentId)) // Fix: This logic seems incorrect; should use a different index
              )
            }
            onMoveBelow={(componentId) =>
              reorderComponents(
                currentPageId,
                rootComponents.findIndex((c) => c.id === String(componentId)),
                rootComponents.findIndex((c) => c.id === String(componentId)) // Fix: This logic seems incorrect; should use a different index
              )
            }
          />
        )}
      </div>
      {renderDragOverlay()}
    </div>
  );
};

export default Canvas;