import {editorClient,validCover} from './editor';
export type UploadErrorCode='loginRequired'|'uploadSetup'|'uploadFailed'|'uploadTooLarge'|'uploadInvalid'|'uploadPermission';
export class ImageUploadError extends Error {constructor(public code:UploadErrorCode){super(code);}}
export async function uploadCover(file:File):Promise<string>{
 if(!['image/jpeg','image/png','image/webp','image/gif'].includes(file.type))throw new ImageUploadError('uploadInvalid');
 if(!file.size||file.size>8*1024*1024)throw new ImageUploadError('uploadTooLarge');
 const {data:{session},error:sessionError}=await editorClient.auth.getSession();
 if(sessionError||!session)throw new ImageUploadError('loginRequired');
 const body=new FormData();body.set('file',file);
 const base=import.meta.env.VITE_SUPABASE_URL.replace(/\/$/,'');
 let response:Response;
 try{response=await fetch(`${base}/functions/v1/imagekit-upload`,{method:'POST',headers:{apikey:import.meta.env.VITE_SUPABASE_ANON_KEY,Authorization:`Bearer ${session.access_token}`},body,signal:AbortSignal.timeout(60000)});}catch{throw new ImageUploadError('uploadFailed');}
 const result=await response.json().catch(()=>({}));
 if(!response.ok){if(response.status===404||['imagekit_setup_required','imagekit_credentials_invalid','database_setup_required'].includes(result.code))throw new ImageUploadError('uploadSetup');if(response.status===401)throw new ImageUploadError('loginRequired');if(response.status===403)throw new ImageUploadError('uploadPermission');if(response.status===413)throw new ImageUploadError('uploadTooLarge');if(response.status===415||response.status===400)throw new ImageUploadError('uploadInvalid');throw new ImageUploadError('uploadFailed');}
 if(typeof result.url!=='string'||!validCover(result.url)||!new URL(result.url).pathname.startsWith(new URL(import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT).pathname.replace(/\/$/,'')+'/AU_VIET_NEWS/'))throw new ImageUploadError('uploadFailed');
 return result.url;
}

export async function checkImageUpload():Promise<boolean>{
 const {data:{session}}=await editorClient.auth.getSession();if(!session)return false;
 const response=await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/imagekit-upload`,{headers:{apikey:import.meta.env.VITE_SUPABASE_ANON_KEY,Authorization:`Bearer ${session.access_token}`},signal:AbortSignal.timeout(10000)});
 if(!response.ok)return false;const result=await response.json();return result.configured===true;
}
