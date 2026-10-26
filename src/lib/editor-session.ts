import {useEffect,useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import type {Session} from '@supabase/supabase-js';
import {editorClient} from './editor';
export function useEditorAccess(){
 const [session,setSession]=useState<Session|null>(null);const [authReady,setAuthReady]=useState(false);const [sessionFailed,setSessionFailed]=useState(false);
 useEffect(()=>{let active=true;editorClient.auth.getSession().then(({data,error})=>{if(active){setSession(data.session);setSessionFailed(!!error);setAuthReady(true);}}).catch(()=>{if(active){setSessionFailed(true);setAuthReady(true);}});const {data:{subscription}}=editorClient.auth.onAuthStateChange((_event,next)=>{if(active){setSession(next);setAuthReady(true);setSessionFailed(false);}});return()=>{active=false;subscription.unsubscribe();};},[]);
 const access=useQuery({queryKey:['editor-access',session?.user.id],queryFn:async()=>{const {data,error}=await editorClient.from('editor_accounts').select('user_id').eq('user_id',session!.user.id).maybeSingle();if(error)throw error;return !!data;},enabled:!!session,retry:1,staleTime:0,refetchOnWindowFocus:true});
 return {session,authReady,sessionFailed,access,canPublish:!!session&&access.data===true&&!access.isError};
}
