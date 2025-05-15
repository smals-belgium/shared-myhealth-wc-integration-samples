import { ChangeDetectorRef, Component, CUSTOM_ELEMENTS_SCHEMA, inject, input, OnInit } from "@angular/core";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { CommonModule } from "@angular/common";
import { CacheService } from "./cache.service";
import { WebComponentFamily } from "./wc-family";
import { ComponentServices, componentSpecVersion, Configuration, Language, RefreshCallback } from "@smals-belgium/myhealth-wc-integration";
import {ComponentSpecs} from '@smals-belgium/myhealth-wc-integration-angular';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div>
      <div style="position:relative; width:100%;">
        <div [ngStyle]="{'opacity':listOpacity}" style="float:left; width:30%; border-right:1px solid #555;">
          <div>
            <button routerLink="/">Home</button>
            &nbsp;&nbsp;&nbsp;
            <button (click)="onRefresh()">Refresh</button>
          </div>
          <div style="font-weight:bold; margin-top:24px;">Sample Prescriptions</div>
          <sample-prescriptions-list
              [specs]="specs"
              (onSelectedPrescription)="onSelectedPrescription($event)"
              (onError)="onError($event)"
          />
        </div>
        <div style="float:right; width:69%; border:0px solid blue;">
          <div style="font-weight:bold; margin-top:45px;">Prescription Details</div>
          <div style="margin-left:16px; margin-top:13px;">
            <sample-prescriptions-details
                [specs]="specs"
                [pid]="prescriptionId"
                (onError)="onError($event)"
            />
          </div>
        </div>
      </div>
    </div>
  `,
})
export class SamplePrescriptionsComponent implements OnInit {
  family = input.required<WebComponentFamily>()

  private readonly cacheService = inject(CacheService)
  private readonly router = inject(Router)
  private readonly activeRoute = inject(ActivatedRoute)

  prescriptionId?: string
  listOpacity = 1.0

  language = Language.FR
  configName = Configuration.DEV
  componentServices?: ComponentServices
  version?:string
  specs!: ComponentSpecs
  refreshCallbacks: RefreshCallback[] = []

  constructor(private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    console.log("SamplePrescriptionsComponent INIT", this.family(), componentSpecVersion);
    this.version = componentSpecVersion
    this.componentServices = {
      cache: this.cacheService.get(this.family()),
      getAccessToken: async (audience: string) => `sample-host-web-access-token-${audience}`,
      registerRefreshCallback: (callback) => this.refreshCallbacks.push(callback)
    }

    this.specs = {
      version: this.version,
      language: this.language,
      configName: this.configName,
      services: this.componentServices
    }

    this.activeRoute.queryParams.subscribe((params:any) => {
      if (!!params.pid){
        console.log("Changing prescriptionID to ", params.pid)
        this.prescriptionId = params.pid;
      }
    })
  }

  onSelectedPrescription($event:any) {
    const pid = $event.detail
    console.log("onSelectedPrescription, pid: ", pid);
    const urlParts = this.router.url.split('?')
    this.router.navigateByUrl(`${urlParts[0]}?pid=${pid}`)
  }

  onError($event:any) {
    const {title, text} = $event.detail
    window.alert(`${title}: ${text}`)
  }

  onRefresh() {
    if (this.refreshCallbacks.length === 0) {
      return
    }

    this.listOpacity = 0.3;
    let doneLeft = this.refreshCallbacks.length
    for(const callback of this.refreshCallbacks) {
      callback(() => {
        console.log("done() called")
        if (--doneLeft === 0) {
          console.log("Refresh complete!")
          this.listOpacity = 1.0;
          this.cdr.detectChanges();
          }
      })
    }
  }
}
