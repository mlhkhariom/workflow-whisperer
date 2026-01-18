import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

async function callApi<T>(action: string, data?: unknown): Promise<T> {
  const { data: response, error } = await supabase.functions.invoke('postgres-api', {
    body: { action, data },
  });

  if (error) {
    console.error('API error:', error);
    throw new Error(error.message);
  }

  if (response?.error) {
    throw new Error(response.error);
  }

  return response;
}

// ==================== PRODUCT INTERFACES ====================

export interface Product {
  id: string;
  category: 'laptops' | 'desktops' | 'accessories';
  // Common fields
  brand?: string;
  model?: string;
  name?: string; // For accessories
  processor?: string;
  generation?: string;
  ram_gb?: number | null;
  ram_type?: string;
  storage_type?: string;
  storage_gb?: number | null;
  screen_size?: string;
  monitor_size?: string;
  graphics?: string;
  condition?: string;
  price_range?: string;
  stock_quantity?: number | null;
  special_feature?: string;
  warranty_in_months?: number | null;
  image_url_1?: string | null;
  image_url_2?: string | null;
  updated_at?: string;
  // Computed
  status: 'active' | 'low_stock' | 'out_of_stock';
  displayName: string;
  price: number | null;
}

function parsePriceToNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value !== 'string') return null;
  const cleaned = value.replace(/,/g, '');
  const match = cleaned.match(/\d+(?:\.\d+)?/);
  if (!match) return null;
  const num = Number(match[0]);
  return Number.isFinite(num) ? num : null;
}

function computeStatus(stock: number | null | undefined): 'active' | 'low_stock' | 'out_of_stock' {
  if (stock === null || stock === undefined) return 'active'; // No stock info = assume active
  if (stock === 0) return 'out_of_stock';
  if (stock <= 3) return 'low_stock';
  return 'active';
}

function normalizeLaptop(raw: any): Product {
  const id = String(raw?.row_number ?? crypto.randomUUID());
  const displayName = `${raw?.brand ?? ''} ${raw?.model ?? ''}`.trim() || `Laptop ${id}`;
  
  return {
    id,
    category: 'laptops',
    brand: raw?.brand || '',
    model: raw?.model || '',
    processor: raw?.processor || '',
    generation: raw?.generation || '',
    ram_gb: raw?.ram_gb ?? null,
    storage_type: raw?.storage_type || '',
    storage_gb: raw?.storage_gb ?? null,
    screen_size: raw?.screen_size || '',
    graphics: raw?.graphics || '',
    condition: raw?.condition || 'Used',
    price_range: raw?.price_range || '',
    stock_quantity: raw?.stock_quantity ?? null,
    special_feature: raw?.special_feature || '',
    warranty_in_months: raw?.warranty_in_months ?? null,
    image_url_1: raw?.image_url_1 || null,
    image_url_2: raw?.image_url_2 || null,
    updated_at: raw?.updated_at || null,
    status: computeStatus(raw?.stock_quantity),
    displayName,
    price: parsePriceToNumber(raw?.price_range),
  };
}

function normalizeDesktop(raw: any): Product {
  const id = String(raw?.row_number ?? crypto.randomUUID());
  const displayName = `${raw?.brand ?? ''} ${raw?.model ?? ''}`.trim() || `Desktop ${id}`;
  
  return {
    id,
    category: 'desktops',
    brand: raw?.brand || '',
    model: raw?.model || '',
    processor: raw?.processor || '',
    generation: raw?.generation || '',
    ram_gb: raw?.ram_gb ?? null,
    ram_type: raw?.ram_type || '',
    storage_gb: raw?.storage_gb ?? null,
    monitor_size: raw?.monitor_size || '',
    graphics: raw?.graphics || '',
    condition: raw?.condition || 'Used',
    price_range: raw?.price_range || '',
    stock_quantity: raw?.stock_quantity ?? null,
    special_feature: raw?.special_feature || '',
    warranty_in_months: raw?.warranty_in_months ?? null,
    image_url_1: raw?.image_url_1 || null,
    image_url_2: raw?.image_url_2 || null,
    updated_at: raw?.updated_at || null,
    status: computeStatus(raw?.stock_quantity),
    displayName,
    price: parsePriceToNumber(raw?.price_range),
  };
}

