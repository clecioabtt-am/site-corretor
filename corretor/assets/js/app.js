const isConfigured=()=>window.SUPABASE_URL&&!window.SUPABASE_URL.includes('COLE_AQUI')&&window.SUPABASE_ANON_KEY&&!window.SUPABASE_ANON_KEY.includes('COLE_AQUI');
const db=isConfigured()?supabase.createClient(window.SUPABASE_URL,window.SUPABASE_ANON_KEY):null;
let all=[];
const bairrosBase=['Ponta Negra','Adrianópolis','Dom Pedro','Flores','Aleixo','Parque 10'];
const fallbackBairroImages={
  'Ponta Negra':'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=900&q=80',
  'Adrianópolis':'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80',
  'Dom Pedro':'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=900&q=80',
  'Flores':'https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?auto=format&fit=crop&w=900&q=80',
  'Aleixo':'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=900&q=80',
  'Parque 10':'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=900&q=80'
};
const money=n=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL',maximumFractionDigits:0}).format(n||0);
function propImg(p){return p.imagem||p.image_url||p.property_images?.[0]?.image_url||'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=85'}
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
function render(list){
  const grid=document.querySelector('#propertyGrid'); if(!grid)return;
  const visible=list.filter(p=>p.status==='disponivel');
  grid.innerHTML=visible.map(p=>`<article class="card"><div class="thumb" style="background-image:url('${propImg(p)}')"><span>${p.status||'disponivel'}</span></div><div class="cardBody"><small>${p.bairro||''} • ${p.cidade||'Manaus'}</small><h3>${p.titulo||p.title}</h3><p>${p.tipo||''} ${p.finalidade==='aluguel'?'para aluguel':'à venda'}, ${p.area||0} m²</p><b>${money(p.valor||p.price)}</b><a target="_blank" href="https://wa.me/${window.DEFAULT_WHATSAPP}?text=${encodeURIComponent('Tenho interesse no imóvel: '+(p.titulo||p.title||''))}">Falar com corretor</a></div></article>`).join('')||'<p class="empty">Nenhum imóvel disponível encontrado.</p>'
}
function renderBairros(items){
  const wrap=document.querySelector('#bairroGrid'); if(!wrap)return;
  const disponíveis=items.filter(p=>p.status==='disponivel');
  wrap.querySelectorAll('a[data-bairro]').forEach(card=>{
    const bairro=card.dataset.bairro;
    const props=disponíveis.filter(p=>(p.bairro||'').toLowerCase()===bairro.toLowerCase());
    card.querySelector('small').textContent=`${props.length} ${props.length===1?'imóvel':'imóveis'}`;
    card.dataset.images=JSON.stringify(props.map(propImg).filter(Boolean));
    const img=props[0]?propImg(props[0]):fallbackBairroImages[bairro];
    card.style.backgroundImage=`linear-gradient(#0003,#0007),url('${img}')`;
    card.onclick=()=>{document.querySelector('#filterDistrict').value=bairro; applyFilters(); document.querySelector('#imoveis').scrollIntoView({behavior:'smooth'});};
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
  const pur=document.querySelector('#filterPurpose')?.value, typ=document.querySelector('#filterType')?.value, bai=document.querySelector('#filterDistrict')?.value.toLowerCase(), max=Number(document.querySelector('#filterMax')?.value||0);
  if(pur)l=l.filter(p=>p.finalidade===pur); if(typ)l=l.filter(p=>p.tipo===typ); if(bai)l=l.filter(p=>(p.bairro||'').toLowerCase().includes(bai)); if(max)l=l.filter(p=>(p.valor||0)<=max); render(l)
}
['filterPurpose','filterType','filterDistrict','filterMax'].forEach(id=>document.addEventListener('input',e=>{if(e.target.id===id)applyFilters()}));
document.querySelector('#clearFilters')?.addEventListener('click',()=>{document.querySelectorAll('.filters input,.filters select').forEach(x=>x.value=''); render(all)});
document.querySelector('#heroSearch')?.addEventListener('submit',e=>{e.preventDefault();document.querySelector('#imoveis').scrollIntoView({behavior:'smooth'}); document.querySelector('#filterType').value=document.querySelector('#heroType').value; document.querySelector('#filterDistrict').value=document.querySelector('#heroText').value; applyFilters()});
function calc(){const price=+priceRange.value, down=+downRange.value/100, rate=(+rateRange.value/100)/12, months=+yearsRange.value*12, financed=price*(1-down); const parcel=financed*(rate*Math.pow(1+rate,months))/(Math.pow(1+rate,months)-1); priceLabel.textContent=money(price);downLabel.textContent=Math.round(down*100)+'%';rateLabel.textContent=rateRange.value+'% /ano';yearsLabel.textContent=yearsRange.value+' anos';parcelValue.textContent=money(parcel)+'/mês'}
['priceRange','downRange','rateRange','yearsRange'].forEach(id=>document.querySelector('#'+id)?.addEventListener('input',calc)); if(document.querySelector('#priceRange'))calc();
document.querySelector('#leadForm')?.addEventListener('submit',async e=>{e.preventDefault();const f=Object.fromEntries(new FormData(e.target)); try{if(db) await db.from('leads').insert(f); alert('Dados enviados com sucesso!')}catch(err){alert('Recebemos seu interesse. Configure o Supabase para salvar online.')} e.target.reset()});
loadProperties();
