
import React from 'react';
import { useWebsiteStore, Breakpoint } from '../store/WebsiteStore';

// Common property editor components
const TextInput = ({ value, onChange, label, isResponsive = false }: { value: string, onChange: (value: string) => void, label: string, isResponsive?: boolean }) => {
  return (
    <div className="mb-3">
      <label className="block text-sm font-medium mb-1 text-gray-700">
        {label}
        {isResponsive && (
          <span className="ml-1 text-xs text-blue-600">(responsive)</span>
        )}
      </label>
      <input
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
  );
};

const ColorPicker = ({ value, onChange, label, isResponsive = false }: { value: string, onChange: (color: string) => void, label: string, isResponsive?: boolean }) => {
  return (
    <div className="mb-3">
      <label className="block text-sm font-medium mb-1 text-gray-700">
        {label}
        {isResponsive && (
          <span className="ml-1 text-xs text-blue-600">(responsive)</span>
        )}
      </label>
      <div className="flex">
        <input
          type="color"
          value={value || '#000000'}
          onChange={(e) => onChange(e.target.value)}
          className="mr-2 h-8 w-8 rounded overflow-hidden"
        />
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
    </div>
  );
};

const SelectInput = ({ 
  value, 
  onChange, 
  label, 
  options,
  isResponsive = false
}: { 
  value: string, 
  onChange: (value: string) => void, 
  label: string, 
  options: { value: string, label: string }[],
  isResponsive?: boolean
}) => {
  return (
    <div className="mb-3">
      <label className="block text-sm font-medium mb-1 text-gray-700">
        {label}
        {isResponsive && (
          <span className="ml-1 text-xs text-blue-600">(responsive)</span>
        )}
      </label>
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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

// Component-specific property editors
const HeadingEditor = ({ props, onChange, breakpoint }: { props: any, onChange: (key: string, value: any, isResponsive?: boolean) => void, breakpoint: Breakpoint }) => {
  const isResponsive = breakpoint !== 'desktop';

  return (
    <div>
      <TextInput
        label="Text"
        value={props.text || ''}
        onChange={(value) => onChange('text', value)}
      />
      <SelectInput
        label="Level"
        value={props.level || 'h2'}
        onChange={(value) => onChange('level', value)}
        options={[
          { value: 'h1', label: 'H1' },
          { value: 'h2', label: 'H2' },
          { value: 'h3', label: 'H3' },
          { value: 'h4', label: 'H4' },
          { value: 'h5', label: 'H5' },
          { value: 'h6', label: 'H6' },
        ]}
      />
      <SelectInput
        label="Text Align"
        value={props.textAlign || 'left'}
        onChange={(value) => onChange('textAlign', value, isResponsive)}
        options={[
          { value: 'left', label: 'Left' },
          { value: 'center', label: 'Center' },
          { value: 'right', label: 'Right' },
        ]}
        isResponsive={isResponsive}
      />
      <ColorPicker
        label="Color"
        value={props.color || '#000000'}
        onChange={(value) => onChange('color', value)}
      />
    </div>
  );
};

const ParagraphEditor = ({ props, onChange, breakpoint }: { props: any, onChange: (key: string, value: any, isResponsive?: boolean) => void, breakpoint: Breakpoint }) => {
  const isResponsive = breakpoint !== 'desktop';

  return (
    <div>
      <div className="mb-3">
        <label className="block text-sm font-medium mb-1 text-gray-700">Text</label>
        <textarea
          value={props.text || ''}
          onChange={(e) => onChange('text', e.target.value)}
          className="w-full border rounded px-3 py-2 text-sm"
          rows={4}
        />
      </div>
      <SelectInput
        label="Text Align"
        value={props.textAlign || 'left'}
        onChange={(value) => onChange('textAlign', value, isResponsive)}
        options={[
          { value: 'left', label: 'Left' },
          { value: 'center', label: 'Center' },
          { value: 'right', label: 'Right' },
          { value: 'justify', label: 'Justify' },
        ]}
        isResponsive={isResponsive}
      />
      <ColorPicker
        label="Color"
        value={props.color || '#333333'}
        onChange={(value) => onChange('color', value)}
      />
    </div>
  );
};

const ImageEditor = ({ props, onChange, breakpoint }: { props: any, onChange: (key: string, value: any, isResponsive?: boolean) => void, breakpoint: Breakpoint }) => {
  const isResponsive = breakpoint !== 'desktop';

  return (
    <div>
      <TextInput
        label="Image URL"
        value={props.src || ''}
        onChange={(value) => onChange('src', value)}
      />
      <TextInput
        label="Alt Text"
        value={props.alt || ''}
        onChange={(value) => onChange('alt', value)}
      />
      <TextInput
        label="Width"
        value={props.width || '100%'}
        onChange={(value) => onChange('width', value, isResponsive)}
        isResponsive={isResponsive}
      />
      <TextInput
        label="Height"
        value={props.height || 'auto'}
        onChange={(value) => onChange('height', value, isResponsive)}
        isResponsive={isResponsive}
      />
    </div>
  );
};

const ButtonEditor = ({ props, onChange, breakpoint }: { props: any, onChange: (key: string, value: any, isResponsive?: boolean) => void, breakpoint: Breakpoint }) => {
  return (
    <div>
      <TextInput
        label="Button Text"
        value={props.text || ''}
        onChange={(value) => onChange('text', value)}
      />
      <TextInput
        label="URL"
        value={props.url || '#'}
        onChange={(value) => onChange('url', value)}
      />
      <SelectInput
        label="Variant"
        value={props.variant || 'primary'}
        onChange={(value) => onChange('variant', value)}
        options={[
          { value: 'primary', label: 'Primary' },
          { value: 'secondary', label: 'Secondary' },
          { value: 'success', label: 'Success' },
          { value: 'danger', label: 'Danger' },
          { value: 'outline', label: 'Outline' },
        ]}
      />
      <SelectInput
        label="Alignment"
        value={props.textAlign || 'center'}
        onChange={(value) => onChange('textAlign', value)}
        options={[
          { value: 'left', label: 'Left' },
          { value: 'center', label: 'Center' },
          { value: 'right', label: 'Right' },
        ]}
      />
    </div>
  );
};

const LinkEditor = ({ props, onChange }: { props: any, onChange: (key: string, value: any, isResponsive?: boolean) => void }) => {
  return (
    <div>
      <TextInput
        label="Link Text"
        value={props.text || ''}
        onChange={(value) => onChange('text', value)}
      />
      <TextInput
        label="URL"
        value={props.url || '#'}
        onChange={(value) => onChange('url', value)}
      />
      <ColorPicker
        label="Color"
        value={props.color || '#0066cc'}
        onChange={(value) => onChange('color', value)}
      />
    </div>
  );
};

const ContainerEditor = ({ props, onChange, breakpoint }: { props: any, onChange: (key: string, value: any, isResponsive?: boolean) => void, breakpoint: Breakpoint }) => {
  const isResponsive = breakpoint !== 'desktop';

  return (
    <div>
      <TextInput
        label="Padding"
        value={props.padding || '16px'}
        onChange={(value) => onChange('padding', value, isResponsive)}
        isResponsive={isResponsive}
      />
      <TextInput
        label="Margin"
        value={props.margin || '0'}
        onChange={(value) => onChange('margin', value, isResponsive)}
        isResponsive={isResponsive}
      />
      <ColorPicker
        label="Background Color"
        value={props.backgroundColor || '#ffffff'}
        onChange={(value) => onChange('backgroundColor', value)}
      />
      <TextInput
        label="Border Radius"
        value={props.borderRadius || '0'}
        onChange={(value) => onChange('borderRadius', value)}
      />
      <TextInput
        label="Max Width"
        value={props.maxWidth || '1200px'}
        onChange={(value) => onChange('maxWidth', value, isResponsive)}
        isResponsive={isResponsive}
      />
    </div>
  );
};

const SectionEditor = ({ props, onChange }: { props: any, onChange: (key: string, value: any, isResponsive?: boolean) => void }) => {
  return (
    <div>
      <ColorPicker
        label="Background Color"
        value={props.backgroundColor || '#f9f9f9'}
        onChange={(value) => onChange('backgroundColor', value)}
      />
      <TextInput
        label="Padding"
        value={props.padding || '40px 0'}
        onChange={(value) => onChange('padding', value)}
      />
    </div>
  );
};

const RowEditor = ({ props, onChange, breakpoint }: { props: any, onChange: (key: string, value: any, isResponsive?: boolean) => void, breakpoint: Breakpoint }) => {
  const isResponsive = breakpoint !== 'desktop';

  return (
    <div>
      <TextInput
        label="Gap"
        value={props.gap || '16px'}
        onChange={(value) => onChange('gap', value)}
      />
      <SelectInput
        label="Align Items"
        value={props.alignItems || 'center'}
        options={[
          { value: 'stretch', label: 'Stretch' },
          { value: 'flex-start', label: 'Start' },
          { value: 'center', label: 'Center' },
          { value: 'flex-end', label: 'End' },
        ]}
        onChange={(value) => onChange('alignItems', value, isResponsive)}
        isResponsive={isResponsive}
      />
      <SelectInput
        label="Justify Content"
        value={props.justifyContent || 'space-between'}
        options={[
          { value: 'flex-start', label: 'Start' },
          { value: 'center', label: 'Center' },
          { value: 'flex-end', label: 'End' },
          { value: 'space-between', label: 'Space Between' },
          { value: 'space-around', label: 'Space Around' },
          { value: 'space-evenly', label: 'Space Evenly' },
        ]}
        onChange={(value) => onChange('justifyContent', value, isResponsive)}
        isResponsive={isResponsive}
      />
    </div>
  );
};

const ColumnEditor = ({ props, onChange, breakpoint }: { props: any, onChange: (key: string, value: any, isResponsive?: boolean) => void, breakpoint: Breakpoint }) => {
  const isResponsive = breakpoint !== 'desktop';

  return (
    <div>
      <SelectInput
        label="Width"
        value={props.width || '1'}
        options={[
          { value: '1', label: 'Full Width (1/1)' },
          { value: '1/2', label: 'Half Width (1/2)' },
          { value: '1/3', label: 'One Third (1/3)' },
          { value: '2/3', label: 'Two Thirds (2/3)' },
          { value: '1/4', label: 'Quarter (1/4)' },
          { value: '3/4', label: 'Three Quarters (3/4)' },
        ]}
        onChange={(value) => onChange('width', value, isResponsive)}
        isResponsive={isResponsive}
      />
      <TextInput
        label="Padding"
        value={props.padding || '0'}
        onChange={(value) => onChange('padding', value)}
      />
    </div>
  );
};

const FormEditor = ({ props, onChange }: { props: any, onChange: (key: string, value: any, isResponsive?: boolean) => void }) => {
  return (
    <div>
      <TextInput
        label="Submit Text"
        value={props.submitText || 'Submit'}
        onChange={(value) => onChange('submitText', value)}
      />
      <TextInput
        label="Form Action"
        value={props.action || ''}
        onChange={(value) => onChange('action', value)}
      />
      <SelectInput
        label="Method"
        value={props.method || 'POST'}
        options={[
          { value: 'GET', label: 'GET' },
          { value: 'POST', label: 'POST' },
        ]}
        onChange={(value) => onChange('method', value)}
      />
    </div>
  );
};

const ListEditor = ({ props, onChange }: { props: any, onChange: (key: string, value: any, isResponsive?: boolean) => void }) => {
  return (
    <div>
      <SelectInput
        label="List Type"
        value={props.type || 'ul'}
        options={[
          { value: 'ul', label: 'Bullet (ul)' },
          { value: 'ol', label: 'Numbered (ol)' },
        ]}
        onChange={(value) => onChange('type', value)}
      />
      <div className="mb-3">
        <label className="block text-sm font-medium mb-1 text-gray-700">
          Items (one per line)
        </label>
        <textarea
          value={(props.items || []).join('\n')}
          onChange={(e) => onChange('items', e.target.value.split('\n'))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          rows={5}
        ></textarea>
      </div>
    </div>
  );
};

const TableEditor = ({ props, onChange }: { props: any, onChange: (key: string, value: any, isResponsive?: boolean) => void }) => {
  return (
    <div>
      <div className="mb-3">
        <label className="block text-sm font-medium mb-1 text-gray-700">
          Headers (comma separated)
        </label>
        <input
          type="text"
          value={(props.headers || []).join(',')}
          onChange={(e) => onChange('headers', e.target.value.split(','))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <div className="mb-3">
        <label className="block text-sm font-medium mb-1 text-gray-700">
          Rows (one per line, cells comma separated)
        </label>
        <textarea
          value={(props.rows || []).map((row: string[]) => row.join(',')).join('\n')}
          onChange={(e) => {
            const rows = e.target.value.split('\n').map(row => row.split(','));
            onChange('rows', rows);
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          rows={5}
        ></textarea>
      </div>
    </div>
  );
};

const VideoEditor = ({ props, onChange, breakpoint }: { props: any, onChange: (key: string, value: any, isResponsive?: boolean) => void, breakpoint: Breakpoint }) => {
  const isResponsive = breakpoint !== 'desktop';

  return (
    <div>
      <TextInput
        label="Video URL"
        value={props.url || ''}
        onChange={(value) => onChange('url', value)}
      />
      <TextInput
        label="Width"
        value={props.width || '100%'}
        onChange={(value) => onChange('width', value, isResponsive)}
        isResponsive={isResponsive}
      />
      <TextInput
        label="Height"
        value={props.height || '315'}
        onChange={(value) => onChange('height', value, isResponsive)}
        isResponsive={isResponsive}
      />
    </div>
  );
};

const DividerEditor = ({ props, onChange }: { props: any, onChange: (key: string, value: any, isResponsive?: boolean) => void }) => {
  return (
    <div>
      <TextInput
        label="Thickness"
        value={props.thickness || '1px'}
        onChange={(value) => onChange('thickness', value)}
      />
      <ColorPicker
        label="Color"
        value={props.color || '#e0e0e0'}
        onChange={(value) => onChange('color', value)}
      />
      <TextInput
        label="Margin"
        value={props.margin || '20px 0'}
        onChange={(value) => onChange('margin', value)}
      />
    </div>
  );
};

// Export a registry of property editors
export const PropertyEditors: Record<string, React.FC<any>> = {
  Heading: HeadingEditor,
  Paragraph: ParagraphEditor,
  Image: ImageEditor,
  Button: ButtonEditor,
  Link: LinkEditor,
  Container: ContainerEditor,
  Section: SectionEditor,
  Row: RowEditor,
  Column: ColumnEditor,
  Form: FormEditor,
  List: ListEditor,
  Table: TableEditor,
  Video: VideoEditor,
  Divider: DividerEditor,
};
