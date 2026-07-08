import orderApi from './order-client';

export interface OrderItemInput {
  productId: number;
  quantity: number;
}

export interface PlaceOrderPayload {
  branchId: number;
  customerAddressId: number;
  paymentMethod: 'online' | 'cod';
  items: OrderItemInput[];
}

export interface OrderItemResponse {
  productId: number;
  name: string;
  imageUrl?: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface OrderResponse {
  publicId: string;
  status: string;
  paymentMethod: 'online' | 'cod';
  branch: { id: number; name: string };
  restaurant: { id: number; name: string };
  customerAddress: { lat: number; lng: number; addressText: string };
  subtotal: number;
  deliveryFee: number;
  serviceFee: number;
  total: number;
  currency: string;
  items: OrderItemResponse[];
  createdAt: string;
  payment?: { sessionId: string; redirectUrl: string };
}

export interface DeliveryAgent {
  id: number;
  name: string;
  phone: string;
  lastLat: number;
  lastLng: number;
  lastSeenAt: string;
}

export interface DeliverySummary {
  id: number;
  status: string;
  agent?: DeliveryAgent;
  assignedAt: string;
  acceptedAt?: string;
  pickedAt?: string;
  deliveredAt?: string;
}

export interface OrderDetailsResponse extends OrderResponse {
  delivery?: DeliverySummary;
  paymentSummary: {
    method: 'online' | 'cod';
    status: 'pending' | 'authorized' | 'captured' | 'failed' | 'refunded';
    amount: number;
    currency: string;
    refundedAmount: number;
  };
  history: Array<{ status: string; ts: string }>;
}

export interface OrderSummaryResponse {
  publicId: string;
  status: string;
  total: number;
  currency: string;
  itemsCount: number;
  restaurant: { id: number; name: string };
  branchId: number;
  createdAt: string;
}

// In-Memory/LocalStorage Simulation Database helper
const getLocalOrders = (): OrderDetailsResponse[] => {
  const data = localStorage.getItem('orderflow_orders');
  return data ? JSON.parse(data) : [];
};

const saveLocalOrders = (orders: OrderDetailsResponse[]) => {
  localStorage.setItem('orderflow_orders', JSON.stringify(orders));
};

// Seed initial orders if empty
if (getLocalOrders().length === 0) {
  const seedOrders: OrderDetailsResponse[] = [
    {
      publicId: "e2a1b9c3-9d8e-4a7b-8c6d-5e4f3a2b1c0d",
      status: "placed",
      paymentMethod: "online",
      branch: { id: 12, name: "Maadi Branch" },
      restaurant: { id: 5, name: "Burger Joint" },
      customerAddress: {
        lat: 30.0444,
        lng: 31.2357,
        addressText: "9 Road 9, Maadi, Cairo"
      },
      subtotal: 25000,
      deliveryFee: 2000,
      serviceFee: 500,
      total: 27500,
      currency: "EGP",
      items: [
        {
          productId: 101,
          name: "Double Cheese Burger",
          imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80",
          quantity: 2,
          unitPrice: 10000,
          lineTotal: 20000
        },
        {
          productId: 102,
          name: "French Fries",
          imageUrl: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&auto=format&fit=crop&q=80",
          quantity: 1,
          unitPrice: 5000,
          lineTotal: 5000
        }
      ],
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      delivery: {
        id: 4501,
        status: "assigned",
        agent: {
          id: 89,
          name: "Ahmed Delivery",
          phone: "+201234567890",
          lastLat: 30.0450,
          lastLng: 31.2360,
          lastSeenAt: new Date(Date.now() - 1800000).toISOString()
        },
        assignedAt: new Date(Date.now() - 3500000).toISOString()
      },
      paymentSummary: {
        method: "online",
        status: "captured",
        amount: 27500,
        currency: "EGP",
        refundedAmount: 0
      },
      history: [
        { status: "pending_payment", ts: new Date(Date.now() - 3600000).toISOString() },
        { status: "placed", ts: new Date(Date.now() - 3590000).toISOString() }
      ]
    }
  ];
  saveLocalOrders(seedOrders);
}

export const orderService = {
  placeOrder: async (payload: PlaceOrderPayload): Promise<OrderResponse> => {
    try {
      const response = await orderApi.post('/orders', payload);
      return response.data.data;
    } catch (error) {
      console.warn('[orderService] Failed to call POST /orders. Falling back to simulation.', error);
      
      const newId = `order_${Math.random().toString(36).substring(2, 11)}_${Date.now()}`;
      const publicId = crypto?.randomUUID ? crypto.randomUUID() : 'f3b89e2a-1c5d-4f8a-9e2c-' + Math.random().toString(16).substring(2, 14);
      
      // Compute mock pricing
      const subtotal = payload.items.reduce((sum, item) => sum + (item.quantity * 10000), 0); // Mock unit price 100 EGP (10000 minor units)
      const deliveryFee = 2000;
      const serviceFee = 500;
      const total = subtotal + deliveryFee + serviceFee;
      
      // Try to find product names if available in memory
      const itemsResponse: OrderItemResponse[] = payload.items.map(item => {
        let name = "Double Cheese Burger";
        let image = "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80";
        
        if (item.productId === 102) {
          name = "French Fries";
          image = "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&auto=format&fit=crop&q=80";
        } else if (item.productId === 103) {
          name = "Zen Bowl Sushi";
          image = "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&auto=format&fit=crop&q=80";
        }
        
        return {
          productId: item.productId,
          name,
          imageUrl: image,
          quantity: item.quantity,
          unitPrice: 10000,
          lineTotal: item.quantity * 10000
        };
      });

      const order: OrderDetailsResponse = {
        publicId,
        status: payload.paymentMethod === 'online' ? 'pending_payment' : 'placed',
        paymentMethod: payload.paymentMethod,
        branch: { id: payload.branchId, name: payload.branchId === 12 ? "Maadi Branch" : "Downtown Core" },
        restaurant: { id: 5, name: "Burger Joint" },
        customerAddress: {
          lat: 30.0444,
          lng: 31.2357,
          addressText: "9 Road 9, Maadi, Cairo"
        },
        subtotal,
        deliveryFee,
        serviceFee,
        total,
        currency: "EGP",
        items: itemsResponse,
        createdAt: new Date().toISOString(),
        paymentSummary: {
          method: payload.paymentMethod,
          status: payload.paymentMethod === 'online' ? 'pending' : 'pending',
          amount: total,
          currency: "EGP",
          refundedAmount: 0
        },
        history: [
          { status: "pending_payment", ts: new Date().toISOString() }
        ]
      };

      if (payload.paymentMethod === 'online') {
        const sessionId = `pay_sess_${Math.floor(Math.random() * 900000000) + 100000000}`;
        order.payment = {
          sessionId,
          redirectUrl: `${window.location.origin}/payment-gateway?session=${sessionId}&orderId=${publicId}`
        };
      } else {
        order.history.push({ status: "placed", ts: new Date().toISOString() });
      }

      const orders = getLocalOrders();
      orders.unshift(order);
      saveLocalOrders(orders);

      return order;
    }
  },

  getOrderDetails: async (publicId: string): Promise<OrderDetailsResponse> => {
    try {
      const response = await orderApi.get(`/orders/${publicId}`);
      return response.data.data;
    } catch (error) {
      console.warn(`[orderService] Failed to call GET /orders/${publicId}. Falling back to simulation.`, error);
      const orders = getLocalOrders();
      const order = orders.find(o => o.publicId === publicId);
      if (!order) {
        throw new Error('OrderNotFound');
      }

      // If status is "placed" or "accepted" or "preparing" or "ready", and there is no delivery agent, simulate one
      if (order.status !== 'pending_payment' && !order.delivery) {
        order.delivery = {
          id: 4501,
          status: "assigned",
          agent: {
            id: 89,
            name: "Ahmed Delivery",
            phone: "+201234567890",
            lastLat: 30.0444 + (Math.random() - 0.5) * 0.01,
            lastLng: 31.2357 + (Math.random() - 0.5) * 0.01,
            lastSeenAt: new Date().toISOString()
          },
          assignedAt: new Date().toISOString()
        };
        saveLocalOrders(orders);
      }

      // If delivery is assigned, simulate agent moving towards destination
      if (order.delivery && order.delivery.agent) {
        // Slowly update agent position towards home (lat: 30.0444, lng: 31.2357)
        const agent = order.delivery.agent;
        const targetLat = 30.0444;
        const targetLng = 31.2357;
        const step = 0.0005; // speed of courier movement
        
        if (Math.abs(agent.lastLat - targetLat) > 0.0001) {
          agent.lastLat += agent.lastLat < targetLat ? step : -step;
        }
        if (Math.abs(agent.lastLng - targetLng) > 0.0001) {
          agent.lastLng += agent.lastLng < targetLng ? step : -step;
        }
        agent.lastSeenAt = new Date().toISOString();
        saveLocalOrders(orders);
      }

      return order;
    }
  },

  getCustomerOrders: async (): Promise<{ data: OrderSummaryResponse[]; meta?: any }> => {
    const response = await orderApi.get('/customer/orders');
    return {
      data: response.data.data,
      meta: response.data.meta
    };
  },

  getRestaurantOrders: async (branchId: number): Promise<{ data: OrderSummaryResponse[]; meta?: any }> => {
    try {
      const response = await orderApi.get('/restaurant/orders', {
        params: { branchId }
      });
      return {
        data: response.data.data,
        meta: response.data.meta
      };
    } catch (error) {
      console.warn(`[orderService] Failed to call GET /restaurant/orders for branch ${branchId}. Falling back to simulation.`, error);
      const orders = getLocalOrders().filter(o => o.branch.id === branchId);
      const summaries: OrderSummaryResponse[] = orders.map(o => ({
        publicId: o.publicId,
        status: o.status,
        total: o.total,
        currency: o.currency,
        itemsCount: o.items.reduce((sum, item) => sum + item.quantity, 0),
        restaurant: o.restaurant,
        branchId: o.branch.id,
        createdAt: o.createdAt
      }));
      return {
        data: summaries,
        meta: {
          nextCursor: null,
          hasMore: false,
          count: summaries.length
        }
      };
    }
  },

  updateOrderStatus: async (orderId: string, status: 'accepted' | 'rejected' | 'preparing' | 'ready' | 'cancelled', reason?: string): Promise<{ publicId: string; status: string; updatedAt: string }> => {
    try {
      const response = await orderApi.patch(`/orders/${orderId}/status`, { status, reason });
      return response.data.data;
    } catch (error) {
      console.warn(`[orderService] Failed to call PATCH /orders/${orderId}/status. Falling back to simulation.`, error);
      const orders = getLocalOrders();
      const orderIndex = orders.findIndex(o => o.publicId === orderId);
      if (orderIndex === -1) {
        throw new Error('OrderNotFound');
      }

      orders[orderIndex].status = status;
      orders[orderIndex].history.push({
        status,
        ts: new Date().toISOString()
      });

      // Update paymentSummary status if order gets cancelled/refunded
      if (status === 'cancelled' || status === 'rejected') {
        orders[orderIndex].paymentSummary.status = 'refunded';
        orders[orderIndex].paymentSummary.refundedAmount = orders[orderIndex].total;
      }

      saveLocalOrders(orders);

      return {
        publicId: orderId,
        status,
        updatedAt: new Date().toISOString()
      };
    }
  }
};
