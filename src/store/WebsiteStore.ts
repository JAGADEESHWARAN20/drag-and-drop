import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { immer } from 'zustand/middleware/immer';
import { devtools } from 'zustand/middleware';
import { Component, Page } from '../types';

export type Breakpoint = 'desktop' | 'tablet' | 'mobile';

type ComponentBlock = {
  id: string;
  type: string;
  props: any;
  children?: ComponentBlock[];
};

interface WebsiteStoreActions {
  setCurrentPageId: (id: string) => void;
  addPage: (page: { id: string; name: string }) => void;
  removePage: (pageId: string) => void;
  addComponent: (
    component: Omit<Component, 'id' | 'children' | 'style'> & {
      parentId?: string | null;
      allowChildren?: boolean;
      responsiveProps: {
        desktop: Record<string, any>;
        tablet: Record<string, any>;
        mobile: Record<string, any>;
      };
    }
  ) => void;
  removeComponent: (id: string) => void;
  updateComponentProps: (id: string, props: Record<string, any>) => void;
  updateResponsiveProps: (
    id: string,
    breakpoint: Breakpoint,
    props: Record<string, any>
  ) => void;
  setSelectedComponentId: (id: string | null) => void;
  reorderComponents: (parentId: string | null, oldIndex: number, newIndex: number) => void;
  moveComponent: (id: string, targetId: string | null, isContainer?: boolean) => void;
  setIsPreviewMode: (isPreview: boolean) => void;
  setBreakpoint: (breakpoint: Breakpoint) => void;
  setAllowChildren: (id: string, allow: boolean) => void;
  updateComponentParent: (id: string, parentId: string | null) => void;
  reorderChildren: (parentId: string | null, newOrder: string[]) => void;
  setComponentOrder: (order: string[]) => void;
  updateComponentOrder: (parentId: string | null, newOrder: string[]) => void;
  startDragging: () => void;
  endDragging: () => void;
  setDraggingComponent: (component: { type: string | null; defaultProps: Record<string, any> | null }) => void;
  setSheetOpen: (isOpen: boolean) => void;
  setHasDragAttempted: (hasAttempted: boolean) => void;
  moveComponentRelativeToTarget: (draggedId: string, targetId: string, position: 'above' | 'below' | 'inside') => void;
}

type WebsiteState = WebsiteStoreActions & {
  pages: Page[];
  currentPageId: string;
  components: Component[];
  selectedComponentId: string | null;
  isPreviewMode: boolean;
  breakpoint: Breakpoint;
  isSheetOpen: boolean;
  hasDragAttempted: boolean;
  isDragging: boolean;
  draggingComponent: { type: string | null; defaultProps: Record<string, any> | null };
  componentOrder: string[];
};