function normalizeAccessory(raw: any): Product {
  const id = String(raw?.row_number ?? crypto.randomUUID());
  const displayName = raw?.accessories_name || `Accessory ${id}`;
  const stockQty = raw?.stock_quantity ?? null;
  
  return {
    id,
    category: 'accessories',
    name: raw?.accessories_name || '',
    price_range: raw?.price_range_inr || '',
    image_url_1: raw?.image_url_1 || null,
    image_url_2: raw?.image_url_2 || null,
    updated_at: raw?.updated_at || null,
    status: computeStatus(stockQty),
    displayName,
    price: parsePriceToNumber(raw?.price_range_inr),
    stock_quantity: stockQty,
  };
}

async function fetchAllProducts(): Promise<Product[]> {
  const [laptopsRaw, desktopsRaw, accessoriesRaw] = await Promise.all([
    callApi<any[]>('get-laptop').catch(() => []),
    callApi<any[]>('get-desktops').catch(() => []),
    callApi<any[]>('get-accessories').catch(() => []),
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

// ==================== PRODUCT MUTATIONS ====================

function getActionPrefix(category: string): string {
  switch (category.toLowerCase()) {
    case 'laptops': return 'laptop';
    case 'desktops': return 'desktop';
    case 'accessories': return 'accessory';
    default: return 'product';
  }
}

export function useAddProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (product: Partial<Product>) => {
      const action = `add-${getActionPrefix(product.category || '')}`;
      console.log('Adding product:', action, product);
      return callApi(action, product);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (product: Product) => {
      const action = `update-${getActionPrefix(product.category)}`;
      console.log('Updating product:', action, product);
      return callApi(action, product);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, category }: { id: string; category: string }) => {
      const action = `delete-${getActionPrefix(category)}`;
      console.log('Deleting product:', action, { id });
      return callApi(action, { id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

// ==================== CHAT INTERFACES ====================

interface RawChatMessage {
  id?: number;
  contact_uid?: string;
  content?: string;
  role?: 'user' | 'assistant';
  created_at?: string;
}

interface NormalizedMessage {
  id: string;
  contactUid: string;
  content: string;
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

function normalizeRawMessage(raw: RawChatMessage): NormalizedMessage | null {
  if (!raw.contact_uid) return null;
  
  return {
    id: String(raw.id ?? crypto.randomUUID()),
    contactUid: raw.contact_uid,
    content: raw.content || '',
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

function deriveContactsFromMessages(messages: NormalizedMessage[]): ChatContact[] {
  const contactMap = new Map<string, NormalizedMessage[]>();

  for (const msg of messages) {
    if (!msg.contactUid) continue;
    if (!contactMap.has(msg.contactUid)) {
      contactMap.set(msg.contactUid, []);
    }
    contactMap.get(msg.contactUid)!.push(msg);
  }

  const contacts: ChatContact[] = [];

  for (const [contactId, msgs] of contactMap.entries()) {
    const sorted = msgs.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    const lastMsg = sorted[0];
    const unreadCount = sorted.filter(m => m.role === 'user').length;

    // Try to extract phone number from contactId if it looks like a phone number
    // Format: could be UUID or phone number based format
    let phoneNumber = '';
    let displayName = `Contact ${contactId.slice(0, 8)}`;
    
    // Check if contactId contains digits that could be a phone number
    const phoneMatch = contactId.match(/\d{10,15}/);
    if (phoneMatch) {
      phoneNumber = phoneMatch[0];
      // Format phone for display
      if (phoneNumber.length >= 10) {
        const formatted = phoneNumber.startsWith('91') 
          ? `+${phoneNumber.slice(0, 2)} ${phoneNumber.slice(2, 7)} ${phoneNumber.slice(7)}`
          : phoneNumber.length === 10
            ? `${phoneNumber.slice(0, 5)} ${phoneNumber.slice(5)}`
            : `+${phoneNumber}`;
        displayName = formatted;
      }
    }

    contacts.push({
      id: contactId,
      name: displayName,
      phoneNumber: phoneNumber,
      lastMessage: lastMsg?.content ?? '',
      time: lastMsg?.created_at ? formatRelativeTime(lastMsg.created_at) : '',
      unread: Math.min(unreadCount, 9),
      online: false,
    });
  }

  contacts.sort((a, b) => {
    const aTime = contactMap.get(a.id)?.[0]?.created_at ?? '';
    const bTime = contactMap.get(b.id)?.[0]?.created_at ?? '';
    return new Date(bTime).getTime() - new Date(aTime).getTime();
  });

  return contacts;
}

function normalizeToChatMessage(raw: NormalizedMessage): ChatMessage {
  return {
    id: raw.id,
    contactId: raw.contactUid,
    message: raw.content,
    sender: raw.role === 'assistant' ? 'agent' : 'user',
    timestamp: raw.created_at,
  };
}

async function fetchAllMessages(): Promise<NormalizedMessage[]> {
  const rawMessages = await callApi<RawChatMessage[]>('get-chats');
  console.log('Raw chat messages:', rawMessages);
  const normalized = (rawMessages || [])
    .map(normalizeRawMessage)
    .filter((m): m is NormalizedMessage => m !== null);
  console.log('Normalized messages:', normalized);
  return normalized;
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
  return useQuery<NormalizedMessage[], Error, ChatMessage[]>({
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
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        .map(normalizeToChatMessage);
    },
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ contactId, message }: { contactId: string; message: string }) => 
      callApi('send-message', { contactId, message }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-messages'] });
    },
  });
}

// ==================== WHATSAPP API ====================

async function callWhatsAppApi<T>(action: string, data?: unknown): Promise<T> {
  const { data: response, error } = await supabase.functions.invoke('whatsapp-api', {
    body: { action, data },
  });

  if (error) {
    console.error('WhatsApp API error:', error);
    throw new Error(error.message);
  }

  if (response?.error) {
    throw new Error(response.error);
  }

  return response;
}

export function useSendWhatsAppMessage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      phoneNumber, 
      message, 
      contactId,
      templateName,
      templateLanguage,
      templateFields
    }: { 
      phoneNumber: string; 
      message?: string;
      contactId: string;
      templateName?: string;
      templateLanguage?: string;
      templateFields?: Record<string, string>;
    }) => {
      // Send via WhatsApp API
      const whatsappResult = await callWhatsAppApi('send-message', {
        phone_number: phoneNumber,
        message_body: message,
        template_name: templateName,
        template_language: templateLanguage,
        ...templateFields
      });
      
      // Also save to local database for history
      await callApi('send-message', { contactId, message: message || `[Template: ${templateName}]` });
      
      return whatsappResult;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-messages'] });
    },
  });
}

export function useWhatsAppContacts() {
  return useQuery({
    queryKey: ['whatsapp-contacts'],
    queryFn: () => callWhatsAppApi<{ success: boolean; data: any }>('get-contacts'),
    staleTime: 30_000,
    refetchInterval: 30_000,
  });
}

export function useWhatsAppMessages(contactUid?: string) {
  return useQuery({
    queryKey: ['whatsapp-messages', contactUid],
    queryFn: () => callWhatsAppApi<{ success: boolean; data: any }>('get-messages', { contact_uid: contactUid }),
    staleTime: 10_000,
    refetchInterval: 10_000,
    enabled: !!contactUid,
  });
}
