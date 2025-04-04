import React, { useState } from 'react';
import { useWebsiteStore, Breakpoint } from '../store/WebsiteStore';
import { PropertyEditors } from '../utils/PropertyEditors';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs,TabsList,TabsContent,TabsTrigger } from '@/components/ui/tabs';
import PositionEditor from './PositionEditor';
import Button from '@/components/ui/button'; // ✅ Corrected import
import { PositionType } from './DroppableContainer';

interface Position {
  type: PositionType;
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  zIndex?: string;
}

const PropertyPanel = () => {
  const {
    components,
    selectedComponentId,
    updateComponentProps,
    updateResponsiveProps,
    breakpoint,
  } = useWebsiteStore();

  const [activeTab, setActiveTab] = useState<string>('general');
  const [device, setDevice] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  const selectedComponent = components.find(
    (component) => component.id === selectedComponentId
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

  const regularProps = selectedComponent.props || {};
  const responsiveProps = selectedComponent.responsiveProps?.[breakpoint] || {};
  const mergedProps = { ...regularProps, ...responsiveProps };

  const isValidPropValue = (value: unknown): value is string | number | boolean | object => {
    return (
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean' ||
      (typeof value === 'object' && value !== null)
    );
  };

  const handlePropertyChange = (key: string, value: unknown, isResponsive = false) => {
    if (!isValidPropValue(value)) return;

    const payload: Record<string, string | number | boolean | object> = {
      [key]: value,
    };

    if (isResponsive) {
      updateResponsiveProps(selectedComponentId, breakpoint, payload);
    } else {
      updateComponentProps(selectedComponentId, payload);
    }
  };

  const handlePositionChange = (position: Position) => {
    updateComponentProps(selectedComponentId, { position });
  };

  const handleTextWrapChange = (value: boolean) => {
    handlePropertyChange('wrap', value);
  };

  const handleDeviceWidthChange = (device: Breakpoint, width: string) => {
    updateResponsiveProps(selectedComponentId, device, { width });
  };

  const handleStyleChange = (key: string, value: string, isResponsive = false) => {
    const style = { ...((mergedProps.style as object) || {}) };
    if (isResponsive) {
      updateResponsiveProps(selectedComponentId, breakpoint, {
        style: { ...style, [key]: value },
      });
    } else {
      updateComponentProps(selectedComponentId, {
        style: { ...style, [key]: value },
      });
    }
  };

  const safeStyle = (mergedProps.style && typeof mergedProps.style === 'object')
    ? mergedProps.style as Record<string, string>
    : {};
  


  const rawWidth =
    selectedComponent.responsiveProps?.[device]?.width ??
    selectedComponent.props.width ??
    '';

  const safeWidth =
    typeof rawWidth === 'string' || typeof rawWidth === 'number' ? rawWidth : '';



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
          <TabsTrigger value="general" className="flex-1">
            General
          </TabsTrigger>
          <TabsTrigger value="position" className="flex-1">
            Position
          </TabsTrigger>
          <TabsTrigger value="responsive" className="flex-1">
            Responsive
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          {PropertyEditor ? (
            <>
              {selectedComponent.type === 'Text' && (
                <div className="mb-4">
                  <Label>Text Wrap</Label>
                  <Button
                    variant={mergedProps.wrap ? 'default' : 'outline'}
                    onClick={() => handleTextWrapChange(!mergedProps.wrap)}
                  >
                    {mergedProps.wrap ? 'Wrap' : 'No Wrap'}
                  </Button>
                </div>
              )}
              <PropertyEditor
                props={mergedProps}
                onChange={handlePropertyChange}
                breakpoint={breakpoint}
              />
            </>
          ) : (
            <p className="text-gray-500">No properties available for this component</p>
          )}
        </TabsContent>

        <TabsContent value="position">
          <PositionEditor
            position={selectedComponent.props.position as Position}
            onChange={handlePositionChange}
          />
        </TabsContent>

        <TabsContent value="responsive">
          <div className="p-2 bg-amber-50 rounded mb-4 text-xs">
            Responsive props override default props for {breakpoint} breakpoint
          </div>
          {PropertyEditor ? (
            <>
              {selectedComponent.type === 'Image' && (
                <div className="mb-4">
                  <Label>Width (Responsive)</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['mobile', 'tablet', 'desktop'] as Breakpoint[]).map((device) => (
                      <div key={device} className="space-y-2">
                        <Label>{device}</Label>
                        <Input
                          type="text"
                          value={safeWidth}
                          onChange={(e) =>
                            handleDeviceWidthChange(device, e.target.value)
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-4">
                <Label>Background Color</Label>
                <Input
                  type="color"
                  value={safeStyle.backgroundColor || ''}
                  onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                />
              </div>

              <div className="mb-4">
                <Label>Font Size</Label>
                <Input
                  type="text"
                  value={safeStyle.fontSize || ''}
                  onChange={(e) => handleStyleChange('fontSize', e.target.value)}
                />
              </div>

              <div className="mb-4">
                <Label>Padding</Label>
                <Input
                  type="text"
                  value={safeStyle.padding || ''}
                  onChange={(e) => handleStyleChange('padding', e.target.value)}
                />
              </div>

              <PropertyEditor
                props={responsiveProps}
                onChange={(key: string, value: unknown) =>
                  handlePropertyChange(key, value, true)
                }
                breakpoint={breakpoint}
                isResponsive={true}
              />
            </>
          ) : (
            <p className="text-gray-500">No responsive properties available</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PropertyPanel;
