import {Chef} from "./chef.entity";

export class Story {
    id: number;
    title: string;
    content: string;
    featuredQuote: string | null;
    productId: number | null;
    restaurantId: number | null;
    chefId: number | null;
    chef?: Chef | null;
    createdAt: Date;
    updatedAt: Date;

    constructor(data: Partial<Story>) {
        this.id = data.id!;
        this.title = data.title!;
        this.content = data.content!;
        this.featuredQuote = data.featuredQuote ?? null;
        this.productId = data.productId ?? null;
        this.restaurantId = data.restaurantId ?? null;
        this.chefId = data.chefId ?? null;
        this.chef = data.chef ?? null;
        this.createdAt = data.createdAt ?? new Date();
        this.updatedAt = data.updatedAt ?? new Date();
    }
}
