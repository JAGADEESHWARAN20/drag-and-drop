import React from 'react';
import { TextInput } from './PropertyEditorUtils';

// Define a type for table cell data
type TableCell = string | number | boolean | null;

interface TableProps {
     headers?: string[];
     rows?: TableCell[][];
}

interface TableEditorProps {
     props: TableProps;
     onChange: (key: keyof TableProps, value: any, isResponsive?: boolean) => void;
}

export const TableEditor = ({ props, onChange }: TableEditorProps) => {
     const handleHeadersChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          const headers = e.target.value.split(',').map((header) => header.trim());
          onChange('headers', headers);
     };

     const handleRowsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
          const rows = e.target.value.split('\n').map((row) =>
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
          <div>
               <div className="mb-3">
                    <label className="block text-sm font-medium mb-1 text-gray-700">
                         Headers (comma separated)
                    </label>
                    <TextInput
                         value={(props.headers || []).join(',')}
                         onChange={handleHeadersChange}
                         label="Headers"
                    />
               </div>
               <div className="mb-3">
                    <label className="block text-sm font-medium mb-1 text-gray-700">
                         Rows (one per line, cells comma separated)
                    </label>
                    <textarea
                         value={(props.rows || []).map((row) => row.join(',')).join('\n')}
                         onChange={handleRowsChange}
                         className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                         rows={5}
                    ></textarea>
               </div>
          </div>
     );
};