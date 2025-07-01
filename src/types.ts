import { ReactNode } from "react";
import { UniqueIdentifier, DragEndEvent } from '@dnd-kit/core';
import { SortingStrategy } from '@dnd-kit/sortable';

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

export interface WebsiteState {
     pages: Page[];
     currentPageId: string;
     components: Component[];
     selectedComponentId: string | null;
     isPreviewMode: boolean;
     breakpoint: Breakpoint;
     componentOrder: string[];
     isDragging: boolean;
     draggingComponent: { type: string | null; defaultProps: Record<string, any> | null };
     isSheetOpen: boolean;
     hasDragAttempted: boolean; // Added new state
     setCurrentPageId: (id: string) => void;
     addPage: (page: Page) => void;
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
     updateResponsiveProps: (id: string, breakpoint: Breakpoint, props: Record<string, string | number | boolean | object>) => void;
     setSelectedComponentId: (id: string | null) => void;
     reorderComponents: (pageId: string, oldIndex: number, newIndex: number) => void;
     moveComponent: (id: string, targetId: string | null, isContainer?: boolean) => void;
     setIsPreviewMode: (isPreview: boolean) => void;
     setBreakpoint: (breakpoint: Breakpoint) => void;
     setAllowChildren: (id: string, allow: boolean) => void;
     updateComponentParent: (id: string, parentId: string | null) => void;
     reorderChildren: (parentId: string | null, newOrder: string[]) => void;
     updateComponentOrder: (parentId: string | null, newOrder: string[]) => void;
     setComponentOrder: (order: string[]) => void;
     startDragging: () => void;
     endDragging: () => void;
     setDraggingComponent: (component: { type: string | null; defaultProps: Record<string, any> | null }) => void;
     setSheetOpen: (isOpen: boolean) => void;
     setHasDragAttempted: (hasAttempted: boolean) => void; // Added new action
}

export interface WebsiteStoreProviderProps {
     children?: ReactNode;
}

export type PublicContextDescriptor = {
     isDragging: boolean;
     // ... other properties
};

export type ValidProp = string | number | boolean | string[] | string[][] | { [key: string]: string | number } | ReactNode;
export type ComponentProps = Record<string, ValidProp>;

export interface SortableContextProps {
     children: ReactNode;
     items: UniqueIdentifier[];
     strategy: SortingStrategy;
     onDragEnd: (event: DragEndEvent) => void;
}