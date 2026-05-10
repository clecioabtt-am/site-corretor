function setupContact(cfg){
  const form = document.querySelector('.contact-form');
  if(!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();

    // Captura correta dos campos do formulário
    // 1º campo = Nome
    // 2º campo = WhatsApp
    // 3º campo = Tipo de imóvel desejado (Interesse)
    // Textarea = Mensagem
    const inputs = form.querySelectorAll('input');
    const textarea = form.querySelector('textarea');

    const nome = inputs[0]?.value?.trim() || '';
    const whatsapp = inputs[1]?.value?.trim() || '';
    const interesse = inputs[2]?.value?.trim() || '';
    const mensagem = textarea?.value?.trim() || '';

    // Salva no Supabase
    await supabaseClient.from('mensagens_contato').insert({
      nome,
      whatsapp,
      interesse,
      mensagem
    });

    // Exibe mensagem de sucesso no site
    let box = document.getElementById('contact-success') || document.createElement('div');
    box.id = 'contact-success';
    box.style.cssText =
      'margin-top:15px;color:#d8a84f;font-weight:800;line-height:1.5';

    if (!box.parentNode) {
      form.appendChild(box);
    }

    box.textContent =
      'Sua mensagem foi enviada para o corretor, assim que possível retornaremos em seu WhatsApp!';

    // Monta a mensagem corretamente
    const texto = `Nova mensagem do site:

Nome: ${nome}
WhatsApp: ${whatsapp}
Interesse: ${interesse}
Mensagem: ${mensagem}`;

    // Abre o WhatsApp do corretor com os dados corretos
    window.open(
      `https://wa.me/${nums(cfg.whatsapp)}?text=${encodeURIComponent(texto)}`,
      '_blank'
    );

    // Limpa o formulário
    form.reset();
  });
}
