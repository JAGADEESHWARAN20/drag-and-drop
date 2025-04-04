import React from 'react';
import { Breakpoint } from '../../store/WebsiteStore';
import { TextInput } from './PropertyEditorUtils';

interface ImageProps {
  src?: string;
  alt?: string;
  width?: string;
  height?: string;
}

interface ImageEditorProps {
  props: ImageProps;
  onChange: (key: keyof ImageProps, value: string, isResponsive?: boolean) => void;
  breakpoint: Breakpoint;
  isResponsive?: boolean;
}

export const ImageEditor = ({
  props,
  onChange,
  breakpoint,
  isResponsive,
}: ImageEditorProps) => {
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
