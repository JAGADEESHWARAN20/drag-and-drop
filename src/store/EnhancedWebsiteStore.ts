import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import {
  ProjectStructure,
  ProjectElement,
  LibraryComponent,
  Communication,
  DragDropState,
  ProjectFunction
} from '../types/ProjectStructure';

interface EnhancedWebsiteState {
  // Current project data
  currentProject: ProjectStructure;

  // UI State
  selectedElementId: string | null;
  sidebarOpen: boolean;
  breakpoint: 'mobile' | 'tablet' | 'desktop';

  // Actions
  createProject: (name: string, description?: string) => void;
  saveProject: () => Promise<void>;
  loadProject: (projectId: string) => Promise<void>;

  // Element management
  addElement: (componentType: string, parentId?: string | null, position?: { x: number; y: number }) => string;
  removeElement: (elementId: string) => void;
  updateElement: (elementId: string, updates: Partial<ProjectElement>) => void;
  moveElement: (elementId: string, newParentId: string | null, position?: number) => void;
  reorderElements: (parentId: string | null, elementIds: string[]) => void;

  // Style management
  updateElementStyles: (elementId: string, styles: Record<string, any>, breakpoint?: string) => void;
  addCustomClass: (elementId: string, className: string) => void;
  removeCustomClass: (elementId: string, className: string) => void;

  // Function management
  addFunction: (func: Omit<ProjectFunction, 'id'>) => string;
  updateFunction: (functionId: string, updates: Partial<ProjectFunction>) => void;
  removeFunction: (functionId: string) => void;
  attachFunctionToElement: (elementId: string, functionId: string, event: string) => void;

  // Communication system
  addCommunication: (communication: Omit<Communication, 'id'>) => string;
  removeCommunication: (communicationId: string) => void;
  updateCommunication: (communicationId: string, updates: Partial<Communication>) => void;

  // Drag and drop
  startDrag: (component: LibraryComponent | ProjectElement, source: string) => void;
  endDrag: () => void;
  updateDragPosition: (x: number, y: number) => void;
  setDropZoneValid: (elementId: string, position: 'before' | 'after' | 'inside') => void;
  setDropZoneInvalid: (reason: string) => void;

  // UI actions
  setSelectedElement: (elementId: string | null) => void;
  setSidebarOpen: (open: boolean) => void;
  setBreakpoint: (breakpoint: 'mobile' | 'tablet' | 'desktop') => void;
  updateCanvasSettings: (settings: Partial<ProjectStructure['canvas']>) => void;
}

