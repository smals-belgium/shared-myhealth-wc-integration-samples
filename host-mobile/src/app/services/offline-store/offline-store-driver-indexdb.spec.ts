// See https://github.com/dumbmatter/fakeIndexedDB?tab=readme-ov-file#jsdom-often-used-with-jest
// about why we include this here.
import "core-js/stable/structured-clone"
import { IDBFactory, IDBKeyRange } from "fake-indexeddb";
import { OfflineStoreIndexDBDriver } from "./offline-store-driver-indexdb"
import { WebComponentFamily } from "src/app/models/wc-family.model"
import Dexie from "dexie";
import { classWithProviders } from "src/app/testing.util";

describe('OfflineStoreIndexDBDriver', () => {
  let service: OfflineStoreIndexDBDriver
  let indexedDB:IDBFactory|null


  function createDexie(dbName:string): Dexie {
    indexedDB = new IDBFactory()
    return new Dexie(dbName, { indexedDB: indexedDB, IDBKeyRange: IDBKeyRange })
  }

  beforeEach(async () => {
    indexedDB = null
    service = classWithProviders({
      token: OfflineStoreIndexDBDriver,
      providers: []
    })

    await service.init(createDexie)

    if (indexedDB){
      expect(await (indexedDB as IDBFactory).databases()).toEqual([{name:'host_mobile', version:10}])
      const db = await openDb()
      const stores = Array.from(db.objectStoreNames)
      stores.sort()
      expect(stores).toEqual(['family1', 'family2', 'sample-prescriptions'])
      db.close()
    }
  })


  function openDb(): Promise<IDBDatabase> {
    return new Promise((resolve,reject) => {
      const request = indexedDB!.open('host_mobile')
      request.onsuccess = (event) => {
        const db:IDBDatabase = request.result
        resolve(db)
      }
      request.onerror = (event) => {
        console.log("Error opening DB ", event)
        reject(event)
      }
    })
  }

  async function getAllData(name:string): Promise<any> {
    const db = await openDb()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(name, "readonly")
      const store = tx.objectStore(name)
      const query = store.getAll()

      query.onsuccess = (event) => {
        db.close()
        resolve(query.result)
      }
      query.onerror = (event) => {
        db.close()
        reject(event)
      }
    })
  }

  it("should throw when accessing service without first being initialized", async () => {
    const service2 = classWithProviders({
      token: OfflineStoreIndexDBDriver,
      providers: []
    })

    try {
      await service2.setItem(WebComponentFamily.Family1, 'key', 'value')
      fail()
    }
    catch(e){
      expect((e as Error).message).toEqual('Service has not been initialized!')
    }
  })

  it("should initialize without giving a create function", async () => {
    const service2 = classWithProviders({
      token: OfflineStoreIndexDBDriver,
      providers: []
    })

    try {
      await service2.init()
      fail()
    }
    catch(err){
      expect((err as Error).message).toMatch(/^IndexedDB API missing/)
    }
  })

  it("should throw when initializing a second time", async () => {
    try {
      await service.init(createDexie)
      fail()
    }
    catch(e){
      expect((e as Error).message).toEqual('Database already initialized!')
    }
  })

  it("should set an item in the store", async () => {
    expect(service).toBeDefined()
    const value = {a:'hello', b:'world'}
    await service.setItem(WebComponentFamily.SamplePrescriptions, 'data1', value)

    const data = await getAllData('sample-prescriptions')
    expect(data).toHaveLength(1)
    expect(Object.keys(data[0])).toEqual(['key', 'value', 'timestamp'])
    expect(data[0].key).toEqual('data1')
    expect(data[0].value).toEqual(value)
  })

  it("should replace an item in the store", async () => {
    expect(service).toBeDefined()
    await service.setItem(WebComponentFamily.SamplePrescriptions, 'data1', 'value1')
    let data = await getAllData('sample-prescriptions')
    expect(data[0].key).toEqual('data1')
    expect(data[0].value).toEqual('value1')

    await service.setItem(WebComponentFamily.SamplePrescriptions, 'data1', 'value222')
    data = await getAllData('sample-prescriptions')
    expect(data[0].key).toEqual('data1')
    expect(data[0].value).toEqual('value222')
  })

  it("should throw when setting invalid data", async () => {
    expect(service).toBeDefined()
    try {
      await service.setItem("bad" as WebComponentFamily, 'key', null)
      fail()
    }
    catch(err) {
      expect((err as Error).message).toEqual('Table bad does not exist')
    }
  })

  it("should receive null when querying for an non existing key", async () => {
    expect(service).toBeDefined()
    const data = await service.getItem(WebComponentFamily.Family1, 'data1')
    expect(data).not.toBeDefined()
  })

  it("should receive null when querying for an non existing key", async () => {
    expect(service).toBeDefined()
    const value = {a:'hello', b:'world', c:100}
    await service.setItem(WebComponentFamily.Family1, 'some-key', value)

    const data = await service.getItem(WebComponentFamily.Family1, 'some-key')
    expect(data).toEqual(value)
  })

  it("should remove an item from the store", async () => {
    expect(service).toBeDefined()
    await service.setItem(WebComponentFamily.Family1, 'key1', 'value for key1')
    await service.setItem(WebComponentFamily.Family1, 'key2', 'value for key2')

    expect( (await getAllData(WebComponentFamily.Family1)).map((d:any) => ({key:d.key, value:d.value})) ).toEqual([{key:'key1',value:'value for key1'},{key:'key2',value:'value for key2'}])
    await service.removeItem(WebComponentFamily.Family1, 'key2')
    expect( (await getAllData(WebComponentFamily.Family1)).map((d:any) => ({key:d.key, value:d.value})) ).toEqual([{key:'key1',value:'value for key1'}])
    await service.removeItem(WebComponentFamily.Family1, 'key2')
    expect( (await getAllData(WebComponentFamily.Family1)).map((d:any) => ({key:d.key, value:d.value})) ).toEqual([{key:'key1',value:'value for key1'}])
    await service.removeItem(WebComponentFamily.Family1, 'key1')
    expect(await getAllData(WebComponentFamily.Family1)).toEqual([])
  })

  it("should remove all items from the store", async () => {
    expect(service).toBeDefined()
    await service.setItem(WebComponentFamily.Family1, 'key1', 'value for key1')
    await service.setItem(WebComponentFamily.Family1, 'key2', 'value for key2')

    expect( (await getAllData(WebComponentFamily.Family1)).map((d:any) => ({key:d.key, value:d.value})) ).toEqual([{key:'key1',value:'value for key1'},{key:'key2',value:'value for key2'}])
    await service.removeAllItems(WebComponentFamily.Family1)
    expect(await getAllData(WebComponentFamily.Family1)).toEqual([])
  })
})
