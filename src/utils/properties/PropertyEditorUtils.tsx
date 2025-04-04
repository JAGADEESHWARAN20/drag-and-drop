import React, { useState } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BaseProps {
  label: string;
  isResponsive?: boolean;
  className?: string;
}

interface TextInputProps extends BaseProps {
  value: string;
  onChange: (value: string) => void;
}

export const TextInput: React.FC<TextInputProps> = ({ value, onChange, label, isResponsive = false, className = '' }) => {
  return (
    <div className="mb-3 dark:text-white">
      <Label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
        {label}
        {isResponsive && <span className="ml-1 text-xs text-blue-600">(responsive)</span>}
      </Label>
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-200 dark:bg-opacity-20 text-black dark:text-white ${className}`}
      />
    </div>
  );
};

interface ColorPickerProps extends BaseProps {
  value: string;
  onChange: (color: string) => void;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ value, onChange, label, isResponsive = false, className = '' }) => {
  const [color, setColor] = useState(value);

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setColor(e.target.value);
    onChange(e.target.value);
  };

  return (
    <div className="mb-3 dark:text-white">
      <Label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
        {label}
        {isResponsive && <span className="ml-1 text-xs text-blue-600">(responsive)</span>}
      </Label>
      <div className="flex items-center">
        <div
          className="mr-2 h-8 w-8 rounded overflow-hidden"
          style={{ backgroundColor: color }}
        />
        <Input
          type="text"
          value={color}
          onChange={handleColorChange}
          className={`flex-1 px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-200 dark:bg-opacity-20 text-black dark:text-white ${className}`}
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

export const SelectInput: React.FC<SelectInputProps> = ({ value, onChange, label, options, isResponsive = false, className = '' }) => {
  return (
    <div className="mb-3 dark:text-white">
      <Label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
        {label}
        {isResponsive && <span className="ml-1 text-xs text-blue-600">(responsive)</span>}
      </Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-200 dark:bg-opacity-20 text-black dark:text-white ${className}`}>
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};