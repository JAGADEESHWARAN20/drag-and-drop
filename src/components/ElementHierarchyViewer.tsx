import React from 'react';
import { useWebsiteStore, Component } from '../store/WebsiteStore';

const ElementHierarchyViewer: React.FC = () => {
     const { components, selectedComponentId, setSelectedComponentId } = useWebsiteStore();

     const renderHierarchy = (parentId: string | null, level: number = 0): JSX.Element[] => {
          const children = components.filter((c) => c.parentId === parentId);

          return children.map((component) => (
               <div
                    key={component.id}
                    style={{ paddingLeft: `${level * 20}px`, cursor: 'pointer' }}
                    onClick={() => setSelectedComponentId(component.id)}
                    className={`p-1 hover:bg-gray-100 ${component.id === selectedComponentId ? 'bg-blue-100' : ''}`}
               >
                    {component.type} ({component.id.slice(0, 8)}...)
                    {renderHierarchy(component.id, level + 1)}
               </div>
          ));
     };

     return (
          <div style={{ width: '300px', borderLeft: '1px solid #ccc', padding: '10px' }}>
               <h3 className="text-lg font-semibold mb-2">Element Hierarchy</h3>
               {renderHierarchy(null)}
          </div>
     );
};

export default ElementHierarchyViewer;