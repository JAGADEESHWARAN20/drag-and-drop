import { create, useStore, StoreApi } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { immer } from 'zustand/middleware/immer';
import { devtools } from 'zustand/middleware';
import { Component, Page } from '../types';
import React, { ReactNode, createContext, useContext } from 'react';

export type Breakpoint = 'desktop' | 'tablet' | 'mobile';

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
  reorderChildren: (parentId: string | null, newOrder: string[]) => void;
  setComponentOrder: (order: string[]) => void;
  componentOrder: string[];
  updateComponentOrder: (parentId: string | null, newOrder: string[]) => void;
  isDragging: boolean;
  startDragging: () => void;
  endDragging: () => void;
  draggingComponent: { type: string | null; defaultProps: Record<string, any> | null };
  setDraggingComponent: (component: { type: string | null; defaultProps: Record<string, any> | null }) => void;
  setSheetOpen: (isOpen: boolean) => void;
  setHasDragAttempted: (hasAttempted: boolean) => void; // Added action
}

type WebsiteState = WebsiteStoreActions & {
  pages: Page[];
  currentPageId: string;
  components: Component[];
  selectedComponentId: string | null;
  isPreviewMode: boolean;
  breakpoint: Breakpoint;
  isSheetOpen: boolean;
  hasDragAttempted: boolean; // Added state
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
      hasDragAttempted: false, // Initialize new state

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
        } else if (component.parentId) {
          console.warn(
            `Attempted to add child to component ${component.parentId} which does not allow children or doesn't exist.`
          );
        }
        state.components.push(newComponent);
        state.selectedComponentId = newComponent.id;
      }),
      removeComponent: (id) => set((state) => {
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
      reorderComponents: (pageId, oldIndex, newIndex) => set((state) => {
        const pageComponents = state.components.filter((c) => c.pageId === pageId && c.parentId === null);
        const [moved] = pageComponents.splice(oldIndex, 1);
        pageComponents.splice(newIndex, 0, moved);
        state.components = state.components.map((c) =>
          c.pageId === pageId && c.parentId === null ? pageComponents.find((pc) => pc.id === c.id) || c : c
        );
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
        } else if (isContainer && newParent && !newParent.allowChildren) {
          console.warn(`Cannot move component ${id} into ${targetId} as it does not allow children.`);
          return;
        }

        component.parentId = isContainer ? targetId : component.parentId || null;
      }),
      setIsPreviewMode: (isPreview) => set((state) => { state.isPreviewMode = isPreview; }),
      setBreakpoint: (breakpoint) => set((state) => { state.breakpoint = breakpoint; }),
      setAllowChildren: (id, allow) => set((state) => {
        const component = state.components.find((c) => c.id === id);
        if (component) {
          component.allowChildren = allow;
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
        } else if (parentId && newParent && !newParent.allowChildren) {
          console.warn(`Cannot move component ${id} into ${parentId} as it does not allow children.`);
          return;
        }

        component.parentId = parentId;
      }),
      reorderChildren: (parentId, newOrder) => set((state) => {
        const parent = state.components.find((c) => c.id === parentId);
        if (parent) {
          parent.children = newOrder;
        } else if (parentId === null) {
          const rootComponents = state.components.filter((c) => c.parentId === null);
          const nonRootComponents = state.components.filter((c) => c.parentId !== null);
          const orderedRootComponents = newOrder
            .map((id) => rootComponents.find((c) => c.id === id))
            .filter(Boolean) as Component[];
          state.components = [...orderedRootComponents, ...nonRootComponents];
        }
      }),
      setComponentOrder: (order) => set((state) => ({ componentOrder: order })),
      updateComponentOrder: (parentId, newOrder) => set((state) => {
        if (parentId === null) {
          const rootComponents = state.components.filter((c) => c.parentId === null);
          const nonRootComponents = state.components.filter((c) => c.parentId !== null);

          const rootComponentMap = new Map(rootComponents.map((c) => [c.id, c]));

          const orderedRootComponents = newOrder
            .map((id) => rootComponentMap.get(id))
            .filter(Boolean) as Component[];

          state.components = [...orderedRootComponents, ...nonRootComponents];
        } else {
          const parent = state.components.find((c) => c.id === parentId);
          if (parent) {
            parent.children = newOrder;
          }
        }
      }),
      startDragging: () => set((state) => { state.isDragging = true; }),
      endDragging: () => set((state) => { state.isDragging = false; }),
      setDraggingComponent: (component) => set((state) => { state.draggingComponent = component; }),
      setSheetOpen: (isOpen: boolean) => set((state) => { state.isSheetOpen = isOpen; }),
      setHasDragAttempted: (hasAttempted: boolean) => set((state) => { state.hasDragAttempted = hasAttempted; }), // Implemented action
    })),
    { name: 'WebsiteStore' }
  ));