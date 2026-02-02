export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  is_available: boolean;
}

export interface OrderItem extends MenuItem {
  quantity: number;
}

export interface Order {
  id: string;
  token_number: number;
  items: OrderItem[];
  total_price: number;
  status: 'pending' | 'preparing' | 'ready' | 'served' | 'cancelled';
    customer_name?: string;
    customer_phone?: string;
    verification_code?: string;
    created_at: string;
}
