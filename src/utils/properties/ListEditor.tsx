
import {  SelectInput } from './PropertyEditorUtils';

interface ListProps {
  type?: 'ul' | 'ol';
  items?: string[];
}

interface ListEditorProps {
  props: ListProps;
  onChange: (key: keyof ListProps, value: string | string[], isResponsive?: boolean) => void;
}

export const ListEditor = ({ props, onChange }: ListEditorProps) => {
  return (
    <div className="dark:text-white"> {/* Added dark mode text color to the container */}
      <SelectInput
        label="List Type"
        value={props.type || 'ul'}
        options={[
          { value: 'ul', label: 'Bullet (ul)' },
          { value: 'ol', label: 'Numbered (ol)' },
        ]}
        onChange={(value) => onChange('type', value)}
        className="bg-white dark:bg-slate-200 dark:bg-opacity-20 text-black dark:text-white" // Added light and dark mode styling
      />
      <div className="mb-3">
        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"> {/* Added dark mode text color to label */}
          Items (one per line)
        </label>
        <textarea
          value={(props.items || []).join('\n')}
          onChange={(e) => onChange('items', e.target.value.split('\n'))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-200 dark:bg-opacity-20 text-black dark:text-white" // Added light and dark mode styling
          rows={5}
        ></textarea>
      </div>
    </div>
  );
};