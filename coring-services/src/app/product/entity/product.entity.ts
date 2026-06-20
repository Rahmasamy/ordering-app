export class Product {
        id?:number;
        restaurant_id?:number;
        category_id?:number;
        name?:string;
        description?:string;
        image_url?:string;
        created_at?:Date;
        updated_at?:Date;

        constructor(productPartial?:Partial<Product>) {
            Object.assign(this,productPartial)
        }
}