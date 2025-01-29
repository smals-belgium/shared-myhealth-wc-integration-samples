import { WebComponentFamily } from "src/app/models/wc-family.model";
import { CacheService } from "./cache.service";
import { classWithProviders } from "src/app/testing.util";


describe('CacheService', () => {
  let service: CacheService

  beforeEach(() => {
    service = classWithProviders({ token: CacheService, providers: [] })
  })

  it('should return different caches for different scopes', async () => {
    const c1 = service.get(WebComponentFamily.SamplePrescriptions);
    c1.set('c1', 'v1')
    c1.set('c2', 'v2')
    expect(c1.get('c1')).toEqual('v1')
    expect(c1.get('c2')).toEqual('v2')

    const c2 = service.get(WebComponentFamily.Family1);
    expect(c2.get('c1')).toBeFalsy()
    expect(c2.get('c2')).toBeFalsy()

    c1.remove('c1')
    expect(c1.get('c1')).toBeFalsy()
    expect(c1.get('c2')).toEqual('v2')
  })

  it('should return the same cache when requested different times', async () => {
    const c1 = service.get(WebComponentFamily.Family2);
    c1.set('c1', 'v1')
    c1.set('c2', 'v2')
    expect(c1.get('c1')).toEqual('v1')
    expect(c1.get('c2')).toEqual('v2')

    const c2 = service.get(WebComponentFamily.Family2);
    expect(c2.get('c1')).toEqual('v1')
    expect(c2.get('c2')).toEqual('v2')

    c2.remove('c2')
    expect(c1.get('c1')).toEqual('v1')
    expect(c1.get('c2')).toBeFalsy()
    expect(c2.get('c1')).toEqual('v1')
    expect(c2.get('c2')).toBeFalsy()
  })
})
