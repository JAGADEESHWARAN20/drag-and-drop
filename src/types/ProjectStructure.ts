
export interface ProjectStructure {
  projectId: string;
  projectName: string;
  version: string;
  createdAt: string;
  updatedAt: string;
  metadata: {
    description: string;
    tags: string[];
    framework: string;
  };
  canvas: {
    width: number;
    height: number;
    zoom: number;
    gridEnabled: boolean;
    snapToGrid: boolean;
  };
  elements: Record<string, ProjectElement>;
  componentLibrary: ComponentLibrary;
  functions: Record<string, ProjectFunction>;
  styles: Record<string, any>;
  communications: Record<string, Communication>;
  dragDropState: DragDropState;
}

export interface ProjectElement {
  elementId: string;
  type: string;
  tagName: string;
  className: string;
  customClasses: string[];
  position: {
    x: number;
    y: number;
    z: number;
  };
  dimensions: {
    width: number | string;
    height: number | string;
    minWidth?: number;
    maxWidth?: number;
  };
  parentId: string | null;
  children: string[];
  properties: {
    innerHTML: string;
    textContent: string;
    attributes: Record<string, any>;
  };
  styles: {
    inline: Record<string, any>;
    responsive: {
      mobile?: Record<string, any>;
      tablet?: Record<string, any>;
      desktop?: Record<string, any>;
    };
    inherited?: Record<string, any>;
  };
  events: string[];
  functions: string[];
  visibility: {
    visible: boolean;
    conditional: {
      showOn: string[];
      hideOn: string[];
    };
  };
  animation: {
    entrance: string;
    exit: string;
    duration: number;
  };
}

export interface ComponentLibrary {
  [category: string]: {
    category: string;
    components: Record<string, LibraryComponent>;
  };
}

export interface LibraryComponent {
  id: string;
  name: string;
  icon: string;
  defaultProps: Record<string, any>;
  draggable: boolean;
  dropZones: string[];
  childrenAllowed: boolean;
  maxChildren: number | null;
  specialBehavior?: string;
  events?: string[];
}

export interface ProjectFunction {
  id: string;
  name: string;
  type: 'event-handler' | 'utility' | 'api-call';
  parameters: string[];
  code: string;
  dependencies: string[];
  async: boolean;
  returnType?: string;
  endpoint?: string;
}

export interface Communication {
  id: string;
  type: 'event' | 'dataBinding';
  source: {
    elementId: string;
    event?: string;
    property?: string;
  };
  targets: Array<{
    elementId: string;
    action?: string;
    property?: string;
    parameters?: Record<string, any>;
    transform?: string;
  }>;
  conditions?: Record<string, any>;
  realTime?: boolean;
}

export interface DragDropState {
  active: boolean;
  draggedComponent: LibraryComponent | null;
  draggedElement: ProjectElement | null;
  sourceLocation: string | null;
  targetLocation: string | null;
  dropZones: string[];
  ghostElement: {
    visible: boolean;
    position: { x: number; y: number };
    dimensions: { width: number; height: number };
  };
  dropIndicators: {
    validDropZone: {
      visible: boolean;
      elementId: string | null;
      position: 'before' | 'after' | 'inside';
    };
    invalidDropZone: {
      visible: boolean;
      reason: string;
    };
  };
}
