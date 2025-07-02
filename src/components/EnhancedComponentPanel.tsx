import React, { useState, useMemo, useCallback } from 'react';
import { useEnhancedWebsiteStore } from '../store/EnhancedWebsiteStore';
import { LibraryComponent, ProjectElement } from '../types/ProjectStructure';
import {
  Search,
  Menu,
  X,
  Box,
  Layout,
  Grid3X3,
  Heading,
  Type,
  MousePointerClick,
  Image,
  Link as LinkIcon,
  List,
  Quote,
  Code,
  Video,
  Music,
  Star,
  CheckSquare,
  Circle,
  Send,
  Navigation,
  ChevronRight,
  Layers,
  Sliders,
  Table,
  CreditCard,
  ShoppingCart,
  DollarSign,
  Share2,
  Twitter,
  Phone,
  Tablet,
  Monitor,
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { toast } from './ui/use-toast';
import { useDraggable } from '@dnd-kit/core';

interface LucideIcon {
  (props: { size?: number | string; className?: string }): JSX.Element;
}

const iconMap: Record<string, React.ElementType> = {
  box: Box,
  layout: Layout,
  'grid-3x3': Grid3X3,
  heading: Heading,
  type: Type,
  'mouse-pointer-click': MousePointerClick,
  image: Image,
  link: LinkIcon,
  list: List,
  quote: Quote,
  code: Code,
  video: Video,
  music: Music,
  star: Star,
  'check-square': CheckSquare,
  circle: Circle,
  send: Send,
  navigation: Navigation,
  'chevron-right': ChevronRight,
  layers: Layers,
  sliders: Sliders,
  table: Table,
  'credit-card': CreditCard,
  'shopping-cart': ShoppingCart,
  'dollar-sign': DollarSign,
  share: Share2,
  twitter: Twitter,
  form: Box, // Fallback for form icon
  textarea: Type, // Fallback for textarea icon
};

interface DraggableComponentProps {
  component: LibraryComponent;
}

const DraggableComponent: React.FC<DraggableComponentProps> = ({ component }) => {
  const { addElement, startDrag } = useEnhancedWebsiteStore();
  const IconComponent = iconMap[component.icon] || Box;
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `draggable-${component.id}`,
    data: {
      type: 'COMPONENT',
      componentType: component.name,
      defaultProps: component.defaultProps,
      dropZones: component.dropZones,
      childrenAllowed: component.childrenAllowed,
      maxChildren: component.maxChildren,
    },
  });

  const handleClick = useCallback(() => {
    if (!isDragging) {
      const newElement: Omit<ProjectElement, 'elementId'> = {
        type: component.name,
        tagName: component.defaultProps.tagName || 'div',
        className: component.defaultProps.className || '',
        customClasses: [],
        position: { x: 0, y: 0, z: 1 },
        dimensions: {
          width: component.defaultProps.width || 'auto',
          height: component.defaultProps.height || 'auto',
        },
        parentId: null,
        children: [],
        properties: {
          innerHTML: component.defaultProps.innerHTML || '',
          textContent: component.defaultProps.textContent || '',
          attributes: { ...component.defaultProps },
        },
        styles: {
          inline: { ...component.defaultProps.styles },
          responsive: {
            mobile: {},
            tablet: {},
            desktop: {},
          },
        },
        events: component.events || [],
        functions: [],
        visibility: {
          visible: true,
          conditional: {
            showOn: ['desktop', 'tablet', 'mobile'],
            hideOn: [],
          },
        },
        animation: {
          entrance: 'none',
          exit: 'none',
          duration: 300,
        },
      };

      const elementId = addElement(newElement);
      toast({
        title: 'Component Added',
        description: `${component.name} added to canvas.`,
        variant: 'default',
      });
    }
  }, [addElement, component, isDragging]);

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={handleClick}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleClick()}
      className={`
        group flex flex-col items-center p-3 
        bg-white dark:bg-gray-800 
        border border-gray-200 dark:border-gray-700 
        rounded-lg cursor-grab 
        hover:border-blue-500 dark:hover:border-blue-400
        ${isDragging ? 'opacity-50' : 'opacity-100'}
        transition-all duration-200
      `}
      role="button"
      tabIndex={0}
      aria-label={`Drag or add ${component.name} component`}
      title={component.description || component.name}
      data-component-id={component.id}
      data-component-type={component.name}
      style={{
        touchAction: 'none',
        userSelect: 'none',
        transform: isDragging ? 'scale(1.05)' : 'scale(1)',
      }}
    >
      <IconComponent size={24} className="text-blue-500 dark:text-blue-400 mb-2" />
      <span className="text-xs text-center text-gray-700 dark:text-gray-300 font-medium">
        {component.name}
      </span>
      {component.description && (
        <span className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 p-2 bg-gray-900 text-white text-xs rounded whitespace-nowrap">
          {component.description}
        </span>
      )}
      <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 rounded-lg transition-opacity" />
    </div>
  );
};

