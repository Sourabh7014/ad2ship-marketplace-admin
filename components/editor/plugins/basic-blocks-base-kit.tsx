import {
  BaseBlockquotePlugin,
  BaseH1Plugin,
  BaseH2Plugin,
  BaseH3Plugin,
  BaseH4Plugin,
  BaseH5Plugin,
  BaseH6Plugin,
  BaseHorizontalRulePlugin,
} from "@platejs/basic-nodes";
import { BaseParagraphPlugin } from "platejs";

import { BlockquoteElement } from "@/components/plate-ui/blockquote-node";
import { H1Element } from "@/components/plate-ui/heading-node";
import { H2Element } from "@/components/plate-ui/heading-node";
import { H3Element } from "@/components/plate-ui/heading-node";
import { H4Element } from "@/components/plate-ui/heading-node";
import { H5Element } from "@/components/plate-ui/heading-node";
import { H6Element } from "@/components/plate-ui/heading-node";
import { HrElement } from "@/components/plate-ui/hr-node";
import { ParagraphElement } from "@/components/plate-ui/paragraph-node";

export const BaseBasicBlocksKit = [
  BaseParagraphPlugin.withComponent(ParagraphElement),
  BaseH1Plugin.withComponent(H1Element),
  BaseH2Plugin.withComponent(H2Element),
  BaseH3Plugin.withComponent(H3Element),
  BaseH4Plugin.withComponent(H4Element),
  BaseH5Plugin.withComponent(H5Element),
  BaseH6Plugin.withComponent(H6Element),
  BaseBlockquotePlugin.withComponent(BlockquoteElement),
  BaseHorizontalRulePlugin.withComponent(HrElement),
];
