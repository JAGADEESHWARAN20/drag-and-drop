import React from 'react';
import { useWebsiteStore } from '../store/WebsiteStore';
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

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        paddingLeft: `${level * 20}px`,
        cursor: 'grab',
    };

    const children = components.filter(c => c.parentId === component.id);

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <div
                onClick={() => setSelectedComponentId(component.id)}
                className={`p-1 hover:bg-gray-100 dark:hover:bg-gray-800 ${component.id === selectedComponentId ? 'bg-blue-100 dark:bg-blue-900' : ''}`}
            >
                {component.type} ({component.id.slice(0, 6)})
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

    return (
        <SortableContext items={children.map(c => c.id)}>
            {children.map(component => (
                <SortableHierarchyItem key={component.id} component={component} level={level} />
            ))}
        </SortableContext>
    );
};

const ElementHierarchyViewer: React.FC = () => {
    const { components, updateComponentParent, updateComponentOrder } = useWebsiteStore();

    const handleDragEnd = (event: any) => {
        const { active, over } = event;
        if (!active || !over || active.id === over.id) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        const activeComponent = components.find(c => c.id === activeId);
        const overComponent = components.find(c => c.id === overId);

        if (!activeComponent || !overComponent) return;

        const sameParent = activeComponent.parentId === overComponent.parentId;

        // Reorder within the same parent
        if (sameParent) {
            const siblings = components.filter(c => c.parentId === activeComponent.parentId);
            const oldIndex = siblings.findIndex(c => c.id === activeId);
            const newIndex = siblings.findIndex(c => c.id === overId);
            if (oldIndex !== -1 && newIndex !== -1) {
                const reordered = arrayMove(siblings, oldIndex, newIndex).map(c => c.id);
                updateComponentOrder(activeComponent.parentId, reordered);
            }
        }
        // Move to new parent
        else {
            updateComponentParent(activeId, overComponent.id);
            const newSiblings = components
                .filter(c => c.parentId === overComponent.id)
                .map(c => c.id)
                .concat(activeId);
            updateComponentOrder(overComponent.id, newSiblings);
        }
    };

    const rootComponents = components.filter(c => c.parentId === null);

    return (
        <div className="space-y-1">
            <SortableContext items={rootComponents.map(c => c.id)}>
                {rootComponents.map(component => (
                    <SortableHierarchyItem key={component.id} component={component} level={0} />
                ))}
            </SortableContext>
        </div>
    );
};

export default ElementHierarchyViewer;
