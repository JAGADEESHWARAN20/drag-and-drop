
import React, { useState } from 'react';
import { useEnhancedWebsiteStore } from '../store/EnhancedWebsiteStore';
import { ProjectElement } from '../types/ProjectStructure';
import { 
  Settings, 
  Palette, 
  Code, 
  Zap,
  Trash2,
  Copy,
  Move,
  Eye,
  EyeOff
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Switch } from './ui/switch';

const EnhancedPropertyPanel: React.FC = () => {
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
    attachFunctionToElement
  } = useEnhancedWebsiteStore();

  const [newClassName, setNewClassName] = useState('');
  const [newFunctionCode, setNewFunctionCode] = useState('function() {\n  // Your code here\n}');

  const selectedElement = selectedElementId ? currentProject.elements[selectedElementId] : null;

  if (!selectedElement) {
    return (
      <div className="w-80 border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 flex items-center justify-center">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <Settings size={32} className="mx-auto mb-2 opacity-50" />
          <p className="text-sm">Select an element to edit its properties</p>
        </div>
      </div>
    );
  }

  const handlePropertyChange = (property: string, value: any) => {
    updateElement(selectedElementId!, {
      properties: {
        ...selectedElement.properties,
        [property]: value
      }
    });
  };

  const handleStyleChange = (property: string, value: any) => {
    updateElementStyles(selectedElementId!, { [property]: value }, breakpoint);
  };

  const handleAddClass = () => {
    if (newClassName.trim()) {
      addCustomClass(selectedElementId!, newClassName.trim());
      setNewClassName('');
    }
  };

  const handleRemoveClass = (className: string) => {
    removeCustomClass(selectedElementId!, className);
  };

  const handleAddFunction = () => {
    if (newFunctionCode.trim()) {
      const functionId = addFunction({
        name: `Custom Function ${Date.now()}`,
        type: 'event-handler',
        parameters: ['event'],
        code: newFunctionCode,
        dependencies: [],
        async: false
      });
      
      attachFunctionToElement(selectedElementId!, functionId, 'click');
      setNewFunctionCode('function() {\n  // Your code here\n}');
    }
  };

  const getCurrentStyles = () => {
    const baseStyles = selectedElement.styles.inline || {};
    const responsiveStyles = selectedElement.styles.responsive[breakpoint] || {};
    return { ...baseStyles, ...responsiveStyles };
  };

  const currentStyles = getCurrentStyles();

  return (
    <div className="w-80 border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">Properties</h3>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                // Copy element functionality
                navigator.clipboard.writeText(JSON.stringify(selectedElement, null, 2));
              }}
            >
              <Copy size={14} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeElement(selectedElementId!)}
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

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <Tabs defaultValue="properties" className="h-full">
          <TabsList className="grid w-full grid-cols-3 mx-4 mt-4">
            <TabsTrigger value="properties">
              <Settings size={14} className="mr-1" />
              Props
            </TabsTrigger>
            <TabsTrigger value="styles">
              <Palette size={14} className="mr-1" />
              Style
            </TabsTrigger>
            <TabsTrigger value="functions">
              <Zap size={14} className="mr-1" />
              Code
            </TabsTrigger>
          </TabsList>

          <TabsContent value="properties" className="p-4 space-y-4">
            {/* Basic Properties */}
            <div className="space-y-3">
              <div>
                <Label htmlFor="element-id">Element ID</Label>
                <Input
                  id="element-id"
                  value={selectedElement.elementId}
                  disabled
                  className="text-xs"
                />
              </div>

              <div>
                <Label htmlFor="tag-name">Tag Name</Label>
                <Input
                  id="tag-name"
                  value={selectedElement.tagName}
                  onChange={(e) => updateElement(selectedElementId!, { tagName: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="class-name">Class Name</Label>
                <Input
                  id="class-name"
                  value={selectedElement.className}
                  onChange={(e) => updateElement(selectedElementId!, { className: e.target.value })}
                />
              </div>

              {selectedElement.properties.textContent !== undefined && (
                <div>
                  <Label htmlFor="text-content">Text Content</Label>
                  <Textarea
                    id="text-content"
                    value={selectedElement.properties.textContent}
                    onChange={(e) => handlePropertyChange('textContent', e.target.value)}
                    rows={3}
                  />
                </div>
              )}

              {/* Custom Classes */}
              <div>
                <Label>Custom Classes</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="Add class name"
                    value={newClassName}
                    onChange={(e) => setNewClassName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddClass()}
                  />
                  <Button onClick={handleAddClass} size="sm">Add</Button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {selectedElement.customClasses.map((className) => (
                    <span
                      key={className}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded"
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

              {/* Visibility */}
              <div className="flex items-center justify-between">
                <Label>Visible</Label>
                <Switch
                  checked={selectedElement.visibility.visible}
                  onCheckedChange={(checked) =>
                    updateElement(selectedElementId!, {
                      visibility: { ...selectedElement.visibility, visible: checked }
                    })
                  }
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="styles" className="p-4 space-y-4">
            {/* Responsive Indicator */}
            <div className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
              <span className="text-sm text-blue-700 dark:text-blue-300">
                Editing: {breakpoint.charAt(0).toUpperCase() + breakpoint.slice(1)}
              </span>
            </div>

            {/* Layout */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100">Layout</h4>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="width">Width</Label>
                  <Input
                    id="width"
                    value={currentStyles.width || ''}
                    onChange={(e) => handleStyleChange('width', e.target.value)}
                    placeholder="auto"
                  />
                </div>
                <div>
                  <Label htmlFor="height">Height</Label>
                  <Input
                    id="height"
                    value={currentStyles.height || ''}
                    onChange={(e) => handleStyleChange('height', e.target.value)}
                    placeholder="auto"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="margin">Margin</Label>
                  <Input
                    id="margin"
                    value={currentStyles.margin || ''}
                    onChange={(e) => handleStyleChange('margin', e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="padding">Padding</Label>
                  <Input
                    id="padding"
                    value={currentStyles.padding || ''}
                    onChange={(e) => handleStyleChange('padding', e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            {/* Colors */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100">Colors</h4>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="color">Text Color</Label>
                  <Input
                    id="color"
                    type="color"
                    value={currentStyles.color || '#000000'}
                    onChange={(e) => handleStyleChange('color', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="background-color">Background</Label>
                  <Input
                    id="background-color"
                    type="color"
                    value={currentStyles.backgroundColor || '#ffffff'}
                    onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Typography */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100">Typography</h4>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="font-size">Font Size</Label>
                  <Input
                    id="font-size"
                    value={currentStyles.fontSize || ''}
                    onChange={(e) => handleStyleChange('fontSize', e.target.value)}
                    placeholder="1rem"
                  />
                </div>
                <div>
                  <Label htmlFor="font-weight">Font Weight</Label>
                  <Input
                    id="font-weight"
                    value={currentStyles.fontWeight || ''}
                    onChange={(e) => handleStyleChange('fontWeight', e.target.value)}
                    placeholder="normal"
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="functions" className="p-4 space-y-4">
            {/* Function List */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100">Attached Functions</h4>
              
              {selectedElement.functions.length > 0 ? (
                <div className="space-y-2">
                  {selectedElement.functions.map((functionId) => {
                    const func = currentProject.functions[functionId];
                    return func ? (
                      <div key={functionId} className="p-2 bg-gray-50 dark:bg-gray-800 rounded text-xs">
                        <div className="font-medium">{func.name}</div>
                        <div className="text-gray-500 dark:text-gray-400">{func.type}</div>
                      </div>
                    ) : null;
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">No functions attached</p>
              )}
            </div>

            {/* Add Function */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100">Add Function</h4>
              
              <div>
                <Label htmlFor="function-code">Function Code</Label>
                <Textarea
                  id="function-code"
                  value={newFunctionCode}
                  onChange={(e) => setNewFunctionCode(e.target.value)}
                  rows={6}
                  className="font-mono text-xs"
                />
              </div>
              
              <Button onClick={handleAddFunction} className="w-full">
                <Code size={14} className="mr-1" />
                Add Function
              </Button>
            </div>

            {/* Events */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100">Events</h4>
              
              <div className="flex flex-wrap gap-1">
                {selectedElement.events.map((event) => (
                  <span
                    key={event}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded"
                  >
                    {event}
                  </span>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EnhancedPropertyPanel;
