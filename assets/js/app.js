
// Ajuste 2026-06-01: garante que a imagem do modal apareça completa, sem corte,
// mesmo se algum CSS antigo ficar em cache no navegador.
(function ensureModalImageContain(){
  const css = `.modalGallery img,#modalImg{object-fit:contain!important;object-position:center center!important;background:#10283a!important;width:100%!important;height:100%!important;max-width:100%!important;max-height:72vh!important;}`;
  if(!document.getElementById('modalImageContainFix')){
    const style=document.createElement('style');
    style.id='modalImageContainFix';
    style.textContent=css;
    document.head.appendChild(style);
  }
})();

const isConfigured=()=>window.SUPABASE_URL&&!window.SUPABASE_URL.includes('COLE_AQUI')&&window.SUPABASE_ANON_KEY&&!window.SUPABASE_ANON_KEY.includes('COLE_AQUI');
const db=isConfigured()?supabase.createClient(window.SUPABASE_URL,window.SUPABASE_ANON_KEY):null;
let all=[];
const bairrosBase=['Ponta Negra','Adrianópolis','Dom Pedro','Flores','Aleixo','Parque 10','Cidade Nova','Coroado','Chapada','Nossa Senhora das Graças'];
const fallbackBairroImages={
  'Ponta Negra':'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=900&q=80',
  'Adrianópolis':'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80',
  'Dom Pedro':'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=900&q=80',
  'Flores':'https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?auto=format&fit=crop&w=900&q=80',
  'Aleixo':'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=900&q=80',
  'Parque 10':'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=900&q=80',
  'Cidade Nova':'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=900&q=80',
  'Coroado':'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=900&q=80',
  'Chapada':'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=900&q=80',
  'Nossa Senhora das Graças':'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80'
};
const money=n=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL',maximumFractionDigits:0}).format(n||0);
let activeGalleryIndex=0;
let activeGalleryImages=[];
const escapeHtml=v=>String(v??'').replace(/[&<>'"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[m]));

async function loadSiteConfig(){
  if(!db) return;
  try{
    const {data,error}=await db.from('site_config').select('*').eq('id',1).maybeSingle();
    if(error || !data) return;
    // WhatsApp fixo do corretor: (92) 98245-2810
    // Mantém o botão sempre direcionado para o número correto, mesmo se houver configuração antiga no Supabase.
    window.DEFAULT_WHATSAPP='5592982452810';
    if(data.primary_color) document.documentElement.style.setProperty('--blue',data.primary_color);
    const portrait=document.querySelector('.portrait');
    if(portrait && data.about_image_url){
      portrait.style.backgroundImage=`url('${data.about_image_url}')`;
      portrait.style.backgroundSize='cover';
      portrait.style.backgroundPosition='center top';
    }
    const heroTitle=document.querySelector('.hero h1');
    if(heroTitle && data.hero_title) heroTitle.textContent=data.hero_title;
    const heroSub=document.querySelector('.hero p');
    if(heroSub && data.hero_subtitle) heroSub.textContent=data.hero_subtitle;
  }catch(e){console.warn('Configuração do site não carregada:',e.message)}
}

const norm=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase();
function isDisponivel(p){return ['disponivel','disponível'].includes(norm(p.status));}
function label(v){return String(v||'').trim();}
function getImages(p){
  const imgs=[];
  if(p.main_image_url) imgs.push(p.main_image_url);
  if(p.image_url) imgs.push(p.image_url);
  if(p.imagem) imgs.push(p.imagem);
  (p.property_images||[]).forEach(i=>{ if(i?.image_url) imgs.push(i.image_url); });
  return [...new Set(imgs.filter(Boolean))];
}
function propImg(p){return getImages(p)[0]||'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=85'}
async function loadProperties(){
  try{
    if(db){
      const {data,error}=await db.from('properties').select('*, property_images(image_url, sort_order)').order('created_at',{ascending:false});
      if(error) throw error;
      all=(data||[]).map(p=>({...p, property_images:(p.property_images||[]).sort((a,b)=>(a.sort_order||0)-(b.sort_order||0))}));
    }else{
      all=[];
      console.warn('Supabase não configurado. A vitrine começa zerada até configurar assets/js/config.js.');
    }
  }catch(e){console.error(e); all=[]}
  render(all); renderBairros(all);
}
function whatsappText(p){
  const img=propImg(p);
  return `Olá, tenho interesse neste imóvel.

`+
    `Imóvel: ${p.titulo||p.title||'Imóvel'}
`+
    `Bairro: ${p.bairro||'-'}
Cidade: ${p.cidade||'Manaus'}
Endereço: ${p.endereco||'-'}
`+
    `Finalidade: ${p.finalidade||'-'}
Tipo: ${p.tipo||'-'}
`+
    `Valor: ${money(p.valor||p.price)}
Área: ${p.area_m2||p.area||0} m²
`+
    `Quartos: ${p.quartos||0} | Banheiros: ${p.banheiros||0} | Vagas: ${p.vagas||0}
`+
    `${img ? `Foto do imóvel: ${img}
` : ''}`+
    `${p.description||p.descricao ? `Descrição: ${p.description||p.descricao}` : ''}`;
}
function getCorretorWhatsapp(){return '5592982452810';}
function whatsappUrl(p){return `https://wa.me/${getCorretorWhatsapp()}?text=${encodeURIComponent(whatsappText(p))}`;}
function mapsQuery(p){return [p.endereco,p.bairro,p.cidade||'Manaus','Amazonas','Brasil'].filter(Boolean).join(', ');}
function mapsUrl(p){return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQuery(p))}`;}
function render(list){
  const grid=document.querySelector('#propertyGrid'); if(!grid)return;
  const visible=list.filter(isDisponivel);
  grid.innerHTML=visible.map((p,i)=>`<article class="card propertyCard" data-id="${p.id||i}" tabindex="0" role="button" aria-label="Ver detalhes do imóvel ${escapeHtml(p.titulo||p.title||'')}"><div class="thumb" style="background-image:url('${propImg(p)}')"><span>${label(p.status)||'Disponível'}</span></div><div class="cardBody"><small>${label(p.bairro)} • ${label(p.cidade)||'Manaus'}</small><h3>${escapeHtml(p.titulo||p.title||'Imóvel sem título')}</h3><p>${label(p.tipo)||'Imóvel'} ${norm(p.finalidade)==='aluguel'?'para aluguel':'à venda'}, ${p.area||p.area_m2||0} m²</p><b>${money(p.valor||p.price)}</b><a class="whatsProperty" target="_blank" rel="noopener" href="${whatsappUrl(p)}">Falar com corretor</a></div></article>`).join('')||'<p class="empty">Nenhum imóvel disponível encontrado.</p>';
  grid.querySelectorAll('.propertyCard').forEach(card=>{
    const id=card.dataset.id;
    const prop=visible.find((x,idx)=>String(x.id||idx)===String(id));
    card.addEventListener('click',e=>{ if(e.target.closest('a')) return; openPropertyModal(prop); });
    card.addEventListener('keydown',e=>{ if(e.key==='Enter') openPropertyModal(prop); });
  });
}
function bairroKey(nome){return norm(nome);}
function createBairroCard(nome){
  const a=document.createElement('a');
  a.dataset.bairro=nome;
  a.innerHTML=`<span>${nome}</span><small>0 imóveis</small>`;
  return a;
}
function renderBairros(items){
  const wrap=document.querySelector('#bairroGrid'); if(!wrap)return;
  const disponíveis=items.filter(isDisponivel);
  const nomesBanco=[...new Set(disponíveis.map(p=>label(p.bairro)).filter(Boolean))];
  const nomes=[...bairrosBase];
  nomesBanco.forEach(b=>{ if(!nomes.some(x=>bairroKey(x)===bairroKey(b))) nomes.push(b); });
  wrap.innerHTML='';
  nomes.forEach(bairro=>{
    const card=createBairroCard(bairro);
    const props=disponíveis.filter(p=>bairroKey(p.bairro)===bairroKey(bairro));
    card.querySelector('small').textContent=`${props.length} ${props.length===1?'imóvel':'imóveis'}`;
    const imgs=props.map(propImg).filter(Boolean);
    card.dataset.images=JSON.stringify(imgs);
    const img=imgs[0]||fallbackBairroImages[bairro]||fallbackBairroImages['Ponta Negra'];
    card.style.backgroundImage=`linear-gradient(#0003,#0007),url('${img}')`;
    card.onclick=()=>{const f=document.querySelector('#filterDistrict'); if(f) f.value=bairro; applyFilters(); document.querySelector('#imoveis')?.scrollIntoView({behavior:'smooth'});};
    wrap.appendChild(card);
  });
}
setInterval(()=>{
  document.querySelectorAll('#bairroGrid a[data-images]').forEach(card=>{
    const imgs=JSON.parse(card.dataset.images||'[]');
    if(imgs.length<2)return;
    const idx=((Number(card.dataset.slide||0)+1)%imgs.length);
    card.dataset.slide=idx;
    card.style.backgroundImage=`linear-gradient(#0003,#0007),url('${imgs[idx]}')`;
  });
},3500);
function applyFilters(){
  let l=[...all];
  const pur=norm(document.querySelector('#filterPurpose')?.value), typ=norm(document.querySelector('#filterType')?.value), bai=norm(document.querySelector('#filterDistrict')?.value), max=Number(document.querySelector('#filterMax')?.value||0);
  if(pur)l=l.filter(p=>norm(p.finalidade)===pur); if(typ)l=l.filter(p=>norm(p.tipo)===typ); if(bai)l=l.filter(p=>bairroKey(p.bairro).includes(bai)); if(max)l=l.filter(p=>(p.valor||p.price||0)<=max); render(l)
}
['filterPurpose','filterType','filterDistrict','filterMax'].forEach(id=>document.addEventListener('input',e=>{if(e.target.id===id)applyFilters()}));
document.querySelector('#clearFilters')?.addEventListener('click',()=>{document.querySelectorAll('.filters input,.filters select').forEach(x=>x.value=''); render(all)});
document.querySelector('#heroSearch')?.addEventListener('submit',e=>{e.preventDefault();document.querySelector('#imoveis')?.scrollIntoView({behavior:'smooth'}); const t=document.querySelector('#filterType'); const d=document.querySelector('#filterDistrict'); if(t)t.value=document.querySelector('#heroType').value; if(d)d.value=document.querySelector('#heroText').value; applyFilters()});
function calc(){const price=+priceRange.value, down=+downRange.value/100, rate=(+rateRange.value/100)/12, months=+yearsRange.value*12, financed=price*(1-down); const parcel=financed*(rate*Math.pow(1+rate,months))/(Math.pow(1+rate,months)-1); priceLabel.textContent=money(price);downLabel.textContent=Math.round(down*100)+'%';rateLabel.textContent=rateRange.value+'% /ano';yearsLabel.textContent=yearsRange.value+' anos';parcelValue.textContent=money(parcel)+'/mês'}
['priceRange','downRange','rateRange','yearsRange'].forEach(id=>document.querySelector('#'+id)?.addEventListener('input',calc)); if(document.querySelector('#priceRange'))calc();
document.querySelector('#leadForm')?.addEventListener('submit',async e=>{e.preventDefault();const f=Object.fromEntries(new FormData(e.target)); try{if(db) await db.from('leads').insert(f); alert('Dados enviados com sucesso!')}catch(err){alert('Recebemos seu interesse. Configure o Supabase para salvar online.')} e.target.reset()});

