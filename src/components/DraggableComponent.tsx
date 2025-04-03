import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { v4 as uuidv4 } from 'uuid';
import { useWebsiteStore } from '../store/WebsiteStore';
import { toast } from '@/components/ui/use-toast';
import { ComponentType, SVGProps } from 'react';

// Define the LibraryComponent type (or import from a shared types file)
interface LibraryComponent {
  type: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement> & { size?: string | number }>;
  defaultProps: Record<string, unknown>;
}

interface DraggableComponentProps {
  component: LibraryComponent;
}

const DraggableComponent = ({ component }: DraggableComponentProps) => {
  const { addComponent } = useWebsiteStore();
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `draggable-${component.type}`,
    data: {
      type: 'COMPONENT',
      componentType: component.type,
      defaultProps: component.defaultProps,
    },
  });

  const handleClick = () => {
    const currentPageId = useWebsiteStore.getState().currentPageId;
    const newComponentId = uuidv4();

    addComponent({
      id: newComponentId,
      pageId: currentPageId,
      parentId: null,
      type: component.type,
      props: { ...component.defaultProps },
      children: [],
      responsiveProps: {
        desktop: {},
        tablet: {},
        mobile: {},
      },
    });

    toast({
      title: 'Component Added',
      description: `Added ${component.type} to canvas. You can now drag it to position.`,
    });
  };

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={handleClick}
      className={`p-2 border rounded cursor-pointer bg-white flex flex-col items-center justify-center text-sm ${isDragging ? 'opacity-50 cursor-grabbing' : ''
        } hover:bg-gray-50 hover:border-blue-300 transition-colors`}
      style={{
        touchAction: 'none', // This prevents touch events from being captured by browser
      }}
    >
      <div className="text-blue-500 mb-1">
        <component.icon size={20} />
      </div>
      <span>{component.label}</span>
    </div>
  );
};

export default DraggableComponent;