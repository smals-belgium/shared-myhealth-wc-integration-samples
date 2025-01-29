import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, inject, input, OnInit, ViewChild } from '@angular/core';
import { CommonModule, LocationStrategy } from '@angular/common';
import { EventHandlerService } from '../services/event-handlers/event-handler.service';
import { ActivatedRoute } from '@angular/router';
import { CacheService } from '../services/cache/cache.service';
import { OfflineStoreService } from '../services/offline-store/offline-store.service';
import { AuthService } from '../services/auth/auth.service';
import { WebComponentFamily } from '../models/wc-family.model';
import { IonBackButton, IonButtons, IonContent, IonHeader, IonRefresher, IonRefresherContent, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { ComponentAccessTokenService, ComponentOfflineStore, componentSpecVersion, Configuration, Language, RegisterRefreshCallback } from '@smals-belgium/myhealth-wc-integration';

@Component({
  selector: 'app-wrapper',
  standalone: true,
  imports: [CommonModule, IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, IonContent, IonRefresher, IonRefresherContent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  styles:`
    div.wrapper { margin:8px 12px; }
  `,
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
@if(!!backButtonText()) {
          <ion-back-button
            defaultHref="/"
            [text]="backButtonText()"
            [attr.aria-label]="backButtonText()"
            (click)="onBackButton()"
          ></ion-back-button>
}
        </ion-buttons>
        <ion-title>{{title()}}</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-refresher mode="ios" slot="fixed" (ionRefresh)="handlePullToRefresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>
      <div class="wrapper" #wrapper></div>
    </ion-content>
  `,
})
export class WrapperComponent implements OnInit {
  template       = input.required<string>()
  title          = input.required<string>()
  family         = input.required<WebComponentFamily>()
  backButtonText = input<string>('')

  @ViewChild('wrapper', {static:true})
  wrapper?: ElementRef
  component:any
  callbacks: RegisterRefreshCallback[] = []

  private readonly locationStrategy = inject(LocationStrategy)
  private readonly activeRoute = inject(ActivatedRoute)
  private readonly authService = inject(AuthService)
  private readonly cacheService = inject(CacheService)
  private readonly eventHandler = inject(EventHandlerService)
  private readonly offlineStoreService = inject(OfflineStoreService)


  private makeOfflineService(family:WebComponentFamily): ComponentOfflineStore {
    const osService = this.offlineStoreService
    return {
      async get(key:string): Promise<any> { return await osService.get(family, key) },
      async set(key:string, value:any, encryption:boolean = false): Promise<void> { await osService.set(family,key,value,encryption) },
      async remove(key:string): Promise<void> { await osService.remove(family, key) }
    }
  }

  private makeAccessTokenService(): ComponentAccessTokenService {
    return {
      getAccessToken: (audience:string): Promise<string|null> => this.authService.getAccessToken(audience),
      getIdToken: (): Promise<string|null> => this.authService.getIdToken()
    }
  }

  private async createWebComponent() {
    const component:any = document.createElement(this.template())

    component.version    = componentSpecVersion
    component.language   = Language.EN
    component.configName = Configuration.DEV

    const services = {
      accessToken:  this.makeAccessTokenService(),
      cache:        this.cacheService.get(this.family()),
      offlineStore: this.makeOfflineService(this.family()),
      registerRefreshCallback: (callback:RegisterRefreshCallback) => this.callbacks.push(callback)
    }

    component.services = services

    // Register per-component output event handlers
    const outputs = this.eventHandler.getOutputs(this.family())
    for(const [outputName, handler] of Object.entries(outputs)) {
      component.addEventListener(outputName, ($event:any) => handler($event.detail))
    }

    // Register error handler
    component.addEventListener('onError', ($event:any) => {
      console.log("ON ERROR: ", $event.detail)
      const {title, text} = $event.detail
      window.alert(`${title}: ${text}`)
    });

    return component
  }


  ngOnInit(): void {
    console.log("WRAPPER - ON_INIT: ", this.template())

    this.createWebComponent().then(component => {
      this.component = component

      // This is to transform url params into inputs for the component we're instantiating
      this.activeRoute.params.subscribe((params:any) => {
        for(const key of Object.keys(params)){
          this.component[key] = params[key]
        }
      });

      console.log("WRAPPER: ", this.wrapper, this.component)
      this.wrapper?.nativeElement.append(this.component)
    })
  }

  onBackButton() {
    this.locationStrategy.back()
  }

  handlePullToRefresh(event:any) {
    console.log("PULL TO REFRESH");
    if (this.callbacks.length === 0) {
      event.target.complete()
      return
    }

    let doneLeft = this.callbacks.length
    for(const callback of this.callbacks) {
      callback(() => {
        console.log("done() called")
        if (--doneLeft === 0) {
          console.log("Pull To Refresh complete!")
          event.target.complete()
        }
      })
    }
  }
}
