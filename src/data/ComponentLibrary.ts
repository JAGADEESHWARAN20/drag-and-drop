
import {
  heading,
  paragraph,
  image,
  square,
  link,
  list,
  container,
  section,
  columns,
  alignLeft,
  alignCenter,
  form,
  box,
  table,
  video
} from 'lucide-react';

export const ComponentLibrary = {
  basic: [
    {
      type: 'Heading',
      label: 'Heading',
      icon: heading,
      defaultProps: {
        text: 'Heading',
        level: 'h2',
        textAlign: 'left',
        color: '#000000',
      }
    },
    {
      type: 'Paragraph',
      label: 'Paragraph',
      icon: paragraph,
      defaultProps: {
        text: 'This is a paragraph. Click to edit.',
        textAlign: 'left',
        color: '#333333',
      }
    },
    {
      type: 'Image',
      label: 'Image',
      icon: image,
      defaultProps: {
        src: 'https://via.placeholder.com/400x300',
        alt: 'Image description',
        width: '100%',
      }
    },
    {
      type: 'Button',
      label: 'Button',
      icon: square,
      defaultProps: {
        text: 'Button',
        variant: 'primary',
        url: '#',
        textAlign: 'center',
      }
    },
    {
      type: 'Link',
      label: 'Link',
      icon: link,
      defaultProps: {
        text: 'Link',
        url: '#',
        color: '#0066cc',
      }
    },
  ],
  layout: [
    {
      type: 'Container',
      label: 'Container',
      icon: box,
      defaultProps: {
        padding: '16px',
        margin: '0',
        backgroundColor: '#ffffff',
        borderRadius: '0',
        maxWidth: '1200px',
      }
    },
    {
      type: 'Section',
      label: 'Section',
      icon: section,
      defaultProps: {
        backgroundColor: '#f9f9f9',
        padding: '40px 0',
      }
    },
    {
      type: 'Row',
      label: 'Row',
      icon: alignCenter,
      defaultProps: {
        gap: '16px',
        alignItems: 'center',
        justifyContent: 'space-between',
      }
    },
    {
      type: 'Column',
      label: 'Column',
      icon: columns,
      defaultProps: {
        width: '1',
        padding: '0',
      }
    },
  ],
  advanced: [
    {
      type: 'Form',
      label: 'Form',
      icon: form,
      defaultProps: {
        submitText: 'Submit',
        method: 'POST',
        action: '',
      }
    },
    {
      type: 'List',
      label: 'List',
      icon: list,
      defaultProps: {
        items: ['Item 1', 'Item 2', 'Item 3'],
        type: 'ul',
      }
    },
    {
      type: 'Table',
      label: 'Table',
      icon: table,
      defaultProps: {
        headers: ['Header 1', 'Header 2', 'Header 3'],
        rows: [
          ['Cell 1-1', 'Cell 1-2', 'Cell 1-3'],
          ['Cell 2-1', 'Cell 2-2', 'Cell 2-3'],
        ],
      }
    },
    {
      type: 'Video',
      label: 'Video',
      icon: video,
      defaultProps: {
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        width: '100%',
        height: '315',
      }
    },
    {
      type: 'Divider',
      label: 'Divider',
      icon: alignLeft,
      defaultProps: {
        thickness: '1px',
        color: '#e0e0e0',
        margin: '20px 0',
      }
    },
  ],
};

// Utility class for component management
export class ComponentManager {
  private components = new Map<string, any>();

  addComponent(component: any) {
    this.components.set(component.id, component);
  }

  getComponents(pageId: string) {
    return Array.from(this.components.values()).filter(c => c.pageId === pageId);
  }

  reorder(pageId: string, oldIndex: number, newIndex: number) {
    const components = this.getComponents(pageId).filter(c => !c.parentId);
    const [moved] = components.splice(oldIndex, 1);
    components.splice(newIndex, 0, moved);
    return components;
  }
}

export const componentManager = new ComponentManager();
