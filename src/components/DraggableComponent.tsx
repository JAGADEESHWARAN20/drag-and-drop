
'use client';

import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { ComponentType, SVGProps } from 'react';
import { ComponentProps } from '../types';

interface LibraryComponent {
  type: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement> & { size?: string | number }>;
  defaultProps: ComponentProps;
}

interface DraggableComponentProps {
  component: LibraryComponent;
}

const DraggableComponent: React.FC<DraggableComponentProps> = ({ component }) => {
  const { attributes, listeners, setNodeRef, isDragging, transform } = useDraggable({
    id: `draggable-${component.type}`,
    data: {
      type: 'COMPONENT',
      componentType: component.type,
      defaultProps: component.defaultProps,
    },
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: isDragging ? 1000 : 'auto',
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`p-3 border rounded-lg cursor-grab bg-white dark:bg-gray-800 flex flex-col items-center justify-center text-sm transition-all hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-sm ${
        isDragging ? 'opacity-50 cursor-grabbing shadow-lg scale-105' : ''
      }`}
      style={{
        touchAction: 'none',
        userSelect: 'none',
        ...style,
      }}
    >
      <div className="text-blue-500 dark:text-blue-400 mb-2">
        <component.icon size={24} aria-hidden="true" />
      </div>
      <span className="text-gray-700 dark:text-gray-300 text-center font-medium">
        {component.label}
      </span>
    </div>
  );
};

export default DraggableComponent;
