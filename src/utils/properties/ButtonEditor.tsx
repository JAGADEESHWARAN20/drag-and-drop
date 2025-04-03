import React, { ChangeEvent } from 'react';
import { Breakpoint } from '../../store/WebsiteStore';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface ButtonProps {
     text?: string;
     url?: string;
     variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'outline';
     textAlign?: 'left' | 'center' | 'right';
}

interface ButtonEditorProps {
     props: ButtonProps;
     onChange: (key: keyof ButtonProps, value: string) => void;
     breakpoint: Breakpoint;
     isResponsive?: boolean;
}

export const ButtonEditor: React.FC<ButtonEditorProps> = ({ props, onChange }) => {
     const handleTextChange = (event: ChangeEvent<HTMLInputElement>) => {
          onChange('text', event.target.value);
     };

     const handleUrlChange = (event: ChangeEvent<HTMLInputElement>) => {
          onChange('url', event.target.value);
     };

     const handleVariantChange = (value: string) => {
          onChange('variant', value);
     };

     const handleTextAlignChange = (value: string) => {
          onChange('textAlign', value);
     };

     return (
          <div>
               <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="text">Button Text</Label>
                    <Input type="text" id="text" value={props.text || ''} onChange={handleTextChange} />
               </div>

               <div className="grid w-full max-w-sm items-center gap-1.5 mt-2">
                    <Label htmlFor="url">URL</Label>
                    <Input type="text" id="url" value={props.url || '#'} onChange={handleUrlChange} />
               </div>

               <div className="grid w-full max-w-sm items-center gap-1.5 mt-2">
                    <Label htmlFor="variant">Variant</Label>
                    <Select value={props.variant || 'primary'} onValueChange={handleVariantChange}>
                         <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Select a variant" />
                         </SelectTrigger>
                         <SelectContent>
                              <SelectItem value="primary">Primary</SelectItem>
                              <SelectItem value="secondary">Secondary</SelectItem>
                              <SelectItem value="success">Success</SelectItem>
                              <SelectItem value="danger">Danger</SelectItem>
                              <SelectItem value="outline">Outline</SelectItem>
                         </SelectContent>
                    </Select>
               </div>

               <div className="grid w-full max-w-sm items-center gap-1.5 mt-2">
                    <Label htmlFor="textAlign">Alignment</Label>
                    <Select value={props.textAlign || 'center'} onValueChange={handleTextAlignChange}>
                         <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Select alignment" />
                         </SelectTrigger>
                         <SelectContent>
                              <SelectItem value="left">Left</SelectItem>
                              <SelectItem value="center">Center</SelectItem>
                              <SelectItem value="right">Right</SelectItem>
                         </SelectContent>
                    </Select>
               </div>
          </div>
     );
};