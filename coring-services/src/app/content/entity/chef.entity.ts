export class Chef {
    id: number;
    name: string;
    title: string;
    imageUrl: string | null;
    quote: string | null;
    createdAt: Date;
    updatedAt: Date;

    constructor(data: Partial<Chef>) {
        this.id = data.id!;
        this.name = data.name!;
        this.title = data.title!;
        this.imageUrl = data.imageUrl ?? null;
        this.quote = data.quote ?? null;
        this.createdAt = data.createdAt ?? new Date();
        this.updatedAt = data.updatedAt ?? new Date();
    }
}
