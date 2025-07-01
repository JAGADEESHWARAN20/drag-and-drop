
import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { Component, Page, Breakpoint, DraggableItemType } from '../types/index';

export type { Breakpoint, Component, Page };

interface WebsiteState {
  pages: Page[];
  currentPageId: string;
  components: Component[];
  selectedComponentId: string | null;
  componentOrder: string[];
  breakpoint: Breakpoint;
  isSheetOpen: boolean;
  draggingComponent: DraggableItemType | null;
  hasDragAttempted: boolean;
  isDragging: boolean;
  
  // Page actions
  addPage: (name: string) => void;
  removePage: (id: string) => void;
  setCurrentPageId: (id: string) => void;
  
  // Component actions
  addComponent: (component: Omit<Component, 'id'>) => string;
  removeComponent: (id: string) => void;
  updateComponentProps: (id: string, props: Record<string, unknown>) => void;
  updateResponsiveProps: (id: string, breakpoint: Breakpoint, props: Record<string, unknown>) => void;
  updateComponentParent: (id: string, parentId: string | null) => void;
  setSelectedComponentId: (id: string | null) => void;
  setAllowChildren: (id: string, allowChildren: boolean) => void;
  updateComponentOrder: (parentId: string | null, order: string[]) => void;
  
  // UI state actions
  setComponentOrder: (order: string[]) => void;
  setBreakpoint: (breakpoint: Breakpoint) => void;
  setSheetOpen: (isOpen: boolean) => void;
  setDraggingComponent: (component: DraggableItemType | null) => void;
  setHasDragAttempted: (hasAttempted: boolean) => void;
  startDragging: () => void;
  stopDragging: () => void;
  reorderComponents: (parentId: string | null, fromIndex: number, toIndex: number) => void;
}

