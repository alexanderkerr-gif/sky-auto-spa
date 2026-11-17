'use strict';
const root=document.documentElement;
const menu=document.querySelector('#menu-toggle');
const scrim=document.querySelector('#scrim');
const theme=document.querySelector('#theme-toggle');
function closeMenu(){document.body.classList.remove('menu-open');scrim.hidden=true;menu.setAttribute('aria-expanded','false');}
menu.addEventListener('click',()=>{if(innerWidth<=900){const open=!document.body.classList.contains('menu-open');document.body.classList.toggle('menu-open',open);scrim.hidden=!open;menu.setAttribute('aria-expanded',String(open));}else{document.body.classList.toggle('sidebar-collapsed');menu.setAttribute('aria-expanded',String(!document.body.classList.contains('sidebar-collapsed')));}});
scrim.addEventListener('click',closeMenu);
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeMenu();menu.focus();}});
window.addEventListener('resize',()=>{if(innerWidth>900)closeMenu();});
function setTheme(value){root.dataset.theme=value;theme.textContent=value==='dark'?'☀':'☾';theme.setAttribute('aria-label',value==='dark'?'Switch to light theme':'Switch to dark theme');try{localStorage.setItem('sky-studio-theme',value);}catch{}}
try{setTheme(localStorage.getItem('sky-studio-theme')||'light');}catch{setTheme('light');}
theme.addEventListener('click',()=>setTheme(root.dataset.theme==='dark'?'light':'dark'));
const names={overview:'Overview',editor:'Website sections',photos:'Photos',guide:'Publishing guide'};
const sections={navigation:['Navigation','Logo, branding, menu links, and the mobile menu.'],hero:['Hero','Introductory label, headline, images, and action buttons.'],feature:['50/50 Feature','Side-by-side photo, headings, body copy, detail rows, and button.'],showcase:['Full-width Showcase','Statement heading, wide image, caption, and story content.'],location:['Location & Details','Address, phone, opening hours, map, and directions.'],faqs:['FAQs','Add, edit, reorder, or remove questions and answers.'],settings:['SEO & Footer','Search appearance and footer text.']};
function route(){
const key=location.hash.slice(1)||'overview';const id=key.startsWith('edit/')?key.slice(5):null;const selected=id&&sections[id]?id:null;const page=selected?'editor':names[key]?key:'overview';
document.querySelectorAll('.page').forEach(el=>el.hidden=el.id!==page);
document.querySelectorAll('[data-nav]').forEach(a=>{const active=a.dataset.nav===page;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
document.querySelectorAll('[data-section]').forEach(a=>{const active=a.dataset.section===selected;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
const label=selected?sections[selected][0]:names[page];document.querySelector('#page-title').textContent=label;document.title=label+' · Sky Auto Spa Studio';
if(page==='editor'){
 document.querySelector('#section-picker').hidden=!!selected;
 document.querySelector('#editor-heading').textContent=selected?sections[selected][0]:'Website sections';
 document.querySelector('#editor-description').textContent=selected?sections[selected][1]:'Choose the part of your page you want to update.';
 document.querySelector('#editor-help').textContent=selected?'This editor saves only this section. Click Publish when ready; allow a few minutes for the live site to update.':'Choose a section below to edit only that component. Each section publishes independently.';
 const full=document.querySelector('#fullscreen-editor');full.hidden=!selected;
 const url=selected?'/admin/editor.html#/collections/'+selected+'/entries/'+selected:'/admin/editor.html';full.href=url;
 document.querySelectorAll('.cms-frame').forEach(frame=>frame.hidden=frame.dataset.section!==selected);
 if(selected&&!document.querySelector('#frame-'+selected)){const frame=document.createElement('iframe');frame.id='frame-'+selected;frame.dataset.section=selected;frame.className='cms-frame';frame.title=sections[selected][0]+' content editor';frame.src=url;document.querySelector('#section-editors').append(frame);}
}
closeMenu();scrollTo(0,0);
}
window.addEventListener('hashchange',route);route();
const photoFields=[['hero_image','Desktop hero','The first image customers see on a larger screen.'],['hero_mobile_image','Mobile hero','A closer crop for customers on their phones.'],['services_image','Services photo','The image next to your car wash information.'],['about_image','About photo','The image that accompanies your introduction.']];
async function loadContent(){const status=document.querySelector('#data-status');try{const response=await fetch('/admin/overview.json',{cache:'no-store'});if(!response.ok)throw Error('Content unavailable');const d=await response.json();document.querySelector('#services-count').textContent=(d.services||[]).length;document.querySelector('#services-state').textContent=d.services?.length?'Feature details are ready':'No detail rows added';const photos=photoFields.filter(([key])=>d[key]);document.querySelector('#photos-count').textContent=photos.length;document.querySelector('#hours-state').textContent=d.hours?.trim()?'Added':'Not set';document.querySelector('#hours-note').textContent=d.hours?.trim()?'Review when your schedule changes.':'Customers are asked to call ahead.';document.querySelector('#hero-heading').textContent=d.hero_title;document.querySelector('#hero-intro').textContent=d.hero_intro;function safeImage(path){return typeof path==='string'&&path.startsWith('/assets/')&&!path.includes('..')?path:'/assets/hero.webp';}document.querySelector('#hero-preview').src=safeImage(d.hero_image);const grid=document.querySelector('#photo-grid');grid.replaceChildren();for(const [key,title,description]of photos){const card=document.createElement('article');card.className='card photo-card';const img=document.createElement('img');img.src=safeImage(d[key]);img.alt=title+' currently used on the website';img.loading='lazy';const header=document.createElement('div');header.className='card-heading';const copy=document.createElement('div');const h=document.createElement('h2');h.textContent=title;const p=document.createElement('p');p.textContent=description;copy.append(h,p);const a=document.createElement('a');a.href='#edit/'+(key==='services_image'?'feature':key==='about_image'?'showcase':'hero');a.className='button secondary small';a.textContent='Replace';a.setAttribute('aria-label','Replace '+title.toLowerCase());header.append(copy,a);card.append(img,header);grid.append(card);}status.textContent='';}catch{status.textContent='Published details could not be loaded. Refresh this page, or open the editor to view your content.';status.classList.add('error');}}
loadContent();
