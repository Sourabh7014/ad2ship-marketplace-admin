import {
  BaseCodeBlockPlugin,
  BaseCodeLinePlugin,
  BaseCodeSyntaxPlugin,
} from "@platejs/code-block";
import { all, createLowlight } from "lowlight";

import {
  CodeBlockElement,
  CodeLineElement,
  CodeSyntaxLeaf,
} from "@/components/plate-ui/code-block-node";

const lowlight = createLowlight(all);

export const BaseCodeBlockKit = [
  BaseCodeBlockPlugin.configure({
    node: { component: CodeBlockElement },
    options: { lowlight },
  }),
  BaseCodeLinePlugin.withComponent(CodeLineElement),
  BaseCodeSyntaxPlugin.withComponent(CodeSyntaxLeaf),
];
