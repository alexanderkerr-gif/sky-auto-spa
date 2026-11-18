export const encode = text => btoa(Array.from(new TextEncoder().encode(text), x=>String.fromCharCode(x)).join(''));
export const decode = text => new TextDecoder().decode(Uint8Array.from(atob(text.replace(/\s/g,'')),c=>c.charCodeAt(0)));
export class Repository {
 constructor(repo,branch,token,request=fetch){this.repo=repo;this.branch=branch;this.token=token;this.request=request;}
 async api(path,method='GET',body){const r=await this.request('https://api.github.com/repos/'+this.repo+path,{method,headers:{Accept:'application/vnd.github+json',Authorization:'Bearer '+this.token,'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});if(!r.ok){if(r.status===401)throw Error('Your session expired. Sign in again.');if(r.status===403)throw Error('GitHub denied access. Check repository write access or try again after the rate limit resets.');if([409,422].includes(r.status))throw Error('The repository changed. Reload the section before publishing again.');throw Error('GitHub request failed ('+r.status+'). Your draft is still here.');}return r.status===204?null:r.json();}
 async read(id,ref=this.branch){const f=await this.api('/contents/content/'+id+'.json?ref='+encodeURIComponent(ref));return {sha:f.sha,data:JSON.parse(decode(f.content))};}
 async publish(id,data,original,uploads){
 const ref=await this.api('/git/ref/heads/'+encodeURIComponent(this.branch));const head=ref.object.sha;
 const latest=await this.read(id,head);if(JSON.stringify(latest.data)!==JSON.stringify(original))throw Error('Someone changed this section since you opened it. Your draft is safe. Reload the latest version before publishing.');
 const commit=await this.api('/git/commits/'+head);const entries=[];
 for(const [path,base64] of uploads){const blob=await this.api('/git/blobs','POST',{content:base64,encoding:'base64'});entries.push({path:'public'+path,mode:'100644',type:'blob',sha:blob.sha});}
 entries.push({path:'content/'+id+'.json',mode:'100644',type:'blob',content:JSON.stringify(data,null,2)+'\n'});
 const tree=await this.api('/git/trees','POST',{base_tree:commit.tree.sha,tree:entries});
 const next=await this.api('/git/commits','POST',{message:'Update '+id+' from Sky Auto Spa Studio',tree:tree.sha,parents:[head]});
 await this.api('/git/refs/heads/'+encodeURIComponent(this.branch),'PATCH',{sha:next.sha,force:false});return next.sha;
 }
}
// Netlify's OAuth popup protocol, bound to both the expected origin and window.
export function signIn(site){return new Promise((resolve,reject)=>{
 const origin='https://api.netlify.com';const popup=window.open(origin+'/auth?provider=github&site_id='+encodeURIComponent(new URL(site).hostname)+'&scope=public_repo','sky-studio-login','width=960,height=650');
 if(!popup){reject(Error('Allow the sign-in popup, then try again.'));return;}
 const cleanup=()=>{window.removeEventListener('message',message);clearInterval(closed);clearTimeout(timeout);popup.close();};
 const message=e=>{if(e.origin!==origin||e.source!==popup||typeof e.data!=='string')return;if(e.data==='authorizing:github'){popup.postMessage(e.data,origin);return;}if(e.data.startsWith('authorization:github:')){try{if(!e.data.startsWith('authorization:github:success:'))throw Error();const result=JSON.parse(e.data.slice('authorization:github:success:'.length));if(!result.token)throw Error();cleanup();resolve(result.token);}catch{cleanup();reject(Error('Sign-in did not complete. Please try again.'));}}};
 window.addEventListener('message',message);const closed=setInterval(()=>{if(popup.closed){cleanup();reject(Error('Sign-in window closed.'));}},700);const timeout=setTimeout(()=>{cleanup();reject(Error('Sign-in timed out. Try again.'));},180000);
 });}
