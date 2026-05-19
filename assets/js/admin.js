const configured=()=>window.SUPABASE_URL&&!window.SUPABASE_URL.includes('COLE_AQUI')&&window.SUPABASE_ANON_KEY&&!window.SUPABASE_ANON_KEY.includes('COLE_AQUI');
const sb=configured()?supabase.createClient(window.SUPABASE_URL,window.SUPABASE_ANON_KEY):null;
const needConfig='Configure SUPABASE_URL e SUPABASE_ANON_KEY em assets/js/config.js para acessar o painel.';
async function init(){
  if(!sb){ loginView.classList.remove('hidden'); dashView.classList.add('hidden'); return; }
  const {data:{session}}=await sb.auth.getSession();
  if(session) showDash(); else {loginView.classList.remove('hidden'); dashView.classList.add('hidden');}
}
function showDash(){loginView.classList.add('hidden');dashView.classList.remove('hidden');loadDash()}
loginForm.addEventListener('submit',async e=>{e.preventDefault(); if(!sb){alert(needConfig);return} const {error}=await sb.auth.signInWithPassword({email:email.value,password:password.value}); if(error) return alert('Erro no login: '+error.message); showDash();});
logout.addEventListener('click',async()=>{if(sb)await sb.auth.signOut();location.reload()});
async function loadDash(){
  if(!sb)return;
  const {data,error}=await sb.from('properties').select('*, property_images(image_url, sort_order)').order('created_at',{ascending:false});
  if(error){alert(error.message);return}
  renderAdmin(data||[]);
  const {data:leads}=await sb.from('leads').select('*').order('created_at',{ascending:false});
  leadList.innerHTML=(leads||[]).map(l=>`<p><b>${l.nome}</b> - ${l.telefone} - ${l.tipo||''}</p>`).join('')||'<p>Nenhum lead.</p>';
}
function renderAdmin(items){
  stTotal.textContent=items.length; stDisp.textContent=items.filter(i=>i.status==='disponivel').length; stVend.textContent=items.filter(i=>i.status==='vendido').length; stAlug.textContent=items.filter(i=>i.status==='alugado').length;
  adminList.innerHTML=items.map(i=>`<div><b>${i.titulo}</b><span>${i.bairro||''} • ${i.status} • ${i.finalidade}</span></div>`).join('')||'<p>Nenhum imóvel cadastrado ainda.</p>';
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
  const payload={titulo:raw.titulo,tipo:raw.tipo,finalidade:raw.finalidade,status:raw.status,cidade:raw.cidade,bairro:raw.bairro,valor:Number(raw.valor||0),area:Number(raw.area||0),quartos:Number(raw.quartos||0),banheiros:Number(raw.banheiros||0),vagas:Number(raw.vagas||0),imagem:images[0]||'',descricao:raw.descricao};
  const {data,error}=await sb.from('properties').insert(payload).select('id').single();
  if(error)return alert(error.message);
  if(images.length){
    const rows=images.map((image_url,sort_order)=>({property_id:data.id,image_url,sort_order}));
    const {error:imgErr}=await sb.from('property_images').insert(rows);
    if(imgErr)return alert('Imóvel salvo, mas houve erro nas imagens extras: '+imgErr.message);
  }
  alert('Imóvel salvo com imagens!'); e.target.reset(); loadDash();
});
settingsForm.addEventListener('submit',async e=>{e.preventDefault(); if(!sb){alert(needConfig);return} const data=Object.fromEntries(new FormData(e.target)); const {error}=await sb.from('site_config').upsert({id:1,...data,updated_at:new Date().toISOString()}); if(error)return alert(error.message); alert('Configurações salvas!')});
init();