function ensurePropertyModal(){
  let modal=document.querySelector('#propertyModal');
  if(modal) return modal;
  modal=document.createElement('div');
  modal.id='propertyModal';
  modal.className='propertyModal hidden';
  modal.innerHTML=`<div class="modalBackdrop" data-close="1"></div><div class="modalBox"><button class="modalClose" data-close="1">×</button><div class="modalGallery"><button class="galleryNav prev" data-prev="1">‹</button><img id="modalImg" alt="Foto do imóvel"><button class="galleryNav next" data-next="1">›</button><div id="modalCounter" class="modalCounter"></div></div><div class="modalInfo"><small id="modalMeta"></small><h2 id="modalTitle"></h2><strong id="modalPrice"></strong><div id="modalDetails" class="modalDetails"></div><p id="modalEndereco" class="modalEndereco"></p><p id="modalDescription"></p><div class="modalActions"><a id="modalWhatsapp" class="primary" target="_blank" rel="noopener">Falar com o corretor no WhatsApp</a><button id="modalLocationBtn" class="locationBtn" type="button">📍 Ver localização</button></div><div id="mapBox" class="mapBox hidden"><iframe id="mapFrame" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe><a id="mapExternal" target="_blank">Abrir no Google Maps</a></div></div></div>`;
  document.body.appendChild(modal);
  modal.addEventListener('click',e=>{
    if(e.target.dataset.close) closePropertyModal();
    if(e.target.dataset.prev) slideModal(-1);
    if(e.target.dataset.next) slideModal(1);
    if(e.target.id==='modalLocationBtn') toggleMapBox();
  });
  document.addEventListener('keydown',e=>{ if(!modal.classList.contains('hidden')&&e.key==='Escape') closePropertyModal(); });
  return modal;
}
function updateModalImage(){
  const img=document.querySelector('#modalImg');
  const counter=document.querySelector('#modalCounter');
  if(img) img.src=activeGalleryImages[activeGalleryIndex]||'';
  if(counter) counter.textContent=`${activeGalleryIndex+1}/${activeGalleryImages.length||1}`;
}
function slideModal(dir){
  if(activeGalleryImages.length<2) return;
  activeGalleryIndex=(activeGalleryIndex+dir+activeGalleryImages.length)%activeGalleryImages.length;
  updateModalImage();
}

