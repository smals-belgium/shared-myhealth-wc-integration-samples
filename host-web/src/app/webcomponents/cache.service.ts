import { Injectable } from "@angular/core";
import { ComponentCache } from "@smals-belgium/myhealth-wc-integration";
import { WebComponentFamily } from "./wc-family";

@Injectable({
  providedIn: 'root'
})
export class CacheService {
  private cache:Record<WebComponentFamily, any> = {
    [WebComponentFamily.SamplePrescriptions]: {}
  }

  // private getCache(family:WebComponentFamily): ComponentCache {
  //   const pthis = this
  //   return {
  //     get(key:string): any { return pthis.cache[family][key] },
  //     // set:    (key:string, value:any) => void
  //     // remove: (key:string) => void
    
  //   }
  // }

  get(family:WebComponentFamily): ComponentCache {
    // return this.cache[family];
    const cache = this.cache[family] as any
    return {
      get: (key:string):any => cache[key],
      set: (key:string, value:any):void => { cache[key] = value },
      remove: (key:string):void => { delete cache[key] }
    }
  }

}
