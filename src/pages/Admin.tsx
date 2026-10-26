import {useState,type FormEvent} from 'react';
import {Link} from 'react-router-dom';
import {ArrowLeft,Eye,EyeOff,Loader2,LockKeyhole,LogIn,LogOut,ShieldCheck} from 'lucide-react';
import {useSite} from '../lib/context';
import {useEditorAccess} from '../lib/editor-session';
import {editorClient,editorError,editorLoginEmail} from '../lib/editor';
import {editorCopy} from '../lib/editor-copy';
import {Button} from '../components/ui/button';
import Editor from './Editor';
export default function Admin(){
 const {locale}=useSite();const c=editorCopy[locale];const {session,authReady,sessionFailed,access,canPublish}=useEditorAccess();
 const [pending,setPending]=useState(false);const [error,setError]=useState('');const [showPassword,setShowPassword]=useState(false);
 async function signIn(e:FormEvent<HTMLFormElement>){e.preventDefault();setPending(true);setError('');const form=e.currentTarget;const values=new FormData(form);try{const {error}=await editorClient.auth.signInWithPassword({email:editorLoginEmail(String(values.get('username'))),password:String(values.get('password'))});if(error)throw error;form.reset();}catch(e){setError(c[editorError(e)]);}finally{setPending(false);}}
 async function signOut(){setError('');const {error}=await editorClient.auth.signOut({scope:'local'});if(error)setError(c[editorError(error)]);}
 if(!authReady||session&&access.isPending)return <div className="wrap admin-gate admin-gate-loading" role="status"><Loader2 className="animate-spin" size={24}/><p>{c.checking}</p></div>;
 if(canPublish)return <Editor/>;
 const accountError=session?(access.isError?c[editorError(access.error)]:c.notEditor):sessionFailed?c.sessionFailed:'';
 return <div className="wrap admin-gate"><section className="admin-login-card"><div className="admin-lock"><LockKeyhole size={29} strokeWidth={1.25}/></div><span className="eyebrow">{c.eyebrow}</span><h1>{c.login}</h1><p className="admin-login-intro">{c.loginIntro}</p>{accountError&&<p className="admin-login-error" role="alert">{accountError}</p>}{session?<div className="admin-access-actions"><p className="admin-session-email">{session.user.email}</p>{access.isError&&<Button variant="outline" onClick={()=>access.refetch()}>{c.retry}</Button>}<Button variant="outline" onClick={signOut}><LogOut size={16}/>{c.logout}</Button></div>:<form className="admin-login-form" onSubmit={signIn}><label htmlFor="admin-username">{c.loginName}</label><input id="admin-username" name="username" autoComplete="username" required maxLength={254} placeholder="admin" autoCapitalize="none" spellCheck={false}/><label htmlFor="admin-password">{c.password}</label><div className="admin-password-field"><input id="admin-password" name="password" type={showPassword?'text':'password'} autoComplete="current-password" required maxLength={256}/><button type="button" aria-label={showPassword?c.hidePassword:c.showPassword} onClick={()=>setShowPassword(v=>!v)}>{showPassword?<EyeOff size={18}/>:<Eye size={18}/>}</button></div>{error&&<p className="admin-login-error" role="alert">{error}</p>}<Button type="submit" disabled={pending}>{pending?<Loader2 size={16} className="animate-spin"/>:<LogIn size={16}/>} {pending?c.loggingIn:c.login}</Button></form>}<div className="admin-login-footnote"><ShieldCheck size={14}/>{c.loginRequired}</div><Link to={`/${locale}`} className="admin-home-link"><ArrowLeft size={14}/>{c.backHome}</Link></section></div>;
}
