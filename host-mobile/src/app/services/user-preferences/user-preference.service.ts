import { Injectable } from "@angular/core";
import { Preferences } from "@capacitor/preferences";

@Injectable({
  providedIn: 'root'
})
export class UserPreferencesService {
  private readonly KEYS = {
    hasRunBefore:       'hasRunBefore',
    language:           'language',
    termsOfUseAccepted: 'termsOfUseAccepted'
  }

  private async _get(key:string): Promise<string|null> {
    return (await Preferences.get({key})).value
  }

  private async _set(key:string, value:any): Promise<void> {
    await Preferences.set({key, value:value.toString()})
  }


  async getHasRunBefore(): Promise<boolean> {
    // Boolean(null) will return false
    return Boolean(await this._get(this.KEYS.hasRunBefore))
  }
  async setHasRunBefore(v:boolean): Promise<void> {
    await this._set(this.KEYS.hasRunBefore, v)
  }

  async getLanguage(): Promise<string|null> {
    return await this._get(this.KEYS.language)
  }
  async setLanguage(lang:string): Promise<void> {
    await this._set(this.KEYS.language, lang)
  }

  async getTermsOfUseAccepted(): Promise<boolean> {
    return Boolean(await this._get(this.KEYS.language))
  }
  async setTermsOfUseAccepted(lang:string): Promise<void> {
    await this._set(this.KEYS.language, lang)
  }

}
