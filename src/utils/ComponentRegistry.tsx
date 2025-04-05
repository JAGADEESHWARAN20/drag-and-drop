import React, { FC } from 'react';
import * as Components from './components';
// Basic Components
interface HeadingProps {
  text?: string;
  level?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  textAlign?: 'left' | 'center' | 'right';
  color?: string;
  className?: string;
  children?: React.ReactNode;
  isPreviewMode?: boolean;
}

interface ComponentDefinition {
  component: FC<any>;
  allowChildren?: boolean;
  
}

export const Heading: FC<HeadingProps> = ({ text, level, textAlign, color, className, children, isPreviewMode }) => {
  const Tag = level || 'h2';

  return React.createElement(
    Tag,
    {
      className: `${className || ''} text-${textAlign}`,
      style: { color },
      contentEditable: !isPreviewMode,
      suppressContentEditableWarning: true,
    },
    text || children
  );
};

interface ParagraphProps {
  text?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  color?: string;
  className?: string;
  children?: React.ReactNode;
  isPreviewMode?: boolean;
}

export const Paragraph: FC<ParagraphProps> = ({ text, textAlign, color, className, children, isPreviewMode }) => {
  return (
    <p
      className={`${className || ''} text-${textAlign}`}
      style={{ color }}
      contentEditable={!isPreviewMode}
      suppressContentEditableWarning={true}
    >
      {text || children}
    </p>
  );
};

interface ImageProps {
  src?: string;
  alt?: string;
  width?: string;
  height?: string;
  className?: string;
}

export const Image: FC<ImageProps> = ({ src, alt, width, height, className }) => {
  return (
    <img
      src={src}
      alt={alt}
      className={className || ''}
      style={{
        width: width || '100%',
        height: height || 'auto',
      }}
    />
  );
};

interface ButtonProps {
  text?: string;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'outline';
  url?: string;
  textAlign?: 'left' | 'center' | 'right';
  className?: string;
  isPreviewMode?: boolean;
}

export const Button: FC<ButtonProps> = ({ text, variant, url, textAlign, className, isPreviewMode }) => {
  const baseClass = 'px-4 py-2 rounded';

  const variantClasses: Record<string, string> = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    success: 'bg-green-600 text-white hover:bg-green-700',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    outline: 'border border-blue-600 text-blue-600 hover:bg-blue-50',
  };

  return (
    <div className={`text-${textAlign}`}>
      <a
        href={isPreviewMode ? url : '#'}
        className={`${baseClass} ${variantClasses[variant] || variantClasses.primary} ${className || ''} inline-block`}
        contentEditable={!isPreviewMode}
        suppressContentEditableWarning={true}
      >
        {text}
      </a>
    </div>
  );
};

interface LinkProps {
  text?: string;
  url?: string;
  color?: string;
  className?: string;
  isPreviewMode?: boolean;
}

export const Link: FC<LinkProps> = ({ text, url, color, className, isPreviewMode }) => {
  return (
    <a
      href={isPreviewMode ? url : '#'}
      className={className || ''}
      style={{ color }}
      contentEditable={!isPreviewMode}
      suppressContentEditableWarning={true}
    >
      {text}
    </a>
  );
};

// Layout Components
interface ContainerProps {
  children?: React.ReactNode;
  padding?: string;
  margin?: string;
  backgroundColor?: string;
  borderRadius?: string;
  maxWidth?: string;
  className?: string;
}

export const Container: FC<ContainerProps> = ({ children, padding, margin, backgroundColor, borderRadius, maxWidth, className }) => {
  return (
    <div
      className={`mx-auto ${className || ''}`}
      style={{
        padding,
        margin,
        backgroundColor,
        borderRadius,
        maxWidth,
      }}
    >
      {children}
    </div>
  );
};

interface SectionProps {
  children?: React.ReactNode;
  backgroundColor?: string;
  padding?: string;
  className?: string;
}

export const Section: FC<SectionProps> = ({ children, backgroundColor, padding, className }) => {
  return (
    <section
      className={`w-full ${className || ''}`}
      style={{ backgroundColor, padding }}
    >
      {children}
    </section>
  );
};

