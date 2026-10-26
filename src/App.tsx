import {useEffect,useState,useCallback} from 'react';
import {Routes,Route,Navigate,useLocation,useParams,Outlet} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import {Site} from './lib/context';
import {sampleArticles,useArticles,isSample} from './lib/api';
import type {Locale} from './lib/types';
import {Header,Footer} from './components/Layout';
import Home from './pages/Home';
import Article from './pages/Article';
import Listing from './pages/Listing';
import Media from './pages/Media';
import Info from './pages/Info';
import {lazy,Suspense} from 'react';
const Editor=lazy(()=>import('./pages/Admin'));
function Layout(){const {locale:routeLocale}=useParams();const locale=(['vi','en','de'].includes(routeLocale||'')?routeLocale:'vi') as Locale;const {i18n,t}=useTranslation();const location=useLocation();const query=useArticles();const [saved,setSaved]=useState<string[]>(()=>{try{const value=JSON.parse(localStorage.getItem('viet-au-saved')||'[]');return Array.isArray(value)?value.filter(v=>typeof v==='string'):[];}catch{return [];}});const toggleSaved=useCallback((id:string)=>{setSaved(prev=>{const next=prev.includes(id)?prev.filter(v=>v!==id):[...prev,id];try{localStorage.setItem('viet-au-saved',JSON.stringify(next));}catch{/* Storage may be disabled by browser settings. */}return next;});},[]);
 useEffect(()=>{i18n.changeLanguage(locale);document.documentElement.lang=locale;try{localStorage.setItem('viet-au-locale',locale);}catch{}},[locale,i18n]);
 useEffect(()=>{window.scrollTo({top:0,behavior:'instant'});document.getElementById('main')?.focus({preventScroll:true});document.title=`THỜI BÁO VIỆT - ÂU | ${t('mission')}`;},[location.pathname,t]);
 const articles=query.data?.length?query.data:sampleArticles;const demoMode=articles.every(isSample);
 if(routeLocale!==locale)return <Navigate to="/vi" replace/>;
 return <Site.Provider value={{locale,articles,demoMode,loading:query.isPending,saved,toggleSaved}}><div id="top"/><Header/><main id="main" tabIndex={-1}><Outlet/></main><Footer/></Site.Provider>;
}
export default function App(){return <Routes><Route path="/" element={<Navigate to="/vi" replace/>}/><Route path="/:locale" element={<Layout/>}><Route index element={<Home/>}/><Route path="article/:slug" element={<Article/>}/><Route path="category/:slug" element={<Listing mode="category"/>}/><Route path="search" element={<Listing/>}/><Route path="saved" element={<Listing mode="saved"/>}/><Route path="multimedia" element={<Media/>}/><Route path="admin" element={<Suspense fallback={<div className="wrap editor-loading">…</div>}><Editor/></Suspense>}/><Route path="post" element={<Navigate to="../admin" replace/>}/>{(['about','contact','privacy','terms','newsletter'] as const).map(page=><Route key={page} path={page} element={<Info page={page}/>}/>)}<Route path="*" element={<Info page="404"/>}/></Route><Route path="*" element={<Navigate to="/vi" replace/>}/></Routes>;}
