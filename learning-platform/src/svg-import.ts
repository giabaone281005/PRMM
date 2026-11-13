// Reconstruct only inert drawing elements. Never insert uploaded markup into DOM.
export function drawingSvg(raw:string){
 if(raw.length>65536)throw Error('SVG tối đa 64 KB.');const doc=new DOMParser().parseFromString(raw,'image/svg+xml');if(doc.querySelector('parsererror')||doc.documentElement.localName!=='svg')throw Error('File SVG không hợp lệ.');
 const tags=new Set(['svg','g','path','rect','circle','ellipse','line','polyline','polygon','text']),attrs=new Set(['viewBox','x','y','x1','y1','x2','y2','cx','cy','r','rx','ry','width','height','d','points','fill','stroke','stroke-width','font-size','text-anchor','transform']);
 function clean(e:Element):string{if(!tags.has(e.localName))return '';const attributes=Array.from(e.attributes).filter(a=>attrs.has(a.name)&&!/[<>]|url\s*\(|javascript:|https?:|data:/i.test(a.value)).map(a=>' '+a.name+'="'+a.value.replaceAll('&','&amp;').replaceAll('"','&quot;')+'"').join('');const text=e.localName==='text'?(e.textContent??'').replaceAll('&','&amp;').replaceAll('<','&lt;'):Array.from(e.children).map(clean).join('');return '<'+e.localName+attributes+'>'+text+'</'+e.localName+'>';}
 return clean(doc.documentElement).replace('<svg','<svg xmlns="http://www.w3.org/2000/svg"');
}
