'use client';

import React, { useState, useMemo, useCallback, useRef } from 'react';
import {
  DndContext,
  DragStartEvent,
  DragOverEvent,
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
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useWebsiteStore, Breakpoint } from '../store/WebsiteStore';
import { Component } from '../types';
import { ComponentRegistry } from '../utils/ComponentRegistry';
import DroppableContainer from './DroppableContainer';
import { toast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import Button from '@/components/ui/button';
import {Switch} from '@/components/ui/switch';
import SelectionManager from './SelectionManager';
import ContextMenu from './ContextMenu';
import { X } from 'lucide-react';

interface CanvasProps {
  isPreviewMode: boolean;
  currentBreakpoint: Breakpoint;
}

const SortableCanvasItem = React.forwardRef<HTMLDivElement, { id: string; component: Component; isPreviewMode: boolean; currentBreakpoint: Breakpoint; renderComponent: (component: Component) => React.ReactNode; handleComponentClick: (id: string, event: React.MouseEvent) => void; selectedIds: string[] }>(
  ({ id, component, isPreviewMode, currentBreakpoint, renderComponent, handleComponentClick, selectedIds }, forwardedRef) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id });

    const style: React.CSSProperties = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    };

    const isSelected = selectedIds.includes(id);

    return (
      <div ref={forwardedRef} style={style} {...attributes} {...listeners}>
        <DroppableContainer
          id={id}
          isPreviewMode={isPreviewMode}
          isSelected={isSelected}
          onSelect={(e) => handleComponentClick(id, e)}
        >
          {renderComponent(component)}
        </DroppableContainer>
      </div>
    );
  }
);

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
    updateComponentParent,
    updateComponentOrder,
  } = useWebsiteStore();

  const { selectedIds, handleComponentClick, setSelectedIds } = SelectionManager();
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const { setNodeRef: setCanvasDroppableRef, isOver: isOverCanvas } = useDroppable({ id: 'canvas-drop-area' });
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

  const getChildComponents = useCallback(
    (parentId: string | null): Component[] => {
      return components.filter((c) => c.parentId === parentId);
    },
    [components]
  );

  const handleRightClick = useCallback((event: React.MouseEvent) => {
    if (isPreviewMode) return;
    event.preventDefault();
    setContextMenu({ x: event.clientX, y: event.clientY });
  }, [isPreviewMode]);

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
                  <SortableCanvasItem
                    key={child.id}
                    id={child.id}
                    component={child}
                    isPreviewMode={isPreviewMode}
                    currentBreakpoint={currentBreakpoint}
                    renderComponent={renderComponent}
                    handleComponentClick={handleComponentClick}
                    selectedIds={selectedIds}
                  />
                ))}
              </SortableContext>
            )}
            {ComponentRegistry[componentData.type as keyof typeof ComponentRegistry]?.allowChildren && !isPreviewMode && childComponents.length === 0 && (
              <div
                className="border-dashed border-2 p-2 border-gray-400 text-gray-500 text-center"
                style={{ minHeight: '40px' }}
              >
                Drop children here
              </div>
            )}
          </DynamicComponent>

      {componentData.type === 'Container' && !isPreviewMode && (
  <div className="mt-2 flex justify-center">
    <Switch
      id={`allow-children-${componentData.id}`}
      checked={ComponentRegistry[componentData.type as keyof typeof ComponentRegistry]?.allowChildren}
      onCheckedChange={(checked) => setAllowChildren(componentData.id, checked)}
      className="w-10 h-6 rounded-full bg-gray-300 data-[state=checked]:bg-blue-600 relative"
    >
      <span
        className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform ${
          ComponentRegistry[componentData.type as keyof typeof ComponentRegistry]?.allowChildren ? 'translate-x-4' : ''
        }`}
      ></span>
    </Switch>
  </div>
)}
        </>
      );
    },
    [components, currentBreakpoint, getChildComponents, handleComponentClick, isPreviewMode, selectedIds, setAllowChildren]
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
        toast({ title: 'Component Reordered', description: 'Order within the parent updated.' });
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
      const oldIndex = rootSiblings.indexOf(activeIdStr);
      const newIndex = rootSiblings.indexOf(overId); // Should be the end of the array
      const updatedOrder = arrayMove(rootSiblings, oldIndex, rootSiblings.length - (rootSiblings.includes(overId) ? 1 : 0));
      updateComponentOrder(null, updatedOrder);
      toast({ title: 'Component Moved', description: `${activeComponent.type} moved to the root level.` });
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
    <div className="relative">
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        collisionDetection={closestCenter}
      >
        <div
          ref={canvasRef}
          className={`h-[90vh] mt-5 mx-auto bg-gray-200 ${getCanvasWidth()} transition-all duration-300 ${isOverCanvas ? 'bg-green-100' : ''}`}
        >
          <div
            ref={setCanvasDroppableRef}
            className={`relative h-full ${isPreviewMode ? 'bg-white' : 'border-dashed border-2 border-gray-400'} overflow-x-auto p-6 ${isOverCanvas ? 'border-4 border-blue-500' : ''}`}
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
                Drag a component here to start building
              </motion.div>
            )}
            <SortableContext
              items={rootComponents.map((c) => c.id)}
              strategy={verticalListSortingStrategy}
            >
              {rootComponents.map((component) => (
                <SortableCanvasItem
                  key={component.id}
                  id={component.id}
                  component={component}
                  isPreviewMode={isPreviewMode}
                  currentBreakpoint={currentBreakpoint}
                  renderComponent={renderComponent}
                  handleComponentClick={handleComponentClick}
                  selectedIds={selectedIds}
                />
              ))}
            </SortableContext>
            {rootComponents.length === 0 && !isPreviewMode && isOverCanvas && draggingComponent && (
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
              onMoveAbove={(componentId) => {
                const currentIndex = rootComponents.findIndex((c) => c.id === String(componentId));
                const aboveIndex = currentIndex - 1;
                if (aboveIndex >= 0) {
                  const updatedOrder = arrayMove(rootComponents.map(c => c.id), currentIndex, aboveIndex);
                  updateComponentOrder(null, updatedOrder);
                  toast({ title: 'Component Moved', description: 'Moved above another component.' });
                }
              }}
              onMoveBelow={(componentId) => {
                const currentIndex = rootComponents.findIndex((c) => c.id === String(componentId));
                const belowIndex = currentIndex + 1;
                if (belowIndex < rootComponents.length) {
                  const updatedOrder = arrayMove(rootComponents.map(c => c.id), currentIndex, belowIndex);
                  updateComponentOrder(null, updatedOrder);
                  toast({ title: 'Component Moved', description: 'Moved below another component.' });
                }
              }}
            />
          )}
        </div>
        {renderDragOverlay()}
      </DndContext>
    </div>
  );
};

export default Canvas;
