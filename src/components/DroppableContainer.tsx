
import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { useWebsiteStore } from '../store/WebsiteStore';
import { v4 as uuidv4 } from 'uuid';
import { X } from 'lucide-react';

interface DroppableContainerProps {
  id: string;
  children: React.ReactNode;
  isPreviewMode: boolean;
  isSelected: boolean;
  onSelect: () => void;
}

const DroppableContainer = ({ 
  id, 
  children, 
  isPreviewMode, 
  isSelected, 
  onSelect 
}: DroppableContainerProps) => {
  const { addComponent, removeComponent } = useWebsiteStore();

  const { isOver, setNodeRef } = useDroppable({
    id: `droppable-${id}`,
    data: {
      accepts: 'COMPONENT',
      containerId: id
    }
  });

  if (isPreviewMode) {
    return <>{children}</>;
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeComponent(id);
  };

  const getComponentType = () => {
    const component = useWebsiteStore.getState().components.find(c => c.id === id);
    return component?.type || '';
  };

  return (
    <div
      ref={setNodeRef}
      className={`relative ${isOver ? 'bg-blue-50' : ''} ${
        isSelected ? 'outline outline-2 outline-blue-500' : 'hover:outline hover:outline-1 hover:outline-blue-300'
      }`}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      {isSelected && (
        <div className="absolute -top-6 right-0 flex bg-blue-500 text-white text-xs z-10">
          <span className="px-2 py-1">
            {getComponentType()}
          </span>
          <button
            className="px-2 py-1 bg-red-500 hover:bg-red-600"
            onClick={handleDelete}
          >
            <X size={14} />
          </button>
        </div>
      )}
      {children}
    </div>
  );
};

export default DroppableContainer;
