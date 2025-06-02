import { ListPlugin as LexicalListPlugin } from "@lexical/react/LexicalListPlugin";
import { ListItemNode, ListNode } from "@lexical/list";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

export default function ListPlugin() {
  const [editor] = useLexicalComposerContext();

  return <LexicalListPlugin />;
}
