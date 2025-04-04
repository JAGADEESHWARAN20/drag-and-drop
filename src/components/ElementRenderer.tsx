import React from 'react';
import {
     DndContext,
     closestCenter,
     KeyboardSensor,
     MouseSensor,
     TouchSensor,
     useSensor,
     useSensors,
     DragEndEvent,
} from '@dnd-kit/core'; // ✅ Fix typo
import {
     SortableContext,
     sortableKeyboardCoordinates,
     verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useWebsiteStore } from '../store/WebsiteStore';
import SortableItem from './SortableItem'; // Reuse the existing SortableItem

const ElementHierarchyViewer: React.FC = () => {
     const { components, selectedComponentId, setSelectedComponentId, reorderComponents, reorderChildren } = useWebsiteStore();

     const sensors = useSensors(
          useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
          useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
          useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
     );

     const handleDragEnd = (event: DragEndEvent) => {
          const { active, over } = event;

          if (!active || !over || active.id === over.id) return;

          const activeId = active.id.toString();
          const overId = over.id.toString();

          const activeComponent = components.find((c) => c.id === activeId);
          const overComponent = components.find((c) => c.id === overId);

          if (!activeComponent || !overComponent) return;

          // Reordering root components
          if (!activeComponent.parentId && !overComponent.parentId) {
               const rootComponents = components.filter((c) => !c.parentId);
               const oldIndex = rootComponents.findIndex((c) => c.id === activeId);
               const newIndex = rootComponents.findIndex((c) => c.id === overId);
               if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
                    reorderComponents(activeComponent.pageId, oldIndex, newIndex);
               }
          }
          // Reordering child components under the same parent
          else if (activeComponent.parentId && activeComponent.parentId === overComponent.parentId) {
               const parentId = activeComponent.parentId;
               const parent = components.find((c) => c.id === parentId);
               if (parent && parent.children) {
                    const oldIndex = parent.children.indexOf(activeId);
                    const newIndex = parent.children.indexOf(overId);
                    if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
                         reorderChildren(parentId, oldIndex, newIndex);
                    }
               }
          }
     };

     const renderHierarchy = (parentId: string | null, level: number = 0): JSX.Element[] => {
          const children = components.filter((c) => c.parentId === parentId);

          return children.map((component) => (
               <SortableItem key={component.id} id={component.id}>
                    <div
                         style={{ paddingLeft: `${level * 20}px`, cursor: 'pointer' }}
                         onClick={() => setSelectedComponentId(component.id)}
                         className={`p-1 hover:bg-gray-100 ${component.id === selectedComponentId ? 'bg-blue-100' : ''}`}
                    >
                         {component.type} ({component.id.slice(0, 8)}...)
                         {renderHierarchy(component.id, level + 1)}
                    </div>
               </SortableItem>
          ));
     };

     const rootComponents = components.filter((c) => !c.parentId);

     return (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
               <SortableContext items={rootComponents.map((c) => c.id)} strategy={verticalListSortingStrategy}>
                    <div style={{ width: '300px', borderLeft: '1px solid #ccc', padding: '10px' }}>
                         {renderHierarchy(null)}
                    </div>
               </SortableContext>
          </DndContext>
     );
};

export default ElementHierarchyViewer;