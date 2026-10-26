import {createClient} from 'npm:@supabase/supabase-js@2.49.1';
import {createUploadHandler} from './handler.ts';
Deno.serve(createUploadHandler({
 env:(name)=>Deno.env.get(name),
 getPrivateKey:async()=>{
  const url=Deno.env.get('SUPABASE_URL');
  const key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if(!url||!key)return undefined;
  // Trusted backend only. This client/key is never sent to the browser.
  const server=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
  const {data,error}=await server.rpc('get_imagekit_upload_key');
  if(error)throw new Error('Secret lookup unavailable');
  return typeof data==='string'&&data?data:undefined;
 },
 verifyEditor:async(authorization)=>{
  const url=Deno.env.get('SUPABASE_URL');
  const key=Deno.env.get('SUPABASE_ANON_KEY');
  if(!url||!key)return 503;
  const client=createClient(url,key,{global:{headers:{Authorization:authorization}},auth:{persistSession:false,autoRefreshToken:false}});
  const {data:{user},error}=await client.auth.getUser(authorization.replace(/^Bearer\s+/i,''));
  if(error||!user)return 401;
  const {data,error:accessError}=await client.from('editor_accounts').select('user_id').eq('user_id',user.id).maybeSingle();
  if(accessError)return 503;
  return data?200:403;
 }
}));
