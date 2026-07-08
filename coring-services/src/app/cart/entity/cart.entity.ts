export interface CartItem {
    id: number;
    cartId: number;
    productId: number;
    quantity: number;
    unitPrice: number;
    selectedDoneness?: string;
    selectedAddons: string[];
    createdAt: Date;
}

export interface Cart {
    id: number;
    userId: number;
    status: 'active' | 'completed' | 'abandoned';
    createdAt: Date;
    updatedAt: Date;
    items?: CartItem[];
}
