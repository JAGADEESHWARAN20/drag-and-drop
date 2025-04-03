import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

export type Breakpoint = 'desktop' | 'tablet' | 'mobile';

export interface Page {
  id: string;
  name: string;
}

export interface Component {
  id: string;
  pageId: string;
  parentId: string | null;
  type: string;
  props: Record<string, any>;
  children: string[];
  responsiveProps: {
    desktop: Record<string, any>;
    tablet: Record<string, any>;
    mobile: Record<string, any>;
  };
}

interface WebsiteState {
  pages: Page[];
  currentPageId: string;
  components: Component[];
  selectedComponentId: string | null;
  isPreviewMode: boolean;
  breakpoint: Breakpoint;
  
  // Actions
  setCurrentPageId: (id: string) => void;
  addPage: (name: string) => void;
  addComponent: (component: Component) => void;
  removeComponent: (id: string) => void;
  updateComponentProps: (id: string, props: Record<string, any>) => void;
  updateResponsiveProps: (id: string, breakpoint: Breakpoint, props: Record<string, any>) => void;
  setSelectedComponentId: (id: string | null) => void;
  reorderComponents: (pageId: string, oldIndex: number, newIndex: number) => void;
  moveComponent: (id: string, targetId: string | null, isContainer?: boolean) => void;
  setIsPreviewMode: (isPreview: boolean) => void;
  setBreakpoint: (breakpoint: Breakpoint) => void;
}

export const useWebsiteStore = create<WebsiteState>((set, get) => ({
  pages: [{ id: '1', name: 'Home' }],
  currentPageId: '1',
  components: [],
  selectedComponentId: null,
  isPreviewMode: false,
  breakpoint: 'desktop',
  
  setCurrentPageId: (id) => set({ currentPageId: id }),
  
  addPage: (name) => {
    const newId = uuidv4();
    set((state) => ({ 
      pages: [...state.pages, { id: newId, name }] 
    }));
    return newId;
  },
  
  addComponent: (component) => set((state) => ({ 
    components: [...state.components, component],
    selectedComponentId: component.id
  })),
  
  removeComponent: (id) => {
    const removeComponentAndChildren = (componentId: string, allComponents: Component[]): string[] => {
      const component = allComponents.find(c => c.id === componentId);
      if (!component) return [componentId];
      
      // Get all child components
      const childComponents = allComponents.filter(c => c.parentId === componentId);
      const childIds = childComponents.flatMap(child => 
        removeComponentAndChildren(child.id, allComponents)
      );
      
      return [componentId, ...childIds];
    };
    
    set((state) => {
      const componentIdsToRemove = removeComponentAndChildren(id, state.components);
      return {
        components: state.components.filter(c => !componentIdsToRemove.includes(c.id)),
        selectedComponentId: state.selectedComponentId === id ? null : state.selectedComponentId
      };
    });
  },
  
  updateComponentProps: (id, props) => set((state) => ({
    components: state.components.map(c => 
      c.id === id ? { ...c, props: { ...c.props, ...props } } : c
    ),
  })),
  
  updateResponsiveProps: (id, breakpoint, props) => set((state) => ({
    components: state.components.map(c => 
      c.id === id ? {
        ...c,
        responsiveProps: {
          ...c.responsiveProps,
          [breakpoint]: { ...c.responsiveProps[breakpoint], ...props },
        },
      } : c
    ),
  })),
  
  setSelectedComponentId: (id) => set({ selectedComponentId: id }),
  
  reorderComponents: (pageId, oldIndex, newIndex) => set((state) => {
    const pageComponents = state.components.filter(c => c.pageId === pageId && !c.parentId);
    const sortedComponents = [...pageComponents];
    const [moved] = sortedComponents.splice(oldIndex, 1);
    sortedComponents.splice(newIndex, 0, moved);
    
    return { 
      components: [
        ...state.components.filter(c => c.pageId !== pageId || c.parentId), 
        ...sortedComponents
      ] 
    };
  }),
  
  moveComponent: (id, targetId, isContainer = false) => set((state) => {
    const component = state.components.find(c => c.id === id);
    if (!component) return state;
    
    return {
      components: state.components.map(c => 
        c.id === id 
          ? { ...c, parentId: isContainer ? targetId : c.parentId } 
          : c
      )
    };
  }),
  
  setIsPreviewMode: (isPreview) => set({ isPreviewMode: isPreview }),
  
  setBreakpoint: (breakpoint) => set({ breakpoint }),
}));
