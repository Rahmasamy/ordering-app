import type { Response } from "express";
import type { PaginateResponse } from "../../pkg/pagination/pagination-cursor.js";


export interface ApiResponse<T=unknown> {
  data?:T ;
metadata?:Object;
success:boolean;

}




export const sendSuccessResponse = <T>(res:Response,data?:T,statusCode:number = 200,metadata?:Object)=>{
  const body:ApiResponse<T> = {
    success:true,
  }
  
  if (data !== undefined) {
    body.data = data;
  }
  
  if(metadata)
    body.metadata = metadata;
  
  res.status(statusCode).json(body)
}

export function sendPaginateResponse<T>(res:Response,data:T[],metadata:PaginateResponse){
  res.status(200).json({
    success:true,
    metadata,
    data
  })   
}