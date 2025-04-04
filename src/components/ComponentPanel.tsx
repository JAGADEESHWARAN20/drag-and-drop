'use client';

import React, { useState, useRef, useEffect, forwardRef } from 'react';
import DraggableComponent from './DraggableComponent';
import { ComponentLibrary } from '../data/ComponentLibrary';
import { Search, MousePointerClick } from 'lucide-react';
import { ComponentType, SVGProps } from 'react';

interface LibraryComponent {
  type: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement> & { size?: string | number }>;
  defaultProps: Record<string, string | number | boolean | string[] | string[][] | Record<string, string | number>>;
}

interface ComponentPanelProps {
  // You can define any other props your ComponentPanel might receive here
}

const ComponentPanel = forwardRef<HTMLDivElement, ComponentPanelProps>(({ }, ref) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredComponents = Object.entries(ComponentLibrary).reduce<
    Record<string, LibraryComponent[]>
  >((acc, [category, components]) => {
    const filtered = components.filter((comp) =>
      comp.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (filtered.length) acc[category] = filtered;
    return acc;
  }, {});

  return (
    <div className="p-4 h-full overflow-y-auto flex flex-col" ref={ref}>
      <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-md">
        <div className="flex items-center mb-2 text-blue-700 dark:text-blue-300">
          <MousePointerClick size={16} className="mr-2" />
          <span className="text-sm font-medium">Click to add</span>
        </div>
        <p className="text-xs text-blue-600 dark:text-blue-400">
          Click any component to add it to the canvas
        </p>
      </div>

      {/* Search Input */}
      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search components..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
        </div>
      </div>

      {/* Component Categories */}
      <div className="space-y-6 flex-1 overflow-x-auto overflow-y-auto">
        {Object.entries(filteredComponents).map(([category, components]) => (
          <div key={category} className="mb-4">
            <h3 className="text-sm font-medium mb-2 text-gray-600 dark:text-gray-400 uppercase">
              {category}
            </h3>
            <div className="flex flex-row gap-2 overflow-x-auto">
              {components.map((component) => (
                <div key={component.type} className="flex-shrink-0">
                  <DraggableComponent component={component} />
                </div>
              ))}
            </div>
          </div>
        ))}
        {Object.keys(filteredComponents).length === 0 && searchTerm && (
          <div className="text-center text-gray-500 dark:text-gray-400">
            No components found matching "{searchTerm}"
          </div>
        )}
        {Object.keys(ComponentLibrary).length > 0 && Object.keys(filteredComponents).length === 0 && !searchTerm && (
          <div className="text-center text-gray-500 dark:text-gray-400">
            Browse components by category. Click to add, or drag to the canvas.
          </div>
        )}
        {Object.keys(ComponentLibrary).length === 0 && (
          <div className="text-center text-gray-500 dark:text-gray-400">
            No components available in the library.
          </div>
        )}
      </div>
    </div>
  );
});

ComponentPanel.displayName = 'ComponentPanel';

export default ComponentPanel;