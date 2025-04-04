import React, { useState } from 'react';
import { Breakpoint } from '../../store/WebsiteStore';
import { TextInput, ColorPicker, SelectInput } from './PropertyEditorUtils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ContainerProps {
  padding?: string;
  margin?: string;
  backgroundColor?: string;
  borderRadius?: string;
  maxWidth?: string;
  display?: 'block' | 'flex' | 'grid' | 'inline-block' | 'inline';
  flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
  alignItems?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
}

interface ContainerEditorProps {
  props: ContainerProps;
  onChange: <K extends keyof ContainerProps>(
    key: K,
    value: ContainerProps[K],
    isResponsive?: boolean
  ) => void;
  breakpoint: Breakpoint;
}

export const ContainerEditor: React.FC<ContainerEditorProps> = ({
  props,
  onChange,
  breakpoint,
}) => {
  const isResponsive = breakpoint !== 'desktop';

  return (
    <div className="dark:text-white">
      <Tabs defaultValue="layout" className="w-full">
        <TabsList>
          <TabsTrigger value="layout">Layout</TabsTrigger>
          <TabsTrigger value="style">Style</TabsTrigger>
        </TabsList>
        <TabsContent value="layout">
          <div className="space-y-4">
            <SelectInput
              label="Display"
              value={props.display || 'block'}
              onChange={(value: 'block' | 'flex' | 'grid' | 'inline-block' | 'inline') => onChange('display', value, isResponsive)}
              options={[
                { value: 'block', label: 'Block' },
                { value: 'flex', label: 'Flex' },
                { value: 'grid', label: 'Grid' },
                { value: 'inline-block', label: 'Inline Block' },
                { value: 'inline', label: 'Inline' },
              ]}
              isResponsive={isResponsive}
            />
            {props.display === 'flex' && (
              <>
                <SelectInput
                  label="Flex Direction"
                  value={props.flexDirection || 'row'}
                  onChange={(value: 'row' | 'column' | 'row-reverse' | 'column-reverse') => onChange('flexDirection', value, isResponsive)}
                  options={[
                    { value: 'row', label: 'Row' },
                    { value: 'column', label: 'Column' },
                    { value: 'row-reverse', label: 'Row Reverse' },
                    { value: 'column-reverse', label: 'Column Reverse' },
                  ]}
                  isResponsive={isResponsive}
                />
                <SelectInput
                  label="Justify Content"
                  value={props.justifyContent || 'flex-start'}
                  onChange={(value: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly') => onChange('justifyContent', value, isResponsive)}
                  options={[
                    { value: 'flex-start', label: 'Flex Start' },
                    { value: 'flex-end', label: 'Flex End' },
                    { value: 'center', label: 'Center' },
                    { value: 'space-between', label: 'Space Between' },
                    { value: 'space-around', label: 'Space Around' },
                    { value: 'space-evenly', label: 'Space Evenly' },
                  ]}
                  isResponsive={isResponsive}
                />
                <SelectInput
                  label="Align Items"
                  value={props.alignItems || 'stretch'}
                  onChange={(value: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline') => onChange('alignItems', value, isResponsive)}
                  options={[
                    { value: 'flex-start', label: 'Flex Start' },
                    { value: 'flex-end', label: 'Flex End' },
                    { value: 'center', label: 'Center' },
                    { value: 'stretch', label: 'Stretch' },
                    { value: 'baseline', label: 'Baseline' },
                  ]}
                  isResponsive={isResponsive}
                />
              </>
            )}
            <TextInput
              label="Max Width"
              value={props.maxWidth ?? '1200px'}
              onChange={(value: string) => onChange('maxWidth', value, isResponsive)}
              isResponsive={isResponsive}
            />
            <TextInput
              label="Padding"
              value={props.padding ?? '16px'}
              onChange={(value: string) => onChange('padding', value, isResponsive)}
              isResponsive={isResponsive}
            />
            <TextInput
              label="Margin"
              value={props.margin ?? '0'}
              onChange={(value: string) => onChange('margin', value, isResponsive)}
              isResponsive={isResponsive}
            />
          </div>
        </TabsContent>
        <TabsContent value="style">
          <div className="space-y-4">
            <ColorPicker
              label="Background Color"
              value={props.backgroundColor ?? '#ffffff'}
              onChange={(value: string) => onChange('backgroundColor', value)}
            />
            <TextInput
              label="Border Radius"
              value={props.borderRadius ?? '0'}
              onChange={(value: string) => onChange('borderRadius', value)}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};