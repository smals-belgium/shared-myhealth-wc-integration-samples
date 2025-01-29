import { Injectable } from "@angular/core";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  async getAccessToken(audience:string): Promise<string|null> {
    return `sample-host-mobile-exchange-token-${audience}`
  }

  async getIdToken(): Promise<string|null> {
    return "sample-host-mobile-id-token"
  }
}
