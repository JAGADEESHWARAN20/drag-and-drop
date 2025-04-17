
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
  children: string[]; // This needs to be required for the component definition
}

export interface Page {
  id: string;
  name: string;
  route?: string;
  isPublished: boolean; // Adding isPublished property that was missing
  createdAt: string;
  updatedAt: string;
}

export type DraggableItemType = {
  type: string;
  defaultProps: ComponentProps;
};
