import { useQuery } from '@tanstack/react-query';
import { supabase } from './supabase';
import demo from '../data/articles.json';
import type { Article, Comment, Locale } from './types';
export const sampleArticles = demo as Article[];
export function useArticles() { return useQuery({queryKey:['articles'],queryFn:async()=>{
 const {data,error}=await supabase.from('articles').select('*').order('published_at',{ascending:false}).limit(200);
 if(error) throw error;
 return (data||[]) as Article[];
},retry:1,staleTime:5*60*1000}); }
export function isSample(article:Article) { return article.id.startsWith('00000000-0000-4000-8000-'); }
export function useComments(articleId:string,enabled:boolean) { return useQuery({queryKey:['comments',articleId],queryFn:async()=>{
 const {data,error}=await supabase.from('comments').select('*').eq('article_id',articleId).order('created_at',{ascending:false}); if(error) throw error; return data as Comment[];
},enabled,retry:1}); }
export async function addComment(article_id:string,author_name:string,content:string) { const {error}=await supabase.from('comments').insert({article_id,author_name:author_name.trim(),content:content.trim()}); if(error) throw error; }
export async function subscribe(email:string,locale:Locale) { const {error}=await supabase.from('newsletter_subscribers').insert({email:email.trim().toLowerCase(),locale}); if(error) throw error; }
export async function sendStory(values:{author_name:string;email:string;title:string;content:string}) { const {error}=await supabase.from('story_submissions').insert(values); if(error) throw error; }
export function getAnonymousId() { let id=localStorage.getItem('viet-au-anonymous'); if(!id){id=crypto.randomUUID();localStorage.setItem('viet-au-anonymous',id);}return id; }
export async function getLikes(articleId:string) {
 const {count,error}=await supabase.from('likes').select('id',{count:'exact',head:true}).eq('article_id',articleId); if(error)throw error;
 const {data,error:ownError}=await supabase.from('likes').select('id').eq('article_id',articleId).eq('anonymous_id',getAnonymousId()).maybeSingle(); if(ownError)throw ownError;return {count:count||0,liked:!!data};
}
export async function toggleLike(articleId:string,liked:boolean) { const id=getAnonymousId();const {error}=liked ? await supabase.from('likes').delete().eq('article_id',articleId).eq('anonymous_id',id) : await supabase.from('likes').insert({article_id:articleId,anonymous_id:id});if(error)throw error; }
export function apiError(error:unknown, fallback:string) { return typeof error==='object' && error!==null && 'code' in error && error.code==='23505' ? 'duplicate' : fallback; }
