const cfg = window.APP_CONFIG || {};
const hasSupabase = cfg.SUPABASE_URL && !cfg.SUPABASE_URL.includes('COLE_AQUI') && cfg.SUPABASE_ANON_KEY && !cfg.SUPABASE_ANON_KEY.includes('COLE_AQUI');
const sb = hasSupabase ? window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY) : null;
const demoProperties = [
 {id:'demo1',title:'Casa contemporânea em condomínio',purpose:'venda',type:'Casa',status:'disponivel',price:1250000,city:'Manaus',neighborhood:'Ponta Negra',area:280,bedrooms:4,bathrooms:5,garage:3,image_url:'/assets/img/property-luxury-1.svg',description:'Residência premium com área gourmet, integração social e acabamento sofisticado.'},
 {id:'demo2',title:'Apartamento alto padrão com vista',purpose:'aluguel',type:'Apartamento',status:'disponivel',price:8500,city:'Manaus',neighborhood:'Adrianópolis',area:160,bedrooms:3,bathrooms:4,garage:2,image_url:'/assets/img/property-luxury-2.svg',description:'Apartamento mobiliado, varanda ampla e lazer completo.'},
 {id:'demo3',title:'Terreno estratégico para investimento',purpose:'venda',type:'Terreno',status:'vendido',price:430000,city:'Manaus',neighborhood:'Tarumã',area:600,bedrooms:0,bathrooms:0,garage:0,image_url:'/assets/img/property-luxury-3.svg',description:'Terreno com excelente localização e potencial de valorização.'}
];
let allProperties = [];
let settings = {site_name:'Ricardo Almeida',site_subtitle:'Corretor de imóveis · CRECI 123456-F',logo_text:'RA',hero_title:'Imóveis selecionados para uma vida extraordinária',hero_subtitle:'Soluções imobiliárias personalizadas para quem busca exclusividade, segurança e os melhores investimentos.',whatsapp:cfg.DEFAULT_WHATSAPP || '5592999999999'};
const brl = n => Number(n||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const qs = s => document.querySelector(s);
function whatsappLink(text='Olá, quero mais informações sobre imóveis disponíveis.') { return `https://wa.me/${String(settings.whatsapp||cfg.DEFAULT_WHATSAPP).replace(/\D/g,'')}?text=${encodeURIComponent(text)}`; }
async function loadSettings(){
 if(sb){const {data}=await sb.from('site_settings').select('*').eq('id',1).maybeSingle(); if(data) settings={...settings,...data};}
 document.querySelectorAll('[data-setting]').forEach(el=>{const k=el.dataset.setting;if(settings[k]) el.textContent=settings[k];});
 qs('#whatsTop').href=whatsappLink(); qs('#whatsBottom').href=whatsappLink();
}
async function loadProperties(){
 if(sb){const {data,error}=await sb.from('properties').select('*').order('created_at',{ascending:false}); allProperties = (!error && data?.length) ? data : demoProperties;} else allProperties=demoProperties;
 renderProperties(allProperties); renderStats(allProperties);
}
function renderStats(items){qs('#statAvailable').textContent=items.filter(p=>p.status==='disponivel').length;qs('#statSale').textContent=items.filter(p=>p.purpose==='venda').length;qs('#statRent').textContent=items.filter(p=>p.purpose==='aluguel').length;}
function renderProperties(items){
 const grid=qs('#propertyGrid');
 grid.innerHTML = items.length ? items.map(p=>`<article class="property-card"><div class="property-img"><img src="${p.image_url||'/assets/img/property-luxury-1.svg'}" alt="${p.title}" onerror="this.src='/assets/img/property-luxury-1.svg'"><div class="badge-row"><span class="badge ${p.status}">${labelStatus(p.status)}</span><span class="badge">${p.purpose==='aluguel'?'Aluguel':'Venda'}</span></div></div><div class="property-body"><h3>${p.title}</h3><div class="price">${brl(p.price)}</div><p>${p.description||''}</p><div class="meta"><span>📍 ${p.neighborhood||''} ${p.city||''}</span><span>📐 ${p.area||0}m²</span><span>🛏️ ${p.bedrooms||0}</span><span>🚗 ${p.garage||0}</span></div><br><a class="btn primary" target="_blank" href="${p.external_url || whatsappLink('Olá, tenho interesse no imóvel: '+p.title)}">Tenho interesse</a></div></article>`).join('') : '<p>Nenhum imóvel encontrado com estes filtros.</p>';
}
function labelStatus(s){return {disponivel:'Disponível',vendido:'Vendido',alugado:'Alugado'}[s]||s;}
qs('#filtersForm').addEventListener('submit',e=>{e.preventDefault(); const purpose=qs('#filterPurpose').value, type=qs('#filterType').value.toLowerCase(), city=qs('#filterCity').value.toLowerCase(), neigh=qs('#filterNeighborhood').value.toLowerCase(), max=Number(qs('#filterMaxPrice').value||0); const f=allProperties.filter(p=>(!purpose||p.purpose===purpose)&&(!type||String(p.type).toLowerCase()===type)&&(!city||String(p.city).toLowerCase().includes(city))&&(!neigh||String(p.neighborhood).toLowerCase().includes(neigh))&&(!max||Number(p.price)<=max)); renderProperties(f);});
qs('#internetSearch').addEventListener('click',()=>{const parts=['imóvel']; if(qs('#filterPurpose').value) parts.push(qs('#filterPurpose').value); if(qs('#filterType').value) parts.push(qs('#filterType').value); if(qs('#filterNeighborhood').value) parts.push(qs('#filterNeighborhood').value); if(qs('#filterCity').value) parts.push(qs('#filterCity').value); if(qs('#filterMaxPrice').value) parts.push('até '+qs('#filterMaxPrice').value); window.open('https://www.google.com/search?q='+encodeURIComponent(parts.join(' ')),'_blank');});
qs('#menuToggle')?.addEventListener('click',()=>qs('#mainMenu').classList.toggle('open'));
qs('#year').textContent=new Date().getFullYear();
loadSettings().then(loadProperties);
