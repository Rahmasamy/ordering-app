export class Testimonial {
    id: number;
    content: string;
    rating: number | null;
    authorName: string | null;
    productId: number | null;
    restaurantId: number | null;
    createdAt: Date;
    updatedAt: Date;

    constructor(data: Partial<Testimonial>) {
        this.id = data.id!;
        this.content = data.content!;
        this.rating = data.rating ?? null;
        this.authorName = data.authorName ?? null;
        this.productId = data.productId ?? null;
        this.restaurantId = data.restaurantId ?? null;
        this.createdAt = data.createdAt ?? new Date();
        this.updatedAt = data.updatedAt ?? new Date();
    }
}
