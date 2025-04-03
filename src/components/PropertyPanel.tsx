// import React, { useState } from 'react';
// import { useWebsiteStore, Breakpoint } from '../store/WebsiteStore';
// import { PropertyEditors } from '../utils/PropertyEditors';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { PositionType } from './DroppableContainer';
// import { Button } from '@/components/ui/button';

// const PositionEditor = ({
//   position,
//   onChange,
// }: {
//   position:
//   | {
//     type: PositionType;
//     top?: string;
//     left?: string;
//     right?: string;
//     bottom?: string;
//     zIndex?: string;
//   }
//   | undefined;
//   onChange: (newPosition: any) => void;
// }) => {
//   // ... (PositionEditor code) ...
// };

// const PropertyPanel = () => {
//   const {
//     components,
//     selectedComponentId,
//     updateComponentProps,
//     updateResponsiveProps,
//     breakpoint,
//   } = useWebsiteStore();

//   const [activeTab, setActiveTab] = useState<string>('general');

//   const selectedComponent = components.find(
//     (component) => component.id === selectedComponentId
//   );

//   if (!selectedComponent) {
//     return (
//       <div className="p-4 h-full border-l border-gray-200">
//         <p className="text-gray-500">No component selected</p>
//         <p className="text-gray-400 text-sm mt-2">
//           Click on a component in the canvas to edit its properties
//         </p>
//       </div>
//     );
//   }

//   const PropertyEditor = PropertyEditors[selectedComponent.type];

//   const regularProps = selectedComponent.props || {};
//   const responsiveProps = selectedComponent.responsiveProps?.[breakpoint] || {};
//   const mergedProps = { ...regularProps, ...responsiveProps };

//   const handlePropertyChange = (key: string, value: any, isResponsive = false) => {
//     if (isResponsive) {
//       updateResponsiveProps(selectedComponentId, breakpoint, { [key]: value });
//     } else {
//       updateComponentProps(selectedComponentId, { [key]: value });
//     }
//   };

//   const handlePositionChange = (position: any) => {
//     updateComponentProps(selectedComponentId, { position });
//   };

//   const handleTextWrapChange = (value: boolean) => {
//     handlePropertyChange('wrap', value);
//   };

//   const handleDeviceWidthChange = (device: Breakpoint, width: string) => {
//     updateResponsiveProps(selectedComponentId, device, { width });
//   };

//   // New Style Properties
//   const handleStyleChange = (key: string, value: string, isResponsive = false) => {
//     handlePropertyChange(`style.${key}`, value, isResponsive);
//   };


//   return (
//     <div className="p-4 h-full overflow-y-auto border-l border-gray-200">
//       <h2 className="text-lg font-semibold mb-4">Properties</h2>
//       <div className="mb-4">
//         <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
//           {selectedComponent.type}
//         </span>
//       </div>
//       <TabsContent value="general">
//         {PropertyEditor ? (
//           <>
//             {selectedComponent.type === 'Text' && (
//               <div className="mb-4">
//                 <Label>Text Wrap</Label>
//                 <Button
//                   variant={mergedProps.wrap ? 'default' : 'outline'}
//                   onClick={() => handleTextWrapChange(!mergedProps.wrap)}
//                 >
//                   {mergedProps.wrap ? 'Wrap' : 'No Wrap'}
//                 </Button>
//               </div>
//             )}
//             <PropertyEditor
//               props={mergedProps}
//               onChange={handlePropertyChange}
//               breakpoint={breakpoint}
//             />
//           </>
//         ) : (
//           <p className="text-gray-500">No properties available for this component</p>
//         )}
//       </TabsContent>

//       <TabsContent value="position">
//         <PositionEditor
//           position={selectedComponent.props.position}
//           onChange={handlePositionChange}
//         />
//       </TabsContent>

//       <TabsContent value="responsive">
//         <div className="p-2 bg-amber-50 rounded mb-4 text-xs">
//           Responsive props override default props for {breakpoint} breakpoint
//         </div>
//         {PropertyEditor ? (
//           <>
//             {selectedComponent.type === 'Image' && (
//               <div className="mb-4">
//                 <Label>Width (Responsive)</Label>
//                 <div className="grid grid-cols-3 gap-2">
//                   {['mobile', 'tablet', 'desktop'].map((device) => (
//                     <div key={device} className="space-y-2">
//                       <Label>{device}</Label>
//                       <Input
//                         type="text"
//                         value={
//                           selectedComponent.responsiveProps?.[device]?.width ||
//                           selectedComponent.props.width ||
//                           ''
//                         }
//                         onChange={(e) =>
//                           handleDeviceWidthChange(device as Breakpoint, e.target.value)
//                         }
//                       />
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {/* New Style Properties Inputs */}
//             <div className="mb-4">
//               <Label>Background Color</Label>
//               <Input
//                 type="color"
//                 value={mergedProps?.style?.backgroundColor || ''}
//                 onChange={(e) => handleStyleChange('backgroundColor', e.target.value, false)}
//               />
//             </div>

