import { useState } from "react";
import { ChatList } from "./ChatList";
import { ChatWindow } from "./ChatWindow";

export function ConversationsPanel() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <div className="flex h-[calc(100vh-0px)]">
      <ChatList selectedId={selectedId} onSelect={setSelectedId} />
      <ChatWindow contactId={selectedId} />
    </div>
  );
}
