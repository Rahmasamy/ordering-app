export interface FoodItem {
  id: string;
  name: string;
  price: number;
  description: string;
  rating: number;
  reviewsCount: number;
  category: 'mains' | 'appetizers' | 'drinks' | 'desserts';
  image: string;
  imageUrl?: string;
  isChefSpecial?: boolean;
  isPopular?: boolean;
  calories?: number;
  isDairyFree?: boolean;
  containsGluten?: boolean;
  tags: string[];
  sku: string;
  stockStatus: 'In Stock' | 'Out of Stock' | 'Low Stock';
  warningThreshold: number;
  taxable: boolean;
  taxCategory: string;
  branchAvailability: Record<string, boolean>; // branchId -> available
  fulfillmentOptions: {
    dineIn: boolean;
    takeaway: boolean;
    delivery: boolean;
  };
  donenessOptions?: string[];
  addons?: { name: string; price: number }[];
  allergenWarnings?: string;
  restaurantId?: number;
  stock?: number;
  isAvailable?: boolean;
}

export interface Branch {
  id: string;
  name: string;
  address: string;
  revenue: number;
  activeStaff: number;
  totalStaff: number;
  capacityStatus: 'High Capacity' | 'Low Staff' | 'Peak Performance' | 'Closing Soon' | 'Stable' | 'Maintenance' | 'New';
  isOpen: boolean;
  activeOrders: number;
  coordinates: { x: number; y: number }; // Percentage position for mock map
  speedMin: number;
  fleetEfficiency: number;
  tags: string[];
}

export interface CartItem {
  id: string; // unique cart line id
  product: FoodItem;
  quantity: number;
  selectedDoneness?: string;
  selectedAddons: string[];
  totalPrice: number;
}

export interface ActivityLog {
  id: string;
  time: string;
  user: string;
  action: string;
  details: string;
  type: 'update' | 'alert' | 'status';
}

export interface DashboardMetrics {
  revenueThisMonth: number;
  revenueGrowthPercent: number;
  orderAccuracyPercent: number;
  avgResponseTimeMin: number;
  activityLogs: ActivityLog[];
}
