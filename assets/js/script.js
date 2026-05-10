
let supabaseClient = null;
if (window.supabase && window.SUPABASE_URL && window.SUPABASE_ANON_KEY) {
  supabaseClient = supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
}

async function syncFromSupabase(){
  if (!supabaseClient) return;
  try {
    const { data: cfg } = await supabaseClient.from('site_config').select('*').eq('id',1).maybeSingle();
    let local = {};
    try { local = JSON.parse(localStorage.getItem('siteAdminData') || '{}'); } catch(e) {}
    if (cfg) {
      local.nome = cfg.nome_corretor || local.nome;
      local.creci = cfg.creci || local.creci;
      local.whatsapp = cfg.whatsapp || local.whatsapp;
      if (cfg.titulo_principal && cfg.titulo_principal.includes('|')) {
        const parts = cfg.titulo_principal.split('|');
        local.heroTitle1 = parts[0];
        local.heroTitle2 = parts[1];
      }
      local.heroSubtitle = cfg.subtitulo_principal || local.heroSubtitle;
      local.contactSubtitle = cfg.texto_contato || local.contactSubtitle;
      local.heroBg = cfg.banner_url || local.heroBg;
    }
    const { data: imoveis } = await supabaseClient.from('imoveis').select('*').eq('ativo', true).order('id');
    if (imoveis && imoveis.length) {
      local.properties = imoveis.map(i => ({
        tag: i.destaque,
        title: i.titulo,
        location: i.localizacao,
        details: i.detalhes || i.descricao,
        price: i.preco,
        image: i.imagem_url
      }));
    }
    localStorage.setItem('siteAdminData', JSON.stringify(local));
  } catch (e) {
    console.warn('Erro ao sincronizar com Supabase', e);
  }
}

document.addEventListener('DOMContentLoaded', async function(){
  await syncFromSupabase();
});


// ===== Site Corretor Premium - Netlify Static Admin =====

const DEFAULT_DATA = {
  nome: "Ricardo Almeida",
  creci: "CRECI 123456-F",
  whatsapp: "5592986155502",
  logoText: "RA",
  heroEyebrow: "EXCLUSIVIDADE QUE TRANSFORMA",
  heroTitle1: "Imóveis selecionados",
  heroTitle2: "para uma vida extraordinária",
  heroSubtitle: "Soluções imobiliárias personalizadas para quem busca exclusividade, segurança e os melhores investimentos.",
  contactTitle: "Pronto para encontrar o imóvel ideal?",
  contactSubtitle: "Solicite uma consultoria personalizada.",
  heroBg: "",
  properties: [
    {tag:"DESTAQUE", title:"Casa no Alphaville", location:"Manaus/AM", details:"4 suítes • 6 banheiros • 450m²", price:"R$ 4.800.000", image:"assets/img/property-1.svg"},
    {tag:"EXCLUSIVO", title:"Apartamento Vista Rio Negro", location:"Ponta Negra, Manaus/AM", details:"3 suítes • 4 banheiros • 210m²", price:"R$ 3.200.000", image:"assets/img/property-2.svg"},
    {tag:"LANÇAMENTO", title:"Condomínio Reserva do Sol", location:"Tarumã, Manaus/AM", details:"5 suítes • 7 banheiros • 680m²", price:"R$ 6.900.000", image:"assets/img/property-3.svg"}
  ]
};

function getData(){
  try {
    return {...DEFAULT_DATA, ...(JSON.parse(localStorage.getItem("siteAdminData") || "{}"))};
  } catch(e) {
    return DEFAULT_DATA;
  }
}

function saveData(data){
  localStorage.setItem("siteAdminData", JSON.stringify(data));
}

function onlyNumbers(v){
  return String(v || "").replace(/\D/g, "");
}

function brMoneyToNumber(v){
  if (!v) return 0;
  const cleaned = String(v).replace(/[^\d,.-]/g,"").replace(/\./g,"").replace(",", ".");
  return parseFloat(cleaned) || 0;
}

function fmt(v){
  return v.toLocaleString("pt-BR", {style:"currency", currency:"BRL"});
}

function applySiteData(){
  const data = getData();

  document.querySelectorAll(".brand strong").forEach(el => el.textContent = data.nome.toUpperCase());
  document.querySelectorAll(".brand small").forEach(el => el.textContent = `CORRETOR DE IMÓVEIS · ${data.creci}`);
  document.querySelectorAll(".brand-mark").forEach(el => el.textContent = data.logoText || "RA");

  const heroEyebrow = document.querySelector(".hero .eyebrow");
  if(heroEyebrow) heroEyebrow.textContent = data.heroEyebrow;

  const h1 = document.querySelector(".hero h1");
  if(h1) h1.innerHTML = `${data.heroTitle1}<span>${data.heroTitle2}</span>`;

  const lead = document.querySelector(".hero .lead");
  if(lead) lead.textContent = data.heroSubtitle;

  const contactTitle = document.querySelector("#contato h2, .contact h2");
  if(contactTitle) contactTitle.textContent = data.contactTitle;

  const contactSubtitle = document.querySelector("#contato p, .contact p");
  if(contactSubtitle) contactSubtitle.textContent = data.contactSubtitle;

  const heroBg = document.querySelector(".hero-bg");
  if(heroBg && data.heroBg){
    heroBg.style.background = `radial-gradient(circle at 75% 25%,#d8a84f30,transparent 24%),linear-gradient(90deg,#07101b 0%,#07101bee 35%,#07101b44 70%),url('${data.heroBg}') center/cover no-repeat`;
  }

  renderProperties(data.properties || []);
}