export const useWebsiteStore = create<WebsiteState>((set, get) => ({
  pages: [
    {
      id: 'default-page',
      name: 'Home',
      isPublished: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  currentPageId: 'default-page',
  components: [],
  selectedComponentId: null,
  componentOrder: [],
  breakpoint: 'desktop',
  isSheetOpen: false,
  draggingComponent: null,
  hasDragAttempted: false,
  isDragging: false,

  // Page actions
      // These implementations have been moved below

      // These implementations have been moved below
  addPage: (name) => {
    const id = uuidv4();
    const newPage: Page = {
      id,
      name,
      isPublished: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set((state) => ({
      pages: [...state.pages, newPage],
      currentPageId: id,
    }));
    return id;
  },
  
  removePage: (id) => {
    set((state) => {
      const filteredPages = state.pages.filter((page) => page.id !== id);
      const filteredComponents = state.components.filter((comp) => comp.pageId !== id);
      // If the current page is being removed, set a new current page
      let newCurrentPageId = state.currentPageId;
      if (id === state.currentPageId && filteredPages.length > 0) {
        newCurrentPageId = filteredPages[0].id;
      }
      
      return {
        pages: filteredPages,
        components: filteredComponents,
        currentPageId: newCurrentPageId,
      };
    });
  },
  
  setCurrentPageId: (id) => {
    set({ currentPageId: id });
  },

  // Component actions
  addComponent: (component) => {
    const id = uuidv4();
    
    const newComponent: Component = {
      id,
      ...component,
      pageId: component.pageId || get().currentPageId,
      parentId: component.parentId || null,
      children: component.children || [],
      // Ensure responsiveProps has all required breakpoints
      responsiveProps: {
        desktop: component.responsiveProps?.desktop || {},
        tablet: component.responsiveProps?.tablet || {},
        mobile: component.responsiveProps?.mobile || {},
      },
    };
    
    set((state) => ({
      components: [...state.components, newComponent],
      selectedComponentId: id,
    }));
    
    return id;
  },
  
  removeComponent: (id) => {
    set((state) => {
      // First, find and remove all child components recursively
      const findChildrenIds = (parentId: string): string[] => {
        const childIds = state.components
          .filter(c => c.parentId === parentId)
          .map(c => c.id);
        
        return [
          ...childIds,
          ...childIds.flatMap(childId => findChildrenIds(childId))
        ];
      };
      
      const childrenIds = findChildrenIds(id);
      const componentsToRemove = new Set([id, ...childrenIds]);
      
      const updatedComponents = state.components.filter(
        (component) => !componentsToRemove.has(component.id)
      );
      
      // If the selected component is being removed, clear the selection
      const updatedSelectedId = 
        state.selectedComponentId && componentsToRemove.has(state.selectedComponentId) 
          ? null 
          : state.selectedComponentId;
      
      return {
        components: updatedComponents,
        selectedComponentId: updatedSelectedId,
      };
    });
  },
  
  updateComponentProps: (id, props) => {
    set((state) => ({
      components: state.components.map((component) =>
        component.id === id
          ? { ...component, props: { ...component.props, ...props } }
          : component
      ),
    }));
  },
  
  updateResponsiveProps: (id, breakpoint, props) => {
    set((state) => ({
      components: state.components.map((component) =>
        component.id === id
          ? {
              ...component,
              responsiveProps: {
                ...component.responsiveProps,
                [breakpoint]: {
                  ...(component.responsiveProps[breakpoint] || {}),
                  ...props,
                },
              },
            }
          : component
      ),
    }));
  },
  
  updateComponentParent: (id, parentId) => {
    set((state) => ({
      components: state.components.map((component) =>
        component.id === id
          ? { ...component, parentId }
          : component
      ),
    }));
  },
  
  setSelectedComponentId: (id) => {
    set({ selectedComponentId: id });
  },
  
  setAllowChildren: (id, allowChildren) => {
    set((state) => ({
      components: state.components.map((component) =>
        component.id === id
          ? { ...component, allowChildren }
          : component
      ),
    }));
  },
  
  updateComponentOrder: (parentId, order) => {
    // This function updates the order of components with the same parent
    set((state) => {
      // First, get all components with the given parentId
      const componentsWithParent = state.components.filter(
        (c) => c.parentId === parentId
      );
      
      // Create a map of component IDs to their new position
      const orderMap = new Map(order.map((id, index) => [id, index]));
      
      // Sort the components based on the new order
      const sortedComponents = [...componentsWithParent].sort((a, b) => {
        const orderA = orderMap.has(a.id) ? orderMap.get(a.id)! : Infinity;
        const orderB = orderMap.has(b.id) ? orderMap.get(b.id)! : Infinity;
        return orderA - orderB;
      });
      
      // Combine the sorted components with the rest of the components
      const updatedComponents = state.components.map((component) => {
        if (component.parentId === parentId) {
          const matchingComponent = sortedComponents.find(
            (c) => c.id === component.id
          );
          return matchingComponent || component;
        }
        return component;
      });
      
      return { components: updatedComponents };
    });
  },
  
  // UI state actions
  setComponentOrder: (order) => {
    set({ componentOrder: order });
  },
  
  setBreakpoint: (breakpoint) => {
    set({ breakpoint });
  },
  
  setSheetOpen: (isOpen) => {
    set({ isSheetOpen: isOpen });
  },
  
  setDraggingComponent: (component) => {
    set({ draggingComponent: component });
  },
  
  setHasDragAttempted: (hasAttempted) => {
    set({ hasDragAttempted: hasAttempted });
  },
  
  startDragging: () => {
    set({ isDragging: true });
  },
  
  stopDragging: () => {
    set({ isDragging: false });
  },
  
  reorderComponents: (parentId, fromIndex, toIndex) => {
    set((state) => {
      const componentsWithParent = state.components.filter(
        (c) => c.parentId === parentId
      );
      
      const componentIds = componentsWithParent.map((c) => c.id);
      const [movedId] = componentIds.splice(fromIndex, 1);
      componentIds.splice(toIndex, 0, movedId);
      
      return {
        components: state.components.map((component) => {
          if (component.parentId === parentId) {
            const newIndex = componentIds.indexOf(component.id);
            return { ...component, order: newIndex };
          }
          return component;
        }),
      };
    });
  },
}));
