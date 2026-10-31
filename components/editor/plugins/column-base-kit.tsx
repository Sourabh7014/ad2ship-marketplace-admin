import { BaseColumnItemPlugin, BaseColumnPlugin } from "@platejs/layout";

import {
  ColumnElement,
  ColumnGroupElement,
} from "@/components/plate-ui/column-node";

export const BaseColumnKit = [
  BaseColumnPlugin.withComponent(ColumnGroupElement),
  BaseColumnItemPlugin.withComponent(ColumnElement),
];
