import assert from 'node:assert/strict';
import fs from 'node:fs';
import {render,safeLink} from '../render.mjs';
const ids=['navigation','hero','feature','showcase','location','faqs','settings'];
const data=Object.fromEntries(ids.map(id=>[id,JSON.parse(fs.readFileSync(`content/${id}.json`))]));
const config=JSON.parse(fs.readFileSync('cms-config.json'));
assert.deepEqual(config.collections.map(c=>c.name),ids);
assert.equal(new Set(config.collections.map(c=>c.files[0].file)).size,7);
for(const c of config.collections){assert.equal(c.files[0].name,c.name);for(const field of c.files[0].fields)assert.ok(field.name in data[c.name],c.name+'.'+field.name);}
const base=render(data,'https://example.com');
const changed=structuredClone(data);
changed.navigation.links=[{label:'Answers',url:'#faqs',new_tab:false}];changed.navigation.brand_primary='NEW BRAND';changed.navigation.menu_label='Browse';
changed.hero.heading='Different\nheadline';changed.hero.image_alt='Hero alt updated';changed.hero.primary_button={enabled:true,label:'Explore',target:'custom',url:'https://example.com/offers?a=1&b=2',new_tab:true};
changed.feature.heading='Feature heading';changed.feature.highlight='Highlight text';changed.feature.items=[{title:'Custom row',description:'Custom description',price:'$40'}];
changed.showcase.heading='Showcase heading';changed.showcase.caption='Custom caption';changed.showcase.paragraphs=[{text:'One paragraph'},{text:'Two paragraphs'}];changed.showcase.button={enabled:true,label:'See more',target:'custom',url:'#visit',new_tab:false};
changed.location.phone_e164='+12125550100';changed.location.phone='212-555-0100';changed.location.street='123 Test Street';changed.location.hours='Monday: Closed';changed.location.map_query='Test map location';
changed.faqs.heading='Your questions';changed.faqs.items=[{question:'Custom question?',source:'custom',answer:'Custom answer.'},{question:'When?',source:'hours',answer:''}];
const out=render(changed,'https://example.com');
for(const [key,needles] of Object.entries({navigation:['NEW BRAND','Answers','data-open-label="Browse"','tel:+12125550100'],hero:['Different<br>headline','Hero alt updated','https://example.com/offers?a=1&amp;b=2','target="_blank"'],feature:['Feature heading','Highlight text','Custom row','$40'],showcase:['Showcase heading','Custom caption','One paragraph','Two paragraphs','See more'],location:['123 Test Street','Monday: Closed','Test%20map%20location','Your questions','Custom answer.']})){for(const needle of needles)assert.ok(out[key].includes(needle),key+' missing '+needle);}
assert.equal((out.location.match(/<details>/g)||[]).length,2);
const one=structuredClone(data);one.hero.heading='Only hero changed';const oneResult=render(one,'https://example.com');for(const key of ['navigation','feature','showcase','location','footer'])assert.equal(oneResult[key],base[key]);
const empty=structuredClone(data);empty.faqs.items=[];empty.feature.items=[];empty.location.show_map=false;empty.hero.primary_button.enabled=false;const stripped=render(empty,'https://example.com');assert.ok(!stripped.location.includes('<details>'));assert.ok(!stripped.location.includes('<iframe'));assert.ok(!stripped.feature.includes('<dl'));assert.ok(!stripped.hero.includes('class="hero-call"'));
const unsafe=structuredClone(data);unsafe.hero.heading='<script>alert(1)</script>';assert.ok(render(unsafe,'https://example.com').hero.includes('&lt;script&gt;'));for(const value of ['javascript:alert(1)','//evil.test','data:text/html,x','https://example.com/\nattack'])assert.throws(()=>safeLink(value));
const faqBad=structuredClone(data);faqBad.faqs.items=[{question:'Q',source:'custom',answer:''}];assert.throws(()=>render(faqBad,'https://example.com'));
const admin=fs.readFileSync('public/admin/index.html','utf8');for(const id of ids)assert.ok(admin.includes('#edit/'+id),'missing dashboard link '+id);
console.log('PASS: seven distinct CMS forms; all section renderers; section isolation; custom links; repeatable rows and FAQs; map/hours/phone sync; empty/hidden sections; HTML escaping and unsafe URL rejection; dashboard routes.');
