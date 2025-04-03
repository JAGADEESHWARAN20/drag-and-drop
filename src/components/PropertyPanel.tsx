
import React from 'react';
import { useWebsiteStore } from '../store/WebsiteStore';
import { PropertyEditors } from '../utils/PropertyEditors';

const PropertyPanel = () => {
  const {
    components,
    selectedComponentId,
    updateComponentProps,
    updateResponsiveProps,
    breakpoint
  } = useWebsiteStore();

  const selectedComponent = components.find(
    component => component.id === selectedComponentId
  );

  if (!selectedComponent) {
    return (
      <div className="p-4 h-full border-l border-gray-200">
        <p className="text-gray-500">No component selected</p>
        <p className="text-gray-400 text-sm mt-2">
          Click on a component in the canvas to edit its properties
        </p>
      </div>
    );
  }

  const PropertyEditor = PropertyEditors[selectedComponent.type];

  // Get current props (regular and responsive)
  const regularProps = selectedComponent.props || {};
  const responsiveProps = selectedComponent.responsiveProps?.[breakpoint] || {};
  const mergedProps = { ...regularProps, ...responsiveProps };

  const handlePropertyChange = (key: string, value: any, isResponsive = false) => {
    if (isResponsive) {
      updateResponsiveProps(selectedComponentId, breakpoint, { [key]: value });
    } else {
      updateComponentProps(selectedComponentId, { [key]: value });
    }
  };

  return (
    <div className="p-4 h-full overflow-y-auto border-l border-gray-200">
      <h2 className="text-lg font-semibold mb-4">Properties</h2>
      <div className="mb-4">
        <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
          {selectedComponent.type}
        </span>
      </div>

      {PropertyEditor ? (
        <PropertyEditor
          props={mergedProps}
          onChange={handlePropertyChange}
          breakpoint={breakpoint}
        />
      ) : (
        <p className="text-gray-500">No properties available for this component</p>
      )}
    </div>
  );
};

export default PropertyPanel;
