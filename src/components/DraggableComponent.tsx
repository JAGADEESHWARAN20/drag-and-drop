'use client';

import React, { useRef, useEffect } from 'react';
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
  const dragRef = useRef<HTMLDivElement>(null);
  
  const { attributes, listeners, setNodeRef, isDragging, transform } = useDraggable({
    id: component.type,
    data: {
      type: 'COMPONENT',
      componentType: component.type,
      defaultProps: component.defaultProps,
    },
    // Remove sensors property as it's not part of UseDraggableArguments
  });

  useEffect(() => {
    setNodeRef(dragRef.current);
  }, [setNodeRef]);

  return (
    <div
      ref={dragRef}
      {...listeners}
      {...attributes}
      className={`p-2 border rounded cursor-grab bg-white flex flex-col items-center justify-center text-sm w-20 h-20 md:w-24 md:h-24 flex-shrink-0 hover:border-blue-300 transition-colors ${isDragging ? 'opacity-50 cursor-grabbing shadow-lg' : ''}`}
      style={{
        touchAction: 'none', // Essential for touch devices
        userSelect: 'none',
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
      }}
    >
      <div className="text-blue-500 mb-1 dark:text-white">
        <component.icon size={20} aria-hidden="true" />
      </div>
      <span className="text-black dark:text-white text-center">
        {component.label}
      </span>
    </div>
  );
};

export default DraggableComponent;
