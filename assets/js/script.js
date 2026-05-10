
const supabaseClient = supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);

const DEFAULT_CONFIG = {
  nome_corretor: "Ricardo Almeida",
  creci: "CRECI 123456-F",
  whatsapp: "5592986155502",
  logo_texto: "RA",
  logo_url: "",
  banner_url: "",
  titulo_principal: "Imóveis selecionados|para uma vida extraordinária",
  subtitulo_principal: "Soluções imobiliárias personalizadas para quem busca exclusividade, segurança e os melhores investimentos.",
  texto_contato: "Solicite uma consultoria personalizada."
};

function moneyNumber(v){
  if(!v) return 0;
  return parseFloat(String(v).replace(/[^\d,.-]/g,'').replace(/\./g,'').replace(',','.')) || 0;
}
function fmt(v){ return v.toLocaleString("pt-BR",{style:"currency",currency:"BRL"}); }
function nums(v){ return String(v || "").replace(/\D/g,""); }

async function loadConfig(){
  let config = DEFAULT_CONFIG;
  const { data, error } = await supabaseClient.from("site_config").select("*").eq("id",1).maybeSingle();
  if(data) config = {...config, ...data};

  const brandStrong = document.querySelectorAll(".brand strong");
  brandStrong.forEach(el => el.textContent = (config.nome_corretor || "").toUpperCase());

  document.querySelectorAll(".brand small").forEach(el => el.textContent = `CORRETOR DE IMÓVEIS · ${config.creci || ""}`);

  document.querySelectorAll(".brand-mark").forEach(el => {
    if(config.logo_url){
      el.innerHTML = `<img src="${config.logo_url}" alt="Logo" style="width:100%;height:100%;object-fit:contain">`;
    } else {
      el.textContent = config.logo_texto || "RA";
    }
  });

  const titles = String(config.titulo_principal || DEFAULT_CONFIG.titulo_principal).split("|");
  const h1 = document.querySelector(".hero h1");
  if(h1) h1.innerHTML = `${titles[0] || ""}<span>${titles[1] || ""}</span>`;

  const lead = document.querySelector(".hero .lead");
  if(lead) lead.textContent = config.subtitulo_principal || "";

  const heroBg = document.querySelector(".hero-bg");
  if(heroBg && config.banner_url){
    heroBg.style.background = `radial-gradient(circle at 75% 25%,#d8a84f30,transparent 24%),linear-gradient(90deg,#07101b 0%,#07101bee 35%,#07101b44 70%),url('${config.banner_url}') center/cover no-repeat`;
  }

  const contactSubtitle = document.querySelector("#contato p, .contact p");
  if(contactSubtitle) contactSubtitle.textContent = config.texto_contato || "";

  const whats = document.querySelectorAll('a[href*="wa.me"], .whatsapp');
  whats.forEach(a => {
    if(a.tagName === "A") a.href = `https://wa.me/${nums(config.whatsapp)}`;
  });

  return config;
}

async function loadProperties(){
  const { data, error } = await supabaseClient.from("imoveis").select("*").eq("ativo",true).order("id",{ascending:true});
  const grid = document.querySelector(".property-grid");
  if(!grid || !data) return;

  grid.innerHTML = data.map(p => `
    <article class="property-card reveal visible">
      <div class="property-img" style="background-image:url('${p.imagem_url || "assets/img/property-1.svg"}')">
        <span>${p.destaque || p.status || "DESTAQUE"}</span>
      </div>
      <div class="property-body">
        <h3>${p.titulo || ""}</h3>
        <p>${p.localizacao || ""}</p>
        <small>
          ${p.tipo ? p.tipo + " • " : ""}
          ${p.quartos ? p.quartos + " quartos • " : ""}
          ${p.banheiros ? p.banheiros + " banheiros • " : ""}
          ${p.vagas ? p.vagas + " vagas • " : ""}
          ${p.area_m2 ? p.area_m2 + "m²" : (p.detalhes || "")}
        </small>
        <strong>${p.preco || ""}</strong>
      </div>
    </article>
  `).join("");
}

function setupContact(config){
  const form = document.querySelector(".contact-form");
  if(!form) return;
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fields = form.querySelectorAll("input, textarea");
    const nome = fields[0]?.value || "";
    const whatsapp = fields[1]?.value || "";
    const interesse = fields[2]?.value || "";
    const mensagem = fields[3]?.value || "";

    await supabaseClient.from("mensagens_contato").insert({nome, whatsapp, interesse, mensagem});

    let box = document.getElementById("contact-success");
    if(!box){
      box = document.createElement("div");
      box.id = "contact-success";
      box.style.cssText = "margin-top:15px;color:#d8a84f;font-weight:800;line-height:1.5";
      form.appendChild(box);
    }
    box.textContent = "Sua mensagem foi enviada para o corretor, assim que possível retornaremos em seu WhatsApp!";

    const text = encodeURIComponent(`Nova mensagem do site:\nNome: ${nome}\nWhatsApp: ${whatsapp}\nInteresse: ${interesse}\nMensagem: ${mensagem}`);
    window.open(`https://wa.me/${nums(config.whatsapp)}?text=${text}`, "_blank");
    form.reset();
  });
}

function setupFinance(){
  const form = document.querySelector(".finance-form");
  if(!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const fields = form.querySelectorAll("input, select");
    const valor = moneyNumber(fields[0]?.value);
    const entrada = moneyNumber(fields[1]?.value);
    const prazo = parseInt(fields[2]?.value || fields[2]?.selectedOptions?.[0]?.textContent || "360") || 360;
    const financiado = Math.max(valor - entrada, 0);
    const taxa = 0.009;
    const parcela = financiado ? (financiado * taxa) / (1 - Math.pow(1 + taxa, -prazo)) : 0;
    const total = parcela * prazo;
    const juros = total - financiado;

    let res = document.getElementById("finance-result");
    if(!res){
      res = document.createElement("div");
      res.id = "finance-result";
      res.style.cssText = "margin-top:16px;padding:16px;border:1px solid #ffffff18;background:#060b11;border-radius:8px;line-height:1.8";
      form.appendChild(res);
    }
    res.innerHTML = `<strong style="color:#d8a84f">Resultado da simulação</strong><br>
      Valor do imóvel: <strong>${fmt(valor)}</strong><br>
      Entrada: <strong>${fmt(entrada)}</strong><br>
      Valor financiado: <strong>${fmt(financiado)}</strong><br>
      Prazo: <strong>${prazo} meses</strong><br>
      Parcela estimada: <strong style="color:#f1c978">${fmt(parcela)}</strong><br>
      Total estimado: <strong>${fmt(total)}</strong><br>
      Juros estimados: <strong>${fmt(Math.max(juros,0))}</strong>
      <small style="display:block;color:#b8c0cc;margin-top:8px">Simulação aproximada. Consulte o banco para valores oficiais.</small>`;
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  document.querySelectorAll('a[href="#depoimentos"]').forEach(a => a.remove());
  const config = await loadConfig();
  await loadProperties();
  setupContact(config);
  setupFinance();
});
