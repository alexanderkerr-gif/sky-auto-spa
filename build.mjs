import fs from 'node:fs';
const d=JSON.parse(fs.readFileSync('content/site.json','utf8'));
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const lines=s=>esc(s).replace(/\r?\n/g,'<br>');
const repo=process.env.CMS_REPOSITORY;
if(!repo||!/^[\w.-]+\/[\w.-]+$/.test(repo))throw Error('Set CMS_REPOSITORY in Netlify to your actual GitHub owner/repository before deploying.');
if(!/^\+[1-9]\d{7,14}$/.test(d.phone_e164))throw Error('Dialing number must include country code, for example +13477215261');
for(const key of ['hero_image','hero_mobile_image','services_image','about_image']){
 if(!/^\/assets\/[\w./ -]+\.(webp|png|jpe?g|gif|avif)$/i.test(d[key])||d[key].includes('..')||!fs.existsSync('public'+d[key]))throw Error('Choose an uploaded image for '+key);
}
const address=d.street+', '+d.city+', '+d.state+' '+d.postal_code;
const hours=String(d.hours??'').trim();
const services=d.services??[];
if(!Array.isArray(services))throw Error('Services must be a list');
const origin=new URL(process.env.URL||'https://sunny-chimera-c97dec.netlify.app').origin;
const schema={'@context':'https://schema.org','@type':'AutoWash',name:'Sky Auto Spa',url:origin,telephone:d.phone_e164,address:{'@type':'PostalAddress',streetAddress:d.street,addressLocality:d.city,addressRegion:d.state,postalCode:d.postal_code,addressCountry:'US'}};
const values=Object.fromEntries(Object.entries(d).map(([k,v])=>[k,esc(v)]));
Object.assign(values,{
 hero_title:lines(d.hero_title),address_html:esc(d.street)+'<br>'+esc(d.city+', '+d.state+' '+d.postal_code),address_plain:esc(address),address_query:encodeURIComponent(address),
 schema:'<script type="application/ld+json">'+JSON.stringify(schema).replace(/</g,'\\u003c')+'</script>',
 hours_html:'<div class="opening-hours"><h3>Opening hours</h3><p>'+lines(hours||'Call ahead for current opening hours.')+'</p></div>',
 hours_summary:lines(hours||'Please call the shop to confirm opening hours before your visit.'),
 services_html:'<dl class="service-facts">'+(services.length?services.map(s=>'<div><dt>'+esc(s.name)+'</dt><dd>'+lines(s.description)+(s.price?'<br><strong>'+esc(s.price)+'</strong>':'')+'</dd></div>').join(''):'<div><dt>Wash options</dt><dd>Call for current services and pricing.</dd></div>')+'</dl>',
 seo:'<link rel="canonical" href="'+esc(origin)+'/"><meta property="og:url" content="'+esc(origin)+'/"><meta property="og:image" content="'+esc(origin+d.hero_image)+'">'
});
const html=fs.readFileSync('template.html','utf8').replace(/\{\{([\w_]+)\}\}/g,(_,key)=>{if(!(key in values))throw Error('Missing field '+key);return values[key]});
const config=JSON.parse(fs.readFileSync('cms-config.json','utf8'));config.backend.repo=repo;config.site_url=origin;config.display_url=origin;
fs.rmSync('dist',{recursive:true,force:true});fs.cpSync('public','dist',{recursive:true});
fs.writeFileSync('dist/index.html',html);
fs.writeFileSync('dist/admin/config.yml',JSON.stringify(config,null,2));
// The overview includes only information already published on the public site.
fs.writeFileSync('dist/admin/overview.json',JSON.stringify({hero_title:d.hero_title,hero_intro:d.hero_intro,hero_image:d.hero_image,hero_mobile_image:d.hero_mobile_image,services_image:d.services_image,about_image:d.about_image,services:d.services??[],hours:d.hours??''}));
fs.writeFileSync('dist/robots.txt','User-agent: *\nAllow: /\nDisallow: /admin/\nSitemap: '+origin+'/sitemap.xml\n');
fs.writeFileSync('dist/sitemap.xml','<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>'+esc(origin)+'/</loc></url></urlset>');
console.log('Built site and owner dashboard for '+repo);
