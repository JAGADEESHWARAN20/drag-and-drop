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