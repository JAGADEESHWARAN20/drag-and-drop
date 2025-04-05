'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  DndContext,
  DragEndEvent,
  useDroppable,
  UniqueIdentifier, // Import UniqueIdentifier
  Active,
  Over,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useWebsiteStore, Breakpoint } from '../store/WebsiteStore';
import { Component } from "../types";
import { ComponentRegistry } from '../utils/ComponentRegistry';
import DroppableContainer from './DroppableContainer';
import SortableItem from './SortableItem';
import { toast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import Button from '@/components/ui/button';
import SelectionManager from './SelectionManager';
import ContextMenu from './ContextMenu';
import { v4 as uuidv4 } from 'uuid';
import { MutableRefObject } from 'react';

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
    reorderComponents, // Import reorderComponents
  } = useWebsiteStore();

  const { selectedIds, handleComponentClick, setSelectedIds } = SelectionManager();
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const { setNodeRef, isOver, active, rect, node, over, ...droppable } = useDroppable({ // Destructure all relevant properties
    id: 'canvas-drop-area',
  });

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
    [components, currentBreakpoint, isPreviewMode, selectedIds, handleComponentClick, setAllowChildren]
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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active?.id === 'library-component' && over?.id === 'canvas-drop-area' && draggingComponent) {
      const newComponentId = uuidv4();
      addComponent({
        type: draggingComponent.type,
        props: draggingComponent.defaultProps,
        pageId: currentPageId,
        parentId: null,
        responsiveProps: { desktop: {}, tablet: {}, mobile: {} },
        allowChildren: (ComponentRegistry[draggingComponent.type as keyof typeof ComponentRegistry]?.allowChildren) || false,
      });
      setDraggingComponent(null);
      setSelectedComponentId(newComponentId);
      toast({
        title: 'Component Added',
        description: `Added ${draggingComponent.type} to canvas.`,
      });

      // Close the sheet after adding the component
      useWebsiteStore.getState().setSheetOpen(false);
      return;
    }

    // Existing reordering logic...
    if (active && over && active.id !== over.id) {
      const activeId = active.id;
      const overId = over.id;

      const activeComponent = components.find(c => c.id === activeId);
      const overComponent = components.find(c => c.id === overId);

      if (activeComponent && overComponent && activeComponent.parentId === overComponent.parentId) {
        const parentId = activeComponent.parentId;
        const siblings = pageComponents.filter(c => c.parentId === parentId).map(c => c.id);
        const oldIndex = siblings.indexOf(String(activeId));
        const newIndex = siblings.indexOf(String(overId));

        if (oldIndex !== -1 && newIndex !== -1) {
          reorderComponents(currentPageId, oldIndex, newIndex);
        }
      } else if (activeComponent && !overComponent && activeComponent.parentId === null) {
        // Dragging to the root level (no over component)
        const oldIndex = rootComponents.findIndex(c => c.id === activeId);
        if (oldIndex !== -1) {
          // Optionally handle dropping at the end or beginning of root components
        }
      }
    }
  };

  const canvasStyle = {
    minHeight: 'calc(100vh - 80px)',
    width: '100%',
    backgroundColor: isOver ? 'lightgreen' : 'transparent',
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div
        ref={setNodeRef}
        style={canvasStyle}
        className={`h-full mx-auto bg-white ${getCanvasWidth()} transition-all duration-300 ${isOver ? 'bg-green-100' : ''}`}
        {...(node && !(active || over) ? droppable : {})}
        id="canvas-drop-area"
      >
        <div
          className={`relative h-full ${isPreviewMode ? 'bg-white' : 'bg-gray-50 border-dashed border-2 border-gray-300'} overflow-x-auto p-6`}
          onClick={() => !isPreviewMode && setSelectedComponentId(null)}
          onContextMenu={handleRightClick}
        >
          <SortableContext
            items={rootComponents.map((c) => c.id)}
            strategy={verticalListSortingStrategy}
          >
            {rootComponents.length === 0 && !isPreviewMode ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex items-center justify-center text-gray-500 mt-7 text-lg p-6"
              >
                Click components in the panel to add them to the canvas.
              </motion.div>
            ) : (
              rootComponents.map((component) => (
                <SortableItem key={component.id} id={component.id}>
                  {renderComponent(component)}
                </SortableItem>
              ))
            )}
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
            onAddToParent={(parentId) => selectedIds.forEach((id) => useWebsiteStore.getState().updateComponentParent(id, parentId))}
            onMoveAbove={(componentId) => reorderComponents(currentPageId, rootComponents.findIndex((c) => c.id === String(componentId)), rootComponents.findIndex((c) => c.id === String(componentId)) - 1)}
            onMoveBelow={(componentId) => reorderComponents(currentPageId, rootComponents.findIndex((c) => c.id === String(componentId)), rootComponents.findIndex((c) => c.id === String(componentId)) + 1)}
          />
        )}
      </div>
    </DndContext>
  );
};

export default Canvas;