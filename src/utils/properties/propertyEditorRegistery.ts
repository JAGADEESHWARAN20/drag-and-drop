import { ButtonEditor } from './ButtonEditor';
import { ColumnEditor } from './ColumnEditor';
import { ContainerEditor } from './ContainerEditor';
import { DividerEditor } from './DividerEditor';
import { FormEditor } from './FormEditor';
import { HeadingEditor } from './HeadingEditor';
import { ImageEditor } from './ImageEditor';
import { LinkEditor } from './LinkEditor';
import { ListEditor } from './ListEditor';
import { ParagraphEditor } from './ParagraphEditor';
import { RowEditor } from './RowEditor';
import { SectionEditor } from './SectionEditor';
import { TableEditor } from './TableEditor';
import { VideoEditor } from './VideoEditor';

export const propertyEditorRegistry = {
     Button: ButtonEditor,
     Column: ColumnEditor,
     Container: ContainerEditor,
     Divider: DividerEditor,
     Form: FormEditor,
     Heading: HeadingEditor,
     Image: ImageEditor,
     Link: LinkEditor,
     List: ListEditor,
     Paragraph: ParagraphEditor,
     Row: RowEditor,
     Section: SectionEditor,
     Table: TableEditor,
     Video: VideoEditor,
};