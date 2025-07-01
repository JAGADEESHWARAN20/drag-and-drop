
import React from 'react';
import { useWebsiteStore } from '../../store/WebsiteStore';
import {
    DndContext,
    DragEndEvent,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
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
import { ChevronDown, ChevronRight, Layers } from 'lucide-react';

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
    const [isExpanded, setIsExpanded] = React.useState(true);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: component.id,
        data: {
            type: 'hierarchy-item',
            component
        }
    });

    const children = components.filter((c) => c.parentId === component.id);
    const hasChildren = children.length > 0;

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        paddingLeft: `${level * 16}px`,
        cursor: 'grab', // Indicate draggable
        touchAction: 'none', // Better touch support
    };

    const toggleExpand = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsExpanded(!isExpanded);
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <div
                className={`flex items-center p-1 rounded my-1 ${component.id === selectedComponentId
                        ? 'bg-blue-100 dark:bg-blue-800'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                onClick={() => setSelectedComponentId(component.id)}
            >
                {hasChildren && (
                    <button onClick={toggleExpand} className="mr-1 p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700">
                        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </button>
                )}
                {!hasChildren && <span className="w-5" />}

                <span className="ml-1 flex items-center">
                    <Layers size={14} className="mr-1 text-blue-500 dark:text-blue-400" />
                    {component.type}
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                        ({component.id.slice(0, 5)})
                    </span>
                </span>
            </div>

            {hasChildren && isExpanded && (
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

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 8 } // Smaller distance to activate dragging
        })
    );

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

    if (rootComponents.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-32 text-gray-500 dark:text-gray-400">
                <Layers size={24} className="mb-2 opacity-50" />
                <p>No components yet</p>
                <p className="text-xs text-center mt-1">
                    Drag components from the panel to the canvas
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-auto max-h-[calc(100vh-200px)] pr-2 clean-scrollbar sticky-container">
            <DndContext
                onDragEnd={handleDragEnd}
                collisionDetection={closestCenter}
                sensors={sensors}
            >
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
        </div>
    );
};

export default ElementHierarchyViewer;
