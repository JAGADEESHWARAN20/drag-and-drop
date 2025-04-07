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

    const children = components.filter(c => c.parentId === component.id);

    return (
        <div ref={setNodeRef} style={style} data-id={component.id}>
            <div
                {...attributes}
                {...listeners}
                onClick={() => setSelectedComponentId(component.id)}
                className={`p-1 rounded hover:bg-gray-100 ${component.id === selectedComponentId ? 'bg-blue-100' : ''
                    }`}
            >
                {component.type} ({component.id.slice(0, 8)}...)
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

const SortableHierarchy: React.FC<SortableHierarchyProps> = ({ parentId, level = 0 }) => {
    const { components } = useWebsiteStore();
    const children = components.filter(c => c.parentId === parentId);
    const childIds = children.map(c => c.id);

    return (
        <SortableContext id={parentId || 'root'} items={childIds}>
            {children.map(component => (
                <SortableHierarchyItem key={component.id} component={component} level={level} />
            ))}
        </SortableContext>
    );
};

const ElementHierarchyViewer: React.FC = () => {
    const { components, updateComponentParent, updateComponentOrder } = useWebsiteStore();

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (!active || !over || active.id === over.id) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        const activeComponent = components.find(c => c.id === activeId);
        const overComponent = components.find(c => c.id === overId);

        if (!activeComponent) return;

        // Reordering within same parent
        if (activeComponent.parentId === overComponent?.parentId) {
            const parentId = activeComponent.parentId;
            const siblings = components.filter(c => c.parentId === parentId).map(c => c.id);
            const oldIndex = siblings.indexOf(activeId);
            const newIndex = siblings.indexOf(overId);

            if (oldIndex !== -1 && newIndex !== -1) {
                const newOrder = arrayMove(siblings, oldIndex, newIndex);
                updateComponentOrder(parentId, newOrder);
            }
        }

        // Moving to new parent
        else if (overComponent) {
            updateComponentParent(activeId, overComponent.id);

            const newSiblings = components
                .filter(c => c.parentId === overComponent.id)
                .map(c => c.id)
                .filter(id => id !== activeId);

            updateComponentOrder(overComponent.id, [...newSiblings, activeId]);
        }

        // Moving to root
        else if (overId === 'root') {
            updateComponentParent(activeId, null);

            const rootComponents = components
                .filter(c => c.parentId === null && c.id !== activeId)
                .map(c => c.id);

            updateComponentOrder(null, [...rootComponents, activeId]);
        }
    };

    return (
        <div style={{ width: '300px', borderLeft: '1px solid #ccc', padding: '10px' }}>
            <DndContext onDragEnd={handleDragEnd}>
                <SortableHierarchy parentId={null} level={0} />
            </DndContext>
        </div>
    );
};

export default ElementHierarchyViewer;
