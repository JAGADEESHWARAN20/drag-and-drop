
import React, { useState } from 'react';
import { useEnhancedWebsiteStore } from '../store/EnhancedWebsiteStore';
import { ChevronDown, ChevronRight, Eye, EyeOff, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HierarchyItemProps {
  elementId: string;
  level: number;
}

const HierarchyItem: React.FC<HierarchyItemProps> = ({ elementId, level }) => {
  const { currentProject, selectedElementId, setSelectedElement, removeElement } = useEnhancedWebsiteStore();
  const [isExpanded, setIsExpanded] = useState(true);
  
  const element = currentProject.elements[elementId];
  if (!element) return null;

  const children = element.children || [];
  const hasChildren = children.length > 0;
  const isSelected = selectedElementId === elementId;

  const handleSelect = () => {
    setSelectedElement(elementId);
  };

  const handleToggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeElement(elementId);
  };

  return (
    <div>
      <div
        className={`
          flex items-center gap-0.5em p-0.5em rounded cursor-pointer group transition-colors
          ${isSelected 
            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' 
            : 'hover:bg-gray-100 dark:hover:bg-gray-800'
          }
        `}
        style={{ paddingLeft: `${level * 1.5 + 0.5}em` }}
        onClick={handleSelect}
      >
        {hasChildren ? (
          <Button
            variant="ghost"
            size="sm"
            className="h-1.5em w-1.5em p-0"
            onClick={handleToggleExpand}
          >
            {isExpanded ? (
              <ChevronDown className="h-0.75em w-0.75em" />
            ) : (
              <ChevronRight className="h-0.75em w-0.75em" />
            )}
          </Button>
        ) : (
          <div className="w-1.5em" />
        )}
        
        <div className="flex-1 flex items-center gap-0.5em min-w-0">
          <span className="font-medium text-0.875rem truncate">
            {element.type}
          </span>
          <span className="text-0.75rem text-gray-500 dark:text-gray-400 truncate">
            #{elementId.slice(0, 8)}
          </span>
        </div>

        <div className="flex items-center gap-0.25em opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="sm" className="h-1.5em w-1.5em p-0">
            <Eye className="h-0.75em w-0.75em" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-1.5em w-1.5em p-0 text-red-500 hover:text-red-600"
            onClick={handleDelete}
          >
            <Trash2 className="h-0.75em w-0.75em" />
          </Button>
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div>
          {children.map(childId => (
            <HierarchyItem key={childId} elementId={childId} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

const ElementHierarchy: React.FC = () => {
  const { currentProject } = useEnhancedWebsiteStore();
  
  const rootElements = Object.values(currentProject.elements).filter(
    element => !element.parentId
  );

  if (rootElements.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-20em text-gray-500 dark:text-gray-400">
        <div className="text-center">
          <div className="w-4em h-4em mx-auto mb-1em rounded-full border-0.125em border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center">
            <Eye className="h-1.5em w-1.5em" />
          </div>
          <h3 className="text-1.125rem font-medium mb-0.5em">No Elements</h3>
          <p className="text-0.875rem">
            Add components to the canvas to see them here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-1em">
      <h3 className="font-medium mb-1em text-gray-900 dark:text-gray-100">
        Element Hierarchy
      </h3>
      <div className="space-y-0.25em">
        {rootElements.map(element => (
          <HierarchyItem 
            key={element.elementId} 
            elementId={element.elementId} 
            level={0} 
          />
        ))}
      </div>
    </div>
  );
};

export default ElementHierarchy;
