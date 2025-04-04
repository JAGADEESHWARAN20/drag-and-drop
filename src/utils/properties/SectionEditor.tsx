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
    <div className="space-y-4">
      <div>
        <Label htmlFor="backgroundColor">Background Color</Label>
        <ColorPicker
          label="Background Color"
          value={props.backgroundColor || '#f9f9f9'}
          onChange={(value) => onChange('backgroundColor', value)}
        />
      </div>

      <div>
        <Label htmlFor="padding">Padding</Label>
        <Input
          id="padding"
          value={props.padding || '40px 0'}
          onChange={(e) => onChange('padding', e.target.value)}
          placeholder="Enter padding (e.g., 40px 0)"
        />
      </div>
    </div>
  );
};
