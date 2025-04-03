import React from 'react';

interface TextInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; // Change here
  label: string;
  isResponsive?: boolean;
}

export const TextInput = ({ value, onChange, label, isResponsive = false }: TextInputProps) => {
  return (
    <div className="mb-3">
      <label className="block text-sm font-medium mb-1 text-gray-700">
        {label}
        {isResponsive && <span className="ml-1 text-xs text-blue-600">(responsive)</span>}
      </label>
      <input
        type="text"
        value={value || ''}
        onChange={onChange} // Pass the event handler directly
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
  );
};

export const ColorPicker = ({ value, onChange, label, isResponsive = false }: { value: string; onChange: (color: string) => void; label: string; isResponsive?: boolean }) => {
  return (
    <div className="mb-3">
      <label className="block text-sm font-medium mb-1 text-gray-700">
        {label}
        {isResponsive && <span className="ml-1 text-xs text-blue-600">(responsive)</span>}
      </label>
      <div className="flex">
        <input
          type="color"
          value={value || '#000000'}
          onChange={(e) => onChange(e.target.value)}
          className="mr-2 h-8 w-8 rounded overflow-hidden"
        />
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
    </div>
  );
};

export const SelectInput = ({
  value,
  onChange,
  label,
  options,
  isResponsive = false,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
  options: { value: string; label: string }[];
  isResponsive?: boolean;
}) => {
  return (
    <div className="mb-3">
      <label className="block text-sm font-medium mb-1 text-gray-700">
        {label}
        {isResponsive && <span className="ml-1 text-xs text-blue-600">(responsive)</span>}
      </label>
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};