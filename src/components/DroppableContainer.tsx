import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
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
  onSelect: (event: React.MouseEvent) => void;
}

const DroppableContainer: React.FC<DroppableContainerProps> = ({
  id,
  children,
  isPreviewMode,
  isSelected,
  onSelect,
}) => {
  const { removeComponent } = useWebsiteStore();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    data: { type: 'SORTABLE_ITEM', componentId: id },
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
    onSelect(e);
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
  const style: React.CSSProperties = {
    ...positionStyles,
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : positionStyles.zIndex || 'auto',
  };

  return (
    <div
      ref={setNodeRef}
      className={`w-full ${isSelected ? 'outline outline-[5px] py-3 px-2 outline-slate-700' : 'hover:outline hover:outline-1 hover:outline-blue-300'} ${isDragging ? 'shadow-lg' : ''}`}
      onClick={handleClick}
      style={style}
      data-component-id={id}
      {...attributes}
      {...listeners}
    >
      {isSelected && (
        <div className="absolute -top-6 right-0 flex bg-slate-700 py-2 text-white text-xs z-50">
          <span className="px-2 py-1 flex w-full items-center">
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