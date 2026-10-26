import {useState} from 'react';
import {Link} from 'react-router-dom';
import {useSite} from '../lib/context';
import {imageUrl} from '../lib/imagekit';
import branding from '../data/branding.json';
/** Keep the publication name searchable and readable at every screen size. */
export function Brand({footer=false}:{footer?:boolean}){
 const {locale}=useSite();const [failed,setFailed]=useState(false);
 return <Link to={`/${locale}`} className={`brand-lockup${footer?' brand-lockup-footer':''}`} aria-label="THỜI BÁO VIỆT - ÂU"><img className="brand-mark" src={failed?`${import.meta.env.BASE_URL}images/logo-viet-au.png`:imageUrl(branding.logo,footer?144:256)} onError={()=>setFailed(true)} alt="" width={1254} height={1254} decoding="async"/><span className="brand-wordmark"><span className="brand-kicker">THỜI BÁO</span><span className="brand-title">VIỆT <span>-</span> ÂU</span></span></Link>;
}
