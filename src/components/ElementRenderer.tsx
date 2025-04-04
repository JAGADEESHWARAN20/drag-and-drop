import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import { useWebsiteStore, Component as ComponentTypeFromStore } from '../store/WebsiteStore';
import { X, Move } from 'lucide-react';
import { PositionType } from './DroppableContainer';
import { ComponentRegistry } from '../utils/ComponentRegistry';

interface ElementRendererProps {
     id: string;
     componentData: ComponentTypeFromStore;
     isSelected: boolean;
     onSelect: () => void;
     isPreviewMode: boolean;
     currentBreakpoint: string;
}

const ElementRenderer = ({
     id,
     componentData,
     isSelected,
     onSelect,
     isPreviewMode,
     currentBreakpoint,
}: ElementRendererProps) => {
     const { removeComponent, updateComponentProps, components } = useWebsiteStore();

     const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
          id,
          data: {
               type: 'SORTABLE_ITEM',
               componentId: id,
          },
     });

     const getComponentPositionStyles = (component: ComponentTypeFromStore) => {
          const position = component.props.position as
               | {
                    type: PositionType;
                    top?: string;
                    left?: string;
                    right?: string;
                    bottom?: string;
                    zIndex?: string;
               }
               | undefined;

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

     const style: React.CSSProperties = {
          transform: CSS.Transform.toString(transform),
          transition,
          opacity: isDragging ? 0.5 : 1,
          position: 'relative',
          zIndex: isDragging ? 50 : 'auto',
     };

     const childComponents = React.useMemo(() => {
          return components.filter((c) => c.parentId === componentData.id);
     }, [components, componentData.id]);

     const handleDelete = (e: React.MouseEvent) => {
          e.stopPropagation();
          removeComponent(id);
     };

     const handleClick = (e: React.MouseEvent) => {
          e.stopPropagation();
          onSelect();
     };

     const getComponentType = () => {
          const component = components.find((c) => c.id === id);
          return component?.type || '';
     };

     const handlePositionChange = (newPosition: {
          type: PositionType;
          top?: string;
          left?: string;
          right?: string;
          bottom?: string;
          zIndex?: string;
     }) => {
          updateComponentProps(id, { position: newPosition });
     };

     const ResolvedComponent = ComponentRegistry[componentData.type] as React.ComponentType<any>;
     const responsiveProps = componentData.responsiveProps?.[currentBreakpoint] || {};
     const mergedProps = { ...componentData.props, ...responsiveProps };

     if (isPreviewMode) {
          if (!ResolvedComponent) return null;

          return (
               <div style={getComponentPositionStyles(componentData)}>
                    <ResolvedComponent {...mergedProps} id={componentData.id} isPreviewMode={isPreviewMode}>
                         {childComponents.map((child) => {
                              const childComponentData = components.find((c) => c.id === child.id);
                              if (!childComponentData) return null;
                              return (
                                   <ElementRenderer
                                        key={child.id}
                                        id={child.id}
                                        componentData={childComponentData}
                                        isSelected={false}
                                        onSelect={() => { }}
                                        isPreviewMode={isPreviewMode}
                                        currentBreakpoint={currentBreakpoint}
                                   />
                              );
                         })}
                    </ResolvedComponent>
               </div>
          );
     }

     return (
          <motion.div
               ref={setNodeRef}
               style={{ ...style, ...getComponentPositionStyles(componentData) }}
               {...attributes}
               {...listeners}
               className={`component-wrapper mb-2 ${isSelected
                         ? 'outline outline-2 outline-blue-500'
                         : 'hover:outline hover:outline-1 hover:outline-blue-300'
                    } cursor-move`}
               layout
               layoutId={id}
               whileDrag={{ scale: 1.02 }}
               onClick={handleClick}
          >
               {isSelected && (
                    <div className="absolute -top-6 right-0 flex bg-blue-500 text-white text-xs z-50">
                         <span className="px-2 py-1 flex items-center">
                              <Move size={12} className="mr-1" />
                              {getComponentType()}
                         </span>
                         <button className="px-2 py-1 bg-red-500 hover:bg-red-600" onClick={handleDelete}>
                              <X size={14} />
                         </button>
                    </div>
               )}

               {ResolvedComponent && (
                    <ResolvedComponent {...mergedProps} id={componentData.id} isPreviewMode={isPreviewMode}>
                         {childComponents.map((child) => {
                              const childComponentData = components.find((c) => c.id === child.id);
                              if (!childComponentData) return null;
                              return (
                                   <ElementRenderer
                                        key={child.id}
                                        id={child.id}
                                        componentData={childComponentData}
                                        isSelected={false}
                                        onSelect={() => { }}
                                        isPreviewMode={isPreviewMode}
                                        currentBreakpoint={currentBreakpoint}
                                   />
                              );
                         })}
                    </ResolvedComponent>
               )}
          </motion.div>
     );
};

export default ElementRenderer;
