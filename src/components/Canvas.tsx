'use client';

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
  useDroppable,
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
import Button from '@/components/ui/button';
import SelectionManager from './SelectionManager';
import ContextMenu from './ContextMenu';
import { v4 as uuidv4 } from 'uuid';
import { ComponentProps } from './DraggableComponent';

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
    addComponent,
  } = useWebsiteStore();

  const { selectedIds, handleComponentClick, setSelectedIds } = SelectionManager();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

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

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const { setNodeRef: setCanvasDropRef, isOver: isCanvasOver } = useDroppable({
    id: 'canvas-drop-area',
    data: { accepts: 'COMPONENT' },
  });

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id.toString());
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (!active) {
        setActiveId(null);
        return;
      }

      const activeIdStr = active.id.toString();
      const overIdStr = over?.id.toString();

      // Handle drop from ComponentPanel onto the canvas root
      if (overIdStr === 'canvas-drop-area' && active.data.current?.type === 'COMPONENT') {
        const componentData = active.data.current as {
          type: 'COMPONENT';
          componentType: string;
          defaultProps: ComponentProps;
        };
        const newComponentId = uuidv4();
        addComponent({
          id: newComponentId,
          pageId: currentPageId,
          parentId: null,
          type: componentData.componentType,
          props: { ...componentData.defaultProps },
          responsiveProps: { desktop: {}, tablet: {}, mobile: {} },
        });
        toast({
          title: 'Component Added',
          description: `Added ${componentData.componentType} to canvas.`,
        });
        setActiveId(null);
        return;
      }

      // Handle drop from ComponentPanel or existing component into a DroppableContainer
      if (overIdStr?.startsWith('droppable-')) {
        const targetId = overIdStr.replace('droppable-', '');
        const targetComponent = components.find((c) => c.id === targetId);

        if (targetComponent && targetComponent.allowChildren) {
          // New component from ComponentPanel
          if (active.data.current?.type === 'COMPONENT') {
            const componentData = active.data.current as {
              type: 'COMPONENT';
              componentType: string;
              defaultProps: ComponentProps;
            };
            const newComponentId = uuidv4();
            addComponent({
              id: newComponentId,
              pageId: currentPageId,
              parentId: targetId,
              type: componentData.componentType,
              props: { ...componentData.defaultProps },
              responsiveProps: { desktop: {}, tablet: {}, mobile: {} },
            });
            toast({
              title: 'Component Added',
              description: `Added ${componentData.componentType} to ${targetComponent.type}.`,
            });
          }
          // Moving an existing component
          else {
            const activeComponent = components.find((c) => c.id === activeIdStr);
            if (activeComponent && activeComponent.id !== targetId) {
              updateComponentParent(activeIdStr, targetId);
              toast({
                title: 'Component Moved',
                description: `Moved ${activeComponent.type} into ${targetComponent.type}.`,
              });
            }
          }
        } else {
          toast({
            title: 'Drop Failed',
            description: 'Target does not allow children.',
            variant: 'destructive',
          });
        }
        setActiveId(null);
        return;
      }

      // Handle reordering within the same level
      if (overIdStr && activeIdStr !== overIdStr) {
        const activeComponent = components.find((c) => c.id === activeIdStr);
        const overComponent = components.find((c) => c.id === overIdStr);

        if (!activeComponent || !overComponent) {
          setActiveId(null);
          return;
        }

        if (activeComponent.parentId === overComponent.parentId) {
          const parentId = activeComponent.parentId || null;
          const siblings = parentId
            ? components.find((c) => c.id === parentId)?.children || []
            : rootComponents.map((c) => c.id);
          const oldIndex = siblings.indexOf(activeIdStr);
          const newIndex = siblings.indexOf(overIdStr);

          if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
            if (parentId) {
              reorderChildren(parentId, oldIndex, newIndex);
              toast({ title: 'Child Reordered', description: 'Child component order updated.' });
            } else {
              reorderComponents(currentPage.id, oldIndex, newIndex);
              toast({ title: 'Component Reordered', description: 'Component order updated.' });
            }
          }
        }
      }

      setActiveId(null);
    },
    [
      components,
      currentPageId,
      rootComponents,
      addComponent,
      updateComponentParent,
      reorderComponents,
      reorderChildren,
    ]
  );

  const handleRightClick = useCallback((event: React.MouseEvent) => {
    if (isPreviewMode) return;
    event.preventDefault();
    setContextMenu({ x: event.clientX, y: event.clientY });
  }, [isPreviewMode]);

  const handleAddToParent = useCallback(
    (parentId: string) => {
      selectedIds.forEach((id) => updateComponentParent(id, parentId));
      setContextMenu(null);
      setSelectedIds([]);
      toast({ title: 'Parent Updated', description: 'Selected elements added to parent.' });
    },
    [selectedIds, updateComponentParent, setSelectedIds]
  );

  const handleMoveAbove = useCallback(
    (componentId: string) => {
      const component = components.find((c) => c.id === componentId);
      if (!component) return;

      if (!component.parentId) {
        const currentIndex = rootComponents.findIndex((c) => c.id === componentId);
        if (currentIndex > 0) {
          reorderComponents(currentPage.id, currentIndex, currentIndex - 1);
          toast({ title: 'Moved Above', description: 'Component moved up.' });
        }
      } else {
        const parent = components.find((c) => c.id === component.parentId);
        if (parent && parent.children) {
          const currentIndex = parent.children.indexOf(componentId);
          if (currentIndex > 0) {
            reorderChildren(parent.id, currentIndex, currentIndex - 1);
            toast({ title: 'Moved Above', description: 'Child component moved up.' });
          }
        }
      }
      setContextMenu(null);
    },
    [components, rootComponents, reorderComponents, reorderChildren]
  );

  const handleMoveBelow = useCallback(
    (componentId: string) => {
      const component = components.find((c) => c.id === componentId);
      if (!component) return;

      if (!component.parentId) {
        const currentIndex = rootComponents.findIndex((c) => c.id === componentId);
        if (currentIndex < rootComponents.length - 1) {
          reorderComponents(currentPage.id, currentIndex, currentIndex + 1);
          toast({ title: 'Moved Below', description: 'Component moved down.' });
        }
      } else {
        const parent = components.find((c) => c.id === component.parentId);
        if (parent && parent.children) {
          const currentIndex = parent.children.indexOf(componentId);
          if (currentIndex < parent.children.length - 1) {
            reorderChildren(parent.id, currentIndex, currentIndex + 1);
            toast({ title: 'Moved Below', description: 'Child component moved down.' });
          }
        }
      }
      setContextMenu(null);
    },
    [components, rootComponents, reorderComponents, reorderChildren]
  );

  const renderComponent = useCallback(
    (componentData: Component) => {
      const DynamicComponent = ComponentRegistry[componentData.type] as React.ComponentType<any>;
      if (!DynamicComponent) return null;

      const responsiveProps = componentData.responsiveProps?.[currentBreakpoint] || {};
      const mergedProps = { ...componentData.props, ...responsiveProps };
      const childComponents = components.filter((c) => c.parentId === componentData.id);
      const isSelected = selectedIds.includes(componentData.id);
      const isDragging = activeId === componentData.id;

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
            {componentData.allowChildren && !isPreviewMode && (
              <div
                className={`border-dashed border-2 p-2 ${isDragging ? 'bg-blue-100' : 'border-gray-400'
                  } text-gray-500 text-center`}
                style={{ minHeight: '40px' }}
              >
                Drop here to add child
              </div>
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
    },
    [
      components,
      currentBreakpoint,
      isPreviewMode,
      selectedIds,
      handleComponentClick,
      setAllowChildren,
      activeId,
    ]
  );

  const getCanvasWidth = useCallback(() => {
    switch (currentBreakpoint) {
      case 'mobile':
        return 'w-full min-w-[320px] max-w-[375px] mx-auto';
      case 'tablet':
        return 'w-full min  max-w-[768px] mx-auto';
      case 'desktop':
        return 'w-full max-w-[1200px] mx-auto';
      default:
        return 'w-full max-w-[1200px] mx-auto';
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
          ref={setCanvasDropRef}
          className={`min-h-[calc(100vh-80px)] relative ${isPreviewMode ? 'bg-white' : 'bg-gray-50 border-dashed border-2 border-gray-300'
            } overflow-x-auto ${isCanvasOver && !isPreviewMode ? 'bg-green-100' : ''}`}
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
                Drag components from the panel to add them to the canvas.
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