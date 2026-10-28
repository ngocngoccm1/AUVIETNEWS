import {Link} from 'react-router-dom';
import {ArrowRight,ArrowUpRight,AudioLines,Images,Play,Heart} from 'lucide-react';
import {useTranslation} from 'react-i18next';
import {useSite} from '../lib/context';
import {localize} from '../lib/types';
import {getCategory,categories} from '../data/categories';
import {Photo,ArticleCard} from '../components/ArticleCard';
import {Newsletter,StoryDialog} from '../components/Forms';
import {Button} from '../components/ui/button';

export function SectionHeading({title,subtitle,to,green=false}:{title:string;subtitle?:string;to?:string;green?:boolean}){
 const {t}=useTranslation();
 return <div className={`section-heading ${green?'heading-green':''}`}><div><h2><span/>{title}</h2>{subtitle&&<p>{subtitle}</p>}</div>{to&&<Link to={to}>{t('seeAll')}<ArrowUpRight size={16}/></Link>}</div>;
}

export default function Home(){
 const {locale,articles,demoMode,loading}=useSite();const {t}=useTranslation();
 const lead=articles.find(a=>a.featured)||articles[0];
 const supporting=articles.filter(a=>a.id!==lead?.id).slice(0,3);
 const latest=[...articles].sort((a,b)=>new Date(b.published_at).getTime()-new Date(a.published_at).getTime()).slice(0,8);
 const popular=[...articles].sort((a,b)=>b.views-a.views).slice(0,6);
 const label={vi:{latest:'Tin mới',perspective:'Góc nhìn Việt – Âu',popular:'Tin đọc nhiều trong tuần',connection:'Nhịp cầu Việt – Âu',empty:'Khám phá chuyên mục'},en:{latest:'Latest news',perspective:'Vietnam – Europe perspectives',popular:'Most read this week',connection:'Connecting Vietnam & Europe',empty:'Explore this section'},de:{latest:'Aktuelle Nachrichten',perspective:'Vietnam – Europa Perspektiven',popular:'Meistgelesen diese Woche',connection:'Vietnam und Europa verbinden',empty:'Rubrik entdecken'}}[locale];
 return <div className="wrap newspaper-home">
  <div className="news-columns">
   <div className="news-main">
    {lead&&<section className="news-opening" aria-label={t('focus')}>
     <article className="news-lead">
      <Link className="news-lead-image" to={`/${locale}/article/${lead.slug}`}><Photo article={lead} eager width={1200}/></Link>
      <div className="news-lead-copy"><Link className="news-kicker" to={`/${locale}/category/${lead.category}`}>{getCategory(lead.category)?.short[locale]}</Link><Link to={`/${locale}/article/${lead.slug}`}><h1>{localize(lead,'title',locale)}</h1></Link><p>{localize(lead,'excerpt',locale)}</p></div>
     </article>
     <div className="news-supporting">
      {supporting.slice(0,2).map(a=><ArticleCard key={a.id} article={a} compact/>)}
      <article className="news-perspective"><span className="perspective-label">{label.perspective}</span>{supporting[2]?<><Link to={`/${locale}/article/${supporting[2].slug}`}><h2>{localize(supporting[2],'title',locale)}</h2></Link><p>{localize(supporting[2],'excerpt',locale)}</p><div className="perspective-author"><div><strong>{supporting[2].author}</strong><span>{getCategory(supporting[2].category)?.short[locale]}</span></div><Heart size={29} strokeWidth={1.3}/></div></>:<><h2>{t('mission')}</h2><p>{t('bridge')}</p></>}</article>
     </div>
    </section>}
    <Link className="news-connection-banner" to={`/${locale}/about`}><ArrowUpRight size={22}/><span>{label.connection}<small>{t('mission')}</small></span><ArrowRight size={22}/></Link>
    {categories.map(category=>{
     const stories=articles.filter(a=>a.category===category.slug).slice(0,4);
     return <section className="news-category" key={category.slug}>
      <div className="news-category-heading"><h2><Link to={`/${locale}/category/${category.slug}`}>{category.short[locale]}</Link></h2><Link className="news-category-more" to={`/${locale}/category/${category.slug}`} aria-label={`${t('seeAll')} ${category.short[locale]}`}><ArrowUpRight size={19}/></Link></div>
      <div className="news-subcategories">{category.subcategories.map(s=><Link key={s.slug} to={`/${locale}/category/${category.slug}?sub=${s.slug}`}>{s.name[locale]}</Link>)}</div>
      {stories.length?<div className="news-category-grid">{stories.map(a=><ArticleCard key={a.id} article={a}/>)}</div>:<Link className="news-empty-category" to={`/${locale}/category/${category.slug}`}>{label.empty}<ArrowRight size={16}/></Link>}
     </section>;
    })}
   </div>
   <aside className="news-sidebar">
    <section className="news-latest"><h2>{label.latest}</h2><div className="news-timeline">{latest.map(a=><Link key={a.id} to={`/${locale}/article/${a.slug}`}><h3>{localize(a,'title',locale)}</h3></Link>)}</div></section>
    <section className="news-popular"><h2>{label.popular}</h2>{popular.map((a,i)=><Link key={a.id} className="news-ranked" to={`/${locale}/article/${a.slug}`}><span>{i+1}</span><h3>{localize(a,'title',locale)}</h3></Link>)}</section>
    <section className="news-community"><Heart size={27} strokeWidth={1.3}/><h2>{t('communityTitle')}</h2><p>{t('communityText')}</p><StoryDialog><Button>{t('submitStory')}<ArrowUpRight size={16}/></Button></StoryDialog></section>
   </aside>
  </div>
  <section className="media-preview newspaper-media"><SectionHeading title={t('multimedia')} to={`/${locale}/multimedia`}/><div className="media-grid">{[{icon:Play,label:'video',image:articles[0],title:'videoTitle',type:'video'},{icon:AudioLines,label:'podcast',image:articles.find(a=>a.category==='cong-dong')||lead,title:'audioTitle',type:'podcast'},{icon:Images,label:'photoStories',image:articles.find(a=>a.category==='van-hoa')||lead,title:'photoStories',type:'photos'}].filter(item=>item.image).map(({icon:Icon,label,image,title,type})=><Link className={`media-tile media-${type}`} key={type} to={`/${locale}/multimedia?tab=${type}`}><Photo article={image}/><div className="media-tile-overlay"/><span className="media-type"><Icon size={14}/>{t(label)}</span><div className="media-tile-bottom"><h3>{t(title)}</h3><span className="media-play"><Icon size={20}/></span></div></Link>)}</div></section>
  <Newsletter/>
  <p className="news-edition-note">{loading?t('loading'):demoMode?t('sample'):t('magazine')}</p>
 </div>;
}
