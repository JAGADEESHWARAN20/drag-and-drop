
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Breakpoint } from '../store/WebsiteStore';

// Base PropertyEditor props
interface PropertyEditorProps {
  props: Record<string, any>;
  onChange: (key: string, value: any) => void;
  breakpoint: Breakpoint;
  isResponsive?: boolean;
}

// Heading property editor
const HeadingEditor: React.FC<PropertyEditorProps> = ({ props, onChange }) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Text</Label>
        <Textarea
          value={props.text || ''}
          onChange={(e) => onChange('text', e.target.value)}
          className="min-h-[100px] dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
        />
      </div>
      
      <div className="space-y-2">
        <Label>Heading Level</Label>
        <Select value={props.level || 'h2'} onValueChange={(value) => onChange('level', value)}>
          <SelectTrigger className="dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="dark:bg-gray-700 dark:text-gray-100">
            <SelectItem value="h1">H1</SelectItem>
            <SelectItem value="h2">H2</SelectItem>
            <SelectItem value="h3">H3</SelectItem>
            <SelectItem value="h4">H4</SelectItem>
            <SelectItem value="h5">H5</SelectItem>
            <SelectItem value="h6">H6</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label>Text Align</Label>
        <Select value={props.textAlign || 'left'} onValueChange={(value) => onChange('textAlign', value)}>
          <SelectTrigger className="dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="dark:bg-gray-700 dark:text-gray-100">
            <SelectItem value="left">Left</SelectItem>
            <SelectItem value="center">Center</SelectItem>
            <SelectItem value="right">Right</SelectItem>
            <SelectItem value="justify">Justify</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label>Color</Label>
        <div className="flex items-center space-x-2">
          <Input
            type="color"
            value={props.color || '#000000'}
            onChange={(e) => onChange('color', e.target.value)}
            className="w-12 h-8 p-0 border-0 dark:bg-gray-700"
          />
          <Input
            type="text"
            value={props.color || '#000000'}
            onChange={(e) => onChange('color', e.target.value)}
            className="dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
          />
        </div>
      </div>
    </div>
  );
};

// Paragraph property editor
const ParagraphEditor: React.FC<PropertyEditorProps> = ({ props, onChange }) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Text</Label>
        <Textarea
          value={props.text || ''}
          onChange={(e) => onChange('text', e.target.value)}
          className="min-h-[100px] dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
        />
      </div>
      
      <div className="space-y-2">
        <Label>Text Align</Label>
        <Select value={props.textAlign || 'left'} onValueChange={(value) => onChange('textAlign', value)}>
          <SelectTrigger className="dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="dark:bg-gray-700 dark:text-gray-100">
            <SelectItem value="left">Left</SelectItem>
            <SelectItem value="center">Center</SelectItem>
            <SelectItem value="right">Right</SelectItem>
            <SelectItem value="justify">Justify</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label>Color</Label>
        <div className="flex items-center space-x-2">
          <Input
            type="color"
            value={props.color || '#333333'}
            onChange={(e) => onChange('color', e.target.value)}
            className="w-12 h-8 p-0 border-0 dark:bg-gray-700"
          />
          <Input
            type="text"
            value={props.color || '#333333'}
            onChange={(e) => onChange('color', e.target.value)}
            className="dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
          />
        </div>
      </div>
    </div>
  );
};

// Button property editor
const ButtonEditor: React.FC<PropertyEditorProps> = ({ props, onChange }) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Button Text</Label>
        <Input
          value={props.text || 'Button'}
          onChange={(e) => onChange('text', e.target.value)}
          className="dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
        />
      </div>
      
      <div className="space-y-2">
        <Label>Button Style</Label>
        <Select value={props.variant || 'primary'} onValueChange={(value) => onChange('variant', value)}>
          <SelectTrigger className="dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="dark:bg-gray-700 dark:text-gray-100">
            <SelectItem value="primary">Primary</SelectItem>
            <SelectItem value="secondary">Secondary</SelectItem>
            <SelectItem value="outline">Outline</SelectItem>
            <SelectItem value="ghost">Ghost</SelectItem>
            <SelectItem value="link">Link</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label>Link URL</Label>
        <Input
          value={props.url || '#'}
          onChange={(e) => onChange('url', e.target.value)}
          className="dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
        />
      </div>
      
      <div className="space-y-2">
        <Label>Text Align</Label>
        <Select value={props.textAlign || 'center'} onValueChange={(value) => onChange('textAlign', value)}>
          <SelectTrigger className="dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="dark:bg-gray-700 dark:text-gray-100">
            <SelectItem value="left">Left</SelectItem>
            <SelectItem value="center">Center</SelectItem>
            <SelectItem value="right">Right</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

