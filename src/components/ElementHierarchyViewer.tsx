import React from 'react';
import { useWebsiteStore } from '../store/WebsiteStore';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Component } from '@/types';

interface SortableHierarchyItemProps {
    component: Component;
    level: number;
}

const SortableHierarchyItem: React.FC<SortableHierarchyItemProps> = ({ component, level }) => {
    const { components, selectedComponentId, setSelectedComponentId } = useWebsiteStore();
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: component.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        paddingLeft: `${level * 20}px`,
        cursor: 'grab',
    };

    const children = components.filter((c) => c.parentId === component.id);

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <div
                onClick={() => setSelectedComponentId(component.id)}
                className={`p-1 hover:bg-gray-100 ${component.id === selectedComponentId ? 'bg-blue-100' : ''}`}
            >
                {component.type} ({component.id.slice(0, 8)}...)
            </div>
            {children.length > 0 && (
                <SortableHierarchy
                    parentId={component.id}
                    level={level + 1}
                />
            )}
        </div>
    );
};

interface SortableHierarchyProps {
    parentId: string | null;
    level?: number;
}

const SortableHierarchy: React.FC<SortableHierarchyProps> = ({ parentId, level = 0 }) => {
    const { components } = useWebsiteStore();
    const children = components.filter((c) => c.parentId === parentId);
    const childIds = children.map((child) => child.id);

    return (
        <SortableContext id={parentId ? `parent-${parentId}` : 'root'} items={childIds}>
            {children.map((component) => (
                <SortableHierarchyItem
                    key={component.id}
                    component={component}
                    level={level}
                />
            ))}
        </SortableContext>
    );
};

const ElementHierarchyViewer: React.FC = () => {
    const { components, updateComponentParent, updateComponentOrder } = useWebsiteStore();

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (active && over && active.id !== over.id) {
            const activeId = active.id as string;
            const overId = over.id as string;

            const activeComponent = components.find((c) => c.id === activeId);
            const overComponent = components.find((c) => c.id === overId);

            if (!activeComponent) return;

            // Case 1: Moving within the same parent
            if (activeComponent.parentId === overComponent?.parentId) {
                const parentId = activeComponent.parentId;
                const childrenOfParent = components.filter((c) => c.parentId === parentId).map(c => c.id);
                const oldIndex = childrenOfParent.indexOf(activeId);
                const newIndex = childrenOfParent.indexOf(overId);

                if (oldIndex !== -1 && newIndex !== -1) {
                    const updatedOrder = arrayMove(childrenOfParent, oldIndex, newIndex);
                    updateComponentOrder(parentId, updatedOrder);
                }
            }
            // Case 2: Moving to a new parent (dropping onto another component)
            else if (overComponent) {
                updateComponentParent(activeId, overComponent.id);
                const newChildrenOrder = [...components.filter(c => c.parentId === overComponent.id).map(c => c.id), activeId];
                updateComponentOrder(overComponent.id, newChildrenOrder);
            }
            // Case 3: Moving to the root (no over component with an ID)
            else if (over && over.id === 'root') {
                updateComponentParent(activeId, null);
                const rootComponents = components.filter(c => c.parentId === null).map(c => c.id);
                const oldIndex = rootComponents.indexOf(activeId);
                const newIndex = rootComponents.indexOf(over.id as string);

                if (oldIndex !== -1 && newIndex !== -1) {
                    const updatedOrder = arrayMove(rootComponents, oldIndex, newIndex);
                    updateComponentOrder(null, updatedOrder);
                }
            }
        }
    };

    return (
        <div style={{ width: '300px', borderLeft: '1px solid #ccc', padding: '10px' }}>
            <DndContext onDragEnd={handleDragEnd}>
                <SortableContext id="root" items={components.filter(c => c.parentId === null).map(c => c.id)}>
                    {components.filter(c => c.parentId === null).map((component) => (
                        <SortableHierarchyItem
                            key={component.id}
                            component={component}
                            level={0}
                        />
                    ))}
                </SortableContext>
            </DndContext>
        </div>
    );
};

export default ElementHierarchyViewer;
