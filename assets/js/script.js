
const supabaseClient = supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
let ALL_PROPERTIES=[]; let SITE_CONFIG={};
const DEFAULT_CONFIG={nome_corretor:'Ricardo Almeida',creci:'CRECI 123456-F',whatsapp:'5592986155502',logo_texto:'RA',logo_url:'',banner_url:'',titulo_principal:'Imóveis selecionados|para uma vida extraordinária',subtitulo_principal:'Soluções imobiliárias personalizadas para quem busca exclusividade, segurança e os melhores investimentos.',texto_contato:'Solicite uma consultoria personalizada.',footer_text:'© 2026 Ricardo Almeida · Corretor de Imóveis · CRECI 123456-F',agent_url:'',mostrar_agent:true};
function nums(v){return String(v||'').replace(/\D/g,'')}
function norm(v){return String(v||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim()}
function money(v){return parseFloat(String(v||'').replace(/[^\d,.-]/g,'').replace(/\./g,'').replace(',','.'))||0}
function brl(v){return v.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}
async function loadConfig(){const r=await supabaseClient.from('site_config').select('*').eq('id',1).maybeSingle(); SITE_CONFIG={...DEFAULT_CONFIG,...(r.data||{})};
 document.querySelectorAll('.brand strong').forEach(e=>e.textContent=(SITE_CONFIG.nome_corretor||'').toUpperCase());
 document.querySelectorAll('.brand small').forEach(e=>e.textContent=`CORRETOR DE IMÓVEIS · ${SITE_CONFIG.creci||''}`);
 document.querySelectorAll('.brand-mark').forEach(e=>{e.innerHTML=SITE_CONFIG.logo_url?`<img src="${SITE_CONFIG.logo_url}" style="width:100%;height:100%;object-fit:contain">`:(SITE_CONFIG.logo_texto||'RA')});
 const parts=String(SITE_CONFIG.titulo_principal||'').split('|'); const h1=document.querySelector('.hero h1'); if(h1) h1.innerHTML=`${parts[0]||''}<span>${parts[1]||''}</span>`;
 const lead=document.querySelector('.hero .lead'); if(lead) lead.textContent=SITE_CONFIG.subtitulo_principal||'';
 const bg=document.querySelector('.hero-bg'); if(bg&&SITE_CONFIG.banner_url) bg.style.background=`radial-gradient(circle at 75% 25%,#d8a84f30,transparent 24%),linear-gradient(90deg,#07101b 0%,#07101bee 35%,#07101b44 70%),url('${SITE_CONFIG.banner_url}') center/cover no-repeat`;
 const cp=document.querySelector('#contato p,.contact p'); if(cp) cp.textContent=SITE_CONFIG.texto_contato||'';
const footer = document.getElementById('footerText');
if (footer) {
  const textoRodape = (SITE_CONFIG.footer_text || '').trim();

  if (textoRodape !== '') {
    footer.textContent = textoRodape;
  } else {
    footer.textContent =
      `© 2026 ${SITE_CONFIG.nome_corretor || 'Ricardo Almeida'} · ` +
      `Corretor de Imóveis · ${SITE_CONFIG.creci || 'CRECI 123456-F'}`;
  }
} const agentCard=document.querySelector('.agent-card'); const agentPhoto=document.querySelector('.agent-photo');
 if(agentCard){
   const showAgent = SITE_CONFIG.mostrar_agent !== false && SITE_CONFIG.mostrar_agent !== 'false';
   agentCard.style.display = showAgent ? '' : 'none';
   if(!showAgent){ const heroContent=document.querySelector('.hero-content'); if(heroContent) heroContent.style.gridTemplateColumns='1fr'; }
 }
 if(agentPhoto && SITE_CONFIG.agent_url){ agentPhoto.style.background=`linear-gradient(180deg,#ffffff05,#0008),url('${SITE_CONFIG.agent_url}') center bottom/contain no-repeat`; }
 document.querySelectorAll('a[href*="wa.me"],.whatsapp').forEach(a=>{if(a.tagName==='A')a.href=`https://wa.me/${nums(SITE_CONFIG.whatsapp)}`}); return SITE_CONFIG;}
async function loadProperties(){const {data}=await supabaseClient.from('imoveis').select('*').eq('ativo',true).order('id',{ascending:true}); ALL_PROPERTIES=data||[]; populateFilters(); renderProperties(ALL_PROPERTIES)}
function get(name){return document.querySelector(`[data-filter="${name}"]`)?.value||''}
function populateFilters(){const panel=document.querySelector('.search-panel'); if(!panel)return; const sels=panel.querySelectorAll('select');
 if(sels[0]){sels[0].dataset.filter='tipo'; const vals=[...new Set(ALL_PROPERTIES.map(p=>p.tipo).filter(Boolean))]; sels[0].innerHTML='<option value="">Todos os tipos</option>'+vals.map(v=>`<option>${v}</option>`).join('')}
 if(sels[1]){sels[1].dataset.filter='cidade'; const vals=[...new Set(ALL_PROPERTIES.map(p=>p.cidade||'Manaus').filter(Boolean))]; sels[1].innerHTML='<option value="">Todas as cidades</option>'+vals.map(v=>`<option>${v}</option>`).join('')}
 if(sels[2]){sels[2].dataset.filter='bairro'; const vals=[...new Set(ALL_PROPERTIES.map(p=>p.bairro).filter(Boolean))].sort(); sels[2].innerHTML='<option value="">Todos os bairros</option>'+vals.map(v=>`<option>${v}</option>`).join('')}
 if(sels[3]){sels[3].dataset.filter='preco'; sels[3].innerHTML='<option value="">Qualquer valor</option><option value="0-250000">Até R$ 250 mil</option><option value="250000-500000">R$ 250 mil até R$ 500 mil</option><option value="500000-1000000">R$ 500 mil até R$ 1 milhão</option><option value="1000000-5000000">R$ 1 milhão até R$ 5 milhões</option><option value="5000000-999999999">Acima de R$ 5 milhões</option>'}
 if(!document.getElementById('advanced-filter-row')){let d=document.createElement('div'); d.id='advanced-filter-row'; d.style.cssText='grid-column:1/-1;display:grid;grid-template-columns:repeat(5,1fr);gap:18px;margin-top:8px'; d.innerHTML=`<div><label>Finalidade</label><select data-filter="finalidade"><option value="">Todas</option><option>Venda</option><option>Aluguel</option></select></div><div><label>Zona</label><select data-filter="zona"><option value="">Todas</option><option>Urbana</option><option>Rural</option></select></div><div><label>Valor mínimo</label><input data-filter="valor_min" placeholder="Ex.: 2000" style="width:100%;margin-top:7px;background:#060b11;color:#fff;border:1px solid #ffffff18;border-radius:4px;padding:10px 12px"></div><div><label>Valor máximo</label><input data-filter="valor_max" placeholder="Ex.: 2500" style="width:100%;margin-top:7px;background:#060b11;color:#fff;border:1px solid #ffffff18;border-radius:4px;padding:10px 12px"></div><div><label>&nbsp;</label><button class="btn ghost" type="button" id="clearFilters" style="width:100%">Limpar filtros</button></div>`; panel.appendChild(d)}
 panel.querySelectorAll('select,input').forEach(e=>{e.addEventListener('change',applyFilters);e.addEventListener('keyup',applyFilters)}); document.getElementById('clearFilters')?.addEventListener('click',()=>{panel.querySelectorAll('select,input').forEach(e=>e.value='');renderProperties(ALL_PROPERTIES)}); panel.querySelector('button')?.addEventListener('click',e=>{e.preventDefault();applyFilters()});}
function applyFilters(){let tipo=norm(get('tipo')),cidade=norm(get('cidade')),bairro=norm(get('bairro')),finalidade=norm(get('finalidade')),zona=norm(get('zona')),vmin=money(get('valor_min')),vmax=money(get('valor_max')),faixa=get('preco'); let fmin=0,fmax=999999999999;if(faixa.includes('-')){let p=faixa.split('-'); fmin=+p[0]||0; fmax=+p[1]||999999999999} renderProperties(ALL_PROPERTIES.filter(p=>{let pr=Number(p.valor_numero||money(p.preco)); if(tipo&&norm(p.tipo)!=tipo)return false; if(cidade&&norm(p.cidade||'Manaus')!=cidade)return false; if(bairro&&norm(p.bairro)!=bairro)return false; if(finalidade&&norm(p.finalidade||p.status)!=finalidade)return false; if(zona&&norm(p.zona)!=zona)return false; if(vmin&&pr<vmin)return false; if(vmax&&pr>vmax)return false; if(faixa&&(pr<fmin||pr>fmax))return false; return true;}))}
function renderProperties(arr){const grid=document.querySelector('.property-grid'); if(!grid)return; if(!arr.length){grid.innerHTML='<div style="grid-column:1/-1;padding:30px;background:#101720;border:1px solid #ffffff18;border-radius:12px">Nenhum imóvel encontrado com esses filtros.</div>';return} grid.innerHTML=arr.map(p=>`<article class="property-card reveal visible"><div class="property-img" style="background-image:url('${p.imagem_url||'assets/img/property-1.svg'}')"><span>${p.destaque||p.finalidade||p.status||'DESTAQUE'}</span></div><div class="property-body"><h3>${p.titulo||''}</h3><p>${p.bairro?p.bairro+', ':''}${p.cidade||p.localizacao||'Manaus/AM'}</p><small>${p.tipo?p.tipo+' • ':''}${p.finalidade?p.finalidade+' • ':''}${p.zona?'Zona '+p.zona+' • ':''}${p.quartos?p.quartos+' quartos • ':''}${p.banheiros?p.banheiros+' banheiros • ':''}${p.vagas?p.vagas+' vagas • ':''}${p.area_m2?p.area_m2+'m²':(p.detalhes||'')}</small><strong>${p.preco||''}</strong><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:14px">${p.link_externo?`<a class="btn ghost" href="${p.link_externo}" target="_blank" style="padding:10px 12px;font-size:11px">Abrir anúncio</a>`:''}${p.whatsapp_anunciante?`<a class="btn primary" href="https://wa.me/${nums(p.whatsapp_anunciante)}" target="_blank" style="padding:10px 12px;font-size:11px">WhatsApp</a>`:''}</div></div></article>`).join('')}
function setupContact(cfg){
  const form = document.querySelector('.contact-form');
  if (!form) return;

  // Evita múltiplos listeners caso a função seja chamada novamente
  if (form.dataset.listenerAttached === 'true') return;
  form.dataset.listenerAttached = 'true';

  form.addEventListener('submit', async function(e){
    e.preventDefault();
    e.stopPropagation();

    // Captura os campos pelo atributo "name" (forma correta)
    const nome = (form.querySelector('[name="nome"]')?.value || '').trim();
    const whatsapp = (form.querySelector('[name="telefone"]')?.value || '').trim();
    const interesse = (form.querySelector('[name="interesse"]')?.value || '').trim();
    const mensagem = (form.querySelector('[name="mensagem"]')?.value || '').trim();

    // Validação básica
    if (!nome || !whatsapp) {
      alert('Por favor, preencha seu nome e WhatsApp.');
      return false;
    }

    // Salva no Supabase (se a tabela existir)
    try {
      const { error } = await supabaseClient
        .from('mensagens_contato')
        .insert({
          nome: nome,
          whatsapp: whatsapp,
          interesse: interesse,
          mensagem: mensagem
        });

      if (error) {
        console.warn('Erro ao salvar no Supabase:', error.message);
      }
    } catch (err) {
      console.warn('Não foi possível salvar a mensagem no Supabase:', err);
    }

    // Mensagem de confirmação no site
    let box = document.getElementById('contact-success');
    if (!box) {
      box = document.createElement('div');
      box.id = 'contact-success';
      form.appendChild(box);
    }

    box.style.cssText =
      'margin-top:15px;padding:12px 16px;background:#0b1119;border:1px solid #d8a84f55;border-radius:8px;color:#d8a84f;font-weight:800;line-height:1.5';

    box.textContent =
      'Sua mensagem foi enviada para o corretor. Em breve retornaremos em seu WhatsApp!';

    // Texto organizado para o WhatsApp
    const texto = `Nova mensagem do site:

Nome: ${nome}
WhatsApp: ${whatsapp}
Interesse: ${interesse}
Mensagem: ${mensagem}`;

    // Número do corretor configurado no painel
    const numeroCorretor = nums(cfg.whatsapp || SITE_CONFIG.whatsapp || '');

    if (numeroCorretor) {
      const urlWhatsApp =
        `https://wa.me/${numeroCorretor}?text=${encodeURIComponent(texto)}`;

      // Abre o WhatsApp em nova aba
      window.open(urlWhatsApp, '_blank', 'noopener,noreferrer');
    } else {
      console.warn('Número do corretor não configurado.');
    }

    // Limpa o formulário
    form.reset();

    return false;
  });
}

function setupFinance(){const form=document.querySelector('.finance-form'); if(!form)return; form.addEventListener('submit',e=>{e.preventDefault();const f=form.querySelectorAll('input,select');let valor=money(f[0]?.value),entrada=money(f[1]?.value),prazo=parseInt(f[2]?.value||f[2]?.selectedOptions?.[0]?.textContent||'360')||360,fin=Math.max(valor-entrada,0),tx=.009,parc=fin?(fin*tx)/(1-Math.pow(1+tx,-prazo)):0,total=parc*prazo,juros=total-fin; let r=document.getElementById('finance-result')||document.createElement('div'); r.id='finance-result'; r.style.cssText='margin-top:16px;padding:16px;border:1px solid #ffffff18;background:#060b11;border-radius:8px;line-height:1.8'; if(!r.parentNode)form.appendChild(r); r.innerHTML=`<strong style="color:#d8a84f">Resultado da simulação</strong><br>Valor do imóvel: <strong>${brl(valor)}</strong><br>Entrada: <strong>${brl(entrada)}</strong><br>Valor financiado: <strong>${brl(fin)}</strong><br>Prazo: <strong>${prazo} meses</strong><br>Parcela estimada: <strong style="color:#f1c978">${brl(parc)}</strong><br>Total estimado: <strong>${brl(total)}</strong><br>Juros estimados: <strong>${brl(Math.max(juros,0))}</strong><small style="display:block;color:#b8c0cc;margin-top:8px">Simulação aproximada. Consulte o banco para valores oficiais.</small>`})}
document.addEventListener('DOMContentLoaded',async()=>{document.querySelectorAll('a[href="#depoimentos"]').forEach(a=>a.remove());const cfg=await loadConfig();await loadProperties();setupContact(cfg);setupFinance();});
