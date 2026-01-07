import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Radio, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useSendMessage, useChatMessages } from "@/hooks/useN8nData";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  time: string;
}

// Test contact ID for live chat demo
const TEST_CONTACT_UID = "live-chat-test";

export function LiveChatPanel() {
  const [localMessages, setLocalMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "👋 Welcome to the live chat testing interface! I'm connected to your n8n AI Sales Agent workflow. Try asking about laptops, desktops, or accessories!",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  const sendMessage = useSendMessage();
  const { data: n8nMessages = [] } = useChatMessages(TEST_CONTACT_UID);

  // Merge n8n messages with local messages
  useEffect(() => {
    if (n8nMessages.length > 0) {
      const formatted: Message[] = n8nMessages.map(m => ({
        id: m.id,
        role: m.role,
        content: m.content,
        time: new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }));
      setLocalMessages(prev => {
        const welcomeMsg = prev.find(m => m.id === "welcome");
        return welcomeMsg ? [welcomeMsg, ...formatted] : formatted;
      });
    }
  }, [n8nMessages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [localMessages]);

  const handleSend = async () => {
    if (!input.trim() || sendMessage.isPending) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setLocalMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      await sendMessage.mutateAsync({
        contactUid: TEST_CONTACT_UID,
        message: userMessage.content,
      });
      
      toast({
        title: "Message sent",
        description: "Waiting for AI response from n8n...",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message to n8n. Check your webhook configuration.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-8 h-[calc(100vh-0px)] flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            Live Chat
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-success/20 text-success text-sm font-medium">
              <Radio className="w-4 h-4 animate-pulse" />
              Connected to n8n
            </span>
          </h1>
          <p className="text-muted-foreground mt-1">Test your AI sales agent in real-time</p>
        </div>
      </div>

      <div className="flex-1 glass-panel rounded-xl flex flex-col overflow-hidden glow-success">
        {/* Chat Header */}
        <div className="p-4 border-b border-border bg-success/5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
            <Bot className="w-5 h-5 text-success" />
          </div>
          <div>
            <h3 className="font-semibold">AI Sales Agent</h3>
            <p className="text-xs text-success">n8n workflow: working</p>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-6" ref={scrollRef}>
          <div className="space-y-6">
            {localMessages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3 animate-fade-in",
                  message.role === "user" && "flex-row-reverse"
                )}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                    message.role === "user" ? "bg-primary/20" : "bg-success/20"
                  )}
                >
                  {message.role === "user" ? (
                    <User className="w-4 h-4 text-primary" />
                  ) : (
                    <Bot className="w-4 h-4 text-success" />
                  )}
                </div>
                <div
                  className={cn(
                    "max-w-[70%] rounded-2xl px-4 py-3",
                    message.role === "user" ? "chat-bubble-user" : "chat-bubble-assistant"
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <span className="text-xs text-muted-foreground mt-2 block">
                    {message.time}
                  </span>
                </div>
              </div>
            ))}
            {sendMessage.isPending && (
              <div className="flex gap-3 animate-fade-in">
                <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-success" />
                </div>
                <div className="chat-bubble-assistant rounded-2xl px-4 py-3">
                  <Loader2 className="w-5 h-5 animate-spin text-success" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t border-border bg-card/50">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-3"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-muted/50"
              disabled={sendMessage.isPending}
            />
            <Button
              type="submit"
              disabled={!input.trim() || sendMessage.isPending}
              className="bg-success hover:bg-success/90 text-success-foreground glow-success"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
