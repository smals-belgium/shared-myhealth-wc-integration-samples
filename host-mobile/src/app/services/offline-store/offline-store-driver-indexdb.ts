import { Injectable } from "@angular/core"
import { OfflineStoreDriver } from "./offline-store.service"
import { WebComponentFamily } from "src/app/models/wc-family.model";
import Dexie from 'dexie'


@Injectable({
  providedIn: 'root'
})
export class OfflineStoreIndexDBDriver implements OfflineStoreDriver {
  private readonly dbName = "host_mobile"
  private db: Dexie|undefined

  async init(createDexie?:(n:string)=>Dexie): Promise<void> {
    if (!!this.db) {
      throw new Error("Database already initialized!")
    }

    console.log("[OfflineStoreIndexDBDriver] initializing...")
    if (!!createDexie) {
      this.db = createDexie(this.dbName)
    }
    else {
      this.db = new Dexie(this.dbName)
    }

    // Create a collection for each WC family
    const collections:any = {}
    for(const family of Object.values(WebComponentFamily)){
      collections[family] = "&key"
    }
    this.db.version(1).stores(collections)
    console.log("[OfflineStoreIndexDBDriver] created collections for ", Object.values(WebComponentFamily))

    await this.db.open()
  }

  private verifyInitialized() {
    if (!this.db){
      throw new Error("Service has not been initialized!")
    }
  }

  async getItem(family:WebComponentFamily, key:string): Promise<any> {
    this.verifyInitialized()
    const data = await this.db!.table(family).get(key)
    return data?.value
  }

  async setItem(family:WebComponentFamily, key:string, value:any): Promise<void> {
    this.verifyInitialized()
    try {
      await this.db!.table(family).put({key, value, timestamp:Date.now()})
    }
    catch(err){
      console.log("[OfflineStoreIndexDBDriver] table.put() error: ", err)
      throw err
    }
  }

  async removeItem(family:WebComponentFamily, key: string): Promise<void> {
    this.verifyInitialized()
    await this.db!.table(family).delete(key)
  }

  async removeAllItems(family:WebComponentFamily): Promise<void> {
    this.verifyInitialized()
    await this.db!.table(family).clear()
  }
}

