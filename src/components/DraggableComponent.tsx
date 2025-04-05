'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useDraggable, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
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

const DraggableComponent = ({ component }: DraggableComponentProps) => {
  const dragRef = useRef<HTMLDivElement>(null);
  const [isPressing, setIsPressing] = useState(false);
  const [pressTimeout, setPressTimeout] = useState<NodeJS.Timeout | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { delay: 300, tolerance: 5 } }));
  const { attributes, listeners, setNodeRef, isDragging, transform } = useDraggable({
    id: component.type, // Use component.type as the ID to match SortableContext
    data: {
      type: 'COMPONENT',
      componentType: component.type,
      defaultProps: component.defaultProps,
    },
  });

  useEffect(() => {
    setNodeRef(dragRef.current);
  }, [setNodeRef, dragRef]);

  return (
    <div
      ref={dragRef}
      {...listeners}
      {...attributes}
      className={`p-2 border rounded cursor-grab bg-white flex flex-col items-center justify-center text-sm w-20 h-20 md:w-24 md:h-24 flex-shrink-0 ${isDragging ? 'opacity-50 cursor-grabbing' : ''} ${isPressing ? 'ring-2 ring-blue-500' : ''} hover:bg-gray-50 hover:border-blue-300 transition-colors dark:bg-slate-700`}
      style={{
        touchAction: 'pan-y',
        userSelect: 'none',
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
      }}
      aria-labelledby={`drag-label-${component.type}`}
    >
      <div className="text-blue-500 mb-1 dark:text-white">
        <component.icon size={20} aria-hidden="true" />
      </div>
      <span id={`drag-label-${component.type}`} className="text-black dark:text-white text-center">
        {component.label}
      </span>
    </div>
  );
};

export default DraggableComponent;