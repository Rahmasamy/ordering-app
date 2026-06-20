export class ProductCategory {
    id?:number;
    name?:string;
    restaurant_id?:number;
    description?:string;
    created_at?:Date;
    updated_at?:Date;
    constructor(categoryPartial?:Partial<ProductCategory>) {
        Object.assign(this,categoryPartial)
    }
}