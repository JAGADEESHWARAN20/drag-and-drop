import React, { useRef, useEffect } from 'react';
import { useWebsiteStore } from '../store/WebsiteStore';

interface ContextMenuProps {
     x: number;
     y: number;
     selectedIds: string[];
     onClose: () => void;
     onAddToParent: (parentId: string) => void;
     onMoveAbove: (componentId: string) => void; // New prop
     onMoveBelow: (componentId: string) => void; // New prop
}

const ContextMenu: React.FC<ContextMenuProps> = ({
     x,
     y,
     selectedIds,
     onClose,
     onAddToParent,
     onMoveAbove,
     onMoveBelow,
}) => {
     const { components } = useWebsiteStore();
     const menuRef = useRef<HTMLDivElement>(null);

     useEffect(() => {
          const handleClickOutside = (event: MouseEvent) => {
               if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                    onClose();
               }
          };
          document.addEventListener('mousedown', handleClickOutside);
          return () => document.removeEventListener('mousedown', handleClickOutside);
     }, [onClose]);

     const potentialParents = components.filter(
          (c) => c.allowChildren && !selectedIds.includes(c.id)
     );

     // Only show move options if a single component is selected
     const showMoveOptions = selectedIds.length === 1;
     const selectedComponentId = selectedIds[0];

     return (
          <div
               ref={menuRef}
               style={{ position: 'absolute', left: x, top: y, zIndex: 1000 }}
               className="bg-white border border-gray-300 shadow-lg p-2 rounded"
          >
               <h3 className="text-sm font-semibold mb-1">Selected Elements</h3>
               <ul className="mb-2">
                    {selectedIds.map((id) => {
                         const component = components.find((c) => c.id === id);
                         return (
                              <li key={id} className="text-sm">
                                   {component?.type} ({id.slice(0, 8)}...)
                              </li>
                         );
                    })}
               </ul>

               {showMoveOptions && (
                    <>
                         <hr className="my-1" />
                         <h4 className="text-sm font-semibold mb-1">Move Position</h4>
                         <ul>
                              <li
                                   className="text-sm cursor-pointer hover:bg-gray-100 p-1"
                                   onClick={() => onMoveAbove(selectedComponentId)}
                              >
                                   Move Above
                              </li>
                              <li
                                   className="text-sm cursor-pointer hover:bg-gray-100 p-1"
                                   onClick={() => onMoveBelow(selectedComponentId)}
                              >
                                   Move Below
                              </li>
                         </ul>
                    </>
               )}

               {potentialParents.length > 0 && (
                    <>
                         <hr className="my-1" />
                         <h4 className="text-sm font-semibold mb-1">Add to Parent</h4>
                         <ul>
                              {potentialParents.map((parent) => (
                                   <li
                                        key={parent.id}
                                        className="text-sm cursor-pointer hover:bg-gray-100 p-1"
                                        onClick={() => onAddToParent(parent.id)}
                                   >
                                        {parent.type} ({parent.id.slice(0, 8)}...)
                                   </li>
                              ))}
                         </ul>
                    </>
               )}
          </div>
     );
};

export default ContextMenu;