import type { Value } from "platejs";
import { Plate, PlateContent, usePlateEditor } from "platejs/react";
import { serializeHtml } from "platejs/static";
import { BaseEditorKit } from "./editor-base-kit";
import { FixedToolbar } from "../plate-ui/fixed-toolbar";
import { FixedToolbarButtons } from "../plate-ui/fixed-toolbar-buttons";

export interface EditorFieldProps {
  value?: Value;
  onChange?: (value: Value, html: string) => Promise<void>;
  placeholder?: string;
}

export function EditorField({
  value,
  onChange,
  placeholder = "Type here...",
  ...props
}: EditorFieldProps) {
  const editor = usePlateEditor({
    plugins: BaseEditorKit,
    
    value: value || [{ type: "p", children: [{ text: "" }] }],
  });

  
  

  return (
    <Plate
      editor={editor}
      onChange={async ({ value: nextValue }) => {
        const html = await serializeHtml(editor);
        onChange?.(nextValue, html);
      }}
      {...props}
    >
      <FixedToolbar>
        <FixedToolbarButtons />
      </FixedToolbar>
      <PlateContent placeholder={placeholder} />
    </Plate>
  );
}
