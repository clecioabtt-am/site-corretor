const configured=()=>window.SUPABASE_URL&&!window.SUPABASE_URL.includes('COLE_AQUI')&&window.SUPABASE_ANON_KEY&&!window.SUPABASE_ANON_KEY.includes('COLE_AQUI');
const sb=configured()?supabase.createClient(window.SUPABASE_URL,window.SUPABASE_ANON_KEY):null;
const needConfig='Configure SUPABASE_URL e SUPABASE_ANON_KEY em assets/js/config.js para acessar o painel.';
let editingId=null;
let currentItems=[];
const $=(id)=>document.getElementById(id);

async function init(){
  if(!sb){ loginView.classList.remove('hidden'); dashView.classList.add('hidden'); return; }
  const {data:{session}}=await sb.auth.getSession();
  if(session) showDash(); else {loginView.classList.remove('hidden'); dashView.classList.add('hidden');}
}
function showDash(){loginView.classList.add('hidden');dashView.classList.remove('hidden');loadDash()}
loginForm.addEventListener('submit',async e=>{e.preventDefault(); if(!sb){alert(needConfig);return} const {error}=await sb.auth.signInWithPassword({email:email.value,password:password.value}); if(error) return alert('Erro no login: '+error.message); showDash();});
logout.addEventListener('click',async()=>{if(sb)await sb.auth.signOut();location.reload()});

async function getProperties(){
  const query='id,titulo,tipo,finalidade,status,cidade,bairro,endereco,valor,area,quartos,banheiros,vagas,imagem,descricao,destaque,created_at,updated_at,property_images(id,image_url,sort_order)';
  let {data,error}=await sb.from('properties').select(query).order('created_at',{ascending:false});
  if(error && String(error.message||'').includes('relationship')){
    const res=await sb.from('properties').select('*').order('created_at',{ascending:false});
    data=res.data; error=res.error;
  }
  if(error) throw error;
  return data||[];
}
async function loadSettings(){
  try{
    const {data,error}=await sb.from('site_config').select('*').eq('id',1).maybeSingle();
    if(error || !data || !settingsForm) return;
    for(const el of settingsForm.elements){
      if(!el.name || el.type==='file') continue;
      if(data[el.name]!==undefined && data[el.name]!==null) el.value=data[el.name];
    }
  }catch(e){console.warn('Configurações não carregadas:',e.message)}
}

async function loadDash(){
  if(!sb)return;
  try{
    const data=await getProperties();
    currentItems=data;
    renderAdmin(data);
    await loadSettings();
    const {data:leads}=await sb.from('leads').select('*').order('created_at',{ascending:false});
    leadList.innerHTML=(leads||[]).map(l=>`<p><b>${l.nome}</b> - ${l.telefone} - ${l.tipo||''}</p>`).join('')||'<p>Nenhum lead.</p>';
  }catch(error){alert('Erro ao carregar painel: '+error.message)}
}
function normalizeStatus(s){return String(s||'disponivel').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase();}
function normalizeBairro(s){return String(s||'Sem bairro').trim() || 'Sem bairro';}
function renderAdmin(items){
  stTotal.textContent=items.length;
  stDisp.textContent=items.filter(i=>normalizeStatus(i.status)==='disponivel').length;
  stVend.textContent=items.filter(i=>normalizeStatus(i.status)==='vendido').length;
  stAlug.textContent=items.filter(i=>normalizeStatus(i.status)==='alugado').length;

  if(!items.length){
    adminList.innerHTML='<p>Nenhum imóvel cadastrado ainda.</p>';
    return;
  }

  const grupos=items.reduce((acc,item)=>{
    const bairro=normalizeBairro(item.bairro);
    (acc[bairro] ||= []).push(item);
    return acc;
  },{});

  adminList.innerHTML=Object.entries(grupos)
    .sort(([a],[b])=>a.localeCompare(b,'pt-BR'))
    .map(([bairro,props])=>`<details class="adminBairroGroup" open><summary><b>${bairro}</b><span>${props.length} ${props.length===1?'imóvel cadastrado':'imóveis cadastrados'}</span></summary>${props.map(i=>`<div class="adminItem"><div><b>${i.titulo||'Sem título'}</b><span>${i.endereco||'Sem endereço'} • ${i.status||'disponivel'} • ${i.finalidade||''}</span></div><div class="adminActions"><button type="button" data-edit="${i.id}">Editar</button><button type="button" data-delete="${i.id}">Remover</button></div></div>`).join('')}</details>`)
    .join('');
}
function fillForm(item){
  editingId=item.id;
  propertyForm.querySelector('button[type="submit"]').textContent='Atualizar imóvel';
  for(const el of propertyForm.elements){
    if(!el.name || el.type==='file') continue;
    if(el.name==='imagens_urls'){
      const extras=(item.property_images||[]).map(x=>x.image_url).filter(Boolean);
      el.value=extras.join('\n');
    }else{
      let val=item[el.name]??'';
      if(el.name==='area') val=item.area??item.area_m2??'';
      if(el.name==='imagem') val=item.imagem??item.image_url??item.main_image_url??'';
      if(el.name==='descricao') val=item.descricao??item.description??'';
      el.value=val;
    }
  }
  propertyForm.scrollIntoView({behavior:'smooth',block:'start'});
}
async function removeProperty(id){
  if(!confirm('Remover este imóvel? Essa ação não pode ser desfeita.')) return;
  const {error}=await sb.from('properties').delete().eq('id',id);
  if(error) return alert('Erro ao remover: '+error.message);
  await loadDash();
}
adminList.addEventListener('click',async e=>{
  const edit=e.target.closest('[data-edit]');
  const del=e.target.closest('[data-delete]');
  if(edit){ const item=currentItems.find(x=>x.id===edit.dataset.edit); if(item) fillForm(item); }
  if(del){ await removeProperty(del.dataset.delete); }
});

