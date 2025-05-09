import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

// Define a type for table cell data
type TableCell = string | number | boolean | null;

interface TableProps {
     headers?: string[];
     rows?: TableCell[][];
}

interface TableEditorProps {
     props: TableProps;
     onChange: <K extends keyof TableProps>(
          key: K,
          value: TableProps[K],
          isResponsive?: boolean
     ) => void;
}

export const TableEditor = ({ props, onChange }: TableEditorProps) => {
     const handleHeadersChange = (value: string) => {
          const headers = value.split(',').map((header) => header.trim());
          onChange('headers', headers);
     };

     const handleRowsChange = (value: string) => {
          const rows = value.split('\n').map((row) =>
               row.split(',').map((cell) => {
                    const trimmedCell = cell.trim();
                    if (trimmedCell === '') return null;
                    if (!isNaN(Number(trimmedCell))) return Number(trimmedCell);
                    if (trimmedCell.toLowerCase() === 'true') return true;
                    if (trimmedCell.toLowerCase() === 'false') return false;
                    return trimmedCell;
               })
          );
          onChange('rows', rows);
     };

     return (
          <div className="space-y-4 dark:text-white"> {/* Added dark mode text color to the container */}
               <div>
                    <Label htmlFor="headers" className="dark:text-gray-300">Headers (comma separated)</Label> {/* Added dark mode text color to label */}
                    <Input
                         id="headers"
                         value={(props.headers || []).join(',')}
                         onChange={(e) => handleHeadersChange(e.target.value)}
                         placeholder="Enter headers, separated by commas"
                         className="bg-white dark:bg-slate-200 dark:bg-opacity-20 text-black dark:text-white" // Added light and dark mode styling
                    />
               </div>

               <div>
                    <Label htmlFor="rows" className="dark:text-gray-300">Rows (one per line, cells comma separated)</Label> {/* Added dark mode text color to label */}
                    <Textarea
                         id="rows"
                         value={(props.rows || []).map((row) => row.join(',')).join('\n')}
                         onChange={(e) => handleRowsChange(e.target.value)}
                         placeholder="Enter rows, one per line"
                         rows={5}
                         className="bg-white dark:bg-slate-200 dark:bg-opacity-20 text-black dark:text-white" // Added light and dark mode styling
                    />
               </div>
          </div>
     );
};