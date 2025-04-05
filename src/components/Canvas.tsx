'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useWebsiteStore, Breakpoint, Component } from '../store/WebsiteStore';
import { ComponentRegistry } from '../utils/ComponentRegistry';
import DroppableContainer from './DroppableContainer';
import SortableItem from './SortableItem';
import { toast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import Button from '@/components/ui/button';
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
    selectedComponentId,
    setSelectedComponentId,
    setAllowChildren,
  } = useWebsiteStore();

  const { selectedIds, handleComponentClick, setSelectedIds } = SelectionManager();
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

  const handleRightClick = useCallback((event: React.MouseEvent) => {
    if (isPreviewMode) return;
    event.preventDefault();
    setContextMenu({ x: event.clientX, y: event.clientY });
  }, [isPreviewMode]);

  const renderComponent = useCallback(
    (componentData: Component) => {
      const DynamicComponent = ComponentRegistry[componentData.type] as React.ComponentType<any>;
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
            {componentData.allowChildren && !isPreviewMode && (
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

  return (
    <div className={`min-h-full mx-auto bg-white ${getCanvasWidth()} transition-all duration-300`}>
      <div
        className={`min-h-[calc(100vh-80px)] relative ${isPreviewMode ? 'bg-white' : 'bg-gray-50 border-dashed border-2 border-gray-300'} overflow-x-auto`}
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
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          selectedIds={selectedIds}
          onClose={() => setContextMenu(null)}
          onAddToParent={(parentId) => selectedIds.forEach((id) => useWebsiteStore.getState().updateComponentParent(id, parentId))}
          onMoveAbove={(componentId) => useWebsiteStore.getState().reorderComponents(currentPageId, rootComponents.findIndex((c) => c.id === componentId), rootComponents.findIndex((c) => c.id === componentId) - 1)}
          onMoveBelow={(componentId) => useWebsiteStore.getState().reorderComponents(currentPageId, rootComponents.findIndex((c) => c.id === componentId), rootComponents.findIndex((c) => c.id === componentId) + 1)}
        />
      )}
    </div>
  );
};

export default Canvas;