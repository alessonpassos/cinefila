import { InjectionToken } from '@angular/core';
export interface ConfigLocal { tmdbToken: string; }
export const CONFIG_LOCAL = new InjectionToken<ConfigLocal>('configuracao.local');
