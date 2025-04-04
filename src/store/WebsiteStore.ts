import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { immer } from 'zustand/middleware/immer'; // Optional: for immutable updates
import { devtools } from 'zustand/middleware'; // Optional: for debugging

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
  props: Record<string, string | number | boolean | object>;
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
  addPage: (page: Page) => void;
  removePage: (pageId: string) => void;
  addComponent: (component: Omit<Component, 'children' | 'style' | 'allowChildren'>) => void;
  removeComponent: (id: string) => void;
  updateComponentProps: (id: string, props: Record<string, string | number | boolean | object>) => void;
  updateResponsiveProps: (id: string, breakpoint: Breakpoint, props: Record<string, string | number | boolean | object>) => void;
  setSelectedComponentId: (id: string | null) => void;
  reorderComponents: (pageId: string, oldIndex: number, newIndex: number) => void;
  moveComponent: (id: string, targetId: string | null, isContainer?: boolean) => void;
  setIsPreviewMode: (isPreview: boolean) => void;
  setBreakpoint: (breakpoint: Breakpoint) => void;
  setAllowChildren: (id: string, allow: boolean) => void;
  updateComponentParent: (id: string, parentId: string | null) => void;
  reorderChildren: (parentId: string, oldIndex: number, newIndex: number) => void;
}

// Using immer middleware for immutable updates and devtools for debugging
export const useWebsiteStore = create<WebsiteState>()(
  devtools(
    immer((set, get) => ({
      pages: [{ id: '1', name: 'Home' }],
      currentPageId: '1',
      components: [],
      selectedComponentId: null,
      isPreviewMode: false,
      breakpoint: 'desktop',

      setCurrentPageId: (id) =>
        set((state) => {
          state.currentPageId = id;
        }),

      addPage: (page) =>
        set((state) => {
          state.pages.push(page);
        }),

      removePage: (pageId) =>
        set((state) => {
          state.pages = state.pages.filter((page) => page.id !== pageId);
          state.components = state.components.filter((component) => component.pageId !== pageId);
          if (state.currentPageId === pageId && state.pages.length > 0) {
            state.currentPageId = state.pages[0].id;
          }
        }),

      addComponent: (component) =>
        set((state) => {
          const newComponent: Component = {
            ...component,
            children: [],
            style: {},
            allowChildren: false,
          };
          const parent = state.components.find((c) => c.id === component.parentId);
          if (parent) {
            parent.children.push(newComponent.id);
          }
          state.components.push(newComponent);
          state.selectedComponentId = newComponent.id;
        }),

      removeComponent: (id) =>
        set((state) => {
          const removeComponentAndChildren = (componentId: string): string[] => {
            const component = state.components.find((c) => c.id === componentId);
            if (!component) return [componentId];
            const childIds = component.children.flatMap((childId) => removeComponentAndChildren(childId));
            return [componentId, ...childIds];
          };

          const idsToRemove = removeComponentAndChildren(id);
          state.components = state.components.filter((c) => !idsToRemove.includes(c.id));
          const parent = state.components.find((c) => c.children.includes(id));
          if (parent) {
            parent.children = parent.children.filter((childId) => !idsToRemove.includes(childId));
          }
          if (state.selectedComponentId === id) {
            state.selectedComponentId = null;
          }
        }),

      updateComponentProps: (id, props) =>
        set((state) => {
          if (state.selectedComponentId !== id) return;
          const component = state.components.find((c) => c.id === id);
          if (component) {
            component.props = { ...component.props, ...props };
          }
        }),

      updateResponsiveProps: (id, breakpoint, props) =>
        set((state) => {
          const component = state.components.find((c) => c.id === id);
          if (component) {
            component.responsiveProps[breakpoint] = {
              ...component.responsiveProps[breakpoint],
              ...props,
            };
          }
        }),

      setSelectedComponentId: (id) =>
        set((state) => {
          state.selectedComponentId = id;
        }),

      reorderComponents: (pageId, oldIndex, newIndex) =>
        set((state) => {
          const pageComponents = state.components.filter((c) => c.pageId === pageId && !c.parentId);
          const sortedComponents = [...pageComponents];
          const [moved] = sortedComponents.splice(oldIndex, 1);
          sortedComponents.splice(newIndex, 0, moved);
          state.components = [
            ...state.components.filter((c) => c.pageId !== pageId || c.parentId),
            ...sortedComponents,
          ];
        }),

      moveComponent: (id, targetId, isContainer = false) =>
        set((state) => {
          const component = state.components.find((c) => c.id === id);
          if (!component) return;

          const oldParent = state.components.find((c) => c.children.includes(id));
          if (oldParent) {
            oldParent.children = oldParent.children.filter((childId) => childId !== id);
          }

          const newParent = isContainer ? state.components.find((c) => c.id === targetId) : null;
          if (newParent) {
            newParent.children.push(id);
          }

          component.parentId = isContainer ? targetId : component.parentId;
        }),

      setIsPreviewMode: (isPreview) =>
        set((state) => {
          state.isPreviewMode = isPreview;
        }),

      setBreakpoint: (breakpoint) =>
        set((state) => {
          state.breakpoint = breakpoint;
        }),

      setAllowChildren: (id, allow) =>
        set((state) => {
          const component = state.components.find((c) => c.id === id);
          if (component) {
            component.allowChildren = allow;
          }
        }),

      updateComponentParent: (id, parentId) =>
        set((state) => {
          const component = state.components.find((c) => c.id === id);
          if (!component) return;

          const oldParent = state.components.find((c) => c.children.includes(id));
          if (oldParent) {
            oldParent.children = oldParent.children.filter((childId) => childId !== id);
          }

          const newParent = parentId ? state.components.find((c) => c.id === parentId) : null;
          if (newParent) {
            newParent.children.push(id);
          }

          component.parentId = parentId;
        }),

      reorderChildren: (parentId, oldIndex, newIndex) =>
        set((state) => {
          const parent = state.components.find((c) => c.id === parentId);
          if (!parent || !parent.children || parent.children.length <= 1) return;

          const newChildren = [...parent.children];
          const [movedChild] = newChildren.splice(oldIndex, 1);
          newChildren.splice(newIndex, 0, movedChild);
          parent.children = newChildren;
        }),
    })),
    { name: 'WebsiteStore' } // Devtools store name
  )
);