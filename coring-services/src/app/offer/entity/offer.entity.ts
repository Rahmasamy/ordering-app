export class Offer {
    id: number;
    badgeText: string;
    imageUrl: string;
    title: string;
    description: string;
    promoCode: string;
    expiresAt: Date;
    productId: number | null;
    restaurantId: number | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;

    constructor(data: Partial<Offer>) {
        this.id = data.id!;
        this.badgeText = data.badgeText!;
        this.imageUrl = data.imageUrl!;
        this.title = data.title!;
        this.description = data.description!;
        this.promoCode = data.promoCode!;
        this.expiresAt = data.expiresAt!;
        this.productId = data.productId ?? null;
        this.restaurantId = data.restaurantId ?? null;
        this.isActive = data.isActive ?? true;
        this.createdAt = data.createdAt ?? new Date();
        this.updatedAt = data.updatedAt ?? new Date();
    }
}