async function resizeImageForUpload(file){
  if(!file || !file.type || !file.type.startsWith('image/')) return file;
  const MAX_W=1920;
  const MAX_H=1920;
  const QUALITY=0.92;
  const dataUrl=await new Promise((resolve,reject)=>{
    const reader=new FileReader();
    reader.onload=()=>resolve(reader.result);
    reader.onerror=reject;
    reader.readAsDataURL(file);
  });
  const img=await new Promise((resolve,reject)=>{
    const image=new Image();
    image.onload=()=>resolve(image);
    image.onerror=reject;
    image.src=dataUrl;
  });
  let {width,height}=img;
  const scale=Math.min(1,MAX_W/width,MAX_H/height);
  const targetW=Math.round(width*scale);
  const targetH=Math.round(height*scale);
  const canvas=document.createElement('canvas');
  canvas.width=targetW;
  canvas.height=targetH;
  const ctx=canvas.getContext('2d',{alpha:false});
  ctx.imageSmoothingEnabled=true;
  ctx.imageSmoothingQuality='high';
  ctx.fillStyle='#ffffff';
  ctx.fillRect(0,0,targetW,targetH);
  ctx.drawImage(img,0,0,targetW,targetH);
  const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',QUALITY));
  if(!blob) return file;
  const base=file.name.replace(/\.[^.]+$/,'') || 'imagem';
  return new File([blob],`${base}-otimizada.jpg`,{type:'image/jpeg',lastModified:Date.now()});
}