//             <div className="mb-4">
//               <Label>Font Size</Label>
//               <Input
//                 type="text"
//                 value={mergedProps?.style?.fontSize || ''}
//                 onChange={(e) => handleStyleChange('fontSize', e.target.value, false)}
//               />
//             </div>

//             <div className="mb-4">
//               <Label>Padding</Label>
//               <Input
//                 type="text"
//                 value={mergedProps?.style?.padding || ''}
//                 onChange={(e) => handleStyleChange('padding', e.target.value, false)}
//               />
//             </div>

//             {/* Add more style properties as needed */}

//             <PropertyEditor
//               props={responsiveProps}
//               onChange={(key, value) => handlePropertyChange(key, value, true)}
//               breakpoint={breakpoint}
//               isResponsive={true}
//             />
//           </>
//         ) : (
//           <p className="text-gray-500">No responsive properties available</p>
//         )}
//       </TabsContent>
//     </div>
//   );
// };

// export default PropertyPanel;

import React, { useState } from 'react';
import { useWebsiteStore, Breakpoint } from '../store/WebsiteStore';
import { PropertyEditors } from '../utils/PropertyEditors';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PositionEditor from './PositionEditor'; // Correct import
import { Button } from '@/components/ui/button';

const PropertyPanel = () => {
    const {
      components,
      selectedComponentId,
      updateComponentProps,
      updateResponsiveProps,
      breakpoint,
    } = useWebsiteStore();

    const [activeTab, setActiveTab] = useState<string>('general');

    const selectedComponent = components.find(
      (component) => component.id === selectedComponentId
    );

    if (!selectedComponent) {
      return (
        <div className="p-4 h-full border-l border-gray-200">
          <p className="text-gray-500">No component selected</p>
          <p className="text-gray-400 text-sm mt-2">
            Click on a component in the canvas to edit its properties
          </p>
        </div>
      );
    }

    const PropertyEditor = PropertyEditors[selectedComponent.type];

    const regularProps = selectedComponent.props || {};
    const responsiveProps = selectedComponent.responsiveProps?.[breakpoint] || {};
    const mergedProps = { ...regularProps, ...responsiveProps };

    const handlePropertyChange = (key: string, value: any, isResponsive = false) => {
      if (isResponsive) {
        updateResponsiveProps(selectedComponentId, breakpoint, { [key]: value });
      } else {
        updateComponentProps(selectedComponentId, { [key]: value });
      }
    };

    const handlePositionChange = (position: any) => {
      updateComponentProps(selectedComponentId, { position });
    };

    const handleTextWrapChange = (value: boolean) => {
      handlePropertyChange('wrap', value);
    };

    const handleDeviceWidthChange = (device: Breakpoint, width: string) => {
      updateResponsiveProps(selectedComponentId, device, { width });
    };

    // New Style Properties
    const handleStyleChange = (key: string, value: string, isResponsive = false) => {
      handlePropertyChange(`style.${key}`, value, isResponsive);
    };


  return (
    <div className="p-4 h-full overflow-y-auto border-l border-gray-200">
      <h2 className="text-lg font-semibold mb-4">Properties</h2>
      <div className="mb-4">
        <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
          {selectedComponent.type}
        </span>
      </div>

      <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full mb-4">
          <TabsTrigger value="general" className="flex-1">
            General
          </TabsTrigger>
          <TabsTrigger value="position" className="flex-1">
            Position
          </TabsTrigger>
          <TabsTrigger value="responsive" className="flex-1">
            Responsive
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          {PropertyEditor ? (
            <>
              {selectedComponent.type === 'Text' && (
                <div className="mb-4">
                  <Label>Text Wrap</Label>
                  <Button
                    variant={mergedProps.wrap ? 'default' : 'outline'}
                    onClick={() => handleTextWrapChange(!mergedProps.wrap)}
                  >
                    {mergedProps.wrap ? 'Wrap' : 'No Wrap'}
                  </Button>
                </div>
              )}
              <PropertyEditor
                props={mergedProps}
                onChange={handlePropertyChange}
                breakpoint={breakpoint}
              />
            </>
          ) : (
            <p className="text-gray-500">No properties available for this component</p>
          )}
        </TabsContent>

        <TabsContent value="position">
          <PositionEditor // Correct usage
            position={selectedComponent.props.position}
            onChange={handlePositionChange}
          />
        </TabsContent>

        <TabsContent value="responsive">
          {/* ... (rest of responsive content) ... */}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PropertyPanel;