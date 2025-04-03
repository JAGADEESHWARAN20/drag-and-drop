import React from 'react';
import { Breakpoint } from '../../store/WebsiteStore';
import { TextInput, SelectInput } from './PropertyEditorUtils';

export interface ButtonProps {
     text?: string;
     url?: string;
     variant?: string;
     textAlign?: string;
}
interface ButtonEditorProps {
     props: ButtonProps;
     onChange: (key: string, value: any, isResponsive?: boolean) => void;
     breakpoint: Breakpoint;
     isResponsive?: boolean;
}


export const ButtonEditor: React.FC<ButtonEditorProps> = ({ props, onChange }) => {
     return (
          <div>
               <TextInput label="Button Text" value={props.text || ''} onChange={(value) => onChange('text', value)} />
               <TextInput label="URL" value={props.url || '#'} onChange={(value) => onChange('url', value)} />
               <SelectInput
                    label="Variant"
                    value={props.variant || 'primary'}
                    onChange={(value) => onChange('variant', value)}
                    options={[
                         { value: 'primary', label: 'Primary' },
                         { value: 'secondary', label: 'Secondary' },
                         { value: 'success', label: 'Success' },
                         { value: 'danger', label: 'Danger' },
                         { value: 'outline', label: 'Outline' },
                    ]}
               />
               <SelectInput
                    label="Alignment"
                    value={props.textAlign || 'center'}
                    onChange={(value) => onChange('textAlign', value)}
                    options={[
                         { value: 'left', label: 'Left' },
                         { value: 'center', label: 'Center' },
                         { value: 'right', label: 'Right' },
                    ]}
               />
          </div>
     );
};