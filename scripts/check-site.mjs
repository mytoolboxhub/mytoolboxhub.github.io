import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { parse } from 'parse5';
import assert from 'node:assert/strict';
const pages = [];
function scan(dir) { for(const entry of readdirSync(dir,{withFileTypes:true})) {const p=join(dir,entry.name); if(entry.isDirectory()) scan(p); else if(p.endsWith('.html')) pages.push(p); } }
scan('dist');
const documents=new Map();
function nodes(root){return [root,...(root.childNodes||[]).flatMap(nodes)];}
function attr(node,name){return node.attrs?.find(a=>a.name===name)?.value;}
for(const path of pages) documents.set(path.replaceAll('\\','/'),nodes(parse(readFileSync(path,'utf8'))));
const origin='https://mytoolboxhub.github.io';
let checkedLinks=0;
for(const [path,tree] of documents){
 const route='/'+relative('dist',path).replaceAll('\\','/').replace(/index\.html$/,'');
 const canonical=tree.find(n=>n.tagName==='link' && attr(n,'rel')==='canonical');
 assert.equal(attr(canonical,'href'),origin+route,path+' canonical');
 assert.equal(tree.filter(n=>n.tagName==='h1').length,1,path+' heading');
 assert.ok(tree.some(n=>n.tagName==='meta'&&attr(n,'name')==='description'&&attr(n,'content')),path+' description');
 assert.ok(tree.some(n=>n.tagName==='meta'&&attr(n,'name')==='google-adsense-account'&&attr(n,'content')==='ca-pub-1771884902241881'),path+' publisher');
 for(const node of tree){
   const value=attr(node,'href') || (['script','img'].includes(node.tagName) ? attr(node,'src'):undefined);
   if(!value || /^(mailto:|data:)/.test(value)) continue;
   const url=new URL(value,origin+route);
   if(url.origin!==origin) continue;
   let target='dist'+decodeURIComponent(url.pathname);
   if(!/\.[^/]+$/.test(target)) target=target.replace(/\/$/,'')+'/index.html';
   if(target==='dist/')target='dist/index.html';
   assert.ok(existsSync(target),path+' missing '+value);
   if(url.hash && documents.has(target)) assert.ok(documents.get(target).some(n=>attr(n,'id')===decodeURIComponent(url.hash.slice(1))),path+' missing anchor '+value);
   checkedLinks++;
 }
 for(const node of tree.filter(n=>n.tagName==='script'&&attr(n,'type')==='application/ld+json')) JSON.parse((node.childNodes||[]).map(n=>n.value||'').join(''));
}
const sitemapFiles=readdirSync('dist').filter(f=>/^sitemap-\d+\.xml$/.test(f));
const sitemap=sitemapFiles.map(f=>readFileSync(join('dist',f),'utf8')).join('');
for(const path of documents.keys()) { const route='/'+relative('dist',path).replaceAll('\\','/').replace(/index\.html$/,''); assert.ok(sitemap.includes('<loc>'+origin+route+'</loc>'),'Missing sitemap '+route); }
assert.equal(readFileSync('dist/ads.txt','utf8').trim(),'google.com, pub-1771884902241881, DIRECT, f08c47fec0942fa0');
assert.ok(readFileSync('dist/robots.txt','utf8').includes(origin+'/sitemap-index.xml'));
console.log(`${pages.length} pages, ${checkedLinks} internal links/assets, canonical URLs, metadata, sitemap, robots and ads.txt passed.`);
