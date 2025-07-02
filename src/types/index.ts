
// Core type definitions for the website builder

export type Breakpoint = 'mobile' | 'tablet' | 'desktop';

export type ComponentProps = Record<string, any>;

export interface Component {
  id: string;
  type: string;
  props: Record<string, any>;
  responsiveProps: {
    mobile: Record<string, any>;
    tablet: Record<string, any>;
    desktop: Record<string, any>;
  };
  parentId: string | null;
  children: string[];
  pageId: string;
  allowChildren: boolean;
}

export interface Page {
  id: string;
  name: string;
  route?: string;
  isPublished: boolean; // Property needed by WebsiteStore
  createdAt: string;
  updatedAt: string;
}

export type DraggableItemType = {
  type: string;
  defaultProps: ComponentProps;
};
