
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
}

export interface Page {
  id: string;
  name: string;
  route: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export type DraggableItemType = {
  type: string;
  defaultProps: ComponentProps;
};
