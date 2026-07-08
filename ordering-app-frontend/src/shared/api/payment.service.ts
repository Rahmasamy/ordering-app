import orderApi from './order-client';

export interface InitPaymentPayload {
  orderId: string;
}

export interface PaymentInitResponse {
  sessionId: string;
  providerSessionId: string;
  redirectUrl: string;
  expiresAt: string;
  amount: number;
  currency: string;
}

export interface PaymentDetailsResponse {
  id: number;
  orderPublicId: string;
  type: 'charge' | 'refund' | 'commission' | 'cod_collection' | 'payout' | 'adjustment';
  method: 'online' | 'cod' | 'bank_transfer' | 'system';
  provider?: 'kashier';
  providerReferenceId?: string;
  status: 'pending' | 'succeeded' | 'failed' | 'reversed';
  amount: number;
  currency: string;
  isRefunded: boolean;
  createdAt: string;
  updatedAt: string;
}

// In-Memory/LocalStorage Simulation Database helper
const getLocalPayments = (): PaymentDetailsResponse[] => {
  const data = localStorage.getItem('orderflow_payments');
  return data ? JSON.parse(data) : [];
};

const saveLocalPayments = (payments: PaymentDetailsResponse[]) => {
  localStorage.setItem('orderflow_payments', JSON.stringify(payments));
};

export const paymentService = {
  initializeSession: async (payload: InitPaymentPayload): Promise<PaymentInitResponse> => {
    try {
      const response = await orderApi.post('/payments/init', payload);
      return response.data.data;
    } catch (error) {
      console.warn('[paymentService] Failed to call POST /payments/init. Falling back to simulation.', error);
      
      const sessionId = `pay_sess_${Math.floor(Math.random() * 900000000) + 100000000}`;
      const providerSessionId = `kashier_session_${Math.random().toString(36).substring(2, 10)}`;
      
      // Get order to determine price
      const ordersData = localStorage.getItem('orderflow_orders');
      let amount = 27500;
      if (ordersData) {
        const orders = JSON.parse(ordersData);
        const order = orders.find((o: any) => o.publicId === payload.orderId);
        if (order) {
          amount = order.total;
        }
      }

      // Add dummy payment record in pending state
      const payments = getLocalPayments();
      const paymentRecord: PaymentDetailsResponse = {
        id: Math.floor(Math.random() * 1000) + 900,
        orderPublicId: payload.orderId,
        type: 'charge',
        method: 'online',
        provider: 'kashier',
        providerReferenceId: `ref_${Math.floor(Math.random() * 1000000)}`,
        status: 'pending',
        amount,
        currency: 'EGP',
        isRefunded: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      payments.push(paymentRecord);
      saveLocalPayments(payments);

      return {
        sessionId,
        providerSessionId,
        redirectUrl: `${window.location.origin}/payment-gateway?session=${sessionId}&orderId=${payload.orderId}`,
        expiresAt: new Date(Date.now() + 1800000).toISOString(),
        amount,
        currency: 'EGP'
      };
    }
  },

  getPaymentDetails: async (paymentId: number): Promise<PaymentDetailsResponse> => {
    try {
      const response = await orderApi.get(`/payments/${paymentId}`);
      return response.data.data;
    } catch (error) {
      console.warn(`[paymentService] Failed to call GET /payments/${paymentId}. Falling back to simulation.`, error);
      const payments = getLocalPayments();
      const payment = payments.find(p => p.id === paymentId);
      if (!payment) {
        throw new Error('PaymentNotFound');
      }
      return payment;
    }
  },

  // Extension helper to capture payment in simulation
  simulatePaymentSuccess: (orderId: string) => {
    // 1. Update payment record
    const payments = getLocalPayments();
    const payment = payments.find(p => p.orderPublicId === orderId);
    if (payment) {
      payment.status = 'succeeded';
      payment.updatedAt = new Date().toISOString();
      saveLocalPayments(payments);
    }

    // 2. Update order status to placed & payment status to captured
    const ordersData = localStorage.getItem('orderflow_orders');
    if (ordersData) {
      const orders = JSON.parse(ordersData);
      const order = orders.find((o: any) => o.publicId === orderId);
      if (order) {
        order.status = 'placed';
        order.paymentSummary.status = 'captured';
        // Add status history
        order.history.push({
          status: 'placed',
          ts: new Date().toISOString()
        });
        localStorage.setItem('orderflow_orders', JSON.stringify(orders));
      }
    }
  }
};
