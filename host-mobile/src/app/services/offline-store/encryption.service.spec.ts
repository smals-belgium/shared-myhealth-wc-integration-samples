import { KeychainAccess, SecureStorage } from "@aparajita/capacitor-secure-storage";
import { EncryptionService } from './encryption.service';
import * as uuid from 'uuid'
import { classWithProviders } from "src/app/testing.util";

jest.mock('@aparajita/capacitor-secure-storage')
jest.mock('uuid');

describe('EncryptionService', () => {
  let service: EncryptionService

  beforeEach(() => {
    SecureStorage.setSynchronize = jest.fn()
    SecureStorage.setDefaultKeychainAccess = jest.fn()
    SecureStorage.setKeyPrefix = jest.fn()
    SecureStorage.get = jest.fn()
    SecureStorage.set = jest.fn()
    SecureStorage.remove = jest.fn()

    service = classWithProviders({ token: EncryptionService, providers: [] })
  })

  it("should initialize the service with an existing encryption key", async () => {
    jest.mocked(SecureStorage.get).mockResolvedValue('some-key')

    await service.init()

    expect(SecureStorage.setSynchronize).toHaveBeenCalledWith(false)
    expect(SecureStorage.setDefaultKeychainAccess).toHaveBeenCalledWith(KeychainAccess.whenPasscodeSetThisDeviceOnly)
    expect(SecureStorage.setKeyPrefix).toHaveBeenCalledWith('host_mobile:')
    expect(SecureStorage.get).toHaveBeenCalledWith('encryption_key')
    expect(SecureStorage.set).not.toHaveBeenCalled()
    expect(SecureStorage.remove).not.toHaveBeenCalled()
  })

  it("should initialize the service and generate a new encryption key", async () => {
    jest.mocked(SecureStorage.get).mockResolvedValue(null)
    jest.mocked(uuid.v4 as ()=>string).mockReturnValueOnce('123-456-789')

    await service.init()

    expect(SecureStorage.setSynchronize).toHaveBeenCalledWith(false)
    expect(SecureStorage.setDefaultKeychainAccess).toHaveBeenCalledWith(KeychainAccess.whenPasscodeSetThisDeviceOnly)
    expect(SecureStorage.setKeyPrefix).toHaveBeenCalledWith('host_mobile:')
    expect(SecureStorage.get).toHaveBeenCalledWith('encryption_key')
    expect(SecureStorage.set).toHaveBeenCalledWith('encryption_key', '123456789')
    expect(SecureStorage.remove).not.toHaveBeenCalled()
  })

  describe("when properly initialized", () => {
    beforeEach(async () => {
      jest.mocked(SecureStorage.get).mockResolvedValue('some-valid-key')
      await service.init()
      expect(SecureStorage.setSynchronize).toHaveBeenCalledWith(false)
      expect(SecureStorage.setDefaultKeychainAccess).toHaveBeenCalledWith(KeychainAccess.whenPasscodeSetThisDeviceOnly)
      expect(SecureStorage.setKeyPrefix).toHaveBeenCalledWith('host_mobile:')
      expect(SecureStorage.get).toHaveBeenCalledWith('encryption_key')
      expect(SecureStorage.set).not.toHaveBeenCalled()
      expect(SecureStorage.remove).not.toHaveBeenCalled()

      jest.resetAllMocks()
    })

    it("should clean and remove the encryption key", async () => {
      await service.clean()
      expect(SecureStorage.get).not.toHaveBeenCalled()
      expect(SecureStorage.set).not.toHaveBeenCalled()
      expect(SecureStorage.remove).toHaveBeenCalledWith('encryption_key')
    })
  
    it("should reset the encryption key", async () => {
      jest.mocked(uuid.v4 as ()=>string).mockReturnValueOnce('a-b-c-d')
      await service.reset()
      expect(SecureStorage.get).not.toHaveBeenCalled()
      expect(SecureStorage.set).toHaveBeenCalledWith('encryption_key', 'abcd')
      expect(SecureStorage.remove).not.toHaveBeenCalled()
    })

    it("should properly encrypt data", async () => {
      const encryptedData = await service.encryptData({a:1, b:'hello'})
      expect(encryptedData.length).toBeGreaterThan(5)
    })

    it("should properly encrypt data (object)", async () => {
      const data = {hello:'world', blah:100}
      const encryptedData = await service.encryptData(data)
      const decryptedData = await service.decryptData(encryptedData)
      expect(decryptedData).toEqual(data)
    })

    it("should properly encrypt data (string)", async () => {
      const data = "Hello, world!"
      const encryptedData = await service.encryptData(data)
      const decryptedData = await service.decryptData(encryptedData)
      expect(decryptedData).toEqual(data)
    })

    it("should properly encrypt data (number)", async () => {
      const data = 57091
      const encryptedData = await service.encryptData(data)
      const decryptedData = await service.decryptData(encryptedData)
      expect(decryptedData).toEqual(data)
    })
  })

  describe("when not initialized", () => {
    it("should throw an error when trying to encrypt data", async () => {
      expect.assertions(1)
      expect(() => {
        service.encryptData('some data...')
      }).toThrow(/No valid encryption key available/)
    })

    it("should throw an error when trying to decrypt data", async () => {
      expect.assertions(1)
      expect(() => {
        service.decryptData('abcdefghijkl')
      }).toThrow(/No valid encryption key available/)
    })
  })
})
