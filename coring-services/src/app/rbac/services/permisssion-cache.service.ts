import { getPermissionsByRoleName } from "../repo/permission.repo.js";
import { injectable } from "tsyringe";

@injectable()
export class PermissionCacheService {
     private permissionCacheMap: Map<string,{permissions: string[],cachedAt:number}> = new Map()
     private readonly cacheTTL: number = 1 * 60 * 60 * 1000 // 1 hour

     async getCachePermissions(roleName: string): Promise<string[] | null> {
         const cacheEntry = this.permissionCacheMap.get(roleName);
         if (!cacheEntry) return null;

         const isCacheValid = Date.now() - cacheEntry.cachedAt < this.cacheTTL;
         if (isCacheValid) {
          return cacheEntry.permissions;
         } 
         const permissions = await getPermissionsByRoleName(roleName)
         this.permissionCacheMap.set(roleName, {permissions, cachedAt: Date.now()})
         return permissions;
         
     }
    hasPermission(permissions:string[],resource:string,action:string):boolean{
        return permissions.includes(`${resource}:${action}`);
    }

    
}

export const permissionCacheService = new PermissionCacheService()