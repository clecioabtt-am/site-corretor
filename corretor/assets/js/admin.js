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
async function loadDash(){
  if(!sb)return;
  try{
    const data=await getProperties();
    currentItems=data;
    renderAdmin(data);
    const {data:leads}=await sb.from('leads').select('*').order('created_at',{ascending:false});
    leadList.innerHTML=(leads||[]).map(l=>`<p><b>${l.nome}</b> - ${l.telefone} - ${l.tipo||''}</p>`).join('')||'<p>Nenhum lead.</p>';
  }catch(error){alert('Erro ao carregar painel: '+error.message)}
}
function normalizeStatus(s){return String(s||'disponivel').toLowerCase();}
function renderAdmin(items){
  stTotal.textContent=items.length;
  stDisp.textContent=items.filter(i=>normalizeStatus(i.status)==='disponivel').length;
  stVend.textContent=items.filter(i=>normalizeStatus(i.status)==='vendido').length;
  stAlug.textContent=items.filter(i=>normalizeStatus(i.status)==='alugado').length;
  adminList.innerHTML=items.map(i=>`<div class="adminItem"><div><b>${i.titulo||'Sem título'}</b><span>${i.bairro||'Sem bairro'} • ${i.status||'disponivel'} • ${i.finalidade||''}</span></div><div class="adminActions"><button type="button" data-edit="${i.id}">Editar</button><button type="button" data-delete="${i.id}">Remover</button></div></div>`).join('')||'<p>Nenhum imóvel cadastrado ainda.</p>';
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
      el.value=item[el.name]??'';
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
    tipo:raw.tipo,
    finalidade:raw.finalidade,
    status:raw.status,
    cidade:raw.cidade||'Manaus',
    bairro:raw.bairro||'',
    valor:Number(raw.valor||0),
    area:Number(raw.area||0),
    quartos:Number(raw.quartos||0),
    banheiros:Number(raw.banheiros||0),
    vagas:Number(raw.vagas||0),
    imagem:images[0]||'',
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
settingsForm.addEventListener('submit',async e=>{e.preventDefault(); if(!sb){alert(needConfig);return} const data=Object.fromEntries(new FormData(e.target)); const {error}=await sb.from('site_config').upsert({id:1,...data,updated_at:new Date().toISOString()}); if(error)return alert(error.message); alert('Configurações salvas!')});
init();
