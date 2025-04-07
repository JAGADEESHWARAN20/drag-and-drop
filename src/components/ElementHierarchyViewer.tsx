import React from 'react';
import { useWebsiteStore } from '../store/WebsiteStore';
import {
    DndContext,
    DragEndEvent,
    closestCenter,
} from '@dnd-kit/core';
import {
    SortableContext,
    useSortable,
    arrayMove,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Component } from '@/types';
import { toast } from '@/components/ui/use-toast';

interface SortableHierarchyItemProps {
    component: Component;
    level: number;
}

const SortableHierarchyItem: React.FC<SortableHierarchyItemProps> = ({
    component,
    level,
}) => {
    const { components, selectedComponentId, setSelectedComponentId } =
        useWebsiteStore();

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: component.id });

    const children = components.filter((c) => c.parentId === component.id);

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        paddingLeft: `${level * 16}px`,
        cursor: 'grab', // Indicate draggable
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <div
                className={`p-1 rounded ${component.id === selectedComponentId
                    ? 'bg-blue-100 dark:bg-blue-800'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                onClick={() => setSelectedComponentId(component.id)}
            >
                {component.type} ({component.id.slice(0, 5)})
            </div>
            {children.length > 0 && (
                <SortableHierarchy parentId={component.id} level={level + 1} />
            )}
        </div>
    );
};

interface SortableHierarchyProps {
    parentId: string | null;
    level?: number;
}

const SortableHierarchy: React.FC<SortableHierarchyProps> = ({
    parentId,
    level = 0,
}) => {
    const { components } = useWebsiteStore();
    const children = components.filter((c) => c.parentId === parentId);

    return (
        <SortableContext
            items={children.map((c) => c.id)}
            strategy={verticalListSortingStrategy}
        >
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
    const {
        components,
        updateComponentParent,
        updateComponentOrder,
    } = useWebsiteStore();

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!active || !over || active.id === over.id) return;

        const activeId = String(active.id);
        const overId = String(over.id);

        const activeComponent = components.find((c) => c.id === activeId);
        const overComponent = components.find((c) => c.id === overId);
        if (!activeComponent || !overComponent) return;

        const sameParent = activeComponent.parentId === overComponent.parentId;

        if (sameParent) {
            const parentId = activeComponent.parentId;
            const siblings = components.filter((c) => c.parentId === parentId).map(c => c.id);
            const oldIndex = siblings.indexOf(activeId);
            const newIndex = siblings.indexOf(overId);

            if (oldIndex !== -1 && newIndex !== -1) {
                const updatedOrder = arrayMove(siblings, oldIndex, newIndex);
                updateComponentOrder(parentId, updatedOrder);
                toast({ title: 'Component Reordered', description: 'Order within parent updated in Hierarchy.' });
            }
        } else {
            // Handle reparenting in the hierarchy
            updateComponentParent(activeId, overComponent.id);
            const newChildrenOrder = [...components.filter(c => c.parentId === overComponent.id).map(c => c.id), activeId];
            updateComponentOrder(overComponent.id, newChildrenOrder);
            toast({ title: 'Component Moved', description: `Moved ${activeComponent.type} under ${overComponent.type} in Hierarchy.` });
        }
    };

    const rootComponents = components.filter((c) => c.parentId === null);

    return (
        <DndContext onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
            <SortableContext
                items={rootComponents.map((c) => c.id)}
                strategy={verticalListSortingStrategy}
            >
                {rootComponents.map((component) => (
                    <SortableHierarchyItem
                        key={component.id}
                        component={component}
                        level={0}
                    />
                ))}
            </SortableContext>
        </DndContext>
    );
};

export default ElementHierarchyViewer;