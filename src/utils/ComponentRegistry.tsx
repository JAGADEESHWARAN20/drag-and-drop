
import React from 'react';
import { ComponentProps } from '../types';

// Define component interfaces
interface ComponentRegistryItem {
  component: React.ComponentType<ComponentProps & { children?: React.ReactNode; id: string; isPreviewMode?: boolean }>;
  allowChildren: boolean;
  editableProps: string[];
  defaultProps: ComponentProps;
}

// Sample component: Heading
const Heading: React.FC<ComponentProps & { children?: React.ReactNode; id: string; isPreviewMode?: boolean }> = ({
  text,
  level = 'h2',
  textAlign = 'left',
  color = '#000000',
  style = {},
  isPreviewMode = false,
  id,
}) => {
  const HeadingTag = level as keyof JSX.IntrinsicElements;
  
  return (
    <HeadingTag
      style={{
        textAlign,
        color,
        ...style,
      }}
      id={isPreviewMode ? undefined : id}
    >
      {text}
    </HeadingTag>
  );
};

// Sample component: Paragraph
const Paragraph: React.FC<ComponentProps & { children?: React.ReactNode; id: string; isPreviewMode?: boolean }> = ({
  text,
  textAlign = 'left',
  color = '#333333',
  style = {},
  isPreviewMode = false,
  id,
}) => {
  return (
    <p
      style={{
        textAlign,
        color,
        ...style,
      }}
      id={isPreviewMode ? undefined : id}
    >
      {text}
    </p>
  );
};

// Sample component: Button
const Button: React.FC<ComponentProps & { children?: React.ReactNode; id: string; isPreviewMode?: boolean }> = ({
  text,
  variant = 'primary',
  url = '#',
  textAlign = 'center',
  style = {},
  isPreviewMode = false,
  id,
}) => {
  const variantClasses = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    link: 'text-primary underline-offset-4 hover:underline',
  };

  return (
    <div style={{ textAlign }}>
      <button
        className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background px-4 py-2 ${variantClasses[variant as keyof typeof variantClasses]}`}
        style={style}
        id={isPreviewMode ? undefined : id}
      >
        {text}
      </button>
    </div>
  );
};

// Sample component: Image
const Image: React.FC<ComponentProps & { children?: React.ReactNode; id: string; isPreviewMode?: boolean }> = ({
  src,
  alt,
  width = '100%',
  height = 'auto',
  style = {},
  isPreviewMode = false,
  id,
}) => {
  return (
    <img
      src={src}
      alt={alt}
      style={{
        width,
        height,
        ...style,
      }}
      id={isPreviewMode ? undefined : id}
    />
  );
};

// Sample component: Container
const Container: React.FC<ComponentProps & { children?: React.ReactNode; id: string; isPreviewMode?: boolean }> = ({
  padding = '16px',
  margin = '0',
  backgroundColor = '#ffffff',
  borderRadius = '0',
  maxWidth = '1200px',
  style = {},
  children,
  isPreviewMode = false,
  id,
}) => {
  return (
    <div
      style={{
        padding,
        margin,
        backgroundColor,
        borderRadius,
        maxWidth,
        ...style,
      }}
      className="mx-auto"
      id={isPreviewMode ? undefined : id}
    >
      {children}
    </div>
  );
};

// Sample component: Section
const Section: React.FC<ComponentProps & { children?: React.ReactNode; id: string; isPreviewMode?: boolean }> = ({
  backgroundColor = '#f9f9f9',
  padding = '40px 0',
  style = {},
  children,
  isPreviewMode = false,
  id,
}) => {
  return (
    <section
      style={{
        backgroundColor,
        padding,
        ...style,
      }}
      id={isPreviewMode ? undefined : id}
    >
      {children}
    </section>
  );
};

// Sample component: Grid
const Grid: React.FC<ComponentProps & { children?: React.ReactNode; id: string; isPreviewMode?: boolean }> = ({
  columns = 2,
  gap = '16px',
  style = {},
  children,
  isPreviewMode = false,
  id,
}) => {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap,
        ...style,
      }}
      id={isPreviewMode ? undefined : id}
    >
      {children}
    </div>
  );
};

// Register all components
export const ComponentRegistry: Record<string, ComponentRegistryItem> = {
  Heading: {
    component: Heading,
    allowChildren: false,
    editableProps: ['text', 'level', 'textAlign', 'color'],
    defaultProps: {
      text: 'Heading',
      level: 'h2',
      textAlign: 'left',
      color: '#000000',
    },
  },
  Paragraph: {
    component: Paragraph,
    allowChildren: false,
    editableProps: ['text', 'textAlign', 'color'],
    defaultProps: {
      text: 'This is a paragraph. Click to edit.',
      textAlign: 'left',
      color: '#333333',
    },
  },
  Button: {
    component: Button,
    allowChildren: false,
    editableProps: ['text', 'variant', 'url', 'textAlign'],
    defaultProps: {
      text: 'Button',
      variant: 'primary',
      url: '#',
      textAlign: 'center',
    },
  },
  Image: {
    component: Image,
    allowChildren: false,
    editableProps: ['src', 'alt', 'width', 'height'],
    defaultProps: {
      src: 'https://via.placeholder.com/400x300',
      alt: 'Image description',
      width: '100%',
      height: 'auto',
    },
  },
  Container: {
    component: Container,
    allowChildren: true,
    editableProps: ['padding', 'margin', 'backgroundColor', 'borderRadius', 'maxWidth'],
    defaultProps: {
      padding: '16px',
      margin: '0',
      backgroundColor: '#ffffff',
      borderRadius: '0',
      maxWidth: '1200px',
    },
  },
  Section: {
    component: Section,
    allowChildren: true,
    editableProps: ['backgroundColor', 'padding'],
    defaultProps: {
      backgroundColor: '#f9f9f9',
      padding: '40px 0',
    },
  },
  Grid: {
    component: Grid,
    allowChildren: true,
    editableProps: ['columns', 'gap'],
    defaultProps: {
      columns: 2,
      gap: '16px',
    },
  },
};

// Export all component types
export type ComponentType = keyof typeof ComponentRegistry;
