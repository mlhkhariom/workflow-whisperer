import { useState } from "react";
import { ChatList } from "./ChatList";
import { ChatWindow } from "./ChatWindow";
import { useChats, type ChatContact } from "@/hooks/useN8nData";

export function ConversationsPanel() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { data: contacts = [] } = useChats();
  
  // Find the selected contact to pass details to ChatWindow
  const selectedContact = contacts.find(c => c.id === selectedId) || null;

  return (
    <div className="flex h-[calc(100vh-0px)]">
      <ChatList selectedId={selectedId} onSelect={setSelectedId} />
      <ChatWindow contactId={selectedId} contact={selectedContact} />
    </div>
  );
}