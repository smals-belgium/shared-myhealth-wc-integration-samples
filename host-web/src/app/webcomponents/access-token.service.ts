import { Injectable } from "@angular/core";
import { ComponentAccessTokenService } from "@smals-belgium/myhealth-wc-integration";

@Injectable({
  providedIn: 'root'
})
export class AccessTokenService implements ComponentAccessTokenService {

  async getAccessToken(audience: string): Promise<string|null> {
    return `sample-host-web-access-token-${audience}`
  }

  async getIdToken(): Promise<string|null> {
    return "sample-host-web-id-token"
  }
}
