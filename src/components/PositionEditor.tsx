
import React from 'react';
import {
     Select,
     SelectContent,
     SelectItem,
     SelectTrigger,
     SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PositionType } from './DroppableContainer';

interface Position {
     type: PositionType;
     top?: string;
     left?: string;
     right?: string;
     bottom?: string;
     zIndex?: string;
}

const PositionEditor = ({
     position,
     onChange,
}: {
     position: Position | undefined;
     onChange: (newPosition: Position) => void;
}) => {
     const defaultPosition: Position = position || { type: 'relative' };

     const handlePositionTypeChange = (value: string) => {
          onChange({
               ...defaultPosition,
               type: value as PositionType,
          });
     };

     const handlePositionValueChange = (property: string, value: string) => {
          onChange({
               ...defaultPosition,
               [property]: value,
          });
     };

     return (
          <div className="space-y-4">
               <div className="space-y-2">
                    <Label>Position Type</Label>
                    <Select value={defaultPosition.type} onValueChange={handlePositionTypeChange}>
                         <SelectTrigger className="dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600">
                              <SelectValue placeholder="Select position type" />
                         </SelectTrigger>
                         <SelectContent className="dark:bg-gray-700 dark:text-gray-100">
                              <SelectItem value="relative">Relative</SelectItem>
                              <SelectItem value="absolute">Absolute</SelectItem>
                              <SelectItem value="fixed">Fixed</SelectItem>
                              <SelectItem value="sticky">Sticky</SelectItem>
                         </SelectContent>
                    </Select>
               </div>

               {(defaultPosition.type === 'absolute' ||
                    defaultPosition.type === 'fixed' ||
                    defaultPosition.type === 'sticky') && (
                         <>
                              <div className="grid grid-cols-2 gap-2">
                                   <div className="space-y-2">
                                        <Label>Top</Label>
                                        <Input
                                             type="text"
                                             value={defaultPosition.top || ''}
                                             onChange={(e) => handlePositionValueChange('top', e.target.value)}
                                             placeholder="e.g., 10px"
                                             className="dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                                        />
                                   </div>
                                   <div className="space-y-2">
                                        <Label>Left</Label>
                                        <Input
                                             type="text"
                                             value={defaultPosition.left || ''}
                                             onChange={(e) => handlePositionValueChange('left', e.target.value)}
                                             placeholder="e.g., 10px"
                                             className="dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                                        />
                                   </div>
                              </div>

                              <div className="grid grid-cols-2 gap-2">
                                   <div className="space-y-2">
                                        <Label>Bottom</Label>
                                        <Input
                                             type="text"
                                             value={defaultPosition.bottom || ''}
                                             onChange={(e) => handlePositionValueChange('bottom', e.target.value)}
                                             placeholder="e.g., 10px"
                                             className="dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                                        />
                                   </div>
                                   <div className="space-y-2">
                                        <Label>Right</Label>
                                        <Input
                                             type="text"
                                             value={defaultPosition.right || ''}
                                             onChange={(e) => handlePositionValueChange('right', e.target.value)}
                                             placeholder="e.g., 10px"
                                             className="dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                                        />
                                   </div>
                              </div>

                              <div className="space-y-2">
                                   <Label>Z-Index</Label>
                                   <Input
                                        type="text"
                                        value={defaultPosition.zIndex || ''}
                                        onChange={(e) => handlePositionValueChange('zIndex', e.target.value)}
                                        placeholder="e.g., 10"
                                        className="dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                                   />
                              </div>
                         </>
                    )}
          </div>
     );
};

export default PositionEditor;
