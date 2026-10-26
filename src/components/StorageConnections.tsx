import {Database,Image,RefreshCw} from 'lucide-react';
import {useQuery} from '@tanstack/react-query';
import {useArticles} from '../lib/api';
import {useSite} from '../lib/context';
import {checkImageUpload} from '../lib/image-upload';
import {storageCopy} from '../lib/storage-copy';
export function StorageConnections({editorId,canUpload}:{editorId?:string;canUpload:boolean}){
 const {locale}=useSite();const c=storageCopy[locale];const db=useArticles();const media=useQuery({queryKey:['imagekit-status',editorId],queryFn:checkImageUpload,enabled:canUpload,retry:false,staleTime:30000});
 const missing=(db.error as {code?:string})?.code==='PGRST205';
 return <section className="editor-connections" aria-label="Backend"><div className={db.isSuccess?'connection-ready':'connection-pending'}><Database size={19}/><div><span>{c.database}</span><strong>{db.isPending?c.dbChecking:db.isError?missing?c.dbMissing:c.dbError:c.dbReady}</strong>{db.isSuccess&&!db.data.length&&<p>{c.dbEmpty}</p>}</div><button type="button" onClick={()=>db.refetch()} aria-label={c.retry}><RefreshCw size={14}/></button></div><div className={canUpload&&media.data?'connection-ready':'connection-pending'}><Image size={19}/><div><span>{c.media}</span><strong>{!canUpload?c.mediaLogin:media.isPending?c.mediaChecking:media.data?c.mediaReady:c.mediaSetup}</strong><p>{c.mediaNote}</p></div>{canUpload&&<button type="button" onClick={()=>media.refetch()} aria-label={c.retry}><RefreshCw size={14}/></button>}</div></section>;
}
