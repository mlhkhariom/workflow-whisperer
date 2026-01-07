import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: string;
  image_url?: string;
}

interface Chat {
  contact_uid: string;
  name: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

interface ChatMessage {
  id: string;
  contact_uid: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

const callN8nProxy = async (action: string, data?: Record<string, unknown>) => {
  const { data: response, error } = await supabase.functions.invoke("n8n-proxy", {
    body: { action, data },
  });

  if (error) throw error;
  return response;
};

export const useProducts = () => {
  return useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: () => callN8nProxy("get_products"),
    staleTime: 30000,
  });
};

export const useChats = () => {
  return useQuery<Chat[]>({
    queryKey: ["chats"],
    queryFn: () => callN8nProxy("get_chats"),
    staleTime: 10000,
  });
};

export const useChatMessages = (contactUid: string | null) => {
  return useQuery<ChatMessage[]>({
    queryKey: ["chat_messages", contactUid],
    queryFn: () => callN8nProxy("get_chat_messages", { contact_uid: contactUid }),
    enabled: !!contactUid,
    staleTime: 5000,
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ contactUid, message }: { contactUid: string; message: string }) =>
      callN8nProxy("send_message", { contact_uid: contactUid, message }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["chat_messages", variables.contactUid] });
      queryClient.invalidateQueries({ queryKey: ["chats"] });
    },
  });
};
