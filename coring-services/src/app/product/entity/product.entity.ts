export class Product {
    id: number;
    name: string;
    description: string;
    imageUrl: string;
    restaurantId: number;
    categoryId: number | null;
    isTrending: boolean;
    isChefSpecial?: boolean;
    isPopular?: boolean;
    calories?: number | null;
    isDairyFree?: boolean;
    containsGluten?: boolean;
    reviewsCount?: number;
    rating?: number;
    imageUrls?: string[];
    donenessOptions?: string[] | null;
    addons?: { name: string; price: number }[];
    price?: number;
    stock?: number;
    isAvailable?: boolean;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;

    constructor(data: Partial<Product>) {
        this.id = data.id!;
        this.name = data.name!;
        this.description = data.description ?? "";
        this.imageUrl = data.imageUrl ?? "";
        this.restaurantId = data.restaurantId!;
        this.categoryId = data.categoryId ?? null;
        this.isTrending = data.isTrending ?? false;
        this.isChefSpecial = data.isChefSpecial ?? false;
        this.isPopular = data.isPopular ?? false;
        this.calories = data.calories ?? null;
        this.isDairyFree = data.isDairyFree ?? false;
        this.containsGluten = data.containsGluten ?? true;
        this.reviewsCount = data.reviewsCount ?? 0;
        this.rating = data.rating ?? 0.0;
        this.imageUrls = data.imageUrls ?? [];
        this.donenessOptions = data.donenessOptions ?? null;
        this.addons = data.addons ?? [];
        this.price = data.price;
        this.stock = data.stock ?? 100;
        this.isAvailable = data.isAvailable ?? true;
        this.createdAt = data.createdAt ?? new Date();
        this.updatedAt = data.updatedAt ?? new Date();
        this.deletedAt = data.deletedAt ?? null;
    }
}
