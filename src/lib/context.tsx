import {createContext,useContext} from 'react';
import type {Article,Locale} from './types';
export interface SiteContext { locale:Locale; articles:Article[]; demoMode:boolean; loading:boolean; saved:string[]; toggleSaved:(id:string)=>void; }
export const Site=createContext<SiteContext>(null!);
export const useSite=()=>useContext(Site);
