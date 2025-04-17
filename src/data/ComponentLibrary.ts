
import {
  Heading,
  Text,
  Image,
  Square,
  Link,
  List,
  Container,
  Section,
  Columns,
  AlignCenter,
  FormInput,
  Box,
  Table,
  Video,
  LayoutGrid,
  SeparatorHorizontal,
} from 'lucide-react';

interface ComponentDefaultProps {
  [key: string]: string | number | string[] | { [key: string]: string | number } | string[][];
}

interface ComponentType {
  type: string;
  label: string;
  icon: React.ComponentType;
  defaultProps: ComponentDefaultProps;
}

export const ComponentLibrary: Record<'basic' | 'layout' | 'advanced', ComponentType[]> = {
  basic: [
    {
      type: 'Heading',
      label: 'Heading',
      icon: Heading,
      defaultProps: {
        text: 'Heading',
        level: 'h2',
        textAlign: 'left',
        color: '#000000',
      },
    },
    {
      type: 'Paragraph',
      label: 'Paragraph',
      icon: Text,
      defaultProps: {
        text: 'This is a paragraph. Click to edit.',
        textAlign: 'left',
        color: '#333333',
      },
    },
    {
      type: 'Image',
      label: 'Image',
      icon: Image,
      defaultProps: {
        src: 'https://via.placeholder.com/400x300',
        alt: 'Image description',
        width: '100%',
      },
    },
    {
      type: 'Button',
      label: 'Button',
      icon: Square,
      defaultProps: {
        text: 'Button',
        variant: 'primary',
        url: '#',
        textAlign: 'center',
      },
    },
    {
      type: 'Link',
      label: 'Link',
      icon: Link,
      defaultProps: {
        text: 'Link',
        url: '#',
        color: '#0066cc',
      },
    },
  ],
  layout: [
    {
      type: 'Container',
      label: 'Container',
      icon: Box,
      defaultProps: {
        padding: '16px',
        margin: '0',
        backgroundColor: '#ffffff',
        borderRadius: '0',
        maxWidth: '1200px',
      },
    },
    {
      type: 'Section',
      label: 'Section',
      icon: Section,
      defaultProps: {
        backgroundColor: '#f9f9f9',
        padding: '40px 0',
      },
    },
    {
      type: 'Row',
      label: 'Row',
      icon: AlignCenter,
      defaultProps: {
        gap: '16px',
        alignItems: 'center',
        justifyContent: 'space-between',
      },
    },
    {
      type: 'Column',
      label: 'Column',
      icon: Columns,
      defaultProps: {
        width: '1',
        padding: '0',
      },
    },
    {
      type: 'Grid',
      label: 'Grid',
      icon: LayoutGrid,
      defaultProps: {
        columns: 2,
        gap: '16px',
      },
    },
  ],
  advanced: [
    {
      type: 'Form',
      label: 'Form',
      icon: FormInput,
      defaultProps: {
        submitText: 'Submit',
        method: 'POST',
        action: '',
      },
    },
    {
      type: 'List',
      label: 'List',
      icon: List,
      defaultProps: {
        items: ['Item 1', 'Item 2', 'Item 3'],
        type: 'ul',
      },
    },
    {
      type: 'Table',
      label: 'Table',
      icon: Table,
      defaultProps: {
        headers: ['Header 1', 'Header 2', 'Header 3'],
        rows: [
          ['Cell 1-1', 'Cell 1-2', 'Cell 1-3'],
          ['Cell 2-1', 'Cell 2-2', 'Cell 2-3']
        ]
      }
    },
    {
      type: 'Video',
      label: 'Video',
      icon: Video,
      defaultProps: {
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        width: '100%',
        height: '315',
      },
    },
    {
      type: 'Divider',
      label: 'Divider',
      icon: SeparatorHorizontal,
      defaultProps: {
        thickness: '1px',
        color: '#e0e0e0',
        margin: '20px 0',
      },
    },
  ],
};

// Utility class for component management
interface ComponentInstance {
  id: string;
  type: string;
  pageId: string;
  parentId?: string;
  props: ComponentDefaultProps;
}

export class ComponentManager {
  private components = new Map<string, { id: string; pageId: string; parentId?: string }>();

  addComponent(component: { id: string; pageId: string; parentId?: string }) {
    this.components.set(component.id, component);
  }

  getComponents(pageId: string): { id: string; pageId: string; parentId?: string }[] {
    return Array.from(this.components.values()).filter((c) => c.pageId === pageId);
  }

  reorder(pageId: string, oldIndex: number, newIndex: number) {
    const components = this.getComponents(pageId).filter((c) => !c.parentId);
    if (oldIndex < 0 || newIndex < 0 || oldIndex >= components.length || newIndex >= components.length) {
      return components; // Prevents errors if indexes are out of bounds
    }
    const [moved] = components.splice(oldIndex, 1);
    components.splice(newIndex, 0, moved);
    return components;
  }
}

export const componentManager = new ComponentManager();
