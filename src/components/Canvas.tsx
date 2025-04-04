import React, { useState, useMemo, useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useWebsiteStore, Breakpoint, Component } from '../store/WebsiteStore';
import { ComponentRegistry } from '../utils/ComponentRegistry';
import DroppableContainer from './DroppableContainer';
import SortableItem from './SortableItem';
import { toast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import  Button  from '@/components/ui/button';
import SelectionManager from './SelectionManager';
import ContextMenu from './ContextMenu';

interface CanvasProps {
  isPreviewMode: boolean;
  currentBreakpoint: Breakpoint;
}

const Canvas: React.FC<CanvasProps> = ({ isPreviewMode, currentBreakpoint }) => {
  const {
    pages,
    currentPageId,
    components,
    reorderComponents,
    updateComponentParent,
    selectedComponentId,
    setSelectedComponentId,
    setAllowChildren,
    moveComponent,
    reorderChildren,
  } = useWebsiteStore();

  const { selectedIds, handleComponentClick, setSelectedIds } = SelectionManager();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [canvasRef, setCanvasRef] = useState<HTMLDivElement | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

  const currentPage = pages.find((page) => page.id === currentPageId) || pages[0];
  const pageComponents = useMemo(() => components.filter((c) => c.pageId === currentPage.id), [components, currentPage.id]);
  const rootComponents = useMemo(() => pageComponents.filter((c) => !c.parentId), [pageComponents]);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id.toString());
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!active || !over) {
      setActiveId(null);
      return;
    }

    const activeIdStr = active.id.toString();
    const overIdStr = over.id.toString();

    // Handle drop into a placeholder (move to container)
    if (overIdStr.startsWith('placeholder-')) {
      const containerId = overIdStr.split('-')[1];
      moveComponent(activeIdStr, containerId, true);
      toast({ title: 'Component Moved', description: 'Component added to container' });
    }
    // Handle reordering (root or child)
    else {
      const activeComponent = components.find((c) => c.id === activeIdStr);
      const overComponent = components.find((c) => c.id === overIdStr);

      if (!activeComponent || !overComponent) {
        setActiveId(null);
        return;
      }

      // Reordering root components
      if (!activeComponent.parentId && !overComponent.parentId) {
        const oldIndex = rootComponents.findIndex((c) => c.id === activeIdStr);
        const newIndex = rootComponents.findIndex((c) => c.id === overIdStr);
        if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
          reorderComponents(currentPage.id, oldIndex, newIndex);
          toast({ title: 'Component Reordered', description: 'The component order has been updated' });
        }
      }
      // Reordering child components
      else if (activeComponent.parentId && activeComponent.parentId === overComponent.parentId) {
        const parentId = activeComponent.parentId;
        const parent = components.find((c) => c.id === parentId);
        if (parent && parent.children) {
          const oldIndex = parent.children.indexOf(activeIdStr);
          const newIndex = parent.children.indexOf(overIdStr);
          if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
            reorderChildren(parentId, oldIndex, newIndex);
            toast({ title: 'Child Reordered', description: 'Child component order updated' });
          }
        }
      }
    }

    setActiveId(null);
  };

  const handleRightClick = (event: React.MouseEvent) => {
    if (isPreviewMode) return;
    event.preventDefault();
    setContextMenu({ x: event.clientX, y: event.clientY });
  };

  const handleAddToParent = (parentId: string) => {
    selectedIds.forEach((id) => updateComponentParent(id, parentId));
    setContextMenu(null);
    setSelectedIds([]);
    toast({ title: 'Parent Updated', description: 'Selected elements have been added to parent' });
  };

  const handleMoveAbove = (componentId: string) => {
    const component = components.find((c) => c.id === componentId);
    if (!component) return;

    if (!component.parentId) {
      const currentIndex = rootComponents.findIndex((c) => c.id === componentId);
      if (currentIndex > 0) {
        reorderComponents(currentPage.id, currentIndex, currentIndex - 1);
        toast({ title: 'Moved Above', description: 'Component moved up' });
      }
    } else {
      const parent = components.find((c) => c.id === component.parentId);
      if (parent && parent.children) {
        const currentIndex = parent.children.indexOf(componentId);
        if (currentIndex > 0) {
          reorderChildren(parent.id, currentIndex, currentIndex - 1);
          toast({ title: 'Moved Above', description: 'Child component moved up' });
        }
      }
    }
    setContextMenu(null);
  };

  const handleMoveBelow = (componentId: string) => {
    const component = components.find((c) => c.id === componentId);
    if (!component) return;

    if (!component.parentId) {
      const currentIndex = rootComponents.findIndex((c) => c.id === componentId);
      if (currentIndex < rootComponents.length - 1) {
        reorderComponents(currentPage.id, currentIndex, currentIndex + 1);
        toast({ title: 'Moved Below', description: 'Component moved down' });
      }
    } else {
      const parent = components.find((c) => c.id === component.parentId);
      if (parent && parent.children) {
        const currentIndex = parent.children.indexOf(componentId);
        if (currentIndex < parent.children.length - 1) {
          reorderChildren(parent.id, currentIndex, currentIndex + 1);
          toast({ title: 'Moved Below', description: 'Child component moved down' });
        }
      }
    }
    setContextMenu(null);
  };

  const renderComponent = useCallback((componentData: Component) => {
    const DynamicComponent = ComponentRegistry[componentData.type] as React.ComponentType<any>; // ✅ Fix type

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
            <SortableContext items={childComponents.map((c) => c.id)} strategy={verticalListSortingStrategy}>
              {childComponents.map((child) => (
                <SortableItem key={child.id} id={child.id}>
                  {renderComponent(child)}
                </SortableItem>
              ))}
            </SortableContext>
          )}
          {componentData.allowChildren && (
            <div
              className="border-dashed border-2 p-4 border-gray-400"
              data-droppable-id={`placeholder-${componentData.id}`}
              style={{ height: '50px' }}
            />
          )}
        </DynamicComponent>
        {componentData.type === 'Container' && !isPreviewMode && (
          <div className="mt-2">
            <Button
              variant={componentData.allowChildren ? 'default' : 'outline'}
              onClick={() => setAllowChildren(componentData.id, !componentData.allowChildren)}
            >
              {componentData.allowChildren ? 'Disable Children' : 'Enable Children'}
            </Button>
          </div>
        )}
      </DroppableContainer>
    );
  }, [isPreviewMode, selectedIds, components, currentBreakpoint, setAllowChildren, handleComponentClick]);


  const getCanvasWidth = useCallback(() => {
    switch (currentBreakpoint) {
      case 'mobile': return 'w-full max-w-[375px]';
      case 'tablet': return 'w-full max-w-[768px]';
      case 'desktop': return 'w-full';
      default: return 'w-full';
    }
  }, [currentBreakpoint]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className={`min-h-full mx-auto bg-white ${getCanvasWidth()} transition-all duration-300`}>
        <div
          ref={setCanvasRef}
          className={`min-h-[calc(100vh-80px)] relative ${isPreviewMode ? 'bg-white' : 'bg-gray-50 border-dashed border-2 border-gray-300'}`}
          onClick={() => !isPreviewMode && setSelectedComponentId(null)}
          onContextMenu={handleRightClick}
        >
          <SortableContext items={rootComponents.map((c) => c.id)} strategy={verticalListSortingStrategy}>
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
                {rootComponents.map((component) => (
                  <SortableItem key={component.id} id={component.id}>
                    {renderComponent(component)}
                  </SortableItem>
                ))}
              </div>
            )}
          </SortableContext>
        </div>
      </div>
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          selectedIds={selectedIds}
          onClose={() => setContextMenu(null)}
          onAddToParent={handleAddToParent}
          onMoveAbove={handleMoveAbove}
          onMoveBelow={handleMoveBelow}
        />
      )}
    </DndContext>
  );
};

export default Canvas;