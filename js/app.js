const cfg = window.SUPABASE_CONFIG || {};
const sb = (cfg.url && cfg.anonKey && !cfg.url.includes('SEU-PROJETO')) ? supabase.createClient(cfg.url, cfg.anonKey) : null;
const BRL = v => new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(Number(v||0));
const WPP='5592999999999';
const fallbackProperties=[
 {id:'demo1',title:'Casa Alto Padrão em Ponta Negra',city:'Manaus',district:'Ponta Negra',type:'Casa',purpose:'Venda',status:'Disponível',price:3200000,area:450,bedrooms:4,bathrooms:5,parking:4,featured:true,cover_url:'',description:'Residência sofisticada em região nobre, ambientes amplos e acabamento premium.'},
 {id:'demo2',title:'Apartamento Premium no Adrianópolis',city:'Manaus',district:'Adrianópolis',type:'Apartamento',purpose:'Aluguel',status:'Disponível',price:5800,area:148,bedrooms:3,bathrooms:3,parking:2,featured:true,cover_url:'',description:'Apartamento completo, localização estratégica e lazer de condomínio clube.'},
 {id:'demo3',title:'Terreno Comercial na Torquato Tapajós',city:'Manaus',district:'Flores',type:'Terreno',purpose:'Venda',status:'Disponível',price:890000,area:900,bedrooms:0,bathrooms:0,parking:0,featured:true,cover_url:'',description:'Excelente área para investimento, com acesso rápido e vocação comercial.'}
];
let allProperties=[];
async function loadSettings(){
 if(!sb) return;
 const {data}=await sb.from('site_settings').select('*').limit(1).maybeSingle();
 if(data){
  document.querySelectorAll('[data-setting="agent_name"]').forEach(e=>e.textContent=data.agent_name||'Oclesio Araújo Jr');
  document.querySelectorAll('[data-setting="creci"]').forEach(e=>e.textContent=data.creci||'CRECI-AM 0000-F');
  document.querySelectorAll('[data-setting="phone"]').forEach(e=>e.textContent=data.phone||'(92) 99999-9999');
  document.querySelectorAll('[data-setting="email"]').forEach(e=>e.textContent=data.email||'contato@oclesioimoveis.com.br');
  const hero=document.querySelector('[data-setting="hero_title"]'); if(hero) hero.innerHTML=data.hero_title||hero.innerHTML;
  const subtitle=document.querySelector('[data-setting="hero_subtitle"]'); if(subtitle) subtitle.textContent=data.hero_subtitle||subtitle.textContent;
 }
}
async function loadProperties(){
 if(!sb){ allProperties=fallbackProperties; renderProperties(allProperties); return; }
 const {data,error}=await sb.from('properties').select('*').order('created_at',{ascending:false});
 allProperties=(!error && data && data.length)?data:fallbackProperties;
 renderProperties(allProperties.filter(p=>p.status!=='Vendido' && p.status!=='Alugado'));
}
function renderProperties(list){
 const box=document.getElementById('propertiesGrid'); if(!box)return;
 if(!list.length){box.innerHTML='<div class="empty">Nenhum imóvel encontrado para os filtros selecionados.</div>';return;}
 box.innerHTML=list.map(p=>`<article class="property"><div class="photo">${p.cover_url?`<img src="${p.cover_url}" alt="${p.title}">`:''}<span class="badge">${p.purpose||'Venda'}</span><span class="badge status">${p.status||'Disponível'}</span></div><div class="property-body"><h4>${p.title||'Imóvel'}</h4><p>${p.city||'Manaus'} • ${p.district||''}</p><div class="price">${BRL(p.price)}</div><div class="meta"><span>${p.type||'Imóvel'}</span><span>${p.area||0} m²</span><span>${p.bedrooms||0} quartos</span><span>${p.parking||0} vagas</span></div><p>${p.description||''}</p><a class="btn btn-dark" target="_blank" href="https://wa.me/${WPP}?text=${encodeURIComponent('Olá, quero informações sobre: '+(p.title||'imóvel'))}">Falar sobre este imóvel</a></div></article>`).join('');
}
function applyFilters(){
 const type=document.getElementById('filterType')?.value||''; const purpose=document.getElementById('filterPurpose')?.value||''; const district=(document.getElementById('filterDistrict')?.value||'').toLowerCase(); const max=Number(document.getElementById('filterMax')?.value||0);
 let list=allProperties.filter(p=>(p.status||'Disponível')==='Disponível');
 if(type) list=list.filter(p=>p.type===type); if(purpose) list=list.filter(p=>p.purpose===purpose); if(district) list=list.filter(p=>(p.district||'').toLowerCase().includes(district)); if(max) list=list.filter(p=>Number(p.price||0)<=max);
 renderProperties(list);
}
function webSearch(){
 const type=document.getElementById('filterType')?.value||'imóvel'; const purpose=document.getElementById('filterPurpose')?.value||'venda ou aluguel'; const district=document.getElementById('filterDistrict')?.value||'Manaus';
 const q=`${type} ${purpose} ${district} Manaus corretor imóveis Oclesio Araújo Jr`;
 window.open(`https://www.google.com/search?q=${encodeURIComponent(q)}`,'_blank');
}
document.addEventListener('DOMContentLoaded',()=>{loadSettings();loadProperties();document.querySelectorAll('.js-filter').forEach(e=>e.addEventListener('input',applyFilters));document.getElementById('webSearch')?.addEventListener('click',webSearch);document.querySelector('.mobile-btn')?.addEventListener('click',()=>document.querySelector('.menu')?.classList.toggle('hide'))});
