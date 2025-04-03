import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { useWebsiteStore } from '../store/WebsiteStore';
import { X, Move } from 'lucide-react';

export type PositionType = 'relative' | 'absolute' | 'fixed' | 'sticky';

interface PositionProps {
  type: PositionType;
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  zIndex?: string;
}

interface DroppableContainerProps {
  id: string;
  children: React.ReactNode;
  isPreviewMode: boolean;
  isSelected: boolean;
  onSelect: (event: React.MouseEvent) => void; // Updated to accept MouseEvent
}

const DroppableContainer: React.FC<DroppableContainerProps> = ({
  id,
  children,
  isPreviewMode,
  isSelected,
  onSelect,
}) => {
  const { addComponent, removeComponent, updateComponentProps } = useWebsiteStore();

  const { isOver, setNodeRef } = useDroppable({
    id: `droppable-${id}`,
    data: {
      accepts: 'COMPONENT',
      containerId: id,
    },
  });

  if (isPreviewMode) {
    return <>{children}</>;
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeComponent(id);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(e); // Pass the event to onSelect
  };

  const getComponentType = () => {
    const component = useWebsiteStore.getState().components.find((c) => c.id === id);
    return component?.type || '';
  };

  const getPositionStyles = () => {
    const component = useWebsiteStore.getState().components.find((c) => c.id === id);
    if (!component) return {};

    const position = component.props.position as PositionProps | undefined;
    if (!position) return {};

    return {
      position: position.type || 'relative',
      top: position.top,
      left: position.left,
      right: position.right,
      bottom: position.bottom,
      zIndex: position.zIndex,
    };
  };

  const positionStyles = getPositionStyles();

  return (
    <div
      ref={setNodeRef}
      className={`component-container ${isOver ? 'bg-blue-100' : ''} ${isSelected ? 'outline outline-2 outline-blue-500' : 'hover:outline hover:outline-1 hover:outline-blue-300'
        } cursor-move`}
      onClick={handleClick}
      style={positionStyles}
      data-component-id={id}
    >
      {isSelected && (
        <div className="absolute -top-6 right-0 flex bg-blue-500 text-white text-xs z-50">
          <span className="px-2 py-1 flex items-center">
            <Move size={12} className="mr-1" />
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