import { Redis } from "ioredis";
import type { ICacheProvider } from "./ICacheProvider.js";

export interface CacheClient {
  port:number;
  host:string;
  password?:string;
  
}

export class RedisProvider implements ICacheProvider {
    private readonly client:Redis;
constructor(private readonly cache:CacheClient) {
    this.client = new Redis({
      host: this.cache.host,
      port: this.cache.port,
      password: this.cache.password,
      lazyConnect:true,
      maxRetriesPerRequest:3,
      
    });

    this.client.on('error',(err) => {
      console.log(`redis connection error:${err.message}`);
      
    })
    this.client.connect().then(() => {
      console.log(`redis connected successfully`);
      
    }).catch((err) => {
      console.log(`redis connection error:${err.message}`);
      
    })


}

async get(key:string):Promise<any>{
    return await this.client.get(key);

}
async set(key:string,value:any,ttl?:number):Promise<void>{
    if(ttl) {
        await this.client.set(key,value,'EX',ttl)
    }
    else{
        await this.client.set(key,value)
    }
}

async del(key:string):Promise<void>{
    await this.client.del(key)

}

}