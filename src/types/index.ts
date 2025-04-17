
// Core type definitions for the website builder

export type Breakpoint = 'mobile' | 'tablet' | 'desktop';

export type ComponentProps = Record<string, any>;

export interface Component {
  id: string;
  type: string;
  pageId: string;
  parentId?: string | null;
  props: ComponentProps;
  responsiveProps?: {
    [key in Breakpoint]?: ComponentProps;
  };
  allowChildren: boolean;
  children?: string[]; // Make children optional since it's not always needed
}

export interface Page {
  id: string;
  name: string;
  route?: string; // Make route optional to match usage in WebsiteStore
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export type DraggableItemType = {
  type: string;
  defaultProps: ComponentProps;
};
