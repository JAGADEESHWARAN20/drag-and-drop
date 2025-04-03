import React from 'react';
import { HeadingEditor } from './properties/HeadingEditor';
import { ParagraphEditor } from './properties/ParagraphEditor';
import { ImageEditor } from './properties/ImageEditor';
import { LinkEditor } from './properties/LinkEditor';
import { ContainerEditor } from './properties/ContainerEditor';
import { SectionEditor } from './properties/SectionEditor';
import { RowEditor } from './properties/RowEditor';
import { ColumnEditor } from './properties/ColumnEditor';
import { FormEditor } from './properties/FormEditor';
import { ListEditor } from './properties/ListEditor';
import { TableEditor } from './properties/TableEditor';
import { VideoEditor } from './properties/VideoEditor';
import { DividerEditor } from './properties/DividerEditor';
import { Breakpoint } from '../store/WebsiteStore';


export type OnChangeHandler = (key: string, value: unknown) => void;

interface PropertyEditorProps {
  props: Record<string, unknown>;
  onChange: OnChangeHandler;
  breakpoint: Breakpoint;
  isResponsive?: boolean;
}

// Ensure ButtonEditorProps extends PropertyEditorProps and specifies ButtonProps for 'props'


export const PropertyEditors: {
  [key: string]: React.ComponentType<PropertyEditorProps>;
} = {
  Heading: HeadingEditor,
  Paragraph: ParagraphEditor,
  Image: ImageEditor,
  
  Link: LinkEditor,
  Container: ContainerEditor,
  Section: SectionEditor,
  Row: RowEditor,
  Column: ColumnEditor,
  Form: FormEditor,
  List: ListEditor,
  Table: TableEditor,
  Video: VideoEditor,
  Divider: DividerEditor,
};
