
import React, { useRef, useState, useCallback } from 'react';
import { useEnhancedWebsiteStore } from '../store/EnhancedWebsiteStore';
import { ProjectElement, LibraryComponent } from '../types/ProjectStructure';
import { 
  Smartphone, 
  Tablet, 
  Monitor, 
  Save,
  Undo,
  Redo,
  Eye,
  EyeOff
} from 'lucide-react';
import { Button } from './ui/button';
import { toast } from './ui/use-toast';

interface DroppableElementProps {
  element: ProjectElement;
  isSelected: boolean;
  onSelect: () => void;
  onDrop: (component: LibraryComponent, parentId: string, position?: number) => void;
  children: React.ReactNode;
}

const DroppableElement: React.FC<DroppableElementProps> = ({
  element,
  isSelected,
  onSelect,
  onDrop,
  children
}) => {
  const [dragOver, setDragOver] = useState(false);
  const { setDropZoneValid, setDropZoneInvalid } = useEnhancedWebsiteStore();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!dragOver) {
      setDragOver(true);
      setDropZoneValid(element.elementId, 'inside');
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);

    try {
      const componentData = JSON.parse(e.dataTransfer.getData('application/json'));
      if (componentData && componentData.id) {
        onDrop(componentData as LibraryComponent, element.elementId);
      }
    } catch (error) {
      console.error('Error parsing dropped component:', error);
    }
  };

  const getComputedStyles = (): React.CSSProperties => {
    const { breakpoint } = useEnhancedWebsiteStore.getState();
    const baseStyles = element.styles.inline || {};
    const responsiveStyles = element.styles.responsive[breakpoint] || {};
    
    return {
      ...baseStyles,
      ...responsiveStyles,
      position: 'relative'
    };
  };

  const TagName = element.tagName as keyof JSX.IntrinsicElements;

  return (
    <TagName
      className={`
        ${element.className} ${element.customClasses.join(' ')}
        ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
        ${dragOver ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-dashed border-blue-500' : ''}
        relative transition-all cursor-pointer
      `}
      style={getComputedStyles()}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      {...element.properties.attributes}
    >
      {element.properties.textContent && (
        <span dangerouslySetInnerHTML={{ __html: element.properties.textContent }} />
      )}
      {children}
      
      {dragOver && (
        <div className="absolute inset-0 flex items-center justify-center bg-blue-100/50 dark:bg-blue-900/50 pointer-events-none">
          <div className="bg-blue-500 text-white px-2 py-1 rounded text-sm">
            Drop here
          </div>
        </div>
      )}
      
      {isSelected && (
        <div className="absolute -top-8 right-0 flex items-center space-x-1 bg-blue-500 text-white px-2 py-1 rounded text-xs">
          <span>{element.type}</span>
        </div>
      )}
    </TagName>
  );
};

const EnhancedCanvas: React.FC = () => {
  const {
    currentProject,
    selectedElementId,
    breakpoint,
    sidebarOpen,
    setSelectedElement,
    setBreakpoint,
    addElement,
    saveProject,
    setSidebarOpen
  } = useEnhancedWebsiteStore();

  const canvasRef = useRef<HTMLDivElement>(null);
  const [previewMode, setPreviewMode] = useState(false);

  const rootElements = Object.values(currentProject.elements).filter(
    el => el.parentId === null
  );

  const getChildElements = useCallback((parentId: string): ProjectElement[] => {
    const parent = currentProject.elements[parentId];
    if (!parent) return [];

    return parent.children
      .map(childId => currentProject.elements[childId])
      .filter(Boolean);
  }, [currentProject.elements]);

  const renderElement = useCallback((element: ProjectElement): React.ReactNode => {
    const childElements = getChildElements(element.elementId);
    
    return (
      <DroppableElement
        key={element.elementId}
        element={element}
        isSelected={selectedElementId === element.elementId && !previewMode}
        onSelect={() => setSelectedElement(element.elementId)}
        onDrop={(component, parentId) => {
          addElement(component.name, parentId);
        }}
      >
        {childElements.map(child => renderElement(child))}
      </DroppableElement>
    );
  }, [currentProject.elements, selectedElementId, previewMode, getChildElements, setSelectedElement, addElement]);

  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();
    
    try {
      const componentData = JSON.parse(e.dataTransfer.getData('application/json'));
      if (componentData && componentData.id) {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (rect) {
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          addElement(componentData.name, null, { x, y });
          
          // Close sidebar on mobile after drop
          if (window.innerWidth < 768) {
            setSidebarOpen(false);
          }
        }
      }
    } catch (error) {
      console.error('Error parsing dropped component:', error);
    }
  };

  const handleCanvasDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleSave = async () => {
    try {
      await saveProject();
      toast({
        title: "Project Saved",
        description: "Your project has been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save project. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getCanvasStyles = (): React.CSSProperties => {
    const { canvas } = currentProject;
    let width = '100%';
    
    switch (breakpoint) {
      case 'mobile':
        width = '375px';
        break;
      case 'tablet':
        width = '768px';
        break;
      case 'desktop':
        width = `${canvas.width}px`;
        break;
    }

    return {
      width,
      minHeight: `${canvas.height}px`,
      transform: `scale(${canvas.zoom})`,
      transformOrigin: 'top center',
      transition: 'width 0.3s ease-in-out'
    };
  };

  return (
    <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'md:ml-0' : ''}`}>
      {/* Canvas Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="flex items-center space-x-2">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {currentProject.projectName}
          </h1>
          <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
            v{currentProject.version}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Breakpoint Controls */}
          <div className="flex items-center space-x-1 border border-gray-200 dark:border-gray-700 rounded-md">
            <Button
              variant={breakpoint === 'mobile' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setBreakpoint('mobile')}
              className="h-8 w-8 p-0"
            >
              <Smartphone size={14} />
            </Button>
            <Button
              variant={breakpoint === 'tablet' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setBreakpoint('tablet')}
              className="h-8 w-8 p-0"
            >
              <Tablet size={14} />
            </Button>
            <Button
              variant={breakpoint === 'desktop' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setBreakpoint('desktop')}
              className="h-8 w-8 p-0"
            >
              <Monitor size={14} />
            </Button>
          </div>

          {/* Preview Toggle */}
          <Button
            variant={previewMode ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPreviewMode(!previewMode)}
          >
            {previewMode ? <EyeOff size={14} /> : <Eye size={14} />}
            <span className="ml-1 hidden sm:inline">
              {previewMode ? 'Edit' : 'Preview'}
            </span>
          </Button>

          {/* Save Button */}
          <Button onClick={handleSave}>
            <Save size={14} />
            <span className="ml-1 hidden sm:inline">Save</span>
          </Button>
        </div>
      </div>

      {/* Canvas Container */}
      <div className="flex-1 bg-gray-100 dark:bg-gray-800 overflow-auto">
        <div className="p-8 flex justify-center">
          <div
            ref={canvasRef}
            className="bg-white dark:bg-gray-900 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
            style={getCanvasStyles()}
            onDrop={handleCanvasDrop}
            onDragOver={handleCanvasDragOver}
            onClick={() => setSelectedElement(null)}
          >
            {rootElements.length === 0 ? (
              <div className="h-full min-h-[400px] flex items-center justify-center text-gray-500 dark:text-gray-400">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center">
                    <Monitor size={24} />
                  </div>
                  <h3 className="text-lg font-medium mb-2">Start Building</h3>
                  <p className="text-sm">
                    Drag components from the sidebar to start building your page
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 space-y-4">
                {rootElements.map(element => renderElement(element))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedCanvas;