async function uploadFiles(files){
  const urls=[];
  for(const file of files){
    const safe=file.name.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9._-]/g,'-');
    const path=`imoveis/${Date.now()}-${Math.random().toString(36).slice(2)}-${safe}`;
    const {error}=await sb.storage.from('imoveis').upload(path,file,{cacheControl:'3600',upsert:false});
    if(error) throw error;
    const {data}=sb.storage.from('imoveis').getPublicUrl(path);
    urls.push(data.publicUrl);
  }
  return urls;
}
propertyForm.addEventListener('submit',async e=>{
  e.preventDefault(); if(!sb){alert(needConfig);return}
  const fd=new FormData(e.target); const raw=Object.fromEntries(fd.entries());
  const extraUrls=(raw.imagens_urls||'').split('\n').map(x=>x.trim()).filter(Boolean);
  const fileInput=e.target.querySelector('input[name="imagens_arquivos"]');
  let uploaded=[];
  try{ uploaded=fileInput?.files?.length?await uploadFiles(fileInput.files):[]; }catch(err){return alert('Erro no upload das imagens: '+err.message)}
  const images=[raw.imagem,...extraUrls,...uploaded].filter(Boolean);
  const payload={
    titulo:raw.titulo,
    title:raw.titulo,
    tipo:raw.tipo,
    finalidade:raw.finalidade,
    status:raw.status,
    cidade:raw.cidade||'Manaus',
    bairro:raw.bairro||'',
    endereco:raw.endereco||'',
    valor:Number(raw.valor||0),
    area:Number(raw.area||0),
    area_m2:Number(raw.area||0),
    quartos:Number(raw.quartos||0),
    banheiros:Number(raw.banheiros||0),
    vagas:Number(raw.vagas||0),
    imagem:images[0]||'',
    image_url:images[0]||'',
    main_image_url:images[0]||'',
    descricao:raw.descricao||'',
    updated_at:new Date().toISOString()
  };
  let id=editingId;
  if(id){
    const {error}=await sb.from('properties').update(payload).eq('id',id);
    if(error)return alert('Erro ao atualizar imóvel: '+error.message+'\n\nSe aparecer coluna bairro/schema cache, rode o SQL supabase/supabase-corrigir-banco.sql no Supabase.');
    await sb.from('property_images').delete().eq('property_id',id);
  }else{
    const {data,error}=await sb.from('properties').insert(payload).select('id').single();
    if(error)return alert('Erro ao salvar imóvel: '+error.message+'\n\nSe aparecer coluna bairro/schema cache, rode o SQL supabase/supabase-corrigir-banco.sql no Supabase.');
    id=data.id;
  }
  if(images.length){
    const rows=images.map((image_url,sort_order)=>({property_id:id,image_url,sort_order}));
    const {error:imgErr}=await sb.from('property_images').insert(rows);
    if(imgErr)return alert('Imóvel salvo, mas houve erro nas imagens extras: '+imgErr.message);
  }
  alert(editingId?'Imóvel atualizado com sucesso!':'Imóvel salvo com sucesso!');
  editingId=null;
  e.target.reset();
  propertyForm.querySelector('button[type="submit"]').textContent='Salvar imóvel';
  loadDash();
});
settingsForm.addEventListener('submit',async e=>{
  e.preventDefault();
  if(!sb){alert(needConfig);return}
  const fd=new FormData(e.target);
  const data=Object.fromEntries(fd.entries());
  delete data.about_image_file;
  const file=e.target.querySelector('input[name="about_image_file"]')?.files?.[0];
  try{
    if(file){
      const uploaded=await uploadFiles([file]);
      if(uploaded[0]) data.about_image_url=uploaded[0];
    }
  }catch(err){return alert('Erro ao enviar foto do corretor: '+err.message)}
  const {error}=await sb.from('site_config').upsert({id:1,...data,updated_at:new Date().toISOString()});
  if(error)return alert(error.message);
  alert('Configurações salvas!');
  await loadSettings();
});
init();

