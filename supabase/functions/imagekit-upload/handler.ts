// Web-standard handler: runs in Supabase Edge Functions, tested without credentials.
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
export const IMAGE_FOLDER = '/AU_VIET_NEWS';
type Dependencies = {
 env: (name: string) => string | undefined;
 verifyEditor: (authorization: string) => Promise<200 | 401 | 403 | 503>;
 fetch?: typeof fetch;
};
function imageType(bytes: Uint8Array): { mime: string; extension: string } | null {
 if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return {mime:'image/jpeg',extension:'jpg'};
 if ([137,80,78,71,13,10,26,10].every((v,i)=>bytes[i]===v)) return {mime:'image/png',extension:'png'};
 const text=new TextDecoder().decode(bytes);
 if (text.startsWith('RIFF')&&text.slice(8,12)==='WEBP') return {mime:'image/webp',extension:'webp'};
 if (text.startsWith('GIF87a')||text.startsWith('GIF89a')) return {mime:'image/gif',extension:'gif'};
 return null;
}
export function createUploadHandler(deps:Dependencies) {
 return async (request:Request):Promise<Response> => {
  const origin=request.headers.get('origin')||'';
  const allowed=(deps.env('ALLOWED_ORIGINS')||'*').split(',').map(s=>s.trim());
  const cors={'Access-Control-Allow-Origin':allowed.includes('*')?'*':origin,'Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type','Access-Control-Allow-Methods':'GET, POST, OPTIONS','Vary':'Origin','Cache-Control':'no-store'};
  const json=(body:object,status=200)=>new Response(JSON.stringify(body),{status,headers:{...cors,'Content-Type':'application/json'}});
  if(origin&&!allowed.includes('*')&&!allowed.includes(origin))return new Response('Origin not allowed',{status:403});
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers:cors});
  if(request.method!=='POST'&&request.method!=='GET')return json({code:'method_not_allowed'},405);
  const authorization=request.headers.get('authorization')||'';
  if(!/^Bearer\s+\S+$/i.test(authorization))return json({code:'unauthorized'},401);
  try {
   const access=await deps.verifyEditor(authorization);
   if(access!==200)return json({code:access===401?'unauthorized':access===403?'editor_required':'database_setup_required'},access);
   const privateKey=deps.env('IMAGEKIT_PRIVATE_KEY');
   const endpoint=deps.env('IMAGEKIT_URL_ENDPOINT')||'https://ik.imagekit.io/noc';
   if(!privateKey)return json({code:'imagekit_setup_required'},503);
   if(request.method==='GET')return json({configured:true,folder:IMAGE_FOLDER});
   if(Number(request.headers.get('content-length'))>MAX_IMAGE_BYTES+65536)return json({code:'file_too_large'},413);
   if(!request.headers.get('content-type')?.startsWith('multipart/form-data'))return json({code:'invalid_file'},400);
   const body=await request.formData();const file=body.get('file');
   if(!(file instanceof File)||!file.size)return json({code:'invalid_file'},400);
   if(file.size>MAX_IMAGE_BYTES)return json({code:'file_too_large'},413);
   const type=imageType(new Uint8Array(await file.slice(0,16).arrayBuffer()));
   if(!type)return json({code:'invalid_file'},415);
   const fileName=`viet-au-${crypto.randomUUID()}.${type.extension}`;
   const upload=new FormData();
   upload.set('file',new File([file],fileName,{type:type.mime}));
   upload.set('fileName',fileName);upload.set('folder',IMAGE_FOLDER);
   upload.set('useUniqueFileName','true');upload.set('overwriteFile','false');
   const response=await (deps.fetch||fetch)('https://upload.imagekit.io/api/v1/files/upload',{
    method:'POST',headers:{Authorization:`Basic ${btoa(privateKey+':')}`},body:upload,signal:AbortSignal.timeout(45000)
   });
   if(!response.ok)return json({code:response.status===401||response.status===403?'imagekit_credentials_invalid':'imagekit_upload_failed'},502);
   const data=await response.json();
   // Return only public media metadata; never return upstream headers, keys, or errors.
   const url=new URL(data.url);const base=new URL(endpoint);
   const prefix=base.pathname.replace(/\/$/,'')+IMAGE_FOLDER+'/';
   if(url.protocol!=='https:'||url.origin!==base.origin||!url.pathname.startsWith(prefix)||typeof data.fileId!=='string')return json({code:'invalid_upload_response'},502);
   return json({url:url.href,fileId:data.fileId,folder:IMAGE_FOLDER});
  } catch {return json({code:'upload_unavailable'},502);}
 };
}
