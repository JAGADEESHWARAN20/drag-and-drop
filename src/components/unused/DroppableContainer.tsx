
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useWebsiteStore } from '../../store/WebsiteStore';
import { X, MoveVertical } from 'lucide-react';

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
  onSelect: (event: React.MouseEvent) => void;
}

const DroppableContainer: React.FC<DroppableContainerProps> = ({
  id,
  children,
  isPreviewMode,
  isSelected,
  onSelect,
}) => {
  const { removeComponent, components } = useWebsiteStore();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    data: { type: 'component', id },
  });

  const component = components.find((c) => c.id === id);
  if (!component) return null;

  if (isPreviewMode) {
    return <>{children}</>;
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeComponent(id);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(e);
  };

  const position = component.props.position as PositionProps | undefined;
  const positionStyles: React.CSSProperties = position
    ? {
      position: position.type || 'relative',
      top: position.top,
      left: position.left,
      right: position.right,
      bottom: position.bottom,
      zIndex: position.zIndex,
    }
    : {};

  const style: React.CSSProperties = {
    ...positionStyles,
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : positionStyles.zIndex || 'auto',
    touchAction: 'none', // Essential for touch devices
    cursor: isSelected ? 'grab' : 'pointer',
  };

  return (
    <div
      ref={setNodeRef}
      className={`relative border-2 ${isSelected ? 'border-blue-500' : 'border-transparent'} ${isDragging ? 'shadow-lg border-blue-400' : ''} rounded-sm`}
      onClick={handleClick}
      style={style}
      data-component-id={id}
      {...attributes}
      {...listeners}
    >
      {isSelected && (
        <div className="absolute -top-7 right-0 flex text-slate-700 py-1 text-xs z-50 bg-white dark:bg-gray-800 shadow-sm rounded-t-md">
          <span className="px-2 py-1 flex items-center cursor-grab">
            <MoveVertical size={12} className="mr-1" />
            <span className="text-xs">Drag</span>
          </span>
          <button
            className="px-2 py-1 rounded-full bg-red-500 hover:bg-red-600 text-white"
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
