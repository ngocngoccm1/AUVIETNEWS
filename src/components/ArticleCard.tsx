import {useEffect,useState} from 'react';
import {Link} from 'react-router-dom';
import {Bookmark,ArrowUpRight,Clock3} from 'lucide-react';
import {useTranslation} from 'react-i18next';
import {useSite} from '../lib/context';
import {imageUrl,localImage} from '../lib/imagekit';
import {localize,type Article} from '../lib/types';
import {getCategory} from '../data/categories';
export function Photo({article,className='',eager=false,width=900}:{article:Article;className?:string;eager?:boolean;width?:number}){
 const [failed,setFailed]=useState(false);useEffect(()=>setFailed(false),[article.cover_image]);
 return <img src={failed?localImage(article.cover_image):imageUrl(article.cover_image,width)} onError={()=>setFailed(true)} alt={localize(article,'title',useSite().locale)} className={`article-photo ${className}`} loading={eager?'eager':'lazy'} decoding="async"/>;
}
export function ArticleCard({article,compact=false}:{article:Article;compact?:boolean}){
 const {locale,saved,toggleSaved}=useSite();const {t}=useTranslation();
 return <article className={`article-card group ${compact?'card-compact':''}`}><Link to={`/${locale}/article/${article.slug}`} className="photo-link"><Photo article={article}/><span className="photo-arrow"><ArrowUpRight size={20}/></span></Link><div className="card-body"><div className="card-kicker"><Link to={`/${locale}/category/${article.category}`}>{getCategory(article.category)?.short[locale]}</Link><button className="save-button" onClick={()=>toggleSaved(article.id)} aria-label={t(saved.includes(article.id)?'unsave':'save')} aria-pressed={saved.includes(article.id)}><Bookmark size={16} fill={saved.includes(article.id)?'currentColor':'none'}/></button></div><Link to={`/${locale}/article/${article.slug}`}><h3>{localize(article,'title',locale)}</h3></Link>{!compact&&<p className="card-excerpt">{localize(article,'excerpt',locale)}</p>}<div className="article-meta"><span>{new Intl.DateTimeFormat(locale,{day:'2-digit',month:'2-digit'}).format(new Date(article.published_at))}</span><span className="meta-dot"/><span><Clock3 size={12}/>{article.reading_time} {t('min')}</span></div></div></article>;
}