function renderProperties(properties){
  const grid = document.querySelector(".property-grid");
  if(!grid) return;
  grid.innerHTML = properties.map((p, i) => `
    <article class="property-card reveal visible">
      <div class="property-img" style="background-image:url('${p.image || "assets/img/property-1.svg"}')">
        <span>${p.tag || "DESTAQUE"}</span>
      </div>
      <div class="property-body">
        <h3>${p.title || "Imóvel sem título"}</h3>
        <p>${p.location || ""}</p>
        <small>${p.details || ""}</small>
        <strong>${p.price || ""}</strong>
      </div>
    </article>
  `).join("");
}

function setupContact(){
  const form = document.querySelector(".contact-form");
  if(!form) return;
  form.addEventListener("submit", function(e){
    e.preventDefault();

    const fields = form.querySelectorAll("input, textarea");
    const nome = fields[0]?.value.trim() || "";
    const clienteWhatsapp = fields[1]?.value.trim() || "";
    const assunto = fields[2]?.value.trim() || "";
    const mensagem = fields[3]?.value.trim() || "";

    const data = getData();
    const corretorWhatsapp = onlyNumbers(data.whatsapp || DEFAULT_DATA.whatsapp);

    let box = document.getElementById("contact-success");
    if(!box){
      box = document.createElement("div");
      box.id = "contact-success";
      box.style.cssText = "margin-top:15px;color:#d8a84f;font-weight:800;line-height:1.5";
      form.appendChild(box);
    }
    box.textContent = "Sua mensagem foi enviada para o corretor, assim que possível retornaremos em seu WhatsApp!";

    const texto = `Olá, sou ${nome}.%0AWhatsApp: ${clienteWhatsapp}%0AAssunto: ${assunto}%0AMensagem: ${mensagem}`;
    const url = `https://wa.me/${corretorWhatsapp}?text=${texto}`;
    window.open(url, "_blank");
  });
}

function setupFinance(){
  const form = document.querySelector(".finance-form");
  if(!form) return;
  form.addEventListener("submit", function(e){
    e.preventDefault();
    const fields = form.querySelectorAll("input, select");
    const valorImovel = brMoneyToNumber(fields[0]?.value);
    const entrada = brMoneyToNumber(fields[1]?.value);
    const prazo = parseInt(fields[2]?.value || fields[2]?.selectedOptions?.[0]?.textContent || "360") || 360;

    const valorFinanciado = Math.max(valorImovel - entrada, 0);
    const taxaMensal = 0.009;
    const parcela = valorFinanciado > 0 ? (valorFinanciado * taxaMensal) / (1 - Math.pow(1 + taxaMensal, -prazo)) : 0;
    const total = parcela * prazo;
    const juros = Math.max(total - valorFinanciado, 0);

    let res = document.getElementById("finance-result");
    if(!res){
      res = document.createElement("div");
      res.id = "finance-result";
      res.style.cssText = "margin-top:16px;padding:16px;border:1px solid #ffffff18;background:#060b11;border-radius:8px;line-height:1.8";
      form.appendChild(res);
    }
    res.innerHTML = `
      <strong style="color:#d8a84f">Resultado da simulação</strong><br>
      Valor do imóvel: <strong>${fmt(valorImovel)}</strong><br>
      Entrada: <strong>${fmt(entrada)}</strong><br>
      Valor financiado: <strong>${fmt(valorFinanciado)}</strong><br>
      Prazo: <strong>${prazo} meses</strong><br>
      Taxa estimada: <strong>0,9% ao mês</strong><br>
      Parcela estimada: <strong style="color:#f1c978">${fmt(parcela)}</strong><br>
      Total estimado: <strong>${fmt(total)}</strong><br>
      Juros estimados: <strong>${fmt(juros)}</strong>
      <small style="display:block;color:#b8c0cc;margin-top:8px">Simulação aproximada. Consulte o banco para valores oficiais.</small>
    `;
  });
}

document.addEventListener("DOMContentLoaded", function(){
  applySiteData();
  setupContact();
  setupFinance();

  document.querySelectorAll('a[href="#depoimentos"]').forEach(a => a.remove());
});
