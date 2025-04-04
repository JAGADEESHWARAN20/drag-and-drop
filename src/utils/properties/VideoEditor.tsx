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
  onChange: <K extends keyof VideoProps>(
    key: K,
    value: VideoProps[K], // Use inferred type instead of 'any'
    isResponsive?: boolean
  ) => void;
  breakpoint: Breakpoint;
}

export const VideoEditor = ({
  props,
  onChange,
  breakpoint,
}: VideoEditorProps) => {
  const isResponsive = breakpoint !== 'desktop';

  return (
    <div className="dark:text-white"> {/* Added dark mode text color to the container */}
      <TextInput
        label="Video URL"
        value={props.url || ''}
        onChange={(value) => onChange('url', value)}
        className="bg-white dark:bg-slate-200 dark:bg-opacity-20 text-black dark:text-white" // Added light and dark mode styling
      />
      <TextInput
        label="Width"
        value={props.width || '100%'}
        onChange={(value) => onChange('width', value, isResponsive)}
        isResponsive={isResponsive}
        className="bg-white dark:bg-slate-200 dark:bg-opacity-20 text-black dark:text-white" // Added light and dark mode styling
      />
      <TextInput
        label="Height"
        value={props.height || '315'}
        onChange={(value) => onChange('height', value, isResponsive)}
        isResponsive={isResponsive}
        className="bg-white dark:bg-slate-200 dark:bg-opacity-20 text-black dark:text-white" // Added light and dark mode styling
      />
    </div>
  );
};