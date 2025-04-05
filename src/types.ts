// In your ../types/index.ts

import { ReactNode } from "react";

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
     
    
     setDraggingComponent: (component: any) => void;
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
     reorderChildren: (parentId: string | null, newOrder: string[]) => void;
     updateComponentOrder: (parentId: string | null, newOrder: string[]) => void;
     setComponentOrder: (order: string[]) => void; // Add this line
}

export interface WebsiteStoreProviderProps {
     children?: ReactNode;
}

export type PublicContextDescriptor = {
     // ... other properties
     isDragging: boolean;
     // ...
};
export type ValidProp = string | number | boolean | string[] | string[][] | { [key: string]: string | number };
export type ComponentProps = Record<string, ValidProp>;


