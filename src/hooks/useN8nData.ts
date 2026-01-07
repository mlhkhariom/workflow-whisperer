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
  category: 'laptops' | 'desktops' | 'accessories' | string;
  price: number | null;
  stock: number | null;
  status: 'active' | 'low_stock' | 'out_of_stock' | string;
  imageUrl?: string | null;
}

function parsePriceToNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value !== 'string') return null;

  // Extract the first number-like chunk (handles: "15000-22000", "₹2,000 – ₹6,500", "1826")
  const cleaned = value.replace(/,/g, '');
  const match = cleaned.match(/\d+(?:\.\d+)?/);
  if (!match) return null;

  const num = Number(match[0]);
  return Number.isFinite(num) ? num : null;
}

function computeStatus(stock: number | null): 'active' | 'low_stock' | 'out_of_stock' {
  if (stock === 0) return 'out_of_stock';
  if (stock != null && stock > 0 && stock <= 3) return 'low_stock';
  return 'active';
}

function normalizeLaptop(raw: any): Product {
  const id = raw?.id ?? `laptop-${raw?.row_number ?? crypto.randomUUID()}`;
  const name = `${raw?.brand ?? ''} ${raw?.model ?? ''}`.trim() || `Laptop ${raw?.row_number ?? ''}`.trim();
  const stock = typeof raw?.stock_quantity === 'number' ? raw.stock_quantity : null;
  const price = parsePriceToNumber(raw?.price_range);

  return {
    id: String(id),
    name,
    category: 'laptops',
    price,
    stock,
    status: computeStatus(stock),
    imageUrl: raw?.image_url_1 ?? null,
  };
}

function normalizeAccessory(raw: any): Product {
  const id = raw?.id ?? `accessory-${raw?.row_number ?? crypto.randomUUID()}`;
  const name = String(raw?.accessories_name ?? raw?.name ?? 'Accessory');
  const price = parsePriceToNumber(raw?.price_range_inr ?? raw?.price_range ?? raw?.price);

  // Accessories table does not have stock — keep it null so UI shows “—”
  const stock: number | null = null;

  return {
    id: String(id),
    name,
    category: 'accessories',
    price,
    stock,
    status: 'active',
    imageUrl: raw?.image_url_1 ?? null,
  };
}

function normalizeDesktop(raw: any): Product {
  const id = raw?.id ?? `desktop-${raw?.row_number ?? crypto.randomUUID()}`;
  const name = String(raw?.name ?? raw?.desktop_name ?? 'Desktop');
  const stock = typeof raw?.stock_quantity === 'number' ? raw.stock_quantity : (typeof raw?.stock === 'number' ? raw.stock : null);
  const price = parsePriceToNumber(raw?.price_range ?? raw?.price);

  return {
    id: String(id),
    name,
    category: 'desktops',
    price,
    stock,
    status: computeStatus(stock),
    imageUrl: raw?.image_url_1 ?? null,
  };
}

// Fetch all product categories and combine them
async function fetchAllProducts(): Promise<Product[]> {
  const [laptopsRaw, desktopsRaw, accessoriesRaw] = await Promise.all([
    callN8n<any[]>('get-laptop').catch(() => []),
    callN8n<any[]>('get-desktops').catch(() => []),
    callN8n<any[]>('get-accessories').catch(() => []),
  ]);

  const laptops = (laptopsRaw || []).map(normalizeLaptop);
  const desktops = (desktopsRaw || []).map(normalizeDesktop);
  const accessories = (accessoriesRaw || []).map(normalizeAccessory);

  return [...laptops, ...desktops, ...accessories];
}

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: fetchAllProducts,
    staleTime: 10_000,
    refetchInterval: 10_000,
    refetchIntervalInBackground: true,
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
    staleTime: 5_000,
    refetchInterval: 5_000,
    refetchIntervalInBackground: true,
  });
}

export function useChatMessages(contactId: string | null) {
  return useQuery({
    queryKey: ['chat-messages', contactId],
    queryFn: () => callN8n<ChatMessage[]>('get-chat-messages', { contactId }),
    enabled: !!contactId,
    staleTime: 2_000,
    refetchInterval: 2_000,
    refetchIntervalInBackground: true,
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
