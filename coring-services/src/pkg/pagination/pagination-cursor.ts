import type { Knex } from "knex";

export interface PaginationCursorParams {
    limit: number;
    cursor?: string;
    sortOrder?: "ASC" | "DESC";
    orderBy: string;
}

export interface filterParams {
    field: string;
    operator: "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "like" | "in" | "nin" ;
    value: string | string[];
}

export interface PaginateResponse {
    nextCursor?: string | null;
    hasMore: boolean;
    count: number;
}

export function applyCursorPagination<T>(query: Knex.QueryBuilder, params: PaginationCursorParams): Knex.QueryBuilder {


     if(!params.orderBy) {
        return query;
    }

    if (params.cursor) {
        const opt: ">" | "<" = params.sortOrder === "ASC" ? ">" : "<"
        query = query.where(params.orderBy, opt, params.cursor)

    }
    return query.orderBy(params.orderBy, params.sortOrder).limit(params.limit);

}

export function applyFilterParams(query:Knex.QueryBuilder,params:filterParams[]):Knex.QueryBuilder {

  for(const param of params){
    const {field,operator,value} = param;
    switch(operator){
        case "eq":
            query = query.where(field,value);
            break;
        case "neq":
            query = query.where(field,"!=",value);
            break;
        case "gt":
            query = query.where(field,">",value);
            break;
        case "gte":
            query = query.where(field,">=",value);
            break;
        case "lt":
            query = query.where(field,"<",value);
            break;
        case "lte":
            query = query.where(field,"<=",value);
            break;
        case "like":
            query = query.where(field,"like","%"+value+"%");
            break;
        case "in":
            query = query.whereIn(field,Array.isArray(value) ? value : [value]);
            break;
        case "nin":
            query = query.whereNotIn(field,Array.isArray(value) ? value : [value]);
            break;
    }
  }
  return query;

}
export function buildPaginateResponse<T>(rows:T[],limit:number,sortBy:string): { data: T[], metadata: PaginateResponse } {
    const hasMore = rows.length>limit;
   
    const data:T[] = rows.slice(0,limit)
    let nextCursor: string | null = null;
    if(data.length>0){
      const  lastItem = data[data.length-1] as any;
      nextCursor = hasMore && lastItem? String(lastItem[sortBy]): null

    }
    return {
        data,
        metadata : {

            hasMore,
            nextCursor,
            count:data.length
        }
    }

   
}