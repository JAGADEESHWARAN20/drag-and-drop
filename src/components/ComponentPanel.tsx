'use client';

import React, { useState, forwardRef } from 'react';
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
  onComponentClick: (type: string, defaultProps: Record<string, any>) => void;
}

const ComponentPanel = forwardRef<HTMLDivElement, ComponentPanelProps>(({ onComponentClick }, ref) => {
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
    <div className="p-4 h-full flex flex-col" ref={ref}>
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
            autoFocus={false}
            className="w-full p-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
        </div>
      </div>

      {/* Component Categories */}
      <div className="space-x-2 flex flex-row overflow-x-scroll scrollbar-hidden">
        {Object.entries(filteredComponents).map(([category, components]) => (
          <div key={category} className="mb-4 flex flex-col gap-2">
            <h3 className="text-sm font-medium mb-2 text-gray-600 dark:text-gray-400 uppercase">
              {category}
            </h3>
            <div className="flex flex-row gap-2 whitespace-nowrap scrollbar-hidden">
              {components.map((component) => (
                <div
                  key={component.type}
                  onClick={() => onComponentClick(component.type, component.defaultProps)}
                  className="p-2 border rounded cursor-pointer bg-white flex flex-col items-center justify-center text-sm w-20 h-20 flex-shrink-0 hover:bg-gray-50 hover:border-blue-300 transition-colors dark:bg-slate-700"
                >
                  <div className="text-blue-500 mb-1 dark:text-white">
                    <component.icon size={20} aria-hidden="true" />
                  </div>
                  <span className="text-black dark:text-white text-center">{component.label}</span>
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
            Browse components by category. Click to add to the canvas.
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