interface RowProps {
  children?: React.ReactNode;
  gap?: string;
  alignItems?: 'stretch' | 'flex-start' | 'center' | 'flex-end';
  justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly';
  className?: string;
}

export const Row: FC<RowProps> = ({ children, gap, alignItems, justifyContent, className }) => {
  return (
    <div
      className={`flex flex-wrap ${className || ''}`}
      style={{
        gap,
        alignItems,
        justifyContent,
      }}
    >
      {children}
    </div>
  );
};

interface ColumnProps {
  children?: React.ReactNode;
  width?: string; // e.g., '1', '1/2', '1/3', etc.
  padding?: string;
  className?: string;
}

export const Column: FC<ColumnProps> = ({ children, width, padding, className }) => {
  const getFlexBasis = (width: string) => {
    if (!width || width === '1') return '100%';

    const parts = width.split('/');
    if (parts.length === 2) {
      return `${(parseInt(parts[0]) / parseInt(parts[1])) * 100}%`;
    }

    return width;
  };

  return (
    <div
      className={`${className || ''}`}
      style={{
        flexBasis: getFlexBasis(width),
        padding,
      }}
    >
      {children}
    </div>
  );
};

// Advanced Components
interface FormProps {
  children?: React.ReactNode;
  submitText?: string;
  method?: 'GET' | 'POST';
  action?: string;
  className?: string;
}

export const Form: FC<FormProps> = ({ children, submitText, method, action, className }) => {
  return (
    <form
      className={`${className || ''}`}
      method={method}
      action={action}
    >
      {children}
      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mt-4"
      >
        {submitText}
      </button>
    </form>
  );
};

interface ListProps {
  items: string[];
  type?: 'ul' | 'ol';
  className?: string;
  isPreviewMode?: boolean;
}

export const List: FC<ListProps> = ({ items, type, className, isPreviewMode }) => {
  const ListType = type === 'ol' ? 'ol' : 'ul';
  const listClass = type === 'ol' ? 'list-decimal' : 'list-disc';

  return React.createElement(
    ListType,
    {
      className: `${listClass} pl-5 ${className || ''}`,
    },
    items.map((item: string, index: number) => (
      <li
        key={index}
        contentEditable={!isPreviewMode}
        suppressContentEditableWarning={true}
      >
        {item}
      </li>
    ))
  );
};

interface TableProps {
  headers: string[];
  rows: string[][];
  className?: string;
}

export const Table: FC<TableProps> = ({ headers, rows, className }) => {
  return (
    <div className="overflow-x-auto">
      <table className={`min-w-full bg-white border border-gray-200 ${className || ''}`}>
        <thead>
          <tr className="bg-gray-100">
            {headers.map((header: string, index: number) => (
              <th key={index} className="py-2 px-4 border-b border-gray-200 text-left">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row: string[], rowIndex: number) => (
            <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              {row.map((cell: string, cellIndex: number) => (
                <td key={cellIndex} className="py-2 px-4 border-b border-gray-200">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

interface VideoProps {
  url?: string;
  width?: string;
  height?: string;
  className?: string;
}

export const Video: FC<VideoProps> = ({ url, width, height, className }) => {
  return (
    <div className={className || ''}>
      <iframe
        width={width}
        height={height}
        src={url}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="border-0"
      ></iframe>
    </div>
  );
};

interface DividerProps {
  thickness?: string;
  color?: string;
  margin?: string;
  className?: string;
}

export const Divider: FC<DividerProps> = ({ thickness, color, margin, className }) => {
  return (
    <hr
      className={className || ''}
      style={{
        height: thickness,
        backgroundColor: color,
        margin,
        border: 'none',
      }}
    />
  );
};



export const ComponentRegistry: Record<string, ComponentDefinition> = {
  Heading: { component: Components.Heading },
  Paragraph: { component: Components.Paragraph },
  Image: { component: Components.Image },
  Button: { component: Components.Button },
  Link: { component: Components.Link },
  Container: { component: Components.Container, allowChildren: true }, // Example: Container allows children
  Section: { component: Components.Section },
  Row: { component: Components.Row },
  Column: { component: Components.Column },
  Form: { component: Components.Form },
  List: { component: Components.List },
  Table: { component: Components.Table },
  Video: { component: Components.Video },
  Divider: { component: Components.Divider },
};