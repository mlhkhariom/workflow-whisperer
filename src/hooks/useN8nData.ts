import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface N8nResponse<T> {
  data?: T;
  error?: string;
}

async function callN8n<T>(action: string, data?: unknown): Promise<T> {
  const { data: response, error } = await supabase.functions.invoke('n8n-proxy', {
    body: { action, data },
  });

  if (error) {
    console.error('Supabase function error:', error);
    throw new Error(error.message);
  }

  if (response?.error) {
    throw new Error(response.error);
  }

  return response;
}

// Products
export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: string;
}

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: () => callN8n<Product[]>('get-products'),
    staleTime: 30000,
  });
}

export function useAddProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (product: Omit<Product, 'id'>) => callN8n('add-product', product),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (product: Product) => callN8n('update-product', product),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => callN8n('delete-product', { id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

// Chats
export interface ChatMessage {
  id: string;
  contactId: string;
  message: string;
  sender: 'user' | 'agent';
  timestamp: string;
}

export interface ChatContact {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
}

export function useChats() {
  return useQuery({
    queryKey: ['chats'],
    queryFn: () => callN8n<ChatContact[]>('get-chats'),
    staleTime: 10000,
  });
}

export function useChatMessages(contactId: string | null) {
  return useQuery({
    queryKey: ['chat-messages', contactId],
    queryFn: () => callN8n<ChatMessage[]>('get-chat-messages', { contactId }),
    enabled: !!contactId,
    staleTime: 5000,
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ contactId, message }: { contactId: string; message: string }) => 
      callN8n('send-message', { contactId, message }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['chat-messages', variables.contactId] });
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    },
  });
}
