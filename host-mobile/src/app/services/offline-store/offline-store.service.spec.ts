import { OfflineStoreDriver, OfflineStoreService } from "./offline-store.service";
import { UserPreferencesService } from "../user-preferences/user-preference.service";
import { EncryptionService } from "./encryption.service";
import { classWithProviders } from "src/app/testing.util";
import { WebComponentFamily } from "src/app/models/wc-family.model";


describe('OfflineStoreService', () => {
  let service: OfflineStoreService
  let driverMock: OfflineStoreDriver
  let userPreferencesServiceMock: Partial<UserPreferencesService>
  let encryptionServiceMock: Partial<EncryptionService>


  beforeEach(() => {
    userPreferencesServiceMock = {
      getHasRunBefore: jest.fn(),
      setHasRunBefore: jest.fn(),
    }

    encryptionServiceMock = {
      init: jest.fn(),
      reset: jest.fn(),
      encryptData: jest.fn(),
      decryptData: jest.fn()
    }    

    driverMock = {
      init: jest.fn(),
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      removeAllItems: jest.fn()
    }

    service = classWithProviders({
      token: OfflineStoreService,
      providers: [
        { provide: UserPreferencesService, useValue: userPreferencesServiceMock },
        { provide: EncryptionService,      useValue: encryptionServiceMock }
      ]
    })
  })


  it("should initialize the service when it is not the first time", async () => {
    jest.spyOn(userPreferencesServiceMock, 'getHasRunBefore').mockResolvedValue(true)
    await service.init(driverMock)
    expect(encryptionServiceMock.init).toHaveBeenCalled()
    expect(driverMock.removeAllItems).not.toHaveBeenCalled()
    expect(encryptionServiceMock.reset).not.toHaveBeenCalled()
    expect(userPreferencesServiceMock.setHasRunBefore).not.toHaveBeenCalled()
  })

  it("should initialize the service for the first time", async () => {
    jest.spyOn(userPreferencesServiceMock, 'getHasRunBefore').mockResolvedValue(false)
    await service.init(driverMock)
    expect(encryptionServiceMock.init).toHaveBeenCalled()
    expect(driverMock.removeAllItems).toHaveBeenCalledTimes(3)
    expect(encryptionServiceMock.reset).toHaveBeenCalledTimes(1)
    expect(userPreferencesServiceMock.setHasRunBefore).toHaveBeenCalledWith(true)
  })


  describe("when properly initialized", () => {
    beforeEach(async () => {
      jest.spyOn(userPreferencesServiceMock, 'getHasRunBefore').mockResolvedValue(true)
      await service.init(driverMock)
      jest.resetAllMocks()
    })    

    describe(", getting data from the store, ", () => {
      it("should return null trying to retrieve an unknown key", async () => {
        jest.spyOn(driverMock, 'getItem').mockResolvedValue(null)
        const value = await service.get(WebComponentFamily.Family1, 'key1')
        expect(value).toBeNull()
        expect(driverMock.getItem).toHaveBeenCalledWith(WebComponentFamily.Family1, 'host_mobile:key1')
        expect(encryptionServiceMock.decryptData).not.toHaveBeenCalled()
      })
    
      it("should get a non encrypted value from the store", async () => {
        jest.spyOn(driverMock, 'getItem').mockResolvedValue({value:'hello', encryption:false})
        const value = await service.get(WebComponentFamily.Family1, 'key1')
        expect(value).toEqual('hello')
        expect(driverMock.getItem).toHaveBeenCalledWith(WebComponentFamily.Family1, 'host_mobile:key1')
        expect(encryptionServiceMock.decryptData).not.toHaveBeenCalled()
      })
      
      it("should get an encrypted value from the store", async () => {
        jest.spyOn(driverMock, 'getItem').mockResolvedValue({value:'@@@["hello"]@@@', encryption:true})
        jest.spyOn(encryptionServiceMock, 'decryptData').mockReturnValue('"hello"')
        const value = await service.get(WebComponentFamily.Family1, 'key1')
        expect(value).toEqual('hello')
        expect(driverMock.getItem).toHaveBeenCalledWith(WebComponentFamily.Family1, 'host_mobile:key1')
        expect(encryptionServiceMock.decryptData).toHaveBeenCalledWith('@@@["hello"]@@@')
      })
  
      it("should get null when there is an exception decrypting data", async () => {
        jest.spyOn(driverMock, 'getItem').mockResolvedValue({value:'@@@["hello"]@@@', encryption:true})
        jest.spyOn(encryptionServiceMock, 'decryptData').mockImplementation(() => { throw new Error('decrypt error!') })
        const value = await service.get(WebComponentFamily.Family1, 'key1')
        expect(value).toBeNull()
        expect(driverMock.getItem).toHaveBeenCalledWith(WebComponentFamily.Family1, 'host_mobile:key1')
        expect(encryptionServiceMock.decryptData).toThrow(/decrypt error/)
      })
    })

    describe(", saving data in the store, ", () => {
      it("should save a non encrypted value in the store", async () => {
        await service.set(WebComponentFamily.Family1, 'key1', {a:1, b:'blah'}, false)
        expect(driverMock.setItem).toHaveBeenCalledWith(WebComponentFamily.Family1, 'host_mobile:key1', {value:{a:1, b:'blah'}, encryption:false})
        expect(encryptionServiceMock.encryptData).not.toHaveBeenCalled()
      })

      it("should by default save a non encrypted value in the store", async () => {
        await service.set(WebComponentFamily.Family1, 'key1', 'hello')  // no explicit encryption param
        expect(driverMock.setItem).toHaveBeenCalledWith(WebComponentFamily.Family1, 'host_mobile:key1', {value:'hello', encryption:false})
        expect(encryptionServiceMock.encryptData).not.toHaveBeenCalled()
      })

      it("should save an encrypted value in the store", async () => {
        jest.spyOn(encryptionServiceMock, 'encryptData').mockReturnValue('some-encrypted-data')
        await service.set(WebComponentFamily.Family1, 'key1', {a:1, b:'blah'}, true)
        expect(driverMock.setItem).toHaveBeenCalledWith(WebComponentFamily.Family1, 'host_mobile:key1', {value:'some-encrypted-data', encryption:true})
        expect(encryptionServiceMock.encryptData).toHaveBeenCalledWith(JSON.stringify({a:1, b:'blah'}))
      })
    })

    it("should remove data from the store", async () => {
        await service.remove(WebComponentFamily.Family1, 'key1')
        expect(driverMock.removeItem).toHaveBeenCalledWith(WebComponentFamily.Family1, 'host_mobile:key1')
    })
  })
})