interface EnhancedComponentPanelProps {
  className?: string;
}

const defaultComponentLibrary = {
  layout: {
    category: 'Layout',
    components: {
      container: {
        id: 'comp_container',
        name: 'Container',
        icon: 'box',
        description: 'A flexible div for grouping elements',
        defaultProps: { tagName: 'div', className: 'container', styles: { display: 'block', width: '100%', padding: '16px' } },
        draggable: true,
        dropZones: ['canvas', 'container'],
        childrenAllowed: true,
        maxChildren: null,
      },
      section: {
        id: 'comp_section',
        name: 'Section',
        icon: 'layout',
        description: 'A semantic section for dividing content',
        defaultProps: { tagName: 'section', className: 'section', styles: { display: 'block', width: '100%', padding: '40px 0' } },
        draggable: true,
        dropZones: ['canvas', 'container'],
        childrenAllowed: true,
        maxChildren: null,
      },
      grid: {
        id: 'comp_grid',
        name: 'Grid',
        icon: 'grid-3x3',
        description: 'A grid layout with configurable columns',
        defaultProps: { tagName: 'div', className: 'grid-container', columns: 12, gap: 16, styles: { display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '16px' } },
        draggable: true,
        dropZones: ['canvas', 'container'],
        childrenAllowed: true,
        maxChildren: null,
        specialBehavior: 'grid-layout',
      },
      flexbox: {
        id: 'comp_flexbox',
        name: 'Flexbox',
        icon: 'layers',
        description: 'A flexible box layout for rows or columns',
        defaultProps: { tagName: 'div', className: 'flex-container', styles: { display: 'flex', flexDirection: 'row', gap: '16px' } },
        draggable: true,
        dropZones: ['canvas', 'container'],
        childrenAllowed: true,
        maxChildren: null,
      },
      spacer: {
        id: 'comp_spacer',
        name: 'Spacer',
        icon: 'star',
        description: 'An empty div for adding spacing',
        defaultProps: { tagName: 'div', className: 'spacer', styles: { height: '20px' } },
        draggable: true,
        dropZones: ['canvas', 'container'],
        childrenAllowed: false,
        maxChildren: 0,
      },
    },
  },
  content: {
    category: 'Content',
    components: {
      heading: {
        id: 'comp_heading',
        name: 'Heading',
        icon: 'heading',
        description: 'Configurable heading (H1-H6)',
        defaultProps: { tagName: 'h2', textContent: 'Heading', className: 'heading', styles: { fontSize: '2rem', fontWeight: 'bold', color: '#000000' } },
        draggable: true,
        dropZones: ['canvas', 'container'],
        childrenAllowed: false,
        maxChildren: 0,
      },
      paragraph: {
        id: 'comp_paragraph',
        name: 'Paragraph',
        icon: 'type',
        description: 'Text block for body content',
        defaultProps: { tagName: 'p', textContent: 'This is a paragraph.', className: 'paragraph', styles: { fontSize: '1rem', color: '#333333' } },
        draggable: true,
        dropZones: ['canvas', 'container'],
        childrenAllowed: false,
        maxChildren: 0,
      },
      button: {
        id: 'comp_button',
        name: 'Button',
        icon: 'mouse-pointer-click',
        description: 'Interactive button with customizable styles',
        defaultProps: { tagName: 'button', textContent: 'Click me', className: 'btn btn-primary', type: 'button', styles: { padding: '12px 24px', backgroundColor: '#007bff', color: '#ffffff', border: 'none', borderRadius: '4px', cursor: 'pointer' } },
        draggable: true,
        dropZones: ['canvas', 'container'],
        childrenAllowed: false,
        maxChildren: 0,
        events: ['click', 'hover', 'focus'],
      },
      link: {
        id: 'comp_link',
        name: 'Link',
        icon: 'link',
        description: 'Hyperlink with customizable text and URL',
        defaultProps: { tagName: 'a', textContent: 'Link', href: '#', className: 'link', styles: { color: '#007bff', textDecoration: 'underline' } },
        draggable: true,
        dropZones: ['canvas', 'container'],
        childrenAllowed: false,
        maxChildren: 0,
        events: ['click'],
      },
      list: {
        id: 'comp_list',
        name: 'List',
        icon: 'list',
        description: 'Ordered or unordered list',
        defaultProps: { tagName: 'ul', className: 'list', styles: { listStyle: 'disc', paddingLeft: '20px' } },
        draggable: true,
        dropZones: ['canvas', 'container'],
        childrenAllowed: true,
        maxChildren: null,
      },
      quote: {
        id: 'comp_quote',
        name: 'Quote',
        icon: 'quote',
        description: 'Blockquote for highlighted quotes',
        defaultProps: { tagName: 'blockquote', textContent: 'Quote text', className: 'quote', styles: { borderLeft: '4px solid #ccc', paddingLeft: '16px' } },
        draggable: true,
        dropZones: ['canvas', 'container'],
        childrenAllowed: false,
        maxChildren: 0,
      },
      code: {
        id: 'comp_code',
        name: 'Code Block',
        icon: 'code',
        description: 'Preformatted code block',
        defaultProps: { tagName: 'pre', textContent: 'Code here', className: 'code-block', styles: { backgroundColor: '#f4f4f4', padding: '16px', fontFamily: 'monospace' } },
        draggable: true,
        dropZones: ['canvas', 'container'],
        childrenAllowed: false,
        maxChildren: 0,
      },
    },
  },
  media: {
    category: 'Media',
    components: {
      image: {
        id: 'comp_image',
        name: 'Image',
        icon: 'image',
        description: 'Image with responsive sizing',
        defaultProps: { tagName: 'img', className: 'image', src: 'https://via.placeholder.com/400x300', alt: 'Image description', styles: { width: '100%', height: 'auto' } },
        draggable: true,
        dropZones: ['canvas', 'container'],
        childrenAllowed: false,
        maxChildren: 0,
      },
      video: {
        id: 'comp_video',
        name: 'Video',
        icon: 'video',
        description: 'Video player for local or embedded videos',
        defaultProps: { tagName: 'video', className: 'video', src: '', controls: true, styles: { width: '100%', height: 'auto' } },
        draggable: true,
        dropZones: ['canvas', 'container'],
        childrenAllowed: false,
        maxChildren: 0,
      },
      audio: {
        id: 'comp_audio',
        name: 'Audio',
        icon: 'music',
        description: 'Audio player for embedding audio files',
        defaultProps: { tagName: 'audio', className: 'audio', src: '', controls: true, styles: { width: '100%' } },
        draggable: true,
        dropZones: ['canvas', 'container'],
        childrenAllowed: false,
        maxChildren: 0,
      },
      icon: {
        id: 'comp_icon',
        name: 'Icon',
        icon: 'star',
        description: 'Scalable vector icon',
        defaultProps: { tagName: 'span', className: 'icon', styles: { fontSize: '24px', color: '#000000' } },
        draggable: true,
        dropZones: ['canvas', 'container'],
        childrenAllowed: false,
        maxChildren: 0,
      },
    },
  },
  form: {
    category: 'Form',
    components: {
      form: {
        id: 'comp_form',
        name: 'Form',
        icon: 'form',
        description: 'Container for form elements',
        defaultProps: { tagName: 'form', className: 'form', styles: { display: 'block', padding: '16px' } },
        draggable: true,
        dropZones: ['canvas', 'container'],
        childrenAllowed: true,
        maxChildren: null,
      },
      input: {
        id: 'comp_input',
        name: 'Input',
        icon: 'type',
        description: 'Text input with various types',
        defaultProps: { tagName: 'input', className: 'input', type: 'text', styles: { padding: '8px', border: '1px solid #ccc' } },
        draggable: true,
        dropZones: ['canvas', 'container', 'form'],
        childrenAllowed: false,
        maxChildren: 0,
      },
      textarea: {
        id: 'comp_textarea',
        name: 'Textarea',
        icon: 'textarea',
        description: 'Multi-line text input',
        defaultProps: { tagName: 'textarea', className: 'textarea', styles: { padding: '8px', border: '1px solid #ccc', minHeight: '100px' } },
        draggable: true,
        dropZones: ['canvas', 'container', 'form'],
        childrenAllowed: false,
        maxChildren: 0,
      },
      select: {
        id: 'comp_select',
        name: 'Select',
        icon: 'list',
        description: 'Dropdown menu',
        defaultProps: { tagName: 'select', className: 'select', styles: { padding: '8px', border: '1px solid #ccc' } },
        draggable: true,
        dropZones: ['canvas', 'container', 'form'],
        childrenAllowed: true,
        maxChildren: null,
      },
      checkbox: {
        id: 'comp_checkbox',
        name: 'Checkbox',
        icon: 'check-square',
        description: 'Checkbox input',
        defaultProps: { tagName: 'input', className: 'checkbox', type: 'checkbox', styles: { marginRight: '8px' } },
        draggable: true,
        dropZones: ['canvas', 'container', 'form'],
        childrenAllowed: false,
        maxChildren: 0,
      },
      radio: {
        id: 'comp_radio',
        name: 'Radio',
        icon: 'circle',
        description: 'Radio button input',
        defaultProps: { tagName: 'input', className: 'radio', type: 'radio', styles: { marginRight: '8px' } },
        draggable: true,
        dropZones: ['canvas', 'container', 'form'],
        childrenAllowed: false,
        maxChildren: 0,
      },
      submit: {
        id: 'comp_submit',
        name: 'Submit Button',
        icon: 'send',
        description: 'Button for form submission',
        defaultProps: { tagName: 'button', className: 'btn btn-primary', type: 'submit', textContent: 'Submit', styles: { padding: '12px 24px', backgroundColor: '#007bff', color: '#ffffff', border: 'none', borderRadius: '4px' } },
        draggable: true,
        dropZones: ['canvas', 'container', 'form'],
        childrenAllowed: false,
        maxChildren: 0,
        events: ['click'],
      },
    },
  },
  navigation: {
    category: 'Navigation',
    components: {
      navbar: {
        id: 'comp_navbar',
        name: 'Navbar',
        icon: 'navigation',
        description: 'Horizontal navigation bar',
        defaultProps: { tagName: 'nav', className: 'navbar', styles: { display: 'flex', padding: '16px', backgroundColor: '#f8f9fa' } },
        draggable: true,
        dropZones: ['canvas', 'container'],
        childrenAllowed: true,
        maxChildren: null,
      },
      breadcrumb: {
        id: 'comp_breadcrumb',
        name: 'Breadcrumb',
        icon: 'chevron-right',
        description: 'Navigational breadcrumb trail',
        defaultProps: { tagName: 'nav', className: 'breadcrumb', styles: { display: 'flex', gap: '8px' } },
        draggable: true,
        dropZones: ['canvas', 'container'],
        childrenAllowed: true,
        maxChildren: null,
      },
      pagination: {
        id: 'comp_pagination',
        name: 'Pagination',
        icon: 'layers',
        description: 'Navigation for paginated content',
        defaultProps: { tagName: 'nav', className: 'pagination', styles: { display: 'flex', gap: '8px' } },
        draggable: true,
        dropZones: ['canvas', 'container'],
        childrenAllowed: true,
        maxChildren: null,
      },
      tabs: {
        id: 'comp_tabs',
        name: 'Tabs',
        icon: 'sliders',
        description: 'Tabbed interface for content sections',
        defaultProps: { tagName: 'div', className: 'tabs', styles: { display: 'flex', flexDirection: 'column' } },
        draggable: true,
        dropZones: ['canvas', 'container'],
        childrenAllowed: true,
        maxChildren: null,
      },
    },
  },
  interactive: {
    category: 'Interactive',
    components: {
      accordion: {
        id: 'comp_accordion',
        name: 'Accordion',
        icon: 'layers',
        description: 'Collapsible content panel',
        defaultProps: { tagName: 'div', className: 'accordion', styles: { display: 'block' } },
        draggable: true,
        dropZones: ['canvas', 'container'],
        childrenAllowed: true,
        maxChildren: null,
      },
      carousel: {
        id: 'comp_carousel',
        name: 'Carousel',
        icon: 'sliders',
        description: 'Sliding content display',
        defaultProps: { tagName: 'div', className: 'carousel', styles: { display: 'block', overflow: 'hidden' } },
        draggable: true,
        dropZones: ['canvas', 'container'],
        childrenAllowed: true,
        maxChildren: null,
      },
      modal: {
        id: 'comp_modal',
        name: 'Modal',
        icon: 'box',
        description: 'Pop-up dialog',
        defaultProps: { tagName: 'div', className: 'modal', styles: { display: 'none', position: 'fixed', top: '0', left: '0', width: '100%', height: '100%' } },
        draggable: true,
        dropZones: ['canvas', 'container'],
        childrenAllowed: true,
        maxChildren: null,
      },
      tooltip: {
        id: 'comp_tooltip',
        name: 'Tooltip',
        icon: 'star',
        description: 'Hover-triggered text',
        defaultProps: { tagName: 'span', className: 'tooltip', styles: { position: 'relative' } },
        draggable: true,
        dropZones: ['canvas', 'container'],
        childrenAllowed: false,
        maxChildren: 0,
      },
    },
  },
  data: {
    category: 'Data',
    components: {
      table: {
        id: 'comp_table',
        name: 'Table',
        icon: 'table',
        description: 'Data table with rows and columns',
        defaultProps: { tagName: 'table', className: 'table', styles: { width: '100%', borderCollapse: 'collapse' } },
        draggable: true,
        dropZones: ['canvas', 'container'],
        childrenAllowed: true,
        maxChildren: null,
      },
      card: {
        id: 'comp_card',
        name: 'Card',
        icon: 'credit-card',
        description: 'Styled content container',
        defaultProps: { tagName: 'div', className: 'card', styles: { padding: '16px', border: '1px solid #ccc', borderRadius: '8px' } },
        draggable: true,
        dropZones: ['canvas', 'container'],
        childrenAllowed: true,
        maxChildren: null,
      },
      timeline: {
        id: 'comp_timeline',
        name: 'Timeline',
        icon: 'layers',
        description: 'Chronological event display',
        defaultProps: { tagName: 'div', className: 'timeline', styles: { display: 'block' } },
        draggable: true,
        dropZones: ['canvas', 'container'],
        childrenAllowed: true,
        maxChildren: null,
      },
    },
  },
  ecommerce: {
    category: 'E-commerce',
    components: {
      productCard: {
        id: 'comp_product_card',
        name: 'Product Card',
        icon: 'credit-card',
        description: 'Display product details',
        defaultProps: { tagName: 'div', className: 'product-card', styles: { padding: '16px', border: '1px solid #ccc', borderRadius: '8px' } },
        draggable: true,
        dropZones: ['canvas', 'container'],
        childrenAllowed: true,
        maxChildren: null,
      },
      shoppingCart: {
        id: 'comp_shopping_cart',
        name: 'Shopping Cart',
        icon: 'shopping-cart',
        description: 'Summary of cart items',
        defaultProps: { tagName: 'div', className: 'shopping-cart', styles: { padding: '16px', border: '1px solid #ccc' } },
        draggable: true,
        dropZones: ['canvas', 'container'],
        childrenAllowed: true,
        maxChildren: null,
      },
      checkoutForm: {
        id: 'comp_checkout_form',
        name: 'Checkout Form',
        icon: 'dollar-sign',
        description: 'Form for payment and shipping',
        defaultProps: { tagName: 'form', className: 'checkout-form', styles: { padding: '16px' } },
        draggable: true,
        dropZones: ['canvas', 'container'],
        childrenAllowed: true,
        maxChildren: null,
      },
    },
  },
  social: {
    category: 'Social',
    components: {
      socialIcons: {
        id: 'comp_social_icons',
        name: 'Social Media Icons',
        icon: 'share',
        description: 'Links to social media profiles',
        defaultProps: { tagName: 'div', className: 'social-icons', styles: { display: 'flex', gap: '8px' } },
        draggable: true,
        dropZones: ['canvas', 'container'],
        childrenAllowed: true,
        maxChildren: null,
      },
      shareButton: {
        id: 'comp_share_button',
        name: 'Share Button',
        icon: 'share',
        description: 'Button for sharing content',
        defaultProps: { tagName: 'button', className: 'share-button', textContent: 'Share', styles: { padding: '8px 16px', backgroundColor: '#007bff', color: '#ffffff' } },
        draggable: true,
        dropZones: ['canvas', 'container'],
        childrenAllowed: false,
        maxChildren: 0,
        events: ['click'],
      },
      embedTweet: {
        id: 'comp_embed_tweet',
        name: 'Embed Tweet',
        icon: 'twitter',
        description: 'Embedded tweet or social post',
        defaultProps: { tagName: 'div', className: 'embed-tweet', styles: { padding: '16px' } },
        draggable: true,
        dropZones: ['canvas', 'container'],
        childrenAllowed: false,
        maxChildren: 0,
      },
    },
  },
};