export const useWebsiteStore = create<WebsiteState>()(
  devtools(
    immer((set, get) => ({
      pages: [{ id: '1', name: 'Home' }],
      currentPageId: '1',
      components: [],
      componentOrder: [],
      selectedComponentId: null,
      isPreviewMode: false,
      breakpoint: 'desktop',
      isDragging: false,
      draggingComponent: { type: null, defaultProps: null },
      isSheetOpen: false,
      hasDragAttempted: false,

      setCurrentPageId: (id) => set((state) => { state.currentPageId = id; }),
      addPage: (page) => set((state) => { state.pages.push(page); }),
      removePage: (pageId) => set((state) => {
        state.pages = state.pages.filter((page) => page.id !== pageId);
        state.components = state.components.filter((component) => component.pageId !== pageId);
        if (state.currentPageId === pageId && state.pages.length > 0) {
          state.currentPageId = state.pages[0].id;
        }
      }),

      addComponent: (component) => set((state) => {
        const newComponent: Component = {
          id: uuidv4(),
          pageId: state.currentPageId,
          parentId: component.parentId || null,
          type: component.type,
          props: component.props || {},
          children: [],
          responsiveProps: component.responsiveProps || { desktop: {}, tablet: {}, mobile: {} },
          style: {},
          allowChildren: component.allowChildren || false,
        };
        const parent = state.components.find((c) => c.id === component.parentId);
        if (parent && parent.allowChildren) {
          parent.children.push(newComponent.id);
        }
        state.components.push(newComponent);
        state.selectedComponentId = newComponent.id;
      }),

      removeComponent: (id) => set((state) => {
        const removeRecursive = (componentId: string): string[] => {
          const component = state.components.find((c) => c.id === componentId);
          if (!component) return [componentId];
          return [componentId, ...component.children.flatMap(removeRecursive)];
        };
        const idsToRemove = removeRecursive(id);
        state.components = state.components.filter((c) => !idsToRemove.includes(c.id));
        state.components.forEach((c) => {
          c.children = c.children.filter((childId) => !idsToRemove.includes(childId));
        });
        if (state.selectedComponentId === id) {
          state.selectedComponentId = null;
        }
      }),

      updateComponentProps: (id, props) => set((state) => {
        const component = state.components.find((c) => c.id === id);
        if (component) {
          component.props = { ...component.props, ...props };
        }
      }),

      updateResponsiveProps: (id, breakpoint, props) => set((state) => {
        const component = state.components.find((c) => c.id === id);
        if (component) {
          component.responsiveProps[breakpoint] = {
            ...component.responsiveProps[breakpoint],
            ...props,
          };
        }
      }),

      setSelectedComponentId: (id) => set((state) => { state.selectedComponentId = id; }),

      reorderComponents: (parentId: string | null, oldIndex: number, newIndex: number) =>
        set((state) => {
          const parent = parentId
            ? state.components.find((c) => c.id === parentId)
            : null;

          const siblings = parent
            ? parent.children
            : state.components
              .filter((c) => c.pageId === state.currentPageId && c.parentId === null)
              .map((c) => c.id);

          const updated = [...siblings];
          const [moved] = updated.splice(oldIndex, 1);
          updated.splice(newIndex, 0, moved);

          if (parent) {
            parent.children = updated;
          } else {
            state.componentOrder = updated;
          }
        }),

      moveComponent: (id, targetId, isContainer = false) => set((state) => {
        const component = state.components.find((c) => c.id === id);
        if (!component) return;

        const oldParent = state.components.find((c) => c.children.includes(id));
        if (oldParent) {
          oldParent.children = oldParent.children.filter((childId) => childId !== id);
        }

        const newParent = isContainer ? state.components.find((c) => c.id === targetId) : null;
        if (newParent && newParent.allowChildren) {
          newParent.children.push(id);
          component.parentId = targetId;
        } else if (!isContainer) {
          component.parentId = null;
        }
      }),
      moveComponentRelativeToTarget: (draggedId, targetId, position) =>
        set((state) => {
          const dragged = state.components.find((c) => c.id === draggedId);
          const target = state.components.find((c) => c.id === targetId);
          if (!dragged || !target) return;

          // Remove dragged from its current parent
          const oldParent = state.components.find((c) => c.children.includes(draggedId));
          if (oldParent) {
            oldParent.children = oldParent.children.filter((id) => id !== draggedId);
          }

          // INSIDE: move dragged into target (as child)
          if (position === 'inside' && target.allowChildren) {
            dragged.parentId = targetId;
            target.children.push(draggedId);
            return;
          }

          // ABOVE/BELOW: same parent as target
          const parent = state.components.find((c) => c.children.includes(targetId)) || null;
          const siblings = parent ? parent.children : state.componentOrder;

          // Remove dragged from old location (if needed)
          const filteredSiblings = siblings.filter((id) => id !== draggedId);

          // Find insertion index
          const targetIndex = filteredSiblings.indexOf(targetId);
          const insertIndex = position === 'above' ? targetIndex : targetIndex + 1;

          // Insert dragged at the new position
          filteredSiblings.splice(insertIndex, 0, draggedId);

          // Set parentId
          dragged.parentId = parent ? parent.id : null;

          // Update the correct structure
          if (parent) {
            parent.children = filteredSiblings;
          } else {
            state.componentOrder = filteredSiblings;
          }
        }),

      updateComponentParent: (id, parentId) => set((state) => {
        const component = state.components.find((c) => c.id === id);
        if (!component) return;

        const oldParent = state.components.find((c) => c.children.includes(id));
        if (oldParent) {
          oldParent.children = oldParent.children.filter((childId) => childId !== id);
        }

        const newParent = parentId ? state.components.find((c) => c.id === parentId) : null;
        if (newParent && newParent.allowChildren) {
          newParent.children.push(id);
        }

        component.parentId = parentId;
      }),

      reorderChildren: (parentId, newOrder) => set((state) => {
        const parent = parentId ? state.components.find((c) => c.id === parentId) : null;
        if (parent) {
          parent.children = newOrder;
        }
      }),

      setComponentOrder: (order) => set((state) => { state.componentOrder = order; }),

      updateComponentOrder: (parentId, newOrder) => set((state) => {
        const parent = parentId ? state.components.find((c) => c.id === parentId) : null;
        if (parent) {
          parent.children = newOrder;
        } else {
          state.componentOrder = newOrder;
        }
      }),
      

      setIsPreviewMode: (isPreview) => set((state) => { state.isPreviewMode = isPreview; }),
      setBreakpoint: (breakpoint) => set((state) => { state.breakpoint = breakpoint; }),
      setAllowChildren: (id, allow) => set((state) => {
        const component = state.components.find((c) => c.id === id);
        if (component) {
          component.allowChildren = allow;
        }
      }),

      startDragging: () => set((state) => { state.isDragging = true; }),
      endDragging: () => set((state) => { state.isDragging = false; }),

      setDraggingComponent: (component) => set((state) => { state.draggingComponent = component; }),
      setSheetOpen: (isOpen) => set((state) => { state.isSheetOpen = isOpen; }),
      setHasDragAttempted: (hasAttempted) => set((state) => { state.hasDragAttempted = hasAttempted; }),
    }))
  )
);