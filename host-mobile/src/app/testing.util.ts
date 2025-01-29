import { Injector, Provider, Type } from '@angular/core';

export const classWithProviders = <T>({ token, providers }: { token: Type<T>; providers: Provider[] }): T => {
  const injector: Injector = Injector.create({ providers: [...providers, { provide: token }] });
  return injector.get(token);
};
