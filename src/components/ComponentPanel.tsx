'use client'; // Add this if using Next.js

import { useState } from 'react';
import DraggableComponent from './DraggableComponent';
import { ComponentLibrary } from '../data/ComponentLibrary';
import { Search, MousePointer, MousePointerClick } from 'lucide-react';
import { ComponentType, SVGProps } from 'react';

// Define the type for a component in ComponentLibrary
interface LibraryComponent {
  type: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement> & { size?: string | number }>;
  defaultProps: Record<string, unknown>;
}

const ComponentPanel = () => {
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
    <div className="p-6 h-full overflow-y-auto">
      <h2 className="text-xl font-semibold mb-4 text-blue-900">Component Library</h2>

      <div className="mb-4 p-3 bg-blue-50 rounded-md">
        <div className="flex items-center mb-2 text-blue-700">
          <MousePointerClick size={16} className="mr-2" />
          <span className="text-sm font-medium">Click to add</span>
        </div>
        <p className="text-xs text-blue-600">Click any component to add it to the canvas</p>
      </div>

      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search components..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        </div>
      </div>
      <div className="space-y-6">
        {Object.entries(filteredComponents).map(([category, components]) => (
          <div key={category}>
            <h3 className="text-sm font-medium mb-2 text-gray-600 uppercase">{category}</h3>
            <div className="grid grid-cols-3 gap-2">
              {components.map((component) => (
                <DraggableComponent key={component.type} component={component} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ComponentPanel;