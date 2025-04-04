import React from "react";
import { Breakpoint, useWebsiteStore } from "../../store/WebsiteStore";
import { TextInput, SelectInput, ColorPicker } from "./PropertyEditorUtils";

export const HeadingEditor = () => {
  const selectedComponentId = useWebsiteStore((state) => state.selectedComponentId);
  const updateComponentProps = useWebsiteStore((state) => state.updateComponentProps);
  const selectedComponent = useWebsiteStore((state) =>
    state.components.find((c) => c.id === selectedComponentId)
  );

  // Ensure editor only shows when a heading is selected
  if (!selectedComponent || selectedComponent.type !== "Heading") {
    return null;
  }

  return (
    <div className="dark:text-white"> {/* Added dark mode text color to the container */}
      <TextInput
        label="Text"
        value={String(selectedComponent.props.text || "")} // Ensure it's a string
        onChange={(value) => updateComponentProps(selectedComponent.id, { text: value })}
      />

      <SelectInput
        label="Heading Level"
        value={String(selectedComponent.props.level || "h2")} // Convert to string
        onChange={(value) => updateComponentProps(selectedComponent.id, { level: value })}
        options={[
          { value: "h1", label: "H1" },
          { value: "h2", label: "H2" },
          { value: "h3", label: "H3" },
          { value: "h4", label: "H4" },
          { value: "h5", label: "H5" },
          { value: "h6", label: "H6" },
        ]}
      />

      <SelectInput
        label="Text Align"
        value={String(selectedComponent.props.textAlign || "left")}
        onChange={(value) => updateComponentProps(selectedComponent.id, { textAlign: value })}
        options={[
          { value: "left", label: "Left" },
          { value: "center", label: "Center" },
          { value: "right", label: "Right" },
        ]}
      />

      <ColorPicker
        label="Color"
        value={String(selectedComponent.props.color || "#000000")} // Ensure color is a string
        onChange={(value) => updateComponentProps(selectedComponent.id, { color: value })}
      />
    </div>
  );
};