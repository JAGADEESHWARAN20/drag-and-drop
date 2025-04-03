import fs from 'fs';
import path from 'path';

function createRemainingFiles(code, existingFiles, destination) {
  const fileRegex = /\/\/ (.+\.tsx)/g;
  let match;
  let filesCreated = 0; // Counter for created files

  while ((match = fileRegex.exec(code)) !== null) {
    const filename = match[1];
    if (!existingFiles.includes(filename)) {
      const startIndex = match.index + match[0].length;
      const nextMatch = fileRegex.exec(code);
      const endIndex = nextMatch ? nextMatch.index : code.length;
      const fileContent = code.substring(startIndex, endIndex).trim();

      const filePath = path.join(destination, filename);

      try {
        if (!fs.existsSync(destination)) {
          fs.mkdirSync(destination, { recursive: true });
        }

        fs.writeFileSync(filePath, fileContent);
        console.log(`Created file: ${filePath}`);
        filesCreated++; // Increment counter
      } catch (err) {
        console.error(`Error creating file ${filePath}: ${err.message}`);
      }
    } else {
      console.log(`File ${filename} already exists, skipping.`);
    }
  }

  // Log total files created
  console.log(`\nTotal files created: ${filesCreated}`);
}

const code = `
// propertyEditorsRegistry.ts
import React from 'react';
import { HeadingEditor } from './HeadingEditor';
import { ParagraphEditor } from './ParagraphEditor';
import { ImageEditor } from './ImageEditor';
import { ButtonEditor } from './ButtonEditor';
import { LinkEditor } from './LinkEditor';
import { ContainerEditor } from './ContainerEditor';
import { SectionEditor } from './SectionEditor';
import { RowEditor } from './RowEditor';
import { ColumnEditor } from './ColumnEditor';
import { FormEditor } from './FormEditor';
import { ListEditor } from './ListEditor';
import { TableEditor } from './TableEditor';
import { VideoEditor } from './VideoEditor';
import { DividerEditor } from './DividerEditor';

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

// ParagraphEditor.tsx
import React from 'react';
import { Breakpoint } from '../store/WebsiteStore';
import { TextInput, SelectInput, ColorPicker } from './PropertyEditorUtils';

interface ParagraphProps {
  text?: string;
  textAlign?: string;
  color?: string;
}

interface ParagraphEditorProps {
  props: ParagraphProps;
  onChange: (key: keyof ParagraphProps, value: any, isResponsive?: boolean) => void;
  breakpoint: Breakpoint;
}

export const ParagraphEditor = ({
  props,
  onChange,
  breakpoint,
}: ParagraphEditorProps) => {
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

// ButtonEditor.tsx
import React from 'react';
import { Breakpoint } from '../store/WebsiteStore';
import { TextInput, SelectInput } from './PropertyEditorUtils';

interface ButtonProps {
  text?: string;
  url?: string;
  variant?: string;
  textAlign?: string;
}

interface ButtonEditorProps {
  props: ButtonProps;
  onChange: (key: keyof ButtonProps, value: any, isResponsive?: boolean) => void;
  breakpoint: Breakpoint;
}

export const ButtonEditor = ({
  props,
  onChange,
  breakpoint,
}: ButtonEditorProps) => {
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

// ContainerEditor.tsx
import React from 'react';
import { Breakpoint } from '../store/WebsiteStore';
import { TextInput, ColorPicker } from './PropertyEditorUtils';

interface ContainerProps {
  padding?: string;
  margin?: string;
  backgroundColor?: string;
  borderRadius?: string;
  maxWidth?: string;
}

interface ContainerEditorProps {
  props: ContainerProps;
  onChange: (key: keyof ContainerProps, value: any, isResponsive?: boolean) => void;
  breakpoint: Breakpoint;
}

export const ContainerEditor = ({
  props,
  onChange,
  breakpoint,
}: ContainerEditorProps) => {
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

// RowEditor.tsx
import React from 'react';
import { Breakpoint } from '../store/WebsiteStore';
import { TextInput, SelectInput } from './PropertyEditorUtils';

interface RowProps {
  gap?: string;
  alignItems?: string;
  justifyContent?: string;
}

interface RowEditorProps {
  props: RowProps;
  onChange: (key: keyof RowProps, value: any, isResponsive?: boolean) => void;
  breakpoint: Breakpoint;
}

export const RowEditor = ({
  props,
  onChange,
  breakpoint,
}: RowEditorProps) => {
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

// FormEditor.tsx
import React from 'react';
import { TextInput, SelectInput } from './PropertyEditorUtils';

interface FormProps {
  submitText?: string;
  action?: string;
  method?: string;
}

interface FormEditorProps {
  props: FormProps;
  onChange: (key: keyof FormProps, value: any, isResponsive?: boolean) => void;
}

export const FormEditor = ({ props, onChange }: FormEditorProps) => {
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

// TableEditor.tsx
import React from 'react';
import { TextInput } from './PropertyEditorUtils';

interface TableProps {
  headers?: string[];
  rows?: string[][];
}

interface TableEditorProps {
  props: TableProps;
  onChange: (key: keyof TableProps, value: any, isResponsive?: boolean) => void;
}

export const TableEditor = ({ props, onChange }: TableEditorProps) => {
  return (
    <div>
      <div className="mb-3">
        <label className="block text-sm font-medium mb-1 text-gray-700">
          Headers (comma separated)
        </label>
        <TextInput
          value={(props.headers || []).join(',')}
          onChange={(e) => onChange('headers', e.target.value.split(','))}
        />
      </div>
      <div className="mb-3">
        <label className="block text-sm font-medium mb-1 text-gray-700">
          Rows (one per line, cells comma separated)
        </label>
        <textarea
          value={(props.rows || []).map((row: string[]) => row.join(',')).join('\n')}
          onChange={(e) => {
            const rows = e.target.value.split('\n').map((row) => row.split(','));
            onChange('rows', rows);
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          rows={5}
        ></textarea>
      </div>
    </div>
  );
};

// DividerEditor.tsx
import React from 'react';
import { TextInput, ColorPicker } from './PropertyEditorUtils';

interface DividerProps {
  thickness?: string;
  color?: string;
  margin?: string;
}

interface DividerEditorProps {
  props: DividerProps;
  onChange: (key: keyof DividerProps, value: any, isResponsive?: boolean) => void;
}

export const DividerEditor = ({ props, onChange }: DividerEditorProps) => {
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

// propertyEditorsRegistry.ts
import React from 'react';
import { HeadingEditor } from './HeadingEditor';
import { ParagraphEditor } from './ParagraphEditor';
import { ImageEditor } from './ImageEditor';
import { ButtonEditor } from './ButtonEditor';
import { LinkEditor } from './LinkEditor';
import { ContainerEditor } from './ContainerEditor';
import { SectionEditor } from './SectionEditor';
import { RowEditor } from './RowEditor';
import { ColumnEditor } from './ColumnEditor';
import { FormEditor } from './FormEditor';
import { ListEditor } from './ListEditor';
import { TableEditor } from './TableEditor';
import { VideoEditor } from './VideoEditor';
import { DividerEditor } from './DividerEditor';

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
`;

const existingFiles = [
  'ColumnEditor.tsx',
  'HeadingEditor.tsx',
  'ImageEditor.tsx',
  'LinkEditor.tsx',
  'ListEditor.tsx',
  'PropertyEditorUtils.tsx',
  'SectionEditor.tsx',
  'VideoEditor.tsx',
];

const destinationFolder = './output'; // Specify the destination folder

createRemainingFiles(code, existingFiles, destinationFolder);