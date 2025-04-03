
import React, { useState } from 'react';
import { useWebsiteStore, Breakpoint } from '../store/WebsiteStore';
import { PropertyEditors } from '../utils/PropertyEditors';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PositionType } from './DroppableContainer';

const PositionEditor = ({ 
  position, 
  onChange 
}: { 
  position: { 
    type: PositionType; 
    top?: string; 
    left?: string; 
    right?: string; 
    bottom?: string; 
    zIndex?: string; 
  } | undefined;
  onChange: (newPosition: any) => void;
}) => {
  const defaultPosition = position || { type: 'relative' };
  
  const handlePositionTypeChange = (value: string) => {
    onChange({
      ...defaultPosition,
      type: value as PositionType
    });
  };
  
  const handlePositionValueChange = (property: string, value: string) => {
    onChange({
      ...defaultPosition,
      [property]: value
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Position Type</Label>
        <Select
          value={defaultPosition.type}
          onValueChange={handlePositionTypeChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select position type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="relative">Relative</SelectItem>
            <SelectItem value="absolute">Absolute</SelectItem>
            <SelectItem value="fixed">Fixed</SelectItem>
            <SelectItem value="sticky">Sticky</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {(defaultPosition.type === 'absolute' || defaultPosition.type === 'fixed' || defaultPosition.type === 'sticky') && (
        <>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label>Top</Label>
              <Input
                type="text"
                value={defaultPosition.top || ''}
                onChange={(e) => handlePositionValueChange('top', e.target.value)}
                placeholder="e.g., 10px"
              />
            </div>
            <div className="space-y-2">
              <Label>Left</Label>
              <Input
                type="text"
                value={defaultPosition.left || ''}
                onChange={(e) => handlePositionValueChange('left', e.target.value)}
                placeholder="e.g., 10px"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label>Bottom</Label>
              <Input
                type="text"
                value={defaultPosition.bottom || ''}
                onChange={(e) => handlePositionValueChange('bottom', e.target.value)}
                placeholder="e.g., 10px"
              />
            </div>
            <div className="space-y-2">
              <Label>Right</Label>
              <Input
                type="text"
                value={defaultPosition.right || ''}
                onChange={(e) => handlePositionValueChange('right', e.target.value)}
                placeholder="e.g., 10px"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Z-Index</Label>
            <Input
              type="text"
              value={defaultPosition.zIndex || ''}
              onChange={(e) => handlePositionValueChange('zIndex', e.target.value)}
              placeholder="e.g., 10"
            />
          </div>
        </>
      )}
    </div>
  );
};

const PropertyPanel = () => {
  const {
    components,
    selectedComponentId,
    updateComponentProps,
    updateResponsiveProps,
    breakpoint
  } = useWebsiteStore();
  
  const [activeTab, setActiveTab] = useState<string>('general');

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
  
  const handlePositionChange = (position: any) => {
    updateComponentProps(selectedComponentId, { position });
  };

  return (
    <div className="p-4 h-full overflow-y-auto border-l border-gray-200">
      <h2 className="text-lg font-semibold mb-4">Properties</h2>
      <div className="mb-4">
        <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
          {selectedComponent.type}
        </span>
      </div>

      <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full mb-4">
          <TabsTrigger value="general" className="flex-1">General</TabsTrigger>
          <TabsTrigger value="position" className="flex-1">Position</TabsTrigger>
          <TabsTrigger value="responsive" className="flex-1">Responsive</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          {PropertyEditor ? (
            <PropertyEditor
              props={mergedProps}
              onChange={handlePropertyChange}
              breakpoint={breakpoint}
            />
          ) : (
            <p className="text-gray-500">No properties available for this component</p>
          )}
        </TabsContent>
        
        <TabsContent value="position">
          <PositionEditor 
            position={selectedComponent.props.position}
            onChange={handlePositionChange}
          />
        </TabsContent>
        
        <TabsContent value="responsive">
          <div className="p-2 bg-amber-50 rounded mb-4 text-xs">
            Responsive props override default props for {breakpoint} breakpoint
          </div>
          {PropertyEditor ? (
            <PropertyEditor
              props={responsiveProps}
              onChange={(key, value) => handlePropertyChange(key, value, true)}
              breakpoint={breakpoint}
              isResponsive={true}
            />
          ) : (
            <p className="text-gray-500">No responsive properties available</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PropertyPanel;
