import React from 'react';

interface BaseProps {
  label: string;
  isResponsive?: boolean;
}

interface TextInputProps extends BaseProps {
  value: string;
  onChange: (value: string) => void;
}

export const TextInput: React.FC<TextInputProps> = ({ value, onChange, label, isResponsive = false }) => {
  return (
    <div className="mb-3">
      <label className="block text-sm font-medium mb-1 text-gray-700">
        {label}
        {isResponsive && <span className="ml-1 text-xs text-blue-600">(responsive)</span>}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
  );
};

interface ColorPickerProps extends BaseProps {
  value: string;
  onChange: (color: string) => void;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ value, onChange, label, isResponsive = false }) => {
  return (
    <div className="mb-3">
      <label className="block text-sm font-medium mb-1 text-gray-700">
        {label}
        {isResponsive && <span className="ml-1 text-xs text-blue-600">(responsive)</span>}
      </label>
      <div className="flex">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="mr-2 h-8 w-8 rounded overflow-hidden"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
    </div>
  );
};

interface SelectInputProps extends BaseProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}

export const SelectInput: React.FC<SelectInputProps> = ({ value, onChange, label, options, isResponsive = false }) => {
  return (
    <div className="mb-3">
      <label className="block text-sm font-medium mb-1 text-gray-700">
        {label}
        {isResponsive && <span className="ml-1 text-xs text-blue-600">(responsive)</span>}
      </label>
      <select
        value={value}
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
