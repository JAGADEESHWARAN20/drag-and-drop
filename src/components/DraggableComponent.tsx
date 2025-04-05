'use client';


import { useDraggable } from '@dnd-kit/core';

import { ComponentType, SVGProps } from 'react';

// Create a unified type for component props
type ValidProp = string | number | boolean | string[] | string[][] | { [key: string]: string | number };
export type ComponentProps = Record<string, ValidProp>;

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
  
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `draggable-${component.type}`,
    data: {
      type: 'COMPONENT',
      componentType: component.type,
      defaultProps: component.defaultProps,
    },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`p-2 border rounded cursor-grab bg-white flex flex-col items-center justify-center text-sm w-20 h-20 md:w-24 md:h-24 flex-shrink-0 ${
        isDragging ? 'opacity-50 cursor-grabbing' : ''
      } hover:bg-gray-50 hover:border-blue-300 transition-colors dark:bg-slate-700`}
      style={{
        touchAction: 'none',
        userSelect: 'none',
      }}
      aria-labelledby={`drag-label-${component.type}`} // Keep this
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