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
     onChange: <K extends keyof DividerProps>(
          key: K,
          value: DividerProps[K],
          isResponsive?: boolean
     ) => void;
}

export const DividerEditor = ({ props, onChange }: DividerEditorProps) => {
     return (
          <div className="dark:text-white"> {/* Added dark mode text color to the container */}
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