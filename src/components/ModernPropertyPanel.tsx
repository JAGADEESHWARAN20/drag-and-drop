import React, { useState } from 'react';
import { Settings, Layout, Type, PaintBucket, Box, Layers, ArrowRight } from 'lucide-react';
import { useWebsiteStore } from '../store/WebsiteStore';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { PropertyEditors } from '../utils/PropertyEditors';
import { Button } from '@/components/ui/button';
import { Component, Breakpoint } from '../types';

interface PropertyPanelProps {
  onResponsiveChange: (breakpoint: Breakpoint) => void;
  currentBreakpoint: Breakpoint;
}

const ModernPropertyPanel: React.FC<PropertyPanelProps> = ({ onResponsiveChange, currentBreakpoint }) => {
  const {
    components,
    selectedComponentId,
    updateComponentProps,
    updateResponsiveProps,
  } = useWebsiteStore();

  const [activeTab, setActiveTab] = useState('style');
  
  const selectedComponent = selectedComponentId
    ? components.find((c) => c.id === selectedComponentId)
    : null;
    
  if (!selectedComponent) {
    return (
      <div className="p-6 flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900">
        <Box className="w-12 h-12 mb-4 opacity-50" />
        <h3 className="text-lg font-medium mb-2">No Component Selected</h3>
        <p className="text-sm text-center mb-6">Select a component on the canvas to edit its properties</p>
        <Button variant="outline" className="gap-2">
          <Layout className="w-4 h-4" />
          Add Component
        </Button>
      </div>
    );
  }

  const responsiveProps = selectedComponent.responsiveProps?.[currentBreakpoint] || {};
  const activeProps = { ...selectedComponent.props, ...responsiveProps };
  
  // Find PropertyEditor component for the selected component's type
  const PropertyEditor = PropertyEditors[selectedComponent.type];
  
  const handleUpdateProps = (key: string, value: unknown) => {
    if (currentBreakpoint === 'desktop') {
      updateComponentProps(selectedComponent.id, { [key]: value });
    } else {
      updateResponsiveProps(selectedComponent.id, currentBreakpoint, { [key]: value });
    }
  };
  
  const breakpointButtonVariant = (bp: Breakpoint) => {
    return currentBreakpoint === bp ? "default" : "outline";
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900 overflow-hidden">
      <div className="border-b dark:border-gray-800 px-4 py-3 flex items-center justify-between">
        <h3 className="font-medium flex gap-2 items-center">
          <Settings className="w-4 h-4" />
          <span>{selectedComponent.type}</span>
        </h3>
        <div className="flex space-x-1">
          <Button
            variant={breakpointButtonVariant('desktop')}
            size="sm"
            onClick={() => onResponsiveChange('desktop')}
            className="h-8 px-2"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="1" y="3" width="14" height="10" rx="1" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
          </Button>
          <Button
            variant={breakpointButtonVariant('tablet')}
            size="sm"
            onClick={() => onResponsiveChange('tablet')}
            className="h-8 px-2"
          >
            <svg width="14" height="16" viewBox="0 0 14 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="1" y="2" width="12" height="12" rx="1" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
          </Button>
          <Button
            variant={breakpointButtonVariant('mobile')}
            size="sm"
            onClick={() => onResponsiveChange('mobile')}
            className="h-8 px-2"
          >
            <svg width="10" height="16" viewBox="0 0 10 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="1" y="3" width="8" height="10" rx="1" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
        <TabsList className="grid grid-cols-3 w-full px-3 pt-3">
          <TabsTrigger value="style">Style</TabsTrigger>
          <TabsTrigger value="layout">Layout</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>
        
        <div className="p-3 pt-4 overflow-y-auto flex-1 h-[calc(100%-2.5rem)]">
          <TabsContent value="style" className="mt-0">
            <Accordion type="single" collapsible defaultValue="content">
              <AccordionItem value="content">
                <AccordionTrigger className="py-3">
                  <span className="flex items-center gap-2">
                    <Type className="h-4 w-4" />
                    Content
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  {PropertyEditor && (
                    <PropertyEditor 
                      props={activeProps} 
                      onChange={handleUpdateProps} 
                      breakpoint={currentBreakpoint} 
                    />
                  )}
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="appearance">
                <AccordionTrigger className="py-3">
                  <span className="flex items-center gap-2">
                    <PaintBucket className="h-4 w-4" />
                    Appearance
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    {/* Additional appearance settings based on component type */}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </TabsContent>
          
          <TabsContent value="layout" className="mt-0">
            <Accordion type="single" collapsible defaultValue="dimensions">
              <AccordionItem value="dimensions">
                <AccordionTrigger className="py-3">
                  <span className="flex items-center gap-2">
                    <Layout className="h-4 w-4" />
                    Dimensions
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  {/* Dimension editors */}
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="spacing">
                <AccordionTrigger className="py-3">
                  <span className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4" />
                    Spacing
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  {/* Spacing editors */}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </TabsContent>
          
          <TabsContent value="advanced" className="mt-0">
            <Accordion type="single" collapsible defaultValue="effects">
              <AccordionItem value="effects">
                <AccordionTrigger className="py-3">
                  <span className="flex items-center gap-2">
                    <Layers className="h-4 w-4" />
                    Effects
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  {/* Effects editors */}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default ModernPropertyPanel;