function toggleMapBox(){
  const box=document.querySelector('#mapBox');
  if(!box) return;
  box.classList.toggle('hidden');
}

function openPropertyModal(p){
  if(!p) return;
  const modal=ensurePropertyModal();
  activeGalleryImages=getImages(p);
  if(!activeGalleryImages.length) activeGalleryImages=[propImg(p)];
  activeGalleryIndex=0;
  document.querySelector('#modalTitle').textContent=p.titulo||p.title||'Imóvel sem título';
  document.querySelector('#modalMeta').textContent=`${p.bairro||'-'} • ${p.cidade||'Manaus'} • ${p.status||'Disponível'}`;
  document.querySelector('#modalPrice').textContent=money(p.valor||p.price);
  document.querySelector('#modalDetails').innerHTML=`<span>${p.tipo||'Imóvel'}</span><span>${p.finalidade||'-'}</span><span>${p.area_m2||p.area||0} m²</span><span>${p.quartos||0} quartos</span><span>${p.banheiros||0} banheiros</span><span>${p.vagas||0} vagas</span>`;
  document.querySelector('#modalEndereco').textContent=p.endereco ? `📍 ${p.endereco}` : '📍 Endereço não informado.';
  document.querySelector('#modalDescription').textContent=p.description||p.descricao||'Sem descrição cadastrada.';
  document.querySelector('#modalWhatsapp').href=whatsappUrl(p);
  const q=mapsQuery(p);
  document.querySelector('#mapFrame').src=`https://www.google.com/maps?q=${encodeURIComponent(q)}&output=embed`;
  document.querySelector('#mapExternal').href=mapsUrl(p);
  document.querySelector('#mapBox')?.classList.add('hidden');
  updateModalImage();
  modal.classList.remove('hidden');
  document.body.classList.add('modalOpen');
}
function closePropertyModal(){
  document.querySelector('#propertyModal')?.classList.add('hidden');
  document.body.classList.remove('modalOpen');
}

loadSiteConfig().finally(loadProperties);