const defaultComponentLibrary = {
  layout: {
    category: "Layout",
    components: {
      container: {
        id: "comp_container",
        name: "Container",
        icon: "box",
        defaultProps: {
          className: "container",
          tagName: "div",
          styles: {
            display: "block",
            width: "100%",
            padding: "16px"
          }
        },
        draggable: true,
        dropZones: ["canvas", "container"],
        childrenAllowed: true,
        maxChildren: null
      },
      section: {
        id: "comp_section",
        name: "Section",
        icon: "layout",
        defaultProps: {
          className: "section",
          tagName: "section",
          styles: {
            display: "block",
            width: "100%",
            padding: "40px 0"
          }
        },
        draggable: true,
        dropZones: ["canvas", "container"],
        childrenAllowed: true,
        maxChildren: null
      },
      grid: {
        id: "comp_grid",
        name: "Grid",
        icon: "grid-3x3",
        defaultProps: {
          className: "grid-container",
          columns: 12,
          gap: 16,
          styles: {
            display: "grid",
            gridTemplateColumns: "repeat(12, 1fr)",
            gap: "16px"
          }
        },
        draggable: true,
        dropZones: ["canvas", "container"],
        childrenAllowed: true,
        maxChildren: null,
        specialBehavior: "grid-layout"
      }
    }
  },
  content: {
    category: "Content",
    components: {
      heading: {
        id: "comp_heading",
        name: "Heading",
        icon: "heading",
        defaultProps: {
          tagName: "h2",
          textContent: "Heading",
          className: "heading",
          styles: {
            fontSize: "2rem",
            fontWeight: "bold",
            color: "#000000"
          }
        },
        draggable: true,
        dropZones: ["canvas", "container"],
        childrenAllowed: false,
        maxChildren: 0
      },
      paragraph: {
        id: "comp_paragraph",
        name: "Paragraph",
        icon: "type",
        defaultProps: {
          tagName: "p",
          textContent: "This is a paragraph. Click to edit.",
          className: "paragraph",
          styles: {
            fontSize: "1rem",
            color: "#333333"
          }
        },
        draggable: true,
        dropZones: ["canvas", "container"],
        childrenAllowed: false,
        maxChildren: 0
      },
      button: {
        id: "comp_button",
        name: "Button",
        icon: "mouse-pointer-click",
        defaultProps: {
          tagName: "button",
          textContent: "Click me",
          className: "btn btn-primary",
          type: "button",
          styles: {
            padding: "12px 24px",
            backgroundColor: "#007bff",
            color: "#ffffff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }
        },
        draggable: true,
        dropZones: ["canvas", "container"],
        childrenAllowed: false,
        maxChildren: 0,
        events: ["click", "hover", "focus"]
      }
    }
  },
  media: {
    category: "Media",
    components: {
      image: {
        id: "comp_image",
        name: "Image",
        icon: "image",
        defaultProps: {
          tagName: "img",
          className: "image",
          src: "https://via.placeholder.com/400x300",
          alt: "Image description",
          styles: {
            width: "100%",
            height: "auto"
          }
        },
        draggable: true,
        dropZones: ["canvas", "container"],
        childrenAllowed: false,
        maxChildren: 0
      }
    }
  }
};

const createDefaultProject = (name: string, description = ""): ProjectStructure => ({
  projectId: `proj_${uuidv4()}`,
  projectName: name,
  version: "1.0.0",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  metadata: {
    description,
    tags: [],
    framework: "react"
  },
  canvas: {
    width: 1200,
    height: 800,
    zoom: 1.0,
    gridEnabled: true,
    snapToGrid: true
  },
  elements: {},
  componentLibrary: defaultComponentLibrary,
  functions: {},
  styles: {},
  communications: {},
  dragDropState: {
    active: false,
    draggedComponent: null,
    draggedElement: null,
    sourceLocation: null,
    targetLocation: null,
    dropZones: [],
    ghostElement: {
      visible: false,
      position: { x: 0, y: 0 },
      dimensions: { width: 0, height: 0 }
    },
    dropIndicators: {
      validDropZone: {
        visible: false,
        elementId: null,
        position: 'inside'
      },
      invalidDropZone: {
        visible: false,
        reason: ""
      }
    }
  }
});

export const useEnhancedWebsiteStore = create<EnhancedWebsiteState>((set, get) => ({
  currentProject: createDefaultProject("New Project"),
  selectedElementId: null,
  sidebarOpen: true,
  breakpoint: 'desktop',

  createProject: (name, description) => {
    set({ currentProject: createDefaultProject(name, description) });
  },

  saveProject: async () => {
    const { currentProject } = get();
    const updatedProject = {
      ...currentProject,
      updatedAt: new Date().toISOString()
    };

    // Save to localStorage for now
    localStorage.setItem(`project_${currentProject.projectId}`, JSON.stringify(updatedProject));
    set({ currentProject: updatedProject });

    console.log('Project saved:', updatedProject);
  },

  loadProject: async (projectId) => {
    const stored = localStorage.getItem(`project_${projectId}`);
    if (stored) {
      const project = JSON.parse(stored);
      set({ currentProject: project });
    }
  },

  addElement: (componentType, parentId = null, position) => {
    const { currentProject } = get();
    const elementId = `elem_${componentType}_${uuidv4().slice(0, 8)}`;

    // Find component definition
    let componentDef: LibraryComponent | null = null;
    Object.values(currentProject.componentLibrary).forEach(category => {
      Object.values(category.components).forEach(comp => {
        if (comp.name.toLowerCase() === componentType.toLowerCase()) {
          componentDef = comp;
        }
      });
    });

    if (!componentDef) return elementId;

    const newElement: ProjectElement = {
      elementId,
      type: componentType,
      tagName: componentDef.defaultProps.tagName || 'div',
      className: componentDef.defaultProps.className || '',
      customClasses: [],
      position: {
        x: position?.x || 0,
        y: position?.y || 0,
        z: parentId ? (Object.values(currentProject.elements).filter(e => e.parentId === parentId).length + 1) : 1
      },
      dimensions: {
        width: componentDef.defaultProps.width || 'auto',
        height: componentDef.defaultProps.height || 'auto'
      },
      parentId,
      children: [],
      properties: {
        innerHTML: componentDef.defaultProps.innerHTML || '',
        textContent: componentDef.defaultProps.textContent || '',
        attributes: { ...componentDef.defaultProps }
      },
      styles: {
        inline: { ...componentDef.defaultProps.styles },
        responsive: {
          mobile: {},
          tablet: {},
          desktop: {}
        }
      },
      events: componentDef.events || [],
      functions: [],
      visibility: {
        visible: true,
        conditional: {
          showOn: ['desktop', 'tablet', 'mobile'],
          hideOn: []
        }
      },
      animation: {
        entrance: 'none',
        exit: 'none',
        duration: 300
      }
    };

    set(state => {
      const updatedElements = { ...state.currentProject.elements };
      updatedElements[elementId] = newElement;

      // Update parent's children array
      if (parentId && updatedElements[parentId]) {
        updatedElements[parentId] = {
          ...updatedElements[parentId],
          children: [...updatedElements[parentId].children, elementId]
        };
      }

      return {
        currentProject: {
          ...state.currentProject,
          elements: updatedElements,
          updatedAt: new Date().toISOString()
        },
        selectedElementId: elementId
      };
    });

    return elementId;
  },

  removeElement: (elementId) => {
    set(state => {
      const updatedElements = { ...state.currentProject.elements };
      const element = updatedElements[elementId];

      if (!element) return state;

      // Remove from parent's children array
      if (element.parentId && updatedElements[element.parentId]) {
        updatedElements[element.parentId] = {
          ...updatedElements[element.parentId],
          children: updatedElements[element.parentId].children.filter(id => id !== elementId)
        };
      }

      // Remove all child elements recursively
      const removeChildren = (children: string[]) => {
        children.forEach(childId => {
          if (updatedElements[childId]) {
            removeChildren(updatedElements[childId].children);
            delete updatedElements[childId];
          }
        });
      };

      removeChildren(element.children);
      delete updatedElements[elementId];

      return {
        currentProject: {
          ...state.currentProject,
          elements: updatedElements,
          updatedAt: new Date().toISOString()
        },
        selectedElementId: state.selectedElementId === elementId ? null : state.selectedElementId
      };
    });
  },

  updateElement: (elementId, updates) => {
    set(state => ({
      currentProject: {
        ...state.currentProject,
        elements: {
          ...state.currentProject.elements,
          [elementId]: {
            ...state.currentProject.elements[elementId],
            ...updates
          }
        },
        updatedAt: new Date().toISOString()
      }
    }));
  },

  moveElement: (elementId, newParentId, position) => {
    set(state => {
      const updatedElements = { ...state.currentProject.elements };
      const element = updatedElements[elementId];

      if (!element) return state;

      // Remove from old parent
      if (element.parentId && updatedElements[element.parentId]) {
        updatedElements[element.parentId] = {
          ...updatedElements[element.parentId],
          children: updatedElements[element.parentId].children.filter(id => id !== elementId)
        };
      }

      // Add to new parent
      element.parentId = newParentId;
      if (newParentId && updatedElements[newParentId]) {
        const siblings = [...updatedElements[newParentId].children];
        if (typeof position === 'number') {
          siblings.splice(position, 0, elementId);
        } else {
          siblings.push(elementId);
        }
        updatedElements[newParentId] = {
          ...updatedElements[newParentId],
          children: siblings
        };
      }

      updatedElements[elementId] = element;

      return {
        currentProject: {
          ...state.currentProject,
          elements: updatedElements,
          updatedAt: new Date().toISOString()
        }
      };
    });
  },

  reorderElements: (parentId, elementIds) => {
    set(state => {
      const updatedElements = { ...state.currentProject.elements };

      if (parentId && updatedElements[parentId]) {
        updatedElements[parentId] = {
          ...updatedElements[parentId],
          children: elementIds
        };
      }

      return {
        currentProject: {
          ...state.currentProject,
          elements: updatedElements,
          updatedAt: new Date().toISOString()
        }
      };
    });
  },

  updateElementStyles: (elementId, styles, breakpoint) => {
    set(state => {
      const element = state.currentProject.elements[elementId];
      if (!element) return state;

      const updatedStyles = { ...element.styles };

      if (breakpoint && ['mobile', 'tablet', 'desktop'].includes(breakpoint)) {
        updatedStyles.responsive = {
          ...updatedStyles.responsive,
          [breakpoint]: {
            ...updatedStyles.responsive[breakpoint as keyof typeof updatedStyles.responsive],
            ...styles
          }
        };
      } else {
        updatedStyles.inline = { ...updatedStyles.inline, ...styles };
      }

      return {
        currentProject: {
          ...state.currentProject,
          elements: {
            ...state.currentProject.elements,
            [elementId]: {
              ...element,
              styles: updatedStyles
            }
          },
          updatedAt: new Date().toISOString()
        }
      };
    });
  },

  addCustomClass: (elementId, className) => {
    set(state => {
      const element = state.currentProject.elements[elementId];
      if (!element) return state;

      const updatedClasses = [...element.customClasses];
      if (!updatedClasses.includes(className)) {
        updatedClasses.push(className);
      }

      return {
        currentProject: {
          ...state.currentProject,
          elements: {
            ...state.currentProject.elements,
            [elementId]: {
              ...element,
              customClasses: updatedClasses
            }
          },
          updatedAt: new Date().toISOString()
        }
      };
    });
  },

  removeCustomClass: (elementId, className) => {
    set(state => {
      const element = state.currentProject.elements[elementId];
      if (!element) return state;

      return {
        currentProject: {
          ...state.currentProject,
          elements: {
            ...state.currentProject.elements,
            [elementId]: {
              ...element,
              customClasses: element.customClasses.filter(cls => cls !== className)
            }
          },
          updatedAt: new Date().toISOString()
        }
      };
    });
  },

  addFunction: (func) => {
    const functionId = `func_${uuidv4().slice(0, 8)}`;
    const newFunction: ProjectFunction = { ...func, id: functionId };

    set(state => ({
      currentProject: {
        ...state.currentProject,
        functions: {
          ...state.currentProject.functions,
          [functionId]: newFunction
        },
        updatedAt: new Date().toISOString()
      }
    }));

    return functionId;
  },

  updateFunction: (functionId, updates) => {
    set(state => ({
      currentProject: {
        ...state.currentProject,
        functions: {
          ...state.currentProject.functions,
          [functionId]: {
            ...state.currentProject.functions[functionId],
            ...updates
          }
        },
        updatedAt: new Date().toISOString()
      }
    }));
  },

  removeFunction: (functionId) => {
    set(state => {
      const updatedFunctions = { ...state.currentProject.functions };
      delete updatedFunctions[functionId];

      return {
        currentProject: {
          ...state.currentProject,
          functions: updatedFunctions,
          updatedAt: new Date().toISOString()
        }
      };
    });
  },

  attachFunctionToElement: (elementId, functionId, event) => {
    set(state => {
      const element = state.currentProject.elements[elementId];
      if (!element) return state;

      const updatedFunctions = [...element.functions];
      if (!updatedFunctions.includes(functionId)) {
        updatedFunctions.push(functionId);
      }

      const updatedEvents = [...element.events];
      if (!updatedEvents.includes(event)) {
        updatedEvents.push(event);
      }

      return {
        currentProject: {
          ...state.currentProject,
          elements: {
            ...state.currentProject.elements,
            [elementId]: {
              ...element,
              functions: updatedFunctions,
              events: updatedEvents
            }
          },
          updatedAt: new Date().toISOString()
        }
      };
    });
  },

  addCommunication: (communication) => {
    const communicationId = `comm_${uuidv4().slice(0, 8)}`;
    const newCommunication: Communication = { ...communication, id: communicationId };

    set(state => ({
      currentProject: {
        ...state.currentProject,
        communications: {
          ...state.currentProject.communications,
          [communicationId]: newCommunication
        },
        updatedAt: new Date().toISOString()
      }
    }));

    return communicationId;
  },

  removeCommunication: (communicationId) => {
    set(state => {
      const updatedCommunications = { ...state.currentProject.communications };
      delete updatedCommunications[communicationId];

      return {
        currentProject: {
          ...state.currentProject,
          communications: updatedCommunications,
          updatedAt: new Date().toISOString()
        }
      };
    });
  },

  updateCommunication: (communicationId, updates) => {
    set(state => ({
      currentProject: {
        ...state.currentProject,
        communications: {
          ...state.currentProject.communications,
          [communicationId]: {
            ...state.currentProject.communications[communicationId],
            ...updates
          }
        },
        updatedAt: new Date().toISOString()
      }
    }));
  },

  startDrag: (component, source) => {
    set(state => ({
      currentProject: {
        ...state.currentProject,
        dragDropState: {
          ...state.currentProject.dragDropState,
          active: true,
          draggedComponent: 'id' in component ? component as LibraryComponent : null,
          draggedElement: 'elementId' in component ? component as ProjectElement : null,
          sourceLocation: source,
          dropZones: 'dropZones' in component ? (component as LibraryComponent).dropZones : [],
          ghostElement: {
            ...state.currentProject.dragDropState.ghostElement,
            visible: true
          }
        }
      }
    }));
  },

  endDrag: () => {
    set(state => ({
      currentProject: {
        ...state.currentProject,
        dragDropState: {
          ...state.currentProject.dragDropState,
          active: false,
          draggedComponent: null,
          draggedElement: null,
          sourceLocation: null,
          targetLocation: null,
          dropZones: [],
          ghostElement: {
            ...state.currentProject.dragDropState.ghostElement,
            visible: false
          },
          dropIndicators: {
            validDropZone: {
              visible: false,
              elementId: null,
              position: 'inside'
            },
            invalidDropZone: {
              visible: false,
              reason: ""
            }
          }
        }
      }
    }));
  },

  updateDragPosition: (x, y) => {
    set(state => ({
      currentProject: {
        ...state.currentProject,
        dragDropState: {
          ...state.currentProject.dragDropState,
          ghostElement: {
            ...state.currentProject.dragDropState.ghostElement,
            position: { x, y }
          }
        }
      }
    }));
  },

  setDropZoneValid: (elementId, position) => {
    set(state => ({
      currentProject: {
        ...state.currentProject,
        dragDropState: {
          ...state.currentProject.dragDropState,
          dropIndicators: {
            ...state.currentProject.dragDropState.dropIndicators,
            validDropZone: {
              visible: true,
              elementId,
              position
            },
            invalidDropZone: {
              visible: false,
              reason: ""
            }
          }
        }
      }
    }));
  },

  setDropZoneInvalid: (reason) => {
    set(state => ({
      currentProject: {
        ...state.currentProject,
        dragDropState: {
          ...state.currentProject.dragDropState,
          dropIndicators: {
            ...state.currentProject.dragDropState.dropIndicators,
            validDropZone: {
              visible: false,
              elementId: null,
              position: 'inside'
            },
            invalidDropZone: {
              visible: true,
              reason
            }
          }
        }
      }
    }));
  },

  setSelectedElement: (elementId) => {
    set({ selectedElementId: elementId });
  },

  setSidebarOpen: (open) => {
    set({ sidebarOpen: open });
  },

  setBreakpoint: (breakpoint) => {
    set({ breakpoint });
  },

  updateCanvasSettings: (settings) => {
    set(state => ({
      currentProject: {
        ...state.currentProject,
        canvas: {
          ...state.currentProject.canvas,
          ...settings
        },
        updatedAt: new Date().toISOString()
      }
    }));
  }
}));