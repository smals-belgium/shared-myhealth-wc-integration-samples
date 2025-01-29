import { Injectable } from "@angular/core";
import { ComponentCache } from "@smals-belgium/myhealth-wc-integration";
import { WebComponentFamily } from "../../models/wc-family.model";

@Injectable({
  providedIn: 'root'
})
export class CacheService {
  private cache:Record<WebComponentFamily, any> = {
    [WebComponentFamily.SamplePrescriptions]: {},
    [WebComponentFamily.Family1]: {},
    [WebComponentFamily.Family2]: {},
  }

  get(family:WebComponentFamily): ComponentCache {
    const cache = this.cache[family] as any
    return {
      get:    (key:string):any             => cache[key],
      set:    (key:string, value:any):void => { cache[key] = value },
      remove: (key:string):void            => { delete cache[key] }
    }
  }
}
