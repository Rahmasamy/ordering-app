import {validate} from "class-validator";
import { AppError } from "../error/AppError.js";
import { plainToInstance } from "class-transformer";

export async function validateBody<T extends Object>(cls: new () => T, body: unknown): Promise<T> {

    const instance = plainToInstance(cls, body);
    const errors = await validate(instance,{
        whitelist : true
    });
    if(errors.length > 0) {
       const messages = errors.flatMap(
            (error) => Object.values(
            error.constraints ?? {}
        ))
        throw new AppError( messages.join(", \n "),400);
    }
    return instance;
}