
import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Icon } from 'lucide-react';

interface DraggableComponentProps {
  component: {
    type: string;
    label: string;
    icon: any;
    defaultProps: Record<string, any>;
  };
}

const DraggableComponent = ({ component }: DraggableComponentProps) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `draggable-${component.type}`,
    data: {
      type: 'COMPONENT',
      componentType: component.type,
      defaultProps: component.defaultProps
    }
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`p-2 border rounded cursor-grab bg-white flex flex-col items-center justify-center text-sm ${
        isDragging ? 'opacity-50 cursor-grabbing' : ''
      } hover:bg-gray-50 hover:border-blue-300 transition-colors`}
      style={{
        touchAction: 'none' // This prevents touch events from being captured by browser
      }}
    >
      <div className="text-blue-500 mb-1">
        {React.createElement(component.icon as any, { size: 20 })}
      </div>
      <span>{component.label}</span>
    </div>
  );
};

export default DraggableComponent;
