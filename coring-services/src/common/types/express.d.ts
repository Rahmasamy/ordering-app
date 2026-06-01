declare namespace Express {
     interface Request {
        correlationId?: string;
        user?: {
            userId:string;
            role:string;
            email:string;
        }
    }
}