// Pesquisa inteligente: busca interna no Supabase + links externos sem API
const SMART_PORTALS = [
  {name:'Google', url:q=>`https://www.google.com/search?q=${encodeURIComponent(q)}`},
  {name:'OLX', url:q=>`https://www.olx.com.br/imoveis?q=${encodeURIComponent(q)}`},
  {name:'Zap Imóveis', url:q=>`https://www.zapimoveis.com.br/busca/imoveis/?q=${encodeURIComponent(q)}`},
  {name:'VivaReal', url:q=>`https://www.vivareal.com.br/busca/?q=${encodeURIComponent(q)}`},
  {name:'Imovelweb', url:q=>`https://www.imovelweb.com.br/propriedades-q-${encodeURIComponent(q).replace(/%20/g,'-')}.html`},
  {name:'Facebook Marketplace', url:q=>`https://www.facebook.com/marketplace/search/?query=${encodeURIComponent(q)}`}
];
function smartNorm(v){return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase();}
function smartMoney(n){return new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL',maximumFractionDigits:0}).format(Number(n||0));}
function smartFormData(){
  const form=document.getElementById('smartSearchForm');
  return form?Object.fromEntries(new FormData(form).entries()):{};
}
function smartQueryText(f){
  const partes=[f.tipo, f.finalidade, f.bairro, f.cidade||'Manaus', f.keyword, f.valor_max?`até ${smartMoney(f.valor_max)}`:'', f.quartos_min?`${f.quartos_min} quartos`:'' ];
  return partes.filter(Boolean).join(' ');
}
function matchSmartProperty(p,f){
  const hay=smartNorm([p.titulo,p.title,p.tipo,p.finalidade,p.status,p.cidade,p.bairro,p.endereco,p.descricao,p.description].filter(Boolean).join(' '));
  if(f.keyword && !hay.includes(smartNorm(f.keyword))) return false;
  if(f.tipo && smartNorm(p.tipo)!==smartNorm(f.tipo)) return false;
  if(f.finalidade && smartNorm(p.finalidade)!==smartNorm(f.finalidade)) return false;
  if(f.status && smartNorm(p.status)!==smartNorm(f.status)) return false;
  if(f.cidade && !smartNorm(p.cidade||'Manaus').includes(smartNorm(f.cidade))) return false;
  if(f.bairro && !smartNorm(p.bairro).includes(smartNorm(f.bairro))) return false;
  if(f.valor_max && Number(p.valor||p.price||0)>Number(f.valor_max)) return false;
  if(f.quartos_min && Number(p.quartos||0)<Number(f.quartos_min)) return false;
  return true;
}
function renderSmartExternal(f){
  const box=document.getElementById('externalLinks');
  if(!box) return;
  const q=smartQueryText(f)||'imóveis em Manaus';
  box.innerHTML=SMART_PORTALS.map(portal=>`<a class="externalLink" href="${portal.url(q)}" target="_blank" rel="noopener"><b>${portal.name}</b><span>${q}</span></a>`).join('');
}
function renderSmartResults(items){
  const box=document.getElementById('smartResults');
  if(!box) return;
  if(!items.length){ box.innerHTML='<p class="muted">Nenhum imóvel cadastrado encontrado para esses filtros.</p>'; return; }
  box.innerHTML=items.map(i=>`<div class="smartItem"><div><b>${i.titulo||i.title||'Sem título'}</b><span>${i.tipo||'Imóvel'} • ${i.finalidade||'-'} • ${i.status||'-'} • ${i.bairro||'Sem bairro'} • ${smartMoney(i.valor||i.price)}</span></div><div class="adminActions"><button type="button" data-edit="${i.id}">Editar</button></div></div>`).join('');
}

function chavesSlug(v){
  return String(v||'')
    .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g,'-')
    .replace(/^-+|-+$/g,'');
}
function chavesTipoSlug(tipo, finalidade){
  const t=smartNorm(tipo||'casa');
  const f=smartNorm(finalidade)==='aluguel'?'para-alugar':'a-venda';
  if(t.includes('apart')) return `apartamentos-${f}`;
  if(t.includes('terreno') || t.includes('lote')) return `terrenos-${f}`;
  if(t.includes('sala') || t.includes('comercial')) return `salas-comerciais-${f}`;
  return `casas-${f}`;
}
function chavesUrlFromFilters(f){
  const tipo=chavesTipoSlug(f.tipo,f.finalidade);
  const cidade=chavesSlug(f.cidade||'Manaus');
  const bairro=chavesSlug(f.bairro||'');
  const quartos=Number(f.quartos_min||0);
  let url=`https://www.chavesnamao.com.br/${tipo}/am-${cidade}/`;
  if(bairro) url += `${bairro}/`;
  if(quartos>0) url += `${quartos}-quartos/`;
  return url;
}
function renderChavesSearch(f){
  const box=document.getElementById('chavesLinks');
  if(!box) return;
  const q=smartQueryText(f)||'imóveis em Manaus';
  const main=chavesUrlFromFilters(f);
  const google=`https://www.google.com/search?q=${encodeURIComponent('site:chavesnamao.com.br '+q)}`;
  const broad=`https://www.chavesnamao.com.br/imoveis/am-manaus/?q=${encodeURIComponent(q)}`;
  box.innerHTML=`
    <a class="externalLink chavesMain" href="${main}" target="_blank" rel="noopener"><b>🔎 Abrir no Chaves na Mão</b><span>${main}</span></a>
    <a class="externalLink" href="${google}" target="_blank" rel="noopener"><b>Google dentro do Chaves</b><span>${q}</span></a>
    <a class="externalLink" href="${broad}" target="_blank" rel="noopener"><b>Busca ampla Chaves</b><span>${q}</span></a>
  `;
}

function runSmartSearch(){
  const f=smartFormData();
  const results=(currentItems||[]).filter(p=>matchSmartProperty(p,f));
  renderSmartResults(results);
  renderSmartExternal(f);
  renderChavesSearch(f);
}
function setupSmartSearch(){
  const form=document.getElementById('smartSearchForm');
  if(!form) return;
  form.addEventListener('submit',e=>{e.preventDefault();runSmartSearch();});
  form.addEventListener('input',()=>runSmartSearch());
  document.getElementById('clearSmartSearch')?.addEventListener('click',()=>{form.reset(); const cidade=form.querySelector('[name="cidade"]'); if(cidade) cidade.value='Manaus'; runSmartSearch();});
  document.querySelectorAll('[data-smart-tab]').forEach(btn=>btn.addEventListener('click',()=>{
    document.querySelectorAll('[data-smart-tab]').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    const target=btn.dataset.smartTab;
    document.getElementById('smartInternal')?.classList.toggle('hidden',target!=='interna');
    document.getElementById('smartExternal')?.classList.toggle('hidden',target!=='externa');
    document.getElementById('smartChaves')?.classList.toggle('hidden',target!=='chaves');
    runSmartSearch();
  }));
  runSmartSearch();
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',setupSmartSearch); else setupSmartSearch();
