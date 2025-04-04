import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ColorPicker } from './PropertyEditorUtils';

interface SectionProps {
  backgroundColor?: string;
  padding?: string;
}

interface SectionEditorProps {
  props: SectionProps;
  onChange: <K extends keyof SectionProps>(
    key: K,
    value: SectionProps[K],
    isResponsive?: boolean
  ) => void;
}

export const SectionEditor = ({ props, onChange }: SectionEditorProps) => {
  return (
    <div className="space-y-4 dark:text-white"> {/* Added dark mode text color to the container */}
      <div>
        <Label htmlFor="backgroundColor" className="dark:text-gray-300">Background Color</Label> {/* Added dark mode text color to label */}
        <ColorPicker
          label="Background Color"
          value={props.backgroundColor || '#f9f9f9'}
          onChange={(value) => onChange('backgroundColor', value)}
        />
      </div>

      <div>
        <Label htmlFor="padding" className="dark:text-gray-300">Padding</Label> {/* Added dark mode text color to label */}
        <Input
          id="padding"
          value={props.padding || '40px 0'}
          onChange={(e) => onChange('padding', e.target.value)}
          placeholder="Enter padding (e.g., 40px 0)"
          className="bg-white dark:bg-slate-200 dark:bg-opacity-20 text-black dark:text-white" // Added light and dark mode styling
        />
      </div>
    </div>
  );
};