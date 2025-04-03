import React from 'react';
import { Breakpoint } from '../../store/WebsiteStore';
import { TextInput, SelectInput } from './PropertyEditorUtils';

interface ColumnProps {
  width?: string;
  padding?: string;
}

interface ColumnEditorProps {
  props: ColumnProps;
  onChange: (key: keyof ColumnProps, value: any, isResponsive?: boolean) => void;
  breakpoint: Breakpoint;
}

export const ColumnEditor = ({
  props,
  onChange,
  breakpoint,
}: ColumnEditorProps) => {
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