// Image property editor
const ImageEditor: React.FC<PropertyEditorProps> = ({ props, onChange }) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Image URL</Label>
        <Input
          value={props.src || ''}
          onChange={(e) => onChange('src', e.target.value)}
          className="dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
        />
      </div>
      
      <div className="space-y-2">
        <Label>Alt Text</Label>
        <Input
          value={props.alt || ''}
          onChange={(e) => onChange('alt', e.target.value)}
          className="dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
        />
      </div>
      
      <div className="space-y-2">
        <Label>Width</Label>
        <Input
          value={props.width || '100%'}
          onChange={(e) => onChange('width', e.target.value)}
          className="dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
        />
      </div>
      
      <div className="space-y-2">
        <Label>Height</Label>
        <Input
          value={props.height || 'auto'}
          onChange={(e) => onChange('height', e.target.value)}
          className="dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
        />
      </div>
    </div>
  );
};

// Container property editor
const ContainerEditor: React.FC<PropertyEditorProps> = ({ props, onChange }) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Padding</Label>
        <Input
          value={props.padding || '16px'}
          onChange={(e) => onChange('padding', e.target.value)}
          className="dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
        />
      </div>
      
      <div className="space-y-2">
        <Label>Margin</Label>
        <Input
          value={props.margin || '0'}
          onChange={(e) => onChange('margin', e.target.value)}
          className="dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
        />
      </div>
      
      <div className="space-y-2">
        <Label>Background Color</Label>
        <div className="flex items-center space-x-2">
          <Input
            type="color"
            value={props.backgroundColor || '#ffffff'}
            onChange={(e) => onChange('backgroundColor', e.target.value)}
            className="w-12 h-8 p-0 border-0 dark:bg-gray-700"
          />
          <Input
            type="text"
            value={props.backgroundColor || '#ffffff'}
            onChange={(e) => onChange('backgroundColor', e.target.value)}
            className="dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label>Border Radius</Label>
        <Input
          value={props.borderRadius || '0'}
          onChange={(e) => onChange('borderRadius', e.target.value)}
          className="dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
        />
      </div>
      
      <div className="space-y-2">
        <Label>Max Width</Label>
        <Input
          value={props.maxWidth || '1200px'}
          onChange={(e) => onChange('maxWidth', e.target.value)}
          className="dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
        />
      </div>
    </div>
  );
};

// Section property editor
const SectionEditor: React.FC<PropertyEditorProps> = ({ props, onChange }) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Background Color</Label>
        <div className="flex items-center space-x-2">
          <Input
            type="color"
            value={props.backgroundColor || '#f9f9f9'}
            onChange={(e) => onChange('backgroundColor', e.target.value)}
            className="w-12 h-8 p-0 border-0 dark:bg-gray-700"
          />
          <Input
            type="text"
            value={props.backgroundColor || '#f9f9f9'}
            onChange={(e) => onChange('backgroundColor', e.target.value)}
            className="dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label>Padding</Label>
        <Input
          value={props.padding || '40px 0'}
          onChange={(e) => onChange('padding', e.target.value)}
          className="dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
        />
      </div>
    </div>
  );
};

// Grid property editor
const GridEditor: React.FC<PropertyEditorProps> = ({ props, onChange }) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Columns</Label>
        <Input
          type="number"
          min={1}
          max={12}
          value={props.columns || 2}
          onChange={(e) => onChange('columns', parseInt(e.target.value))}
          className="dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
        />
      </div>
      
      <div className="space-y-2">
        <Label>Gap</Label>
        <Input
          value={props.gap || '16px'}
          onChange={(e) => onChange('gap', e.target.value)}
          className="dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
        />
      </div>
    </div>
  );
};

// Register all property editors
export const PropertyEditors: Record<string, React.ComponentType<PropertyEditorProps>> = {
  Heading: HeadingEditor,
  Paragraph: ParagraphEditor,
  Button: ButtonEditor,
  Image: ImageEditor,
  Container: ContainerEditor,
  Section: SectionEditor,
  Grid: GridEditor,
};