const EnhancedComponentPanel: React.FC<EnhancedComponentPanelProps> = ({ className = '' }) => {
  const { currentProject, sidebarOpen, setSidebarOpen, startDrag, breakpoint, setBreakpoint } = useEnhancedWebsiteStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('layout');

  const categories = useMemo(() => Object.keys(defaultComponentLibrary), []);

  const filteredComponents = useMemo(() => {
    const categoryData = defaultComponentLibrary[activeCategory as keyof typeof defaultComponentLibrary];
    if (!categoryData) {
      console.warn(`Category ${activeCategory} not found in component library`);
      return [];
    }
    return Object.values(categoryData.components)
      .filter((component): component is LibraryComponent =>
        typeof component === 'object' && component !== null && 'name' in component
      )
      .filter((component) =>
        component.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [activeCategory, searchTerm]);

  const handleCategoryChange = useCallback((category: string) => {
    setActiveCategory(category);
  }, []);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleBreakpointChange = useCallback(
    (newBreakpoint: 'mobile' | 'tablet' | 'desktop') => {
      setBreakpoint(newBreakpoint);
    },
    [setBreakpoint]
  );

  const breakpointControls = (
    <div className="flex items-center justify-center space-x-2 py-2 border-b border-gray-200 dark:border-gray-800">
      <Button
        size="sm"
        variant={breakpoint === 'mobile' ? 'default' : 'ghost'}
        onClick={() => handleBreakpointChange('mobile')}
        aria-label="Mobile view"
      >
        <Phone className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant={breakpoint === 'tablet' ? 'default' : 'ghost'}
        onClick={() => handleBreakpointChange('tablet')}
        aria-label="Tablet view"
      >
        <Tablet className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant={breakpoint === 'desktop' ? 'default' : 'ghost'}
        onClick={() => handleBreakpointChange('desktop')}
        aria-label="Desktop view"
      >
        <Monitor className="h-4 w-4" />
      </Button>
    </div>
  );

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="md:hidden fixed top-4 left-4 z-50"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label={sidebarOpen ? 'Close component panel' : 'Open component panel'}
      >
        {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
      </Button>

      <div
        className={`
          fixed md:relative top-0 left-0 h-full bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 
          transition-transform duration-300 ease-in-out z-40
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          w-80 md:w-72 flex flex-col ${className}
        `}
        role="region"
        aria-label="Component panel"
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Components
            </h2>
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close component panel"
            >
              <X size={16} />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search components..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-9 text-sm"
              aria-label="Search components"
            />
          </div>
        </div>

        {breakpointControls}

        <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-800">
          <div className="flex space-x-1 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`
                  px-3 py-1.5 text-sm font-medium rounded-md whitespace-nowrap transition-colors
                  ${activeCategory === category
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }
                `}
                aria-current={activeCategory === category ? 'true' : 'false'}
                aria-label={`Select ${defaultComponentLibrary[category as keyof typeof defaultComponentLibrary].category} category`}
              >
                {defaultComponentLibrary[category as keyof typeof defaultComponentLibrary].category}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center text-blue-700 dark:text-blue-300">
            <MousePointerClick size={16} className="mr-2" />
            <span className="text-sm font-medium">Drag to Canvas</span>
          </div>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
            Drag components to the canvas or click to add instantly
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {filteredComponents.length > 0 ? (
            <div onDragStart={(e) => e.stopPropagation()} className="grid grid-cols-2 gap-3">
              {filteredComponents.map((component) => (
                <DraggableComponent key={component.id} component={component} />
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              <Box size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">No components found</p>
              {searchTerm && (
                <p className="text-xs mt-1">Try a different search term</p>
              )}
            </div>
          )}
        </div>
      </div>

      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setSidebarOpen(false)}
          onDragStart={(e) => e.stopPropagation()}
          aria-hidden="true"
        />
      )}
    </>
  );
};

export default React.memo(EnhancedComponentPanel);