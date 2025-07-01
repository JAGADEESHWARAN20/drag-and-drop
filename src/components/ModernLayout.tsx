import React, { useState, useCallback } from 'react';
import { useEnhancedWebsiteStore } from '../store/EnhancedWebsiteStore';
import { ProjectElement, LibraryComponent } from '../types/ProjectStructure';
import ModernCanvas from './ModernCanvas';
import EnhancedComponentPanel from './EnhancedComponentPanel';
import EnhancedPropertyPanel from './EnhancedPropertyPanel';
import WorkflowPanel from './unused/WorkflowPanel';
import { Layers, Settings, Box, Workflow, Menu, X, MoveRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { DndContext, DragStartEvent, DragEndEvent, closestCenter, useSensor, useSensors, PointerSensor, DragOverlay } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ComponentRegistry } from '../utils/ComponentRegistry';
import { ComponentProps } from '../types';

interface SortableComponentProps {
  id: string;
  type: string;
  children: React.ReactNode;
}

const SortableComponent: React.FC<SortableComponentProps> = ({ id, type, children }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="cursor-move">
      <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
        <Box size={14} />
        <span>{type} #{id.slice(-8)}</span>
      </div>
      {children}
    </div>
  );
};

const ModernLayout: React.FC = () => {
  const { currentProject, breakpoint, setBreakpoint, addElement, reorderElements, moveElement, startDrag, endDrag } = useEnhancedWebsiteStore();
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [rightPanelTab, setRightPanelTab] = useState<'properties' | 'workflow'>('properties');
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(false);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);
  const [leftPanelTab, setLeftPanelTab] = useState<'components' | 'layers'>('components');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draggingComponent, setDraggingComponent] = useState<{ type: string; defaultProps: any } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
        tolerance: 5,
        delay: 100,
      },
    })
  );

  const canAcceptChildren = useCallback((element: ProjectElement): boolean => {
    const componentDef = Object.values(currentProject.componentLibrary)
      .flatMap(category => Object.values(category.components))
      .find(comp => comp.name === element.type);
    return componentDef?.childrenAllowed ?? false;
  }, [currentProject.componentLibrary]);

  const handleBreakpointChange = useCallback((newBreakpoint: 'mobile' | 'tablet' | 'desktop') => {
    setBreakpoint(newBreakpoint);
  }, [setBreakpoint]);

  const handleAddComponent = useCallback(
    (type: string) => {
      addElement(type, null);
      toast({
        title: 'Component Added',
        description: `${type} has been added to the canvas`,
      });
    },
    [addElement]
  );

  const togglePreviewMode = useCallback(() => {
    setIsPreviewMode((prev) => !prev);
  }, []);

  const toggleLeftPanel = useCallback(() => {
    setIsLeftPanelOpen((prev) => !prev);
  }, []);

  const toggleRightPanel = useCallback(() => {
    setIsRightPanelOpen((prev) => !prev);
  }, []);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);

    if (active.data?.current?.type === 'COMPONENT') {
      const { componentType, defaultProps } = active.data.current;
      setDraggingComponent({ type: componentType, defaultProps });
      const component = Object.values(currentProject.componentLibrary)
        .flatMap(category => Object.values(category.components))
        .find(comp => comp.name === componentType);
      if (component) {
        startDrag(component, 'sidebar');
      }
      return;
    }

    const activeElement = currentProject.elements[active.id as string];
    if (activeElement) {
      setDraggingComponent({ type: activeElement.type, defaultProps: activeElement.properties.attributes });
      startDrag(activeElement, 'canvas');
    }
  }, [currentProject, startDrag]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setDraggingComponent(null);
    endDrag();

    if (!active || !over) {
      toast({
        variant: 'destructive',
        title: 'Invalid Drop',
        description: 'No valid drop target found.',
      });
      return;
    }

    const activeIdStr = active.id as string;
    const overId = over.id as string;

    if (active.data?.current?.type === 'COMPONENT') {
      if (overId === 'canvas-drop-area') {
        const { componentType } = active.data.current;
        addElement(componentType, null);
        toast({
          title: 'Component Added',
          description: `${componentType} has been added to the canvas`,
        });
        return;
      }
      const overElement = currentProject.elements[overId];
      if (overElement && canAcceptChildren(overElement)) {
        const componentType = active.data.current.componentType;
        addElement(componentType, overId);
        toast({
          title: 'Component Added',
          description: `${componentType} has been added to ${overElement.type}`,
        });
        return;
      }
      toast({
        variant: 'destructive',
        title: 'Invalid Drop',
        description: 'Target element does not accept children.',
      });
      return;
    }

    const activeElement = currentProject.elements[activeIdStr];
    const overElement = currentProject.elements[overId];

    if (!activeElement) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Active element not found.',
      });
      return;
    }

    if (activeElement.parentId === overElement?.parentId && overElement) {
      const parentId = activeElement.parentId;
      const siblings = Object.values(currentProject.elements)
        .filter((el: ProjectElement) => el.parentId === parentId)
        .sort((a, b) => a.position.z - b.position.z);
      const oldIndex = siblings.findIndex((el) => el.elementId === activeIdStr);
      const newIndex = siblings.findIndex((el) => el.elementId === overId);
      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        const newOrder = [...siblings];
        const [moved] = newOrder.splice(oldIndex, 1);
        newOrder.splice(newIndex, 0, moved);
        reorderElements(parentId, newOrder.map((el) => el.elementId));
        toast({ title: 'Component Reordered', description: 'Components have been reordered.' });
      }
      return;
    }

    if (overElement && canAcceptChildren(overElement)) {
      moveElement(activeIdStr, overElement.elementId, overElement.children.length);
      toast({ title: 'Component Moved', description: `Moved ${activeElement.type} into ${overElement.type}.` });
      return;
    }

    if (overId === 'canvas-drop-area') {
      moveElement(activeIdStr, null);
      toast({ title: 'Component Moved', description: `${activeElement.type} moved to canvas.` });
      return;
    }

    toast({
      variant: 'destructive',
      title: 'Invalid Drop',
      description: 'Target is not a valid drop zone.',
    });
  }, [currentProject, addElement, reorderElements, moveElement, endDrag, canAcceptChildren]);

  const renderDragOverlay = useCallback(() => {
    if (!draggingComponent || !activeId) return null;

    const componentType = draggingComponent.type;
    const DynamicComponent = ComponentRegistry[componentType as keyof typeof ComponentRegistry]?.component as React.ComponentType<ComponentProps & { children?: React.ReactNode; id: string; isPreviewMode?: boolean }>;

    if (!DynamicComponent) {
      console.warn('No component found for type:', componentType);
      return null;
    }

    return (
      <DragOverlay>
        <div className="drag-overlay dark:drag-overlay">
          <DynamicComponent {...draggingComponent.defaultProps} isPreviewMode={false} id="drag-overlay" />
        </div>
      </DragOverlay>
    );
  }, [draggingComponent, activeId]);

  const renderHeader = () => (
    <header className="header dark:header">
      <div className="header-container">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLeftPanel}
            className="mr-2 md:hidden"
          >
            {isLeftPanelOpen ? <X size={16} /> : <Menu size={16} />}
          </Button>
          <div className="header-logo">
            <Box className="h-5 w-5 text-blue-500" />
            BuildPro
          </div>
          <nav className="header-nav">
            <Button variant="ghost" size="sm">Editor</Button>
            <Button variant="ghost" size="sm">Pages</Button>
            <Button variant="ghost" size="sm">Assets</Button>
            <Button variant="ghost" size="sm">Settings</Button>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={togglePreviewMode}
          >
            {isPreviewMode ? 'Edit' : 'Preview'}
          </Button>
          <Button size="sm">Publish</Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleRightPanel}
            className="md:hidden"
          >
            {isRightPanelOpen ? <X size={16} /> : <Settings size={16} />}
          </Button>
        </div>
      </div>
    </header>
  );

  const renderElementHierarchy = () => {
    const rootElements = Object.values(currentProject.elements).filter((el: ProjectElement) => !el.parentId);

    const renderComponent = (element: ProjectElement, level: number = 0): React.ReactNode => {
      const children = element.children
        .map((childId) => currentProject.elements[childId])
        .filter((el): el is ProjectElement => !!el);

      return (
        <SortableComponent key={element.elementId} id={element.elementId} type={element.type}>
          <div className="ml-4">
            {children.length > 0 && (
              <SortableContext items={children.map((el) => el.elementId)} strategy={verticalListSortingStrategy}>
                {children.map((child) => renderComponent(child, level + 1))}
              </SortableContext>
            )}
          </div>
        </SortableComponent>
      );
    };

    return (
      <div className="element-hierarchy">
        <h3 className="element-hierarchy-title">Element Hierarchy</h3>
        <div className="py-2">
          {rootElements.length > 0 ? (
            <SortableContext items={rootElements.map((el) => el.elementId)} strategy={verticalListSortingStrategy}>
              {rootElements.map((element) => renderComponent(element))}
            </SortableContext>
          ) : (
            <p className="element-hierarchy-empty">No elements added yet</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="modern-layout dark:modern-layout">
      {renderHeader()}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="main-content">
          {!isPreviewMode && (
            <div className={`sidebar dark:sidebar ${isLeftPanelOpen ? 'open' : ''}`}>
              <div className="sidebar-tabs dark:sidebar-tabs">
                <Button
                  variant={leftPanelTab === 'components' ? 'default' : 'ghost'}
                  className={`sidebar-tab-button dark:sidebar-tab-button ${leftPanelTab === 'components' ? 'active' : ''}`}
                  onClick={() => setLeftPanelTab('components')}
                >
                  <Layers size={16} />
                  Components
                </Button>
                <Button
                  variant={leftPanelTab === 'layers' ? 'default' : 'ghost'}
                  className={`sidebar-tab-button dark:sidebar-tab-button ${leftPanelTab === 'layers' ? 'active' : ''}`}
                  onClick={() => setLeftPanelTab('layers')}
                >
                  <MoveRight size={16} />
                  Layers
                </Button>
              </div>
              <div className="sidebar-content">
                {leftPanelTab === 'components' && <EnhancedComponentPanel />}
                {leftPanelTab === 'layers' && (
                  <div className="sidebar-content layers">{renderElementHierarchy()}</div>
                )}
              </div>
            </div>
          )}
          <div className={`flex-1 canvas-container dark:canvas-container ${isLeftPanelOpen ? 'sidebar-open' : ''}`}>
            <ModernCanvas
              isPreviewMode={isPreviewMode}
              currentBreakpoint={breakpoint}
              onBreakpointChange={handleBreakpointChange}
              isLeftPanelOpen={isLeftPanelOpen}
            />
          </div>
          {!isPreviewMode && isRightPanelOpen && (
            <div className={`right-panel dark:right-panel ${isRightPanelOpen ? 'sheet-open' : ''}`}>
              <div className="right-panel-tabs dark:right-panel-tabs">
                <Button
                  variant={rightPanelTab === 'properties' ? 'default' : 'ghost'}
                  className={`right-panel-tab-button dark:right-panel-tab-button ${rightPanelTab === 'properties' ? 'active' : ''}`}
                  onClick={() => setRightPanelTab('properties')}
                >
                  <Settings size={16} />
                  Properties
                </Button>
                <Button
                  variant={rightPanelTab === 'workflow' ? 'default' : 'ghost'}
                  className={`right-panel-tab-button dark:right-panel-tab-button ${rightPanelTab === 'workflow' ? 'active' : ''}`}
                  onClick={() => setRightPanelTab('workflow')}
                >
                  <Workflow size={16} />
                  Workflow
                </Button>
              </div>
              <div className="right-panel-content">
                {rightPanelTab === 'properties' && (
                  <EnhancedPropertyPanel
                    onResponsiveChange={handleBreakpointChange}
                    currentBreakpoint={breakpoint}
                  />
                )}
                {rightPanelTab === 'workflow' && <WorkflowPanel />}
              </div>
            </div>
          )}
        </div>
        {renderDragOverlay()}
      </DndContext>
    </div>
  );
};

export default React.memo(ModernLayout);