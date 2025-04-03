import React from 'react';
import { Breakpoint } from '../../store/WebsiteStore';
import { TextInput } from './PropertyEditorUtils';

interface VideoProps {
  url?: string;
  width?: string;
  height?: string;
}

interface VideoEditorProps {
  props: VideoProps;
  onChange: (key: keyof VideoProps, value: any, isResponsive?: boolean) => void;
  breakpoint: Breakpoint;
}

export const VideoEditor = ({
  props,
  onChange,
  breakpoint,
}: VideoEditorProps) => {
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
