
import React from 'react';

// Basic Components
export const Heading = ({ text, level, textAlign, color, className, children, isPreviewMode }: any) => {
  const Tag = level || 'h2';

  return React.createElement(
    Tag,
    {
      className: `${className || ''} text-${textAlign}`,
      style: { color },
      contentEditable: !isPreviewMode,
      suppressContentEditableWarning: true
    },
    text || children
  );
};

export const Paragraph = ({ text, textAlign, color, className, children, isPreviewMode }: any) => {
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

export const Image = ({ src, alt, width, height, className }: any) => {
  return (
    <img
      src={src}
      alt={alt}
      className={className || ''}
      style={{
        width: width || '100%',
        height: height || 'auto'
      }}
    />
  );
};

export const Button = ({ text, variant, url, textAlign, className, isPreviewMode }: any) => {
  const baseClass = "px-4 py-2 rounded";

  const variantClasses: Record<string, string> = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
    success: "bg-green-600 text-white hover:bg-green-700",
    danger: "bg-red-600 text-white hover:bg-red-700",
    outline: "border border-blue-600 text-blue-600 hover:bg-blue-50"
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

export const Link = ({ text, url, color, className, isPreviewMode }: any) => {
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
export const Container = ({
  children,
  padding,
  margin,
  backgroundColor,
  borderRadius,
  maxWidth,
  className
}: any) => {
  return (
    <div
      className={`mx-auto ${className || ''}`}
      style={{
        padding,
        margin,
        backgroundColor,
        borderRadius,
        maxWidth
      }}
    >
      {children}
    </div>
  );
};

export const Section = ({ children, backgroundColor, padding, className }: any) => {
  return (
    <section
      className={`w-full ${className || ''}`}
      style={{ backgroundColor, padding }}
    >
      {children}
    </section>
  );
};

export const Row = ({ children, gap, alignItems, justifyContent, className }: any) => {
  return (
    <div
      className={`flex flex-wrap ${className || ''}`}
      style={{
        gap,
        alignItems,
        justifyContent
      }}
    >
      {children}
    </div>
  );
};

export const Column = ({ children, width, padding, className }: any) => {
  // Convert fractional width to flex basis percentage
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
        padding
      }}
    >
      {children}
    </div>
  );
};

// Advanced Components
export const Form = ({ children, submitText, method, action, className }: any) => {
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

export const List = ({ items, type, className, isPreviewMode }: any) => {
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

export const Table = ({ headers, rows, className }: any) => {
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

export const Video = ({ url, width, height, className }: any) => {
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

export const Divider = ({ thickness, color, margin, className }: any) => {
  return (
    <hr
      className={className || ''}
      style={{
        height: thickness,
        backgroundColor: color,
        margin,
        border: 'none'
      }}
    />
  );
};

// Export all components as a registry
export const ComponentRegistry: Record<string, React.FC<any>> = {
  Heading,
  Paragraph,
  Image,
  Button,
  Link,
  Container,
  Section,
  Row,
  Column,
  Form,
  List,
  Table,
  Video,
  Divider
};
