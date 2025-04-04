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
  props: Record<string, string | number | boolean | object>;  // Updated
  children: string[];
  responsiveProps: {
    desktop: Record<string, string | number | boolean | object>;
    tablet: Record<string, string | number | boolean | object>;
    mobile: Record<string, string | number | boolean | object>;
  };
  style?: Record<string, string | number>;
  allowChildren?: boolean;
}


interface WebsiteState {
  pages: Page[];
  currentPageId: string;
  components: Component[];
  selectedComponentId: string | null;
  isPreviewMode: boolean;
  breakpoint: Breakpoint;

  setCurrentPageId: (id: string) => void;
  addPage: (name: string) => string;
  addComponent: (component: Component) => void;
  removeComponent: (id: string) => void;
  updateComponentProps: (id: string, props: Record<string, string | number | boolean | object>) => void;
  updateResponsiveProps: (
    id: string,
    breakpoint: Breakpoint,
    props: Record<string, string | number | boolean | object>
  ) => void;
  setSelectedComponentId: (id: string | null) => void;
  reorderComponents: (pageId: string, oldIndex: number, newIndex: number) => void;
  moveComponent: (id: string, targetId: string | null, isContainer?: boolean) => void;
  setIsPreviewMode: (isPreview: boolean) => void;
  setBreakpoint: (breakpoint: Breakpoint) => void;
  setAllowChildren: (id: string, allow: boolean) => void;
  updateComponentParent: (id: string, parentId: string | null) => void;
  reorderChildren: (parentId: string, oldIndex: number, newIndex: number) => void; // New action
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
      pages: [...state.pages, { id: newId, name }],
    }));
    return newId;
  },

  addComponent: (component: Omit <Component, 'children' | 'style' | 'allowChildren'>) =>
    set((state) => {
      const updatedComponent = { ...component, children: [], style: {}, allowChildren: false };
      const parent = state.components.find((c) => c.id === component.parentId);
      if (parent) {
        parent.children = [...parent.children, component.id];
      }
      return {
        components: [...state.components, updatedComponent],
        selectedComponentId: component.id,
      };
    }),

  removeComponent: (id) => {
    const removeComponentAndChildren = (componentId: string, allComponents: Component[]): string[] => {
      const component = allComponents.find((c) => c.id === componentId);
      if (!component) return [componentId];

      const childComponents = allComponents.filter((c) => c.parentId === componentId);
      const childIds = childComponents.flatMap((child) =>
        removeComponentAndChildren(child.id, allComponents)
      );

      return [componentId, ...childIds];
    };

    set((state) => {
      const componentIdsToRemove = removeComponentAndChildren(id, state.components);
      const updatedComponents = state.components.filter((c) => !componentIdsToRemove.includes(c.id));
      const parent = updatedComponents.find((c) => c.children.includes(id));
      if (parent) {
        parent.children = parent.children.filter((childId) => !componentIdsToRemove.includes(childId));
      }
      return {
        components: updatedComponents,
        selectedComponentId: state.selectedComponentId === id ? null : state.selectedComponentId,
      };
    });
  },

  updateComponentProps: (id, props) =>
    set((state) => {
      // Ensure updates apply ONLY to the selected component
      if (state.selectedComponentId !== id) return state;

      return {
        components: state.components.map((c) =>
          c.id === id ? { ...c, props: { ...c.props, ...props } } : c
        ),
      };
    }),


  updateResponsiveProps: (id, breakpoint, props) =>
    set((state) => ({
      components: state.components.map((c) =>
        c.id === id
          ? {
            ...c,
            responsiveProps: {
              ...c.responsiveProps,
              [breakpoint]: { ...c.responsiveProps[breakpoint], ...props },
            },
          }
          : c
      ),
    })),

  setSelectedComponentId: (id) => set({ selectedComponentId: id }),

  reorderComponents: (pageId, oldIndex, newIndex) =>
    set((state) => {
      const pageComponents = state.components.filter((c) => c.pageId === pageId && !c.parentId);
      const sortedComponents = [...pageComponents];
      const [moved] = sortedComponents.splice(oldIndex, 1);
      sortedComponents.splice(newIndex, 0, moved);

      return {
        components: [
          ...state.components.filter((c) => c.pageId !== pageId || c.parentId),
          ...sortedComponents,
        ],
      };
    }),

  moveComponent: (id, targetId, isContainer = false) =>
    set((state) => {
      const component = state.components.find((c) => c.id === id);
      if (!component) return state;

      const oldParent = state.components.find((c) => c.children.includes(id));
      if (oldParent) {
        oldParent.children = oldParent.children.filter((childId) => childId !== id);
      }

      const newParent = isContainer ? state.components.find((c) => c.id === targetId) : null;
      if (newParent) {
        newParent.children = [...newParent.children, id];
      }

      return {
        components: state.components.map((c) =>
          c.id === id ? { ...c, parentId: isContainer ? targetId : c.parentId } : c
        ),
      };
    }),

  setIsPreviewMode: (isPreview) => set({ isPreviewMode: isPreview }),

  setBreakpoint: (breakpoint) => set({ breakpoint }),

  setAllowChildren: (id, allow) =>
    set((state) => ({
      components: state.components.map((c) =>
        c.id === id ? { ...c, allowChildren: allow } : c
      ),
    })),

  updateComponentParent: (id, parentId) =>
    set((state) => {
      const component = state.components.find((c) => c.id === id);
      if (!component) return state;

      const oldParent = state.components.find((c) => c.children.includes(id));
      if (oldParent) {
        oldParent.children = oldParent.children.filter((childId) => childId !== id);
      }

      const newParent = parentId ? state.components.find((c) => c.id === parentId) : null;
      if (newParent) {
        newParent.children = [...newParent.children, id];
      }

      return {
        components: state.components.map((c) =>
          c.id === id ? { ...c, parentId } : c
        ),
      };
    }),

  reorderChildren: (parentId, oldIndex, newIndex) =>
    set((state) => {
      const parent = state.components.find((c) => c.id === parentId);
      if (!parent || !parent.children || parent.children.length <= 1) return state;

      const newChildren = [...parent.children];
      const [movedChild] = newChildren.splice(oldIndex, 1);
      newChildren.splice(newIndex, 0, movedChild);

      return {
        components: state.components.map((c) =>
          c.id === parentId ? { ...c, children: newChildren } : c
        ),
      };
    }),
}));