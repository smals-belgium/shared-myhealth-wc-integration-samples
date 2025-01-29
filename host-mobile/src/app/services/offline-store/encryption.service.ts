import { Injectable } from "@angular/core";
import { v4 as uuidv4 } from 'uuid'
import * as crypto from 'crypto-js'
import { KeychainAccess, SecureStorage } from "@aparajita/capacitor-secure-storage";


@Injectable({
  providedIn: 'root'
})
export class EncryptionService {
  private readonly ENCRYPTION_KEY_NAME = 'encryption_key'
  private readonly STORE_KEY_PREFIX = 'host_mobile:'

  private encryptionKey:string|null = null


  private generateKey(): string {
    return uuidv4().toString().split('-').join('')
  }


  async init() {
    console.log("[Encryption/init]")

    // Disable synchronization
    await SecureStorage.setSynchronize(false)

    // The data in the keychain can only be accessed when the device is unlocked.
    // Only available if a passcode is set on the device.
    // This is recommended for items that only need to be accessible while the
    // application is in the foreground. Items with this attribute never migrate
    // to a new device. After a backup is restored to a new device, these items
    // are missing. No items can be stored in this class on devices without a
    // passcode. Disabling the device passcode causes all items in this class to
    // be deleted.
    // See https://github.com/jrendel/SwiftKeychainWrapper/blob/develop/SwiftKeychainWrapper/KeychainItemAccessibility.swift
    await SecureStorage.setDefaultKeychainAccess(KeychainAccess.whenPasscodeSetThisDeviceOnly)

    // Define a string to be prefixed with any key used in the store
    await SecureStorage.setKeyPrefix(this.STORE_KEY_PREFIX)


    // Retrieve encryption key, if any
    try {
      this.encryptionKey = await SecureStorage.get(this.ENCRYPTION_KEY_NAME) as string
      console.log("[Encryption/init] retrieved encryption key,")
      //console.log("[Encryption/init] key:", this.encryptionKey)
    }
    catch(err){
      this.encryptionKey = null
    }

    // No/bad key, regenerate one
    if (this.encryptionKey == null) {
      await this.reset();
    }
  }


  async clean() {
    console.log("[Encryption/clean] destroying encryption key")
    this.encryptionKey = null
    await SecureStorage.remove(this.ENCRYPTION_KEY_NAME)
  }


  async reset() {
    console.log("[Encryption/reset] regenerating new encryption key")
    try {
      this.encryptionKey = this.generateKey()
      await SecureStorage.set(this.ENCRYPTION_KEY_NAME, this.encryptionKey)
      //console.log("[Encryption/reset] new key:", this.encryptionKey)
    }
    catch(err) {
      this.encryptionKey = null
      console.error(err)
      throw new Error("ERROR: unable to store newly generated encryption key!")
    }
  }


  encryptData(clearData:any): string {
    if (this.encryptionKey == null){
      throw new Error("No valid encryption key available!")
    }

    const encryptedData = crypto.AES.encrypt(JSON.stringify(clearData), this.encryptionKey).toString();
    return crypto.enc.Base64.stringify(crypto.enc.Utf8.parse(encryptedData));
  }


  decryptData(encryptedData:string): any {
    if (this.encryptionKey == null){
      throw new Error("No valid encryption key available!")
    }

    const parsed = crypto.enc.Base64.parse(encryptedData).toString(crypto.enc.Utf8);
    return JSON.parse(crypto.AES.decrypt(parsed, this.encryptionKey).toString(crypto.enc.Utf8));
  } 
}
