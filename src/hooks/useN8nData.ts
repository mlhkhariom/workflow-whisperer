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

// Chats - Raw message from n8n (supports both old and new field names)
interface RawChatMessageFromApi {
  id?: number;
  // New field names
  contactUid?: string;
  firstName?: string;
  phoneNumber?: string;
  phoneNumberId?: string;
  messageText?: string;
  // Old field names (fallback)
  contact_uid?: string;
  content?: string;
  // Common fields
  role?: 'user' | 'assistant';
  created_at?: string;
}

// Normalized internal format
interface NormalizedRawMessage {
  id: number | string;
  contactUid: string;
  firstName?: string;
  phoneNumber?: string;
  messageText: string;
  role: 'user' | 'assistant';
  created_at: string;
}

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
  phoneNumber: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
}

// Normalize raw API message to consistent format
function normalizeRawMessage(raw: RawChatMessageFromApi): NormalizedRawMessage | null {
  const contactUid = raw.contactUid || raw.contact_uid;
  if (!contactUid) return null;
  
  return {
    id: raw.id ?? crypto.randomUUID(),
    contactUid,
    firstName: raw.firstName,
    phoneNumber: raw.phoneNumber,
    messageText: raw.messageText || raw.content || '',
    role: raw.role || 'user',
    created_at: raw.created_at || new Date().toISOString(),
  };
}

function formatRelativeTime(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

// Derive contacts list from all messages
function deriveContactsFromMessages(messages: NormalizedRawMessage[]): ChatContact[] {
  const contactMap = new Map<string, { messages: NormalizedRawMessage[]; firstName?: string; phoneNumber?: string }>();

  for (const msg of messages) {
    const contactId = msg.contactUid;
    if (!contactId) continue;
    
    if (!contactMap.has(contactId)) {
      contactMap.set(contactId, { messages: [], firstName: msg.firstName, phoneNumber: msg.phoneNumber });
    }
    const entry = contactMap.get(contactId)!;
    entry.messages.push(msg);
    // Update name/phone if available
    if (msg.firstName) entry.firstName = msg.firstName;
    if (msg.phoneNumber) entry.phoneNumber = msg.phoneNumber;
  }

  const contacts: ChatContact[] = [];

  for (const [contactId, data] of contactMap.entries()) {
    // Sort messages by created_at descending to get latest
    const sorted = data.messages.sort(
      (a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
    );
    const lastMsg = sorted[0];
    const unreadCount = sorted.filter(m => m.role === 'user').length;

    contacts.push({
      id: contactId,
      name: data.firstName || `Contact ${contactId.slice(0, 8)}`,
      phoneNumber: data.phoneNumber || '',
      lastMessage: lastMsg?.messageText ?? '',
      time: lastMsg?.created_at ? formatRelativeTime(lastMsg.created_at) : '',
      unread: Math.min(unreadCount, 9),
      online: false,
    });
  }

  // Sort contacts by most recent message
  contacts.sort((a, b) => {
    const aTime = contactMap.get(a.id)?.messages[0]?.created_at ?? '';
    const bTime = contactMap.get(b.id)?.messages[0]?.created_at ?? '';
    return new Date(bTime).getTime() - new Date(aTime).getTime();
  });

  return contacts;
}

// Normalize raw message to our ChatMessage format
function normalizeToChatMessage(raw: NormalizedRawMessage): ChatMessage {
  return {
    id: String(raw.id),
    contactId: raw.contactUid,
    message: raw.messageText,
    sender: raw.role === 'assistant' ? 'agent' : 'user',
    timestamp: raw.created_at,
  };
}

// Store all messages globally for both contacts list and individual chat
let cachedNormalizedMessages: NormalizedRawMessage[] = [];

async function fetchAllMessages(): Promise<NormalizedRawMessage[]> {
  const rawMessages = await callN8n<RawChatMessageFromApi[]>('get-chats');
  console.log('Raw messages from n8n:', rawMessages);
  const normalized = (rawMessages || [])
    .map(normalizeRawMessage)
    .filter((m): m is NormalizedRawMessage => m !== null);
  console.log('Normalized messages:', normalized);
  console.log('Derived contacts:', deriveContactsFromMessages(normalized));
  cachedNormalizedMessages = normalized;
  return cachedNormalizedMessages;
}

export function useChats() {
  return useQuery({
    queryKey: ['all-messages'],
    queryFn: fetchAllMessages,
    staleTime: 5_000,
    refetchInterval: 5_000,
    refetchIntervalInBackground: true,
    select: (messages) => deriveContactsFromMessages(messages),
  });
}

export function useChatMessages(contactId: string | null) {
  return useQuery<NormalizedRawMessage[], Error, ChatMessage[]>({
    queryKey: ['all-messages'],
    queryFn: fetchAllMessages,
    staleTime: 5_000,
    refetchInterval: 5_000,
    refetchIntervalInBackground: true,
    enabled: !!contactId,
    select: (messages) => {
      if (!contactId) return [];
      return messages
        .filter(m => m.contactUid === contactId)
        .sort((a, b) => new Date(a.created_at || '').getTime() - new Date(b.created_at || '').getTime())
        .map(normalizeToChatMessage);
    },
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ contactId, message }: { contactId: string; message: string }) => 
      callN8n('send-message', { contactId, message }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-messages'] });
    },
  });
}
