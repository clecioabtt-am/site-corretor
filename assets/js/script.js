

// ===== Funcionalidades adicionadas =====
document.addEventListener('DOMContentLoaded', function () {
  const adminData = JSON.parse(localStorage.getItem('siteAdminData') || '{}');

  // Atualiza branding básico
  if (adminData.nome) {
    document.querySelectorAll('.brand strong').forEach(el => el.textContent = adminData.nome.toUpperCase());
  }
  if (adminData.creci) {
    document.querySelectorAll('.brand small').forEach(el => el.textContent = adminData.creci);
  }

  // Formulário de contato
  const contactForm = document.querySelector('.contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const inputs = contactForm.querySelectorAll('input, textarea');
      const nome = inputs[0]?.value || '';
      const whatsapp = inputs[1]?.value || '';
      const assunto = inputs[2]?.value || '';
      const mensagem = inputs[3]?.value || '';
      const success = document.getElementById('contact-success');
      if (success) {
        success.textContent = 'Sua mensagem foi enviada para o corretor. Assim que possível retornaremos em seu WhatsApp!';
      }
      const numero = (adminData.whatsapp || '5592986155502').replace(/\D/g, '');
      const texto = encodeURIComponent(
        `Nova mensagem do site:%0ANome: ${nome}%0AWhatsApp: ${whatsapp}%0AAssunto: ${assunto}%0AMensagem: ${mensagem}`
      );
      window.open(`https://wa.me/${numero}?text=${texto}`, '_blank');
      contactForm.reset();
    });
  }

  // Simulador de financiamento
  const financeForm = document.querySelector('.finance-form');
  if (financeForm) {
    financeForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const vals = financeForm.querySelectorAll('input, select');
      const valor = parseFloat((vals[0]?.value || '0').replace(/[^\d,.-]/g,'').replace(/\./g,'').replace(',', '.')) || 0;
      const entrada = parseFloat((vals[1]?.value || '0').replace(/[^\d,.-]/g,'').replace(/\./g,'').replace(',', '.')) || 0;
      const prazo = parseInt(vals[2]?.value) || 360;
      const financiado = Math.max(valor - entrada, 0);
      const taxa = 0.009; // 0,9% a.m. estimada
      const parcela = financiado > 0 ? (financiado * taxa) / (1 - Math.pow(1 + taxa, -prazo)) : 0;
      const res = document.getElementById('finance-result');
      if (res) {
        res.innerHTML = `Valor financiado: <strong>R$ ${financiado.toLocaleString('pt-BR',{minimumFractionDigits:2})}</strong><br>
        Parcela estimada (${prazo} meses): <strong style="color:#d8a84f">R$ ${parcela.toLocaleString('pt-BR',{minimumFractionDigits:2})}</strong>`;
      }
    });
  }
});
