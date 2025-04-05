import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { immer } from 'zustand/middleware/immer'; // Optional: for immutable updates
import { devtools } from 'zustand/middleware'; // Optional: for debugging
import { WebsiteState } from '../types';
export type Breakpoint = 'desktop' | 'tablet' | 'mobile';

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
          const newComponent: import('../types').Component = { // Use the imported type
            ...component,
            children: [],
            style: {},
            allowChildren: false,
          };
          const parent = state.components.find((c) => c.id === component.parentId);
          if (parent && parent.allowChildren) { // Only add if parent allows children
            parent.children.push(newComponent.id);
          } else if (component.parentId) {
            console.warn(`Attempted to add child to component ${component.parentId} which does not allow children or doesn't exist.`);
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
          if (newParent && newParent.allowChildren) {
            newParent.children.push(id);
          } else if (isContainer && newParent && !newParent.allowChildren) {
            console.warn(`Cannot move component ${id} into ${targetId} as it does not allow children.`);
            return;
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
          if (newParent && newParent.allowChildren) {
            newParent.children.push(id);
          } else if (parentId && newParent && !newParent.allowChildren) {
            console.warn(`Cannot move component ${id} into ${parentId} as it does not allow children.`);
            return;
          }

          component.parentId = parentId;
        }),

      reorderChildren: (parentId, newOrder) =>
        set((state) => {
          const parent = state.components.find((c) => c.id === parentId);
          if (parent) {
            parent.children = newOrder;
          } else if (parentId === null) {
            // Handle reordering of root-level components
            state.components = state.components.map(c =>
              c.parentId === null && newOrder.includes(c.id)
                ? { ...c, /* potentially update order property if you have one */ }
                : c
            );
            // You might need a more robust way to track and update the order of root elements
          }
        }),

      updateComponentOrder: (parentId, newOrder) =>
        set((state) => {
          if (parentId === null) {
            // Update the order of root-level components
            state.components = state.components.map(c =>
              c.parentId === null && newOrder.includes(c.id)
                ? { ...c } // You might need to manage an explicit order property here
                : c
            );
          } else {
            const parent = state.components.find(c => c.id === parentId);
            if (parent) {
              parent.children = newOrder;
            }
          }
        }),
    })),
    { name: 'WebsiteStore' } // Devtools store name
  )
);