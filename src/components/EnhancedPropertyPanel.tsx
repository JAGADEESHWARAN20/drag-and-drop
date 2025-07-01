import React, { useState, useEffect } from 'react';
import { useEnhancedWebsiteStore } from '../store/EnhancedWebsiteStore';
import { ProjectElement } from '../types/ProjectStructure';
import { Settings, Palette, Code, Zap, Trash2, Copy, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { Sheet, SheetContent } from '@/components/ui/sheet';

interface EnhancedPropertyPanelProps {
  onResponsiveChange: (newBreakpoint: 'mobile' | 'tablet' | 'desktop') => void;
  currentBreakpoint: 'mobile' | 'tablet' | 'desktop';
}

const EnhancedPropertyPanel: React.FC<EnhancedPropertyPanelProps> = ({ onResponsiveChange, currentBreakpoint }) => {
  const {
    currentProject,
    selectedElementId,
    breakpoint,
    updateElement,
    updateElementStyles,
    addCustomClass,
    removeCustomClass,
    removeElement,
    addFunction,
    attachFunctionToElement,
    removeFunction,
  } = useEnhancedWebsiteStore();

  const [tab, setTab] = useState<'properties' | 'styles' | 'functions'>('properties');
  const [newClassName, setNewClassName] = useState('');
  const [newFunctionCode, setNewFunctionCode] = useState('function(event) {\n  // Your code here\n}');
  const [selectedEventType, setSelectedEventType] = useState('click');
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const selectedElement = selectedElementId ? currentProject.elements[selectedElementId] : null;

  // Sync sheet open state with selectedElementId
  useEffect(() => {
    setIsSheetOpen(!!selectedElementId);
  }, [selectedElementId]);

  const handlePropertyChange = (property: string, value: any) => {
    updateElement(selectedElementId!, {
      properties: {
        ...selectedElement.properties,
        [property]: value,
      },
    });
  };

  const handleStyleChange = (property: string, value: any) => {
    updateElementStyles(selectedElementId!, { [property]: value }, breakpoint);
  };

  const handleAddClass = () => {
    if (!newClassName.trim() || !/^[a-zA-Z][a-zA-Z0-9\-_]*$/.test(newClassName.trim())) {
      toast({
        title: 'Invalid Class Name',
        description: 'Class names must start with a letter and contain only letters, numbers, hyphens, or underscores.',
        variant: 'destructive',
      });
      return;
    }
    addCustomClass(selectedElementId!, newClassName.trim());
    setNewClassName('');
    toast({
      title: 'Class Added',
      description: `Class "${newClassName.trim()}" added to element.`,
    });
  };

  const handleRemoveClass = (className: string) => {
    removeCustomClass(selectedElementId!, className);
    toast({
      title: 'Class Removed',
      description: `Class "${className}" removed from element.`,
    });
  };

  const handleAddFunction = () => {
    if (!newFunctionCode.trim()) return;

    try {
      new Function(newFunctionCode);
      const functionId = addFunction({
        name: `CustomFunction_${Date.now()}`,
        type: 'event-handler',
        parameters: ['event'],
        code: newFunctionCode,
        dependencies: [],
        async: false,
      });

      attachFunctionToElement(selectedElementId!, functionId, selectedEventType);
      setNewFunctionCode('function(event) {\n  // Your code here\n}');
      toast({
        title: 'Function Added',
        description: `Function attached to ${selectedEventType} event.`,
      });
    } catch (error) {
      toast({
        title: 'Invalid Function',
        description: 'Please enter valid JavaScript function code.',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveFunction = (functionId: string) => {
    removeFunction(functionId);
    updateElement(selectedElementId!, {
      functions: selectedElement.functions.filter((id) => id !== functionId),
    });
    toast({
      title: 'Function Removed',
      description: 'Function removed from element.',
    });
  };

  const getCurrentStyles = () => {
    const baseStyles = selectedElement?.styles.inline || {};
    const responsiveStyles = selectedElement?.styles.responsive[breakpoint] || {};
    return { ...baseStyles, ...responsiveStyles };
  };

  const eventTypes = ['click', 'mouseover', 'mouseout', 'focus', 'blur', 'change'];

  const handleVisibilityChange = (showOn: string[]) => {
    updateElement(selectedElementId!, {
      visibility: {
        ...selectedElement.visibility,
        conditional: {
          showOn,
          hideOn: ['desktop', 'tablet', 'mobile'].filter((bp) => !showOn.includes(bp)),
        },
      },
    });
  };

  const renderContent = () => {
    if (!selectedElement) {
      return (
        <div className="right-panel-empty">
          <Settings size={32} className="right-panel-empty-icon" />
          <p>Select an element to edit its properties</p>
        </div>
      );
    }

    return (
      <>
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Properties</h3>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(selectedElement, null, 2));
                  toast({
                    title: 'Element Copied',
                    description: 'Element data copied to clipboard.',
                  });
                }}
              >
                <Copy size={14} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  removeElement(selectedElementId!);
                  toast({
                    title: 'Element Removed',
                    description: `${selectedElement.type} removed from canvas.`,
                  });
                }}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 size={14} />
              </Button>
            </div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {selectedElement.type} #{selectedElement.elementId.slice(-8)}
          </p>
        </div>
        <div className="right-panel-tabs dark:right-panel-tabs">
          <Button
            variant={tab === 'properties' ? 'default' : 'ghost'}
            className={`right-panel-tab-button dark:right-panel-tab-button ${tab === 'properties' ? 'active' : ''}`}
            onClick={() => setTab('properties')}
          >
            <Settings size={14} />
            Props
          </Button>
          <Button
            variant={tab === 'styles' ? 'default' : 'ghost'}
            className={`right-panel-tab-button dark:right-panel-tab-button ${tab === 'styles' ? 'active' : ''}`}
            onClick={() => setTab('styles')}
          >
            <Palette size={14} />
            Style
          </Button>
          <Button
            variant={tab === 'functions' ? 'default' : 'ghost'}
            className={`right-panel-tab-button dark:right-panel-tab-button ${tab === 'functions' ? 'active' : ''}`}
            onClick={() => setTab('functions')}
          >
            <Zap size={14} />
            Code
          </Button>
        </div>
        <div className="right-panel-content">
          {tab === 'properties' && (
            <div className="space-y-4">
              <div className="property-section">
                <div>
                  <Label htmlFor="element-id" className="property-label dark:property-label">Element ID</Label>
                  <Input
                    id="element-id"
                    value={selectedElement.elementId}
                    disabled
                    className="property-input dark:property-input text-xs"
                  />
                </div>
                <div>
                  <Label htmlFor="tag-name" className="property-label dark:property-label">Tag Name</Label>
                  <Input
                    id="tag-name"
                    value={selectedElement.tagName}
                    onChange={(e) => updateElement(selectedElementId!, { tagName: e.target.value })}
                    className="property-input dark:property-input"
                  />
                </div>
                <div>
                  <Label htmlFor="class-name" className="property-label dark:property-label">Class Name</Label>
                  <Input
                    id="class-name"
                    value={selectedElement.className || ''}
                    onChange={(e) => updateElement(selectedElementId!, { className: e.target.value })}
                    className="property-input dark:property-input"
                  />
                </div>
                {selectedElement.properties.textContent !== undefined && (
                  <div>
                    <Label htmlFor="text-content" className="property-label dark:property-label">Text Content</Label>
                    <Textarea
                      id="text-content"
                      value={selectedElement.properties.textContent || ''}
                      onChange={(e) => handlePropertyChange('textContent', e.target.value)}
                      rows={3}
                      className="property-input dark:property-input"
                    />
                  </div>
                )}
                <div>
                  <Label className="property-label dark:property-label">Custom Classes</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      placeholder="Add class name"
                      value={newClassName}
                      onChange={(e) => setNewClassName(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddClass()}
                      className="property-input dark:property-input"
                    />
                    <Button onClick={handleAddClass} size="sm">Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {selectedElement.customClasses.map((className) => (
                      <span
                        key={className}
                        className="property-class-tag dark:property-class-tag"
                      >
                        {className}
                        <button
                          onClick={() => handleRemoveClass(className)}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <Label className="property-label dark:property-label">Visibility</Label>
                  <Select
                    value={selectedElement.visibility.conditional.showOn.join(',')}
                    onValueChange={(value) => handleVisibilityChange(value.split(','))}
                  >
                    <SelectTrigger className="property-input dark:property-input">
                      <SelectValue placeholder="Select breakpoints" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="desktop,tablet,mobile">All</SelectItem>
                      <SelectItem value="desktop">Desktop</SelectItem>
                      <SelectItem value="tablet">Tablet</SelectItem>
                      <SelectItem value="mobile">Mobile</SelectItem>
                      <SelectItem value="desktop,tablet">Desktop & Tablet</SelectItem>
                      <SelectItem value="desktop,mobile">Desktop & Mobile</SelectItem>
                      <SelectItem value="tablet,mobile">Tablet & Mobile</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
          {tab === 'styles' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                <span className="text-sm text-blue-700 dark:text-blue-300">
                  Editing: {breakpoint.charAt(0).toUpperCase() + breakpoint.slice(1)}
                </span>
              </div>
              <div className="property-section">
                <h4 className="property-section-title dark:property-section-title">Layout</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="width" className="property-label dark:property-label">Width</Label>
                    <Input
                      id="width"
                      value={getCurrentStyles().width || ''}
                      onChange={(e) => handleStyleChange('width', e.target.value)}
                      placeholder="auto"
                      className="property-input dark:property-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="height" className="property-label dark:property-label">Height</Label>
                    <Input
                      id="height"
                      value={getCurrentStyles().height || ''}
                      onChange={(e) => handleStyleChange('height', e.target.value)}
                      placeholder="auto"
                      className="property-input dark:property-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="margin" className="property-label dark:property-label">Margin</Label>
                    <Input
                      id="margin"
                      value={getCurrentStyles().margin || ''}
                      onChange={(e) => handleStyleChange('margin', e.target.value)}
                      placeholder="0"
                      className="property-input dark:property-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="padding" className="property-label dark:property-label">Padding</Label>
                    <Input
                      id="padding"
                      value={getCurrentStyles().padding || ''}
                      onChange={(e) => handleStyleChange('padding', e.target.value)}
                      placeholder="0"
                      className="property-input dark:property-input"
                    />
                  </div>
                </div>
              </div>
              <div className="property-section">
                <h4 className="property-section-title dark:property-section-title">Colors</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="color" className="property-label dark:property-label">Text Color</Label>
                    <Input
                      id="color"
                      type="color"
                      value={getCurrentStyles().color || '#000000'}
                      onChange={(e) => handleStyleChange('color', e.target.value)}
                      className="property-input dark:property-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="background-color" className="property-label dark:property-label">Background</Label>
                    <Input
                      id="background-color"
                      type="color"
                      value={getCurrentStyles().backgroundColor || '#ffffff'}
                      onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                      className="property-input dark:property-input"
                    />
                  </div>
                </div>
              </div>
              <div className="property-section">
                <h4 className="property-section-title dark:property-section-title">Typography</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="font-size" className="property-label dark:property-label">Font Size</Label>
                    <Input
                      id="font-size"
                      value={getCurrentStyles().fontSize || ''}
                      onChange={(e) => handleStyleChange('fontSize', e.target.value)}
                      placeholder="1rem"
                      className="property-input dark:property-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="font-weight" className="property-label dark:property-label">Font Weight</Label>
                    <Input
                      id="font-weight"
                      value={getCurrentStyles().fontWeight || ''}
                      onChange={(e) => handleStyleChange('fontWeight', e.target.value)}
                      placeholder="normal"
                      className="property-input dark:property-input"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
          {tab === 'functions' && (
            <div className="space-y-4">
              <div className="property-section">
                <h4 className="property-section-title dark:property-section-title">Attached Functions</h4>
                {selectedElement.functions.length > 0 ? (
                  <div className="space-y-2">
                    {selectedElement.functions.map((functionId) => {
                      const func = currentProject.functions[functionId];
                      return func ? (
                        <div key={functionId} className="property-function-item dark:property-function-item">
                          <div>
                            <div className="property-function-name dark:property-function-name">{func.name}</div>
                            <div className="property-function-type dark:property-function-type">{func.type}</div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveFunction(functionId)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      ) : null;
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No functions attached</p>
                )}
              </div>
              <div className="property-section">
                <h4 className="property-section-title dark:property-section-title">Add Function</h4>
                <div>
                  <Label htmlFor="event-type" className="property-label dark:property-label">Event Type</Label>
                  <Select value={selectedEventType} onValueChange={setSelectedEventType}>
                    <SelectTrigger className="property-input dark:property-input">
                      <SelectValue placeholder="Select event" />
                    </SelectTrigger>
                    <SelectContent>
                      {eventTypes.map((event) => (
                        <SelectItem key={event} value={event}>
                          {event}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="function-code" className="property-label dark:property-label">Function Code</Label>
                  <Textarea
                    id="function-code"
                    value={newFunctionCode}
                    onChange={(e) => setNewFunctionCode(e.target.value)}
                    rows={6}
                    className="property-input dark:property-input font-mono text-xs"
                  />
                </div>
                <Button onClick={handleAddFunction} className="w-full">
                  <Code size={14} className="mr-1" />
                  Add Function
                </Button>
              </div>
              <div className="property-section">
                <h4 className="property-section-title dark:property-section-title">Events</h4>
                <div className="flex flex-wrap gap-1">
                  {selectedElement.events.map((event) => (
                    <span
                      key={event}
                      className="property-class-tag dark:property-class-tag"
                    >
                      {event}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </>
    );
  };

  return (
    <>
      <div className="right-panel dark:right-panel md:block hidden">
        {renderContent()}
      </div>
      <Sheet open={isSheetOpen} onOpenChange={(open) => {
        setIsSheetOpen(open);
        if (!open) {
          // Deselect element when closing sheet
          useEnhancedWebsiteStore.getState().setSelectedElement(null);
        }
      }}>
        <SheetContent side="right" className="sheet-content dark:sheet-content">
          {renderContent()}
        </SheetContent>
      </Sheet>
    </>
  );
};

export default EnhancedPropertyPanel;