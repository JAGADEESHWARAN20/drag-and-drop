
import React from 'react';
import { useWebsiteStore, Breakpoint } from '../store/WebsiteStore';

// Common property editor components
const ColorPicker = ({ value, onChange, label }: { value: string, onChange: (color: string) => void, label: string }) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-1">{label}</label>
      <div className="flex items-center">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-8 h-8 p-0 border-0 rounded mr-2"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="border rounded px-2 py-1 flex-1 text-sm"
        />
      </div>
    </div>
  );
};

const TextInput = ({ value, onChange, label }: { value: string, onChange: (value: string) => void, label: string }) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border rounded px-2 py-1 text-sm"
      />
    </div>
  );
};

const SelectInput = ({ 
  value, 
  onChange, 
  label, 
  options 
}: { 
  value: string, 
  onChange: (value: string) => void, 
  label: string, 
  options: { value: string, label: string }[] 
}) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border rounded px-2 py-1 text-sm"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

const ResponsiveToggle = ({ 
  isResponsive, 
  onChange 
}: { 
  isResponsive: boolean, 
  onChange: (value: boolean) => void 
}) => {
  return (
    <div className="flex items-center mb-4">
      <label className="flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={isResponsive}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only"
        />
        <div className={`relative w-10 h-5 transition-colors duration-200 ease-in-out rounded-full ${isResponsive ? 'bg-blue-600' : 'bg-gray-200'}`}>
          <div className={`absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition-transform duration-200 ease-in-out ${isResponsive ? 'transform translate-x-5' : ''}`} />
        </div>
        <span className="ml-2 text-sm font-medium text-gray-700">
          {isResponsive ? 'Responsive' : 'Global'}
        </span>
      </label>
    </div>
  );
};

// Component-specific property editors
const HeadingEditor = ({ props, onChange, breakpoint }: { props: any, onChange: (key: string, value: any, isResponsive?: boolean) => void, breakpoint: Breakpoint }) => {
  const [isResponsive, setIsResponsive] = React.useState<Record<string, boolean>>({
    text: false,
    level: false,
    textAlign: false,
    color: false,
  });

  const handleResponsiveToggle = (property: string, value: boolean) => {
    setIsResponsive({ ...isResponsive, [property]: value });
  };

  return (
    <div>
      <TextInput
        label="Text"
        value={props.text || ''}
        onChange={(value) => onChange('text', value, isResponsive.text)}
      />
      <ResponsiveToggle
        isResponsive={isResponsive.text}
        onChange={(value) => handleResponsiveToggle('text', value)}
      />

      <SelectInput
        label="Heading Level"
        value={props.level || 'h2'}
        onChange={(value) => onChange('level', value, isResponsive.level)}
        options={[
          { value: 'h1', label: 'H1' },
          { value: 'h2', label: 'H2' },
          { value: 'h3', label: 'H3' },
          { value: 'h4', label: 'H4' },
          { value: 'h5', label: 'H5' },
          { value: 'h6', label: 'H6' },
        ]}
      />
      <ResponsiveToggle
        isResponsive={isResponsive.level}
        onChange={(value) => handleResponsiveToggle('level', value)}
      />

      <SelectInput
        label="Text Align"
        value={props.textAlign || 'left'}
        onChange={(value) => onChange('textAlign', value, isResponsive.textAlign)}
        options={[
          { value: 'left', label: 'Left' },
          { value: 'center', label: 'Center' },
          { value: 'right', label: 'Right' },
        ]}
      />
      <ResponsiveToggle
        isResponsive={isResponsive.textAlign}
        onChange={(value) => handleResponsiveToggle('textAlign', value)}
      />

      <ColorPicker
        label="Color"
        value={props.color || '#000000'}
        onChange={(value) => onChange('color', value, isResponsive.color)}
      />
      <ResponsiveToggle
        isResponsive={isResponsive.color}
        onChange={(value) => handleResponsiveToggle('color', value)}
      />
    </div>
  );
};

const ParagraphEditor = ({ props, onChange, breakpoint }: { props: any, onChange: (key: string, value: any, isResponsive?: boolean) => void, breakpoint: Breakpoint }) => {
  const [isResponsive, setIsResponsive] = React.useState<Record<string, boolean>>({
    text: false,
    textAlign: false,
    color: false,
  });

  const handleResponsiveToggle = (property: string, value: boolean) => {
    setIsResponsive({ ...isResponsive, [property]: value });
  };

  return (
    <div>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Text</label>
        <textarea
          value={props.text || ''}
          onChange={(e) => onChange('text', e.target.value, isResponsive.text)}
          className="w-full border rounded px-2 py-1 text-sm"
          rows={4}
        />
      </div>
      <ResponsiveToggle
        isResponsive={isResponsive.text}
        onChange={(value) => handleResponsiveToggle('text', value)}
      />

      <SelectInput
        label="Text Align"
        value={props.textAlign || 'left'}
        onChange={(value) => onChange('textAlign', value, isResponsive.textAlign)}
        options={[
          { value: 'left', label: 'Left' },
          { value: 'center', label: 'Center' },
          { value: 'right', label: 'Right' },
          { value: 'justify', label: 'Justify' },
        ]}
      />
      <ResponsiveToggle
        isResponsive={isResponsive.textAlign}
        onChange={(value) => handleResponsiveToggle('textAlign', value)}
      />

      <ColorPicker
        label="Color"
        value={props.color || '#333333'}
        onChange={(value) => onChange('color', value, isResponsive.color)}
      />
      <ResponsiveToggle
        isResponsive={isResponsive.color}
        onChange={(value) => handleResponsiveToggle('color', value)}
      />
    </div>
  );
};

const ImageEditor = ({ props, onChange, breakpoint }: { props: any, onChange: (key: string, value: any, isResponsive?: boolean) => void, breakpoint: Breakpoint }) => {
  const [isResponsive, setIsResponsive] = React.useState<Record<string, boolean>>({
    src: false,
    alt: false,
    width: false,
    height: false,
  });

  const handleResponsiveToggle = (property: string, value: boolean) => {
    setIsResponsive({ ...isResponsive, [property]: value });
  };

  return (
    <div>
      <TextInput
        label="Image URL"
        value={props.src || ''}
        onChange={(value) => onChange('src', value, isResponsive.src)}
      />
      <ResponsiveToggle
        isResponsive={isResponsive.src}
        onChange={(value) => handleResponsiveToggle('src', value)}
      />

      <TextInput
        label="Alt Text"
        value={props.alt || ''}
        onChange={(value) => onChange('alt', value, isResponsive.alt)}
      />
      <ResponsiveToggle
        isResponsive={isResponsive.alt}
        onChange={(value) => handleResponsiveToggle('alt', value)}
      />

      <TextInput
        label="Width"
        value={props.width || '100%'}
        onChange={(value) => onChange('width', value, isResponsive.width)}
      />
      <ResponsiveToggle
        isResponsive={isResponsive.width}
        onChange={(value) => handleResponsiveToggle('width', value)}
      />

      <TextInput
        label="Height"
        value={props.height || 'auto'}
        onChange={(value) => onChange('height', value, isResponsive.height)}
      />
      <ResponsiveToggle
        isResponsive={isResponsive.height}
        onChange={(value) => handleResponsiveToggle('height', value)}
      />
    </div>
  );
};

const ButtonEditor = ({ props, onChange, breakpoint }: { props: any, onChange: (key: string, value: any, isResponsive?: boolean) => void, breakpoint: Breakpoint }) => {
  const [isResponsive, setIsResponsive] = React.useState<Record<string, boolean>>({
    text: false,
    variant: false,
    url: false,
    textAlign: false,
  });

  const handleResponsiveToggle = (property: string, value: boolean) => {
    setIsResponsive({ ...isResponsive, [property]: value });
  };

  return (
    <div>
      <TextInput
        label="Button Text"
        value={props.text || ''}
        onChange={(value) => onChange('text', value, isResponsive.text)}
      />
      <ResponsiveToggle
        isResponsive={isResponsive.text}
        onChange={(value) => handleResponsiveToggle('text', value)}
      />

      <SelectInput
        label="Variant"
        value={props.variant || 'primary'}
        onChange={(value) => onChange('variant', value, isResponsive.variant)}
        options={[
          { value: 'primary', label: 'Primary' },
          { value: 'secondary', label: 'Secondary' },
          { value: 'success', label: 'Success' },
          { value: 'danger', label: 'Danger' },
          { value: 'outline', label: 'Outline' },
        ]}
      />
      <ResponsiveToggle
        isResponsive={isResponsive.variant}
        onChange={(value) => handleResponsiveToggle('variant', value)}
      />

      <TextInput
        label="URL"
        value={props.url || '#'}
        onChange={(value) => onChange('url', value, isResponsive.url)}
      />
      <ResponsiveToggle
        isResponsive={isResponsive.url}
        onChange={(value) => handleResponsiveToggle('url', value)}
      />

      <SelectInput
        label="Alignment"
        value={props.textAlign || 'center'}
        onChange={(value) => onChange('textAlign', value, isResponsive.textAlign)}
        options={[
          { value: 'left', label: 'Left' },
          { value: 'center', label: 'Center' },
          { value: 'right', label: 'Right' },
        ]}
      />
      <ResponsiveToggle
        isResponsive={isResponsive.textAlign}
        onChange={(value) => handleResponsiveToggle('textAlign', value)}
      />
    </div>
  );
};

const LinkEditor = ({ props, onChange, breakpoint }: { props: any, onChange: (key: string, value: any, isResponsive?: boolean) => void, breakpoint: Breakpoint }) => {
  const [isResponsive, setIsResponsive] = React.useState<Record<string, boolean>>({
    text: false,
    url: false,
    color: false,
  });

  const handleResponsiveToggle = (property: string, value: boolean) => {
    setIsResponsive({ ...isResponsive, [property]: value });
  };

  return (
    <div>
      <TextInput
        label="Link Text"
        value={props.text || ''}
        onChange={(value) => onChange('text', value, isResponsive.text)}
      />
      <ResponsiveToggle
        isResponsive={isResponsive.text}
        onChange={(value) => handleResponsiveToggle('text', value)}
      />

      <TextInput
        label="URL"
        value={props.url || '#'}
        onChange={(value) => onChange('url', value, isResponsive.url)}
      />
      <ResponsiveToggle
        isResponsive={isResponsive.url}
        onChange={(value) => handleResponsiveToggle('url', value)}
      />

      <ColorPicker
        label="Color"
        value={props.color || '#0066cc'}
        onChange={(value) => onChange('color', value, isResponsive.color)}
      />
      <ResponsiveToggle
        isResponsive={isResponsive.color}
        onChange={(value) => handleResponsiveToggle('color', value)}
      />
    </div>
  );
};

const ContainerEditor = ({ props, onChange, breakpoint }: { props: any, onChange: (key: string, value: any, isResponsive?: boolean) => void, breakpoint: Breakpoint }) => {
  const [isResponsive, setIsResponsive] = React.useState<Record<string, boolean>>({
    padding: false,
    margin: false,
    backgroundColor: false,
    borderRadius: false,
    maxWidth: false,
  });

  const handleResponsiveToggle = (property: string, value: boolean) => {
    setIsResponsive({ ...isResponsive, [property]: value });
  };

  return (
    <div>
      <TextInput
        label="Padding"
        value={props.padding || '16px'}
        onChange={(value) => onChange('padding', value, isResponsive.padding)}
      />
      <ResponsiveToggle
        isResponsive={isResponsive.padding}
        onChange={(value) => handleResponsiveToggle('padding', value)}
      />

      <TextInput
        label="Margin"
        value={props.margin || '0'}
        onChange={(value) => onChange('margin', value, isResponsive.margin)}
      />
      <ResponsiveToggle
        isResponsive={isResponsive.margin}
        onChange={(value) => handleResponsiveToggle('margin', value)}
      />

      <ColorPicker
        label="Background Color"
        value={props.backgroundColor || '#ffffff'}
        onChange={(value) => onChange('backgroundColor', value, isResponsive.backgroundColor)}
      />
      <ResponsiveToggle
        isResponsive={isResponsive.backgroundColor}
        onChange={(value) => handleResponsiveToggle('backgroundColor', value)}
      />

      <TextInput
        label="Border Radius"
        value={props.borderRadius || '0'}
        onChange={(value) => onChange('borderRadius', value, isResponsive.borderRadius)}
      />
      <ResponsiveToggle
        isResponsive={isResponsive.borderRadius}
        onChange={(value) => handleResponsiveToggle('borderRadius', value)}
      />

      <TextInput
        label="Max Width"
        value={props.maxWidth || '1200px'}
        onChange={(value) => onChange('maxWidth', value, isResponsive.maxWidth)}
      />
      <ResponsiveToggle
        isResponsive={isResponsive.maxWidth}
        onChange={(value) => handleResponsiveToggle('maxWidth', value)}
      />
    </div>
  );
};

// Add more component editors as needed...

// Export a registry of property editors
export const PropertyEditors: Record<string, React.FC<any>> = {
  Heading: HeadingEditor,
  Paragraph: ParagraphEditor,
  Image: ImageEditor,
  Button: ButtonEditor,
  Link: LinkEditor,
  Container: ContainerEditor,
  // Add more editors for other components...
};
