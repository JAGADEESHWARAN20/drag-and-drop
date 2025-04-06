'use client';

import React, { useState, useMemo, useCallback, useRef } from 'react';
import { DndContext, DragStartEvent, DragOverEvent, DragEndEvent, useDroppable, DragOverlay, useSensors, useSensor, PointerSensor } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
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
        updateComponentParent,
        updateComponentOrder,
    } = useWebsiteStore();

    const { selectedIds, handleComponentClick, setSelectedIds } = SelectionManager();
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
    const { setNodeRef, isOver } = useDroppable({ id: 'canvas-drop-area' });
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
            const DynamicComponent = ComponentRegistry[componentData.type as keyof typeof ComponentRegistry]?.component as React.ComponentType<any>;
            if (!DynamicComponent) return null;

            const responsiveProps = componentData.responsiveProps?.[currentBreakpoint] || {};
            const mergedProps = { ...componentData.props, ...responsiveProps };
            const childComponents = components.filter((c) => c.parentId === componentData.id);
            const isSelected = selectedIds.includes(componentData.id);
            const orderedChildren = componentData.children.map(childId =>
                components.find(c => c.id === childId)
            ).filter(Boolean) as Component[];

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
                        {ComponentRegistry[componentData.type as keyof typeof ComponentRegistry]?.allowChildren && !isPreviewMode && (
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
                                variant={ComponentRegistry[componentData.type as keyof typeof ComponentRegistry]?.allowChildren ? 'default' : 'outline'}
                                onClick={() => setAllowChildren(componentData.id, !ComponentRegistry[componentData.type as keyof typeof ComponentRegistry]?.allowChildren)}
                            >
                                {ComponentRegistry[componentData.type as keyof typeof ComponentRegistry]?.allowChildren ? 'Disable Children' : 'Enable Children'}
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

    const handleDragStart = useCallback((event: DragStartEvent) => {
        setActiveId(event.active.id as string);
        const activeComponent = components.find(c => c.id === event.active.id);
        if (activeComponent) {
            setDraggingComponent({ type: activeComponent.type, defaultProps: activeComponent.props });
        }
    }, [components, setDraggingComponent]);

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
                    dragElement.classList.add('opacity-60');
                    setNodeRef(dragElement);
                } else {
                    dragElement.classList.remove('opacity-60');
                    setNodeRef(dragElement);
                }
            }
        }
    }, [draggingComponent, setHasDragAttempted, setNodeRef]);

    const handleDragEnd = useCallback((event: DragEndEvent) => {
        const { active, over } = event;
        const dragElement = document.querySelector('[data-cypress="draggable-item"]') as HTMLElement | null;
        if (dragElement) {
            dragElement.classList.remove('opacity-60');
        }
        setNodeRef(null);

        if (active && over && active.id !== over.id) {
            const activeIdStr = active.id as string;
            const overId = over.id as string;

            const activeComponent = components.find((c) => c.id === activeIdStr);
            const overComponent = components.find((c) => c.id === overId);

            if (!activeComponent) return;

            if (activeComponent.parentId === overComponent?.parentId) {
                const parentId = activeComponent.parentId;
                const childrenOfParent = components.filter((c) => c.parentId === parentId).map(c => c.id);
                const oldIndex = childrenOfParent.indexOf(activeIdStr);
                const newIndex = childrenOfParent.indexOf(overId);

                if (oldIndex !== -1 && newIndex !== -1) {
                    const updatedOrder = arrayMove(childrenOfParent, oldIndex, newIndex);
                    updateComponentOrder(parentId, updatedOrder);
                    toast({ title: 'Component Moved', description: 'Component reordered within parent.' });
                }
            } else if (overComponent) {
                updateComponentParent(activeIdStr, overComponent.id);
                const newChildrenOrder = [...components.filter(c => c.parentId === overComponent.id).map(c => c.id), activeIdStr];
                updateComponentOrder(overComponent.id, newChildrenOrder);
                toast({ title: 'Component Moved', description: 'Component moved to new parent.' });
            } else if (over.id === 'canvas-drop-area' && draggingComponent) {
                updateComponentParent(activeIdStr, null);
                const rootComponentsIds = components.filter(c => c.parentId === null && c.pageId === currentPageId).map(c => c.id);
                const updatedOrder = [...rootComponentsIds.filter(id => id !== activeIdStr), activeIdStr];
                updateComponentOrder(null, updatedOrder);
                toast({ title: 'Component Moved', description: 'Component moved to root.' });
            }
        }

        setHasDragAttempted(false);
        setActiveId(null);
        setDraggingComponent(null);
    }, [components, currentPageId, draggingComponent, setDraggingComponent, setHasDragAttempted, updateComponentParent, updateComponentOrder]);

    const renderDragOverlay = useCallback(() => {
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
    }, [activeId, draggingComponent]);

    return (
        <div className="relative">
            <DndContext
                sensors={sensors}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
            >
                <div
                    ref={canvasRef}
                    className={`h-[90vh] mt-5 mx-auto bg-gray-200 ${getCanvasWidth()} transition-all duration-300 ${isOver ? 'bg-green-100' : ''}`}
                >
                    <div
                        ref={setNodeRef}
                        className={`relative h-full ${isPreviewMode ? 'bg-white' : 'border-dashed border-2 border-gray-400'} overflow-x-auto p-6 ${isOver ? 'border-4 border-blue-500' : ''}`}
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
                            onMoveAbove={(componentId) => {
                                const currentIndex = rootComponents.findIndex((c) => c.id === String(componentId));
                                const aboveIndex = currentIndex - 1;
                                if (aboveIndex >= 0) {
                                    reorderComponents(null, currentIndex, aboveIndex);
                                    toast({ title: 'Component Moved', description: 'Moved above another component.' });
                                }
                            }}
                            onMoveBelow={(componentId) => {
                                const currentIndex = rootComponents.findIndex((c) => c.id === String(componentId));
                                const belowIndex = currentIndex + 1;
                                if (belowIndex < rootComponents.length) {
                                    reorderComponents(null, currentIndex, belowIndex);
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
