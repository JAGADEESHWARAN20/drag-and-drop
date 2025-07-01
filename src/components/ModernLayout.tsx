import React, { useState } from 'react';
import SplitPane from 'react-split-pane';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent
} from '@/components/ui/tabs';
import { useWebsiteStore, Breakpoint } from '../store/WebsiteStore';
import ModernCanvas from './ModernCanvas';
import ModernComponentPanel from './ModernComponentPanel';
import ModernPropertyPanel from './ModernPropertyPanel';
import WorkflowPanel from './WorkflowPanel';
import { Layers, Settings, Box, Workflow, MoveRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { ComponentProps } from '../types';

const ModernLayout: React.FC = () => {
  const { addComponent, breakpoint, setBreakpoint } = useWebsiteStore();
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [rightPanelTab, setRightPanelTab] = useState<'properties' | 'workflow'>('properties');

  const handleBreakpointChange = (newBreakpoint: Breakpoint) => {
    setBreakpoint(newBreakpoint);
  };

  const handleAddComponent = (type: string, defaultProps: ComponentProps) => {
    const componentId = addComponent({
      type,
      props: defaultProps,
      pageId: '',
      parentId: null,
      responsiveProps: {
        desktop: {},
        tablet: {},
        mobile: {},
      },
      allowChildren: type === 'Container' || type === 'Section' || type === 'Grid',
      children: [], // Added the required children property
    });

    toast({
      title: "Component Added",
      description: `${type} has been added to the canvas`,
    });
  };

  const togglePreviewMode = () => {
    setIsPreviewMode(!isPreviewMode);
  };

  const renderHeader = () => (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center">
          <div className="flex items-center gap-2 font-medium text-xl mr-8">
            <Box className="h-5 w-5 text-blue-500" />
            BuildPro
          </div>
          
          <nav className="hidden md:flex space-x-1">
            <Button variant="ghost" size="sm">Editor</Button>
            <Button variant="ghost" size="sm">Pages</Button>
            <Button variant="ghost" size="sm">Assets</Button>
            <Button variant="ghost" size="sm">Settings</Button>
          </nav>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={togglePreviewMode}
          >
            {isPreviewMode ? 'Edit' : 'Preview'}
          </Button>
          
          <Button size="sm">
            Publish
          </Button>
        </div>
      </div>
    </header>
  );

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {renderHeader()}
      
      <div className="flex-1 flex overflow-hidden">
        {!isPreviewMode && (
          <div className="w-72 border-r border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden">
            <Tabs defaultValue="components" className="flex flex-col h-full">
              <div className="border-b border-gray-200 dark:border-gray-800">
                <TabsList className="p-0 justify-start border-0 bg-transparent h-auto">
                  <TabsTrigger
                    value="components"
                    className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                  >
                    <Layers className="h-4 w-4 mr-2" />
                    Components
                  </TabsTrigger>
                  <TabsTrigger
                    value="layers"
                    className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                  >
                    <MoveRight className="h-4 w-4 mr-2" />
                    Layers
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="components" className="flex-1 overflow-hidden m-0 border-0">
                <ModernComponentPanel onComponentClick={handleAddComponent} />
              </TabsContent>
              
              <TabsContent value="layers" className="flex-1 overflow-auto m-0 p-4 border-0">
                <div className="text-sm">
                  <h3 className="font-medium mb-2">Element Hierarchy</h3>
                  <div className="py-2">
                    {/* Element hierarchy tree would go here */}
                    <p className="text-gray-500 dark:text-gray-400 text-sm">No elements added yet</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
        
        <div className="flex-1 flex overflow-hidden">
          <ModernCanvas 
            isPreviewMode={isPreviewMode} 
            currentBreakpoint={breakpoint} 
            onBreakpointChange={handleBreakpointChange}
          />
        </div>
        
        {!isPreviewMode && (
          <div className="w-80 border-l border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden">
            <Tabs value={rightPanelTab} onValueChange={(v) => setRightPanelTab(v as 'properties' | 'workflow')}>
              <div className="border-b border-gray-200 dark:border-gray-800">
                <TabsList className="p-0 justify-start border-0 bg-transparent h-auto">
                  <TabsTrigger
                    value="properties"
                    className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Properties
                  </TabsTrigger>
                  <TabsTrigger
                    value="workflow"
                    className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                  >
                    <Workflow className="h-4 w-4 mr-2" />
                    Workflow
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="properties" className="flex-1 m-0 border-0 overflow-hidden">
                <ModernPropertyPanel 
                  onResponsiveChange={handleBreakpointChange}
                  currentBreakpoint={breakpoint}
                />
              </TabsContent>
              
              <TabsContent value="workflow" className="flex-1 m-0 border-0 overflow-hidden">
                <WorkflowPanel />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModernLayout;
