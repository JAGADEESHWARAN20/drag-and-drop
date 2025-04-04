import React, { useState } from 'react';
import { useWebsiteStore, Breakpoint } from '../store/WebsiteStore';
import { PropertyEditors } from '../utils/PropertyEditors';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsContent, TabsTrigger } from '@/components/ui/tabs';
import PositionEditor from './PositionEditor';
import Button  from '@/components/ui/button';
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
      <div className="p-4 h-full">
        <p className="text-gray-500 dark:text-gray-400">No component selected</p>
        <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
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

  const safeStyle =
    mergedProps.style && typeof mergedProps.style === 'object'
      ? (mergedProps.style as Record<string, string>)
      : {};

  const rawWidth =
    selectedComponent.responsiveProps?.[device]?.width ??
    selectedComponent.props.width ??
    '';

  const safeWidth =
    typeof rawWidth === 'string' || typeof rawWidth === 'number' ? rawWidth : '';

  return (
    <div className="p-4 h-full overflow-y-auto">
      <div className="mb-4">
        <span className="inline-block px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded text-sm">
          {selectedComponent.type}
        </span>
      </div>

      <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full mb-4 bg-gray-100 dark:bg-gray-700">
          <TabsTrigger value="general" className="flex-1 text-gray-700 dark:text-gray-200">
            General
          </TabsTrigger>
          <TabsTrigger value="position" className="flex-1 text-gray-700 dark:text-gray-200">
            Position
          </TabsTrigger>
          <TabsTrigger value="responsive" className="flex-1 text-gray-700 dark:text-gray-200">
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
                    className="dark:bg-gray-700 dark:text-gray-200"
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
            <p className="text-gray-500 dark:text-gray-400">
              No properties available for this component
            </p>
          )}
        </TabsContent>

        <TabsContent value="position">
          <PositionEditor
            position={selectedComponent.props.position as Position}
            onChange={handlePositionChange}
          />
        </TabsContent>

        <TabsContent value="responsive">
          <div className="p-2 bg-amber-50 dark:bg-amber-900/30 rounded mb-4 text-xs text-amber-800 dark:text-amber-300">
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
                          className="dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
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
                  className="dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                />
              </div>

              <div className="mb-4">
                <Label>Font Size</Label>
                <Input
                  type="text"
                  value={safeStyle.fontSize || ''}
                  onChange={(e) => handleStyleChange('fontSize', e.target.value)}
                  className="dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                />
              </div>

              <div className="mb-4">
                <Label>Padding</Label>
                <Input
                  type="text"
                  value={safeStyle.padding || ''}
                  onChange={(e) => handleStyleChange('padding', e.target.value)}
                  className="dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
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
            <p className="text-gray-500 dark:text-gray-400">
              No responsive properties available
            </p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PropertyPanel;