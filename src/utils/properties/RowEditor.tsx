// RowEditor.tsx
import React from 'react';
import { Breakpoint } from '../../store/WebsiteStore';
import { TextInput, SelectInput } from './PropertyEditorUtils';

interface RowProps {
     gap?: string;
     alignItems?: string;
     justifyContent?: string;
}

interface RowEditorProps {
     props: RowProps;
     onChange: (key: keyof RowProps, value: string, isResponsive?: boolean) => void;
     breakpoint: Breakpoint;
}

export const RowEditor = ({
     props,
     onChange,
     breakpoint,
}: RowEditorProps) => {
     const isResponsive = breakpoint !== 'desktop';

     const handleChange = (key: keyof RowProps, value: unknown, isResponsive?: boolean) => {
          let typedValue: string | number | HTMLElement;

          if (typeof value === 'string') {
               typedValue = value;
          } else if (typeof value === 'number') {
               typedValue = value.toString(); // Convert number to string to match expected type
          } else if (value instanceof HTMLElement) {
               console.warn(`Received a DOM element for ${key}, which is unexpected.`);
               return;
          } else {
               console.warn(`Unhandled value type for ${key}:`, value);
               return;
          }

          onChange(key, typedValue, isResponsive);
     };

     return (
          <div>
               <TextInput
                    label="Gap"
                    value={props.gap || '16px'}
                    onChange={(value) => handleChange('gap', value)}
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
                    onChange={(value) => handleChange('alignItems', value, isResponsive)}
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
                    onChange={(value) => handleChange('justifyContent', value, isResponsive)}
                    isResponsive={isResponsive}
               />
          </div>
     );
};
