import {useState} from 'react';
import {supabase} from './store';
export function Auth({onSuccess}:{onSuccess:()=>void}){
  const[email,setEmail]=useState(''),[password,setPassword]=useState('');
  const[error,setError]=useState(''),[notice,setNotice]=useState(''),[busy,setBusy]=useState(false),[signup,setSignup]=useState(false);
  return <main className="auth"><div className="auth-card"><a className="brand" href="/">✳ mở học.</a><h1>{signup?'Tạo tài khoản học tập':'Mở ra một ý tưởng mới.'}</h1><p>Đăng nhập để học và đồng bộ tiến độ trên các thiết bị.</p>
    <form onSubmit={async e=>{e.preventDefault();setBusy(true);setError('');setNotice('');try{
      const result=signup?await supabase!.auth.signUp({email,password}):await supabase!.auth.signInWithPassword({email,password});
      if(result.error)throw result.error;if(result.data.session)onSuccess();else setNotice('Kiểm tra email và mở liên kết xác minh, sau đó quay lại đăng nhập.');
    }catch(e){setError((e as Error).message);}finally{setBusy(false);}}}>
    <label>Email<input type="email" required autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)}/></label><label>Mật khẩu<input type="password" required minLength={8} autoComplete={signup?'new-password':'current-password'} value={password} onChange={e=>setPassword(e.target.value)}/></label><button className="primary" disabled={busy}>{signup?'Tạo tài khoản':'Đăng nhập'} →</button></form>
    <button className="text-btn" onClick={()=>{setSignup(!signup);setError('');setNotice('');}}>{signup?'Đã có tài khoản? Đăng nhập':'Chưa có tài khoản? Đăng ký'}</button>{notice&&<p role="status">{notice}</p>}{error&&<p className="error" role="alert">{error}</p>}
  </div></main>;
}
