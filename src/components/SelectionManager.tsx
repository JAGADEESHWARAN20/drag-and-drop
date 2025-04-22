
import React, { useState } from 'react';
import { useWebsiteStore } from '../store/WebsiteStore';

const SelectionManager = () => {
     const { setSelectedComponentId } = useWebsiteStore();
     const [selectedIds, setSelectedIds] = useState<string[]>([]);

     const handleComponentClick = (componentId: string, event: React.MouseEvent) => {
          event.stopPropagation();
          if (event.shiftKey) {
               if (selectedIds.includes(componentId)) {
                    setSelectedIds(selectedIds.filter((id) => id !== componentId));
               } else {
                    setSelectedIds([...selectedIds, componentId]);
               }
          } else {
               setSelectedIds([componentId]);
               setSelectedComponentId(componentId);
          }
     };

     return { selectedIds, handleComponentClick, setSelectedIds };
};

export default SelectionManager;
