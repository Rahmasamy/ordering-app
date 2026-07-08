import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { StateProvider } from '@/app/providers/StateContext';
import MainLayout from '@/compositions/MainLayout';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

// Customer Portal Modules
import { 
  CustomerHome, 
  ProductDetail, 
  CustomerCheckout, 
  CustomerConfirmation, 
  CustomerOffers, 
  CustomerPrivacy, 
  CustomerFaq,
  PaymentGateway,
  CustomerOrders,
  PaymentReturn,
  PaymentFailed
} from '@/modules/CustomerPortal';

// Merchant Dashboard Modules
import { 
  MerchantOverview, 
  MerchantCatalog, 
  BranchManagement, 
  MerchantTeam, 
  MerchantAnalytics, 
  MerchantLogin,
  MerchantOrders
} from '@/modules/MerchantDashboard';

// Menu Builder Modules
import { ProductWizard } from '@/modules/MenuBuilder';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <StateProvider>
        <BrowserRouter>
          <Routes>
            {/* Standalone full-screen payment gateway */}
            <Route path="/payment-gateway" element={<PaymentGateway />} />

            <Route path="/" element={<MainLayout />}>
              {/* Customer Routes */}
              <Route index element={<CustomerHome />} />
              <Route path="product/:id" element={<ProductDetail />} />
              <Route path="checkout" element={<CustomerCheckout />} />
              <Route path="checkout/return" element={<PaymentReturn />} />
              <Route path="checkout/failed" element={<PaymentFailed />} />
              <Route path="confirmation" element={<CustomerConfirmation />} />
              <Route path="offers" element={<CustomerOffers />} />
              <Route path="privacy" element={<CustomerPrivacy />} />
              <Route path="faq" element={<CustomerFaq />} />
              <Route path="orders" element={<CustomerOrders />} />

              {/* Merchant Routes */}
              <Route path="merchant">
                <Route index element={<MerchantOverview />} />
                <Route path="catalog" element={<MerchantCatalog />} />
                <Route path="branches" element={<BranchManagement />} />
                <Route path="wizard" element={<ProductWizard />} />
                <Route path="team" element={<MerchantTeam />} />
                <Route path="analytics" element={<MerchantAnalytics />} />
                <Route path="login" element={<MerchantLogin />} />
                <Route path="orders" element={<MerchantOrders />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </StateProvider>
    </QueryClientProvider>
  );
}
