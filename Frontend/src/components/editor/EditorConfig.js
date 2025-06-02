import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListItemNode, ListNode } from "@lexical/list";
import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { TableNode, TableCellNode, TableRowNode } from "@lexical/table";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { HorizontalRuleNode } from "@lexical/react/LexicalHorizontalRuleNode";
import { MarkNode } from "@lexical/mark";

export const BLOCK_TYPES = [
  { label: 'Text', type: 'paragraph', icon: 'text' },
  { label: 'Heading 1', type: 'h1', icon: 'h1' },
  { label: 'Heading 2', type: 'h2', icon: 'h2' },
  { label: 'Heading 3', type: 'h3', icon: 'h3' },
  { label: 'Bullet List', type: 'bullet', icon: 'ul' },
  { label: 'Numbered List', type: 'number', icon: 'ol' },
  { label: 'To-do List', type: 'check', icon: 'checkbox' },
  { label: 'Toggle List', type: 'toggle', icon: 'toggle' },
  { label: 'Quote', type: 'quote', icon: 'quote' },
  { label: 'Code', type: 'code', icon: 'code' },
  { label: 'Divider', type: 'divider', icon: 'divider' },
  { label: 'Table', type: 'table', icon: 'table' },
];

export const INLINE_FORMATS = [
  { label: 'Bold', format: 'bold', icon: 'bold' },
  { label: 'Italic', format: 'italic', icon: 'italic' },
  { label: 'Underline', format: 'underline', icon: 'underline' },
  { label: 'Strikethrough', format: 'strikethrough', icon: 'strikethrough' },
  { label: 'Code', format: 'code', icon: 'code' },
  { label: 'Link', format: 'link', icon: 'link' },
];

export const EDITOR_NODES = [
  HeadingNode,
  ListNode,
  ListItemNode,
  QuoteNode,
  CodeNode,
  CodeHighlightNode,
  TableNode,
  TableCellNode,
  TableRowNode,
  AutoLinkNode,
  LinkNode,
  HorizontalRuleNode,
  MarkNode,
];

export const theme = {
  text: {
    bold: 'font-bold',
    italic: 'italic',
    underline: 'underline',
    strikethrough: 'line-through',
    code: 'bg-gray-100 p-0.5 rounded font-mono text-sm',
    link: 'text-blue-600 hover:underline',
  },
  heading: {
    h1: 'text-3xl font-bold my-4',
    h2: 'text-2xl font-semibold my-3',
    h3: 'text-xl font-medium my-2',
  },
  paragraph: 'my-2 leading-relaxed',
  quote: 'border-l-4 border-gray-300 pl-4 py-1 my-2 text-gray-600 italic',
  list: {
    listitem: 'ml-6 my-1',
    nested: {
      listitem: 'list-none',
    },
    ol: 'list-decimal',
    ul: 'list-disc',
    checklist: 'list-none',
  },
  code: 'bg-gray-100 p-4 rounded-md my-2 block font-mono text-sm overflow-x-auto',
  table: 'border-collapse w-full my-4',
  tableCell: 'border border-gray-200 p-2',
  tableCellHeader: 'bg-gray-50 font-semibold',
  divider: 'border-t border-gray-200 my-4',
  image: 'max-w-full h-auto rounded my-4',
};

export const editorConfig = {
  namespace: 'NotionEditor',
  theme: theme,
  nodes: EDITOR_NODES,
  onError: (error) => {
    console.error(error);
  },
};

export const FORMAT_TEXT_COMMAND = 'format_text';
export const INSERT_TABLE_COMMAND = 'insert_table';
export const INSERT_IMAGE_COMMAND = 'insert_image';
export const INSERT_DIVIDER_COMMAND = 'insert_divider';
export const TOGGLE_CHECKBOX_COMMAND = 'toggle_checkbox';
