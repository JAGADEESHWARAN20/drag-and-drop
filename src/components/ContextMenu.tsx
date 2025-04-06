import React, { useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { useWebsiteStore } from '../store/WebsiteStore';
import Button from '@/components/ui/button';
import type { Component } from '../types'; // ✅ Ensure this is the correct path to your Component type

interface ContextMenuProps {
     x: number;
     y: number;
     selectedIds: string[];
     onClose: () => void;
     onAddToParent: (parentId: string) => void;
     onMoveAbove: (componentId: string) => void;
     onMoveBelow: (componentId: string) => void;
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
     const menuRef = useRef<HTMLDivElement>(null);
     const { components, removeComponent } = useWebsiteStore();

     // ✅ Fixed: Now typed and children accessed from single component only
     function moveComponentInParent(
          components: Component[],
          componentId: string,
          direction: 'above' | 'below'
     ): string[] {
          const component = components.find(c => c.id === componentId);
          if (!component) return [];

          const parent = component.parentId
               ? components.find(c => c.id === component.parentId)
               : null;

          const siblings = parent
               ? parent.children
               : components
                    .filter(c => c.pageId === component.pageId && c.parentId === null)
                    .map(c => c.id);

          const index = siblings.indexOf(componentId);
          if (index === -1) return siblings;

          const newIndex = direction === 'above' ? index - 1 : index + 1;
          if (newIndex < 0 || newIndex >= siblings.length) return siblings;

          const reordered = [...siblings];
          const [moved] = reordered.splice(index, 1);
          reordered.splice(newIndex, 0, moved);
          return reordered;
     }

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

     const showMoveOptions = selectedIds.length === 1;
     const selectedComponentId = selectedIds[0];
     const selectedComponent = components.find((c) => c.id === selectedComponentId);

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

               {showMoveOptions && selectedComponent && (
                    <>
                         <hr className="my-1" />
                         <h4 className="text-sm font-semibold mb-1">Move Position</h4>
                         <div className="flex justify-end mt-2 space-x-2">
                              <Button
                                   variant="ghost"
                                   size="icon"
                                   onClick={() => onMoveAbove(selectedComponent.id)}
                                   title="Move Up"
                              >
                                   <svg
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                   >
                                        <path d="M5 10L12 3L19 10M12 3V21" />
                                   </svg>
                              </Button>
                              <Button
                                   variant="ghost"
                                   size="icon"
                                   onClick={() => onMoveBelow(selectedComponent.id)}
                                   title="Move Down"
                              >
                                   <svg
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                   >
                                        <path d="M5 14L12 21L19 14M12 21V3" />
                                   </svg>
                              </Button>
                              <Button
                                   variant="ghost"
                                   size="icon"
                                   onClick={() => removeComponent(selectedComponent.id)}
                                   title="Delete"
                              >
                                   <X size={16} className="text-red-500" />
                              </Button>
                         </div>
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
