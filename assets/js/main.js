/**
 * Ecoponto Cidade Ocidental - Interações Limpas & Smart Header
 */

document.addEventListener('DOMContentLoaded', () => {
  initSmartHeader();
  initStatusIndicator();
  initCopyAddress();
  initMaterialSearch();
  initPhotoLightbox();
  initMobileMenu();
  initInteractiveMascot();
  initFloatingDockObserver();
});

// A) Header inteligente: esconde ao rolar para baixo, volta ao rolar para cima
function initSmartHeader() {
  const header = document.getElementById('main-header');
  const mobileMenu = document.getElementById('mobile-menu');
  if (!header) return;

  let lastScrollY = window.scrollY || 0;
  let ticking = false;
  const threshold = 8; // Limiar pequeno em pixels para evitar tremores

  const updateHeader = () => {
    const currentScrollY = window.scrollY || 0;
    const delta = currentScrollY - lastScrollY;

    // Se o menu mobile estiver aberto, nunca esconde o header
    const isMobileMenuOpen = mobileMenu && !mobileMenu.classList.contains('hidden');

    if (isMobileMenuOpen || currentScrollY <= 15) {
      // No topo da página ou com menu aberto: sempre visível
      header.classList.remove('header-hidden');
    } else if (Math.abs(delta) >= threshold) {
      if (delta > 0 && currentScrollY > 70) {
        // Rolando para baixo: desliza para cima e esconde
        header.classList.add('header-hidden');
      } else if (delta < 0) {
        // Rolando para cima (qualquer quantidade acima do limiar): reaparece
        header.classList.remove('header-hidden');
      }
    }

    lastScrollY = currentScrollY;
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(updateHeader);
      ticking = true;
    }
  }, { passive: true });
}

// Status simples com ponto verde de 8px (sem selo em pílula)
function initStatusIndicator() {
  const statusContainer = document.getElementById('status-container');
  const statusText = document.getElementById('status-text');
  const statusDot = document.getElementById('status-dot');

  if (!statusText || !statusDot) return;

  const now = new Date();
  const currentHour = now.getHours();
  const isOpen = currentHour >= 7 && currentHour < 19;

  if (isOpen) {
    statusDot.className = 'w-2 h-2 rounded-full bg-[#15803d] shrink-0 inline-block';
    statusText.textContent = 'Aberto agora · fecha às 19h';
    if (statusContainer) statusContainer.title = 'Aberto diariamente das 7h às 19h';
  } else {
    statusDot.className = 'w-2 h-2 rounded-full bg-neutral-400 shrink-0 inline-block';
    statusText.textContent = 'Fechado agora · abre às 7h';
    if (statusContainer) statusContainer.title = 'Horário de atendimento: 7h às 19h';
  }
}

// Copiar endereço com feedback simples
function initCopyAddress() {
  const copyBtn = document.getElementById('btn-copy-address');
  if (!copyBtn) return;

  copyBtn.addEventListener('click', async () => {
    const address = "Super Quadra 17 (SQ 17), Quadra 08, Área Especial, Cidade Ocidental - GO (ao lado da Capela Nossa Senhora de Fátima)";
    try {
      await navigator.clipboard.writeText(address);
      showToast("Endereço copiado para a área de transferência.");
    } catch (err) {
      const textarea = document.createElement('textarea');
      textarea.value = address;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      showToast("Endereço copiado para a área de transferência.");
    }
  });
}

function showToast(message) {
  let toast = document.getElementById('app-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'app-toast';
    toast.className = 'fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-neutral-900 text-neutral-100 px-4 py-2.5 rounded-md shadow-md text-sm font-medium flex items-center gap-2 transition-all duration-200 opacity-0 pointer-events-none translate-y-2';
    toast.innerHTML = `<span class="w-2 h-2 rounded-full bg-[#15803d]"></span> <span></span>`;
    document.body.appendChild(toast);
  }

  const span = toast.querySelectorAll('span')[1];
  if (span) span.textContent = message;

  toast.classList.remove('opacity-0', 'pointer-events-none', 'translate-y-2');
  toast.classList.add('opacity-100', 'translate-y-0');

  setTimeout(() => {
    toast.classList.remove('opacity-100', 'translate-y-0');
    toast.classList.add('opacity-0', 'pointer-events-none', 'translate-y-2');
  }, 2600);
}

// ==========================================
// CONSULTA INTELIGENTE DE DESCARTE ("POSSO LEVAR?")
// ==========================================
const MATERIAL_RULES = [
  // 1. REJEITADOS - LIXO ORGÂNICO E RESTOS DE COMIDA
  {
    type: 'REJECTED',
    category: 'Lixo Orgânico & Restos de Alimentos',
    keywords: [
      'banana', 'maca', 'laranja', 'fruta', 'frutas', 'casca', 'cascas', 'comida', 'resto de comida', 'restos de comida',
      'alimento', 'alimentos', 'legume', 'legumes', 'verdura', 'verduras', 'carne', 'carnes', 'osso', 'ossos',
      'arroz', 'feijao', 'pao', 'cafe', 'po de cafe', 'organico', 'lixo organico', 'lixo da cozinha', 'lixo de cozinha',
      'lixo de banheiro', 'papel higienico', 'fralda', 'fraldas', 'absorvente', 'fezes', 'coco de cachorro'
    ],
    verdict: 'Você NÃO pode descartar isso no Ecoponto.',
    explanation: 'Restos de alimentos, cascas de frutas e lixo orgânico atraem pragas, moscas e produzem chorume com mau cheiro.',
    action: 'Coloque para fora nos dias e horários da <strong>coleta domiciliar regular</strong> que passa na sua rua.',
    icon: 'fa-ban'
  },
  // 2. REJEITADOS - GRANDES PODAS DE ÁRVORES
  {
    type: 'REJECTED',
    category: 'Podas de Árvores & Galhos Volumosos',
    keywords: [
      'poda', 'podas', 'galho', 'galhos', 'arvore', 'arvores', 'tronco', 'troncos', 'toco', 'folhagem grande', 'mato alto'
    ],
    verdict: 'Você NÃO pode levar podas volumosas ao Ecoponto.',
    explanation: 'Grandes volumes de podas, toras e galhos pesados não podem ser descarregados no pátio.',
    action: 'Solicite a equipe pública de recolhimento de podas com a <strong>SMLU pelo WhatsApp (61) 99906-4704</strong>.',
    icon: 'fa-tree'
  },
  // 3. REJEITADOS - PILHAS, BATERIAS, LÂMPADAS, QUÍMICOS E TINTAS
  {
    type: 'REJECTED',
    category: 'Material Tóxico & Logística Reversa',
    keywords: [
      'pilha', 'pilhas', 'bateria', 'baterias', 'bateria de carro', 'lampada', 'lampadas', 'fluorescente',
      'tinta', 'tintas', 'lata de tinta', 'solvente', 'verniz', 'thinner', 'remedio', 'remedios', 'medicamento',
      'veneno', 'pesticida', 'oleo', 'oleo de cozinha', 'oleo de motor', 'pneu', 'pneus', 'seringa', 'hospitalar',
      'amianto', 'telha de amianto', 'animal morto'
    ],
    verdict: 'Você NÃO pode descartar isso no Ecoponto.',
    explanation: 'Pilhas, baterias, lâmpadas fluorescentes e produtos químicos oferecem alto risco de contaminação e queimaduras.',
    action: 'Estes itens exigem <strong>Logística Reversa</strong>: devolva nos supermercados, farmácias (remédios/seringas) ou lojas onde foram comprados.',
    icon: 'fa-triangle-exclamation'
  },
  // 4. ACEITOS - RECICLÁVEIS
  {
    type: 'ACCEPTED',
    category: 'Materiais Recicláveis',
    keywords: [
      'vidro', 'vidros', 'garrafa', 'garrafas', 'pote de vidro', 'cacos', 'plastico', 'plasticos', 'pet', 'garrafa pet',
      'sacola', 'sacolas', 'tampa', 'tampinhas', 'pote', 'potes', 'embalagem', 'embalagens', 'papel', 'papeis',
      'papelao', 'caixa', 'caixas', 'caixa de papelao', 'jornal', 'jornais', 'revista', 'revistas', 'caderno',
      'livro', 'tetra pak', 'caixinha de leite', 'lata', 'latinha', 'aluminio', 'metal', 'ferro'
    ],
    verdict: 'Pode trazer para o Ecoponto!',
    explanation: 'Esse material é 100% reciclável! Traga limpo e seco para apoiar a triagem e o meio ambiente da nossa cidade.',
    action: 'Descarte gratuito no pátio da SQ 17, Quadra 08 · Aberto todos os dias das 7h às 19h.',
    icon: 'fa-recycle'
  },
  // 5. ACEITOS - LIXO ELETRÔNICO
  {
    type: 'ACCEPTED',
    category: 'Lixo Eletrônico',
    keywords: [
      'computador', 'pc', 'notebook', 'laptop', 'celular', 'smartphone', 'telefone', 'televisao', 'tv', 'monitor',
      'impressora', 'teclado', 'mouse', 'cabo', 'cabos', 'carregador', 'fio', 'fios', 'fone', 'placa', 'eletronico',
      'liquidificador', 'microondas', 'ventilador', 'ferro de passar', 'aparelho', 'som', 'radio', 'videogame'
    ],
    verdict: 'Pode trazer para o Ecoponto!',
    explanation: 'Recebemos aparelhos eletrônicos, cabos e peças para desmanche ecológico seguro e reciclagem de componentes.',
    action: 'Descarte gratuito no pátio da SQ 17, Quadra 08 · Aberto todos os dias das 7h às 19h.',
    icon: 'fa-tv'
  },
  // 6. ACEITOS - ENTULHO DE CONSTRUÇÃO
  {
    type: 'ACCEPTED',
    category: 'Resíduos da Construção Civil',
    keywords: [
      'entulho', 'tijolo', 'tijolos', 'concreto', 'alvenaria', 'cimento', 'argamassa', 'azulejo', 'piso', 'pisos',
      'ceramica', 'areia', 'pedra', 'brita', 'gesso', 'drywall', 'resto de obra', 'reforma', 'cascalho'
    ],
    verdict: 'Pode trazer para o Ecoponto!',
    explanation: 'Entulhos de pequenas reformas residenciais são recebidos gratuitamente nas caçambas identificadas.',
    action: '⚠️ <strong>Atenção ao limite:</strong> até 1 m³ por descarte (cerca de 20 sacos de entulho ou 1 caçamba pequena).',
    icon: 'fa-trowel-bricks'
  },
  // 7. ACEITOS - MÓVEIS (BOTA-FORA)
  {
    type: 'ACCEPTED',
    category: 'Móveis & Programa Bota-Fora',
    keywords: [
      'sofa', 'sofas', 'colchao', 'colchoes', 'cama', 'camas', 'armario', 'armarios', 'mesa', 'mesas',
      'cadeira', 'cadeiras', 'guarda roupa', 'guarda-roupa', 'estante', 'rack', 'comoda', 'berco', 'movel', 'moveis', 'madeira'
    ],
    verdict: 'Pode descartar no Ecoponto! (Programa Bota-Fora)',
    explanation: 'Móveis velhos fazem parte do programa municipal Bota-Fora. Você pode levar direto ao pátio ou solicitar coleta gratuita na sua residência.',
    action: 'Coleta domiciliar agendável ou entrega no pátio das 7h às 19h.',
    cta: {
      text: 'Agendar Coleta de Móveis no WhatsApp',
      url: 'https://wa.me/5561999064704?text=Ol%C3%A1%2C%20gostaria%20de%20agendar%20a%20coleta%20de%20m%C3%B3veis%20(Bota-Fora)%20no%20Ecoponto.'
    },
    icon: 'fa-couch'
  }
];

function normalizeText(str) {
  return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

function initMaterialSearch() {
  const searchInput = document.getElementById('material-search');
  const verdictCard = document.getElementById('search-verdict-card');
  const clearBtn = document.getElementById('search-clear-btn');
  const chips = document.querySelectorAll('.search-chip');

  if (!searchInput || !verdictCard) return;

  const performSearch = (rawQuery) => {
    const query = normalizeText(rawQuery);

    if (!query) {
      verdictCard.classList.add('hidden');
      verdictCard.innerHTML = '';
      if (clearBtn) clearBtn.classList.add('hidden');
      return;
    }

    if (clearBtn) clearBtn.classList.remove('hidden');

    // Procura na base de regras
    let matchedRule = null;
    for (const rule of MATERIAL_RULES) {
      const match = rule.keywords.some(kw => {
        const normKw = normalizeText(kw);
        return query.includes(normKw) || (normKw.length >= 4 && normKw.includes(query));
      });
      if (match) {
        matchedRule = rule;
        break;
      }
    }

    verdictCard.classList.remove('hidden');

    if (matchedRule) {
      if (matchedRule.type === 'ACCEPTED') {
        verdictCard.innerHTML = `
          <div class="bg-emerald-50 rounded-xl border-[3px] border-neutral-950 p-6 sm:p-7 shadow-[6px_6px_0px_#171717] space-y-4">
            <div class="flex items-center justify-between gap-2 border-b-2 border-emerald-950 pb-2.5">
              <span class="inline-block bg-muro-verde text-white font-display font-black text-xs uppercase tracking-wider px-2.5 py-1 rounded border border-neutral-950">
                ${matchedRule.category}
              </span>
              <span class="text-xs font-black text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                <i class="fa-solid fa-circle-check text-muro-verde text-base"></i> Descarte Autorizado
              </span>
            </div>

            <div class="flex items-start gap-3.5">
              <div class="w-12 h-12 rounded-lg bg-muro-verde text-white flex items-center justify-center shrink-0 border-2 border-neutral-950 text-xl shadow-[3px_3px_0px_#171717]">
                <i class="fa-solid ${matchedRule.icon}"></i>
              </div>
              <div class="space-y-1.5">
                <h3 class="font-display font-black text-2xl sm:text-3xl text-emerald-950 leading-tight">
                  ${matchedRule.verdict}
                </h3>
                <p class="text-base sm:text-lg text-emerald-900 font-bold leading-relaxed">
                  ${matchedRule.explanation}
                </p>
              </div>
            </div>

            <div class="p-3.5 bg-white rounded-lg border-2 border-emerald-400 text-sm sm:text-base font-bold text-emerald-950 shadow-[2px_2px_0px_#171717]">
              ${matchedRule.action}
            </div>

            ${matchedRule.cta ? `
              <div class="pt-2">
                <a href="${matchedRule.cta.url}" target="_blank" rel="noopener noreferrer" class="btn-sticker btn-sticker-yellow w-full py-3.5 text-base justify-center gap-2">
                  <i class="fa-brands fa-whatsapp text-xl text-neutral-950"></i>
                  <span>${matchedRule.cta.text}</span>
                </a>
              </div>
            ` : ''}
          </div>
        `;
      } else {
        // REJECTED
        verdictCard.innerHTML = `
          <div class="bg-red-50 rounded-xl border-[3px] border-neutral-950 p-6 sm:p-7 shadow-[6px_6px_0px_#171717] space-y-4">
            <div class="flex items-center justify-between gap-2 border-b-2 border-red-950 pb-2.5">
              <span class="inline-block bg-muro-vermelho text-white font-display font-black text-xs uppercase tracking-wider px-2.5 py-1 rounded border border-neutral-950">
                ${matchedRule.category}
              </span>
              <span class="text-xs font-black text-red-950 uppercase tracking-wider flex items-center gap-1.5">
                <i class="fa-solid fa-circle-xmark text-muro-vermelho text-base"></i> Não Aceito no Pátio
              </span>
            </div>

            <div class="flex items-start gap-3.5">
              <div class="w-12 h-12 rounded-lg bg-muro-vermelho text-white flex items-center justify-center shrink-0 border-2 border-neutral-950 text-xl shadow-[3px_3px_0px_#171717]">
                <i class="fa-solid ${matchedRule.icon}"></i>
              </div>
              <div class="space-y-1.5">
                <h3 class="font-display font-black text-2xl sm:text-3xl text-red-950 leading-tight">
                  ${matchedRule.verdict}
                </h3>
                <p class="text-base sm:text-lg text-red-900 font-bold leading-relaxed">
                  ${matchedRule.explanation}
                </p>
              </div>
            </div>

            <div class="p-3.5 bg-white rounded-lg border-2 border-red-400 text-sm sm:text-base text-red-950 space-y-1 shadow-[2px_2px_0px_#171717]">
              <p class="font-black text-xs uppercase tracking-wider text-red-700">O que fazer:</p>
              <p class="font-bold">${matchedRule.action}</p>
            </div>
          </div>
        `;
      }
    } else {
      // UNKNOWN / AMBIGUOUS
      verdictCard.innerHTML = `
        <div class="bg-amber-50 rounded-xl border-[3px] border-neutral-950 p-6 sm:p-7 shadow-[6px_6px_0px_#171717] space-y-4">
          <div class="flex items-center justify-between gap-2 border-b-2 border-neutral-950 pb-2.5">
            <span class="inline-block bg-muro-amarelo text-neutral-950 font-display font-black text-xs uppercase tracking-wider px-2.5 py-1 rounded border border-neutral-950">
              Dúvida ou Não Catalogado
            </span>
            <span class="text-xs font-black text-amber-950 uppercase tracking-wider">
              Consulte a Secretaria
            </span>
          </div>

          <div class="space-y-1.5">
            <h3 class="font-display font-black text-xl sm:text-2xl text-neutral-950">
              Ficou na dúvida sobre "${escapeHtml(rawQuery)}"?
            </h3>
            <p class="text-sm text-neutral-800 font-medium leading-relaxed">
              Não temos esse item catalogado na regra rápida. Para você não perder a viagem até o Ecoponto, fale diretamente com a equipe da prefeitura pelo WhatsApp:
            </p>
          </div>

          <div class="pt-2">
            <a href="https://wa.me/5561999064704?text=Ol%C3%A1%2C%20gostaria%20de%20saber%20se%20posso%20descartar%20${encodeURIComponent(rawQuery)}%20no%20Ecoponto."
               target="_blank" 
               rel="noopener noreferrer" 
               class="btn-sticker btn-sticker-yellow w-full py-3.5 text-base justify-center gap-2">
              <i class="fa-brands fa-whatsapp text-lg text-neutral-950"></i>
              <span>Perguntar sobre "${escapeHtml(rawQuery)}" no WhatsApp (61) 99906-4704</span>
            </a>
          </div>
        </div>
      `;
    }
  };

  searchInput.addEventListener('input', (e) => {
    performSearch(e.target.value);
  });

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      searchInput.value = '';
      performSearch('');
      searchInput.focus();
    });
  }

  // Cliques nos chips rápidos
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      const term = chip.getAttribute('data-term') || chip.textContent.trim();
      searchInput.value = term;
      performSearch(term);
      searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  });

  // Foco automático e destaque ao clicar em qualquer link para #consulta
  const consultaLinks = document.querySelectorAll('a[href="#consulta"]');
  const searchBox = document.getElementById('search-box-container');

  consultaLinks.forEach(link => {
    link.addEventListener('click', () => {
      setTimeout(() => {
        searchInput.focus();
        if (searchBox) {
          searchBox.classList.add('ring-4', 'ring-neutral-950');
          setTimeout(() => {
            searchBox.classList.remove('ring-4', 'ring-neutral-950');
          }, 1400);
        }
      }, 300);
    });
  });
}

function escapeHtml(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}

// Modal Lightbox para visualização de fotos
function initPhotoLightbox() {
  const triggers = document.querySelectorAll('[data-lightbox-src]');
  const modal = document.getElementById('photo-modal');
  const modalImg = document.getElementById('modal-img');
  const modalCaption = document.getElementById('modal-caption');
  const closeBtn = document.getElementById('modal-close');

  if (!modal || !modalImg) return;

  triggers.forEach(btn => {
    btn.addEventListener('click', () => {
      const src = btn.getAttribute('data-lightbox-src');
      const caption = btn.getAttribute('data-lightbox-caption') || '';
      modalImg.src = src;
      if (modalCaption) modalCaption.textContent = caption;
      modal.classList.remove('hidden');
      modal.classList.add('flex');
      document.body.style.overflow = 'hidden';
    });
  });

  const closeModal = () => {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    modalImg.src = '';
    document.body.style.overflow = '';
  };

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
      closeModal();
    }
  });
}

// Menu Mobile (com suporte tátil, toggle de ícone e fechamento suave)
function initMobileMenu() {
  const toggleBtn = document.getElementById('mobile-menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const header = document.getElementById('main-header');
  const icon = document.getElementById('mobile-menu-icon');

  if (!toggleBtn || !mobileMenu) return;

  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isHidden = mobileMenu.classList.toggle('hidden');
    toggleBtn.setAttribute('aria-expanded', !isHidden);

    if (icon) {
      if (isHidden) {
        icon.className = 'fa-solid fa-bars text-base';
      } else {
        icon.className = 'fa-solid fa-xmark text-base';
      }
    }

    // Garante que o header permaneça visível se o menu for aberto
    if (!isHidden && header) {
      header.classList.remove('header-hidden');
    }
  });

  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.add('hidden');
      toggleBtn.setAttribute('aria-expanded', 'false');
      if (icon) icon.className = 'fa-solid fa-bars text-base';
    });
  });

  // Fecha o menu ao clicar fora dele
  document.addEventListener('click', (e) => {
    if (!mobileMenu.classList.contains('hidden') && header && !header.contains(e.target)) {
      mobileMenu.classList.add('hidden');
      toggleBtn.setAttribute('aria-expanded', 'false');
      if (icon) icon.className = 'fa-solid fa-bars text-base';
    }
  });
}

// ==========================================
// MASCOTE INTERATIVO & COMPORTAMENTOS SUTIS
// ==========================================
function initInteractiveMascot() {
  const isReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Frases acolhedoras para cada mascote
  const MASCOTE_MESSAGES = {
    hero: [
      "Oi, vizinho! O descarte aqui é 100% gratuito! 🌿",
      "Vamos manter nossa Cidade Ocidental limpa! ✨",
      "Segunda a domingo, das 7h às 19h! ⏰",
      "Traga recicláveis, móveis e pequenos entulhos! 💚"
    ],
    espiando: [
      "Tô de olho! Aberto todos os dias, das 7h às 19h! 👀",
      "Sem intervalo para almoço! Pode vir! ⏰",
      "Fica na SQ 17, ao lado da capela! 📍"
    ],
    placa: [
      "Seu sofá está velho? A prefeitura busca na sua casa! 🛋️",
      "Descarte certo faz nossa cidade brilhar! 🌟",
      "Pode trazer pro Ecoponto! É de graça! 📦"
    ],
    footer: [
      "Cidade Ocidental mais limpa começa com você! 💚",
      "Obrigado por apoiar a reciclagem da nossa cidade! 🌳",
      "Até a próxima visita ao Ecoponto! 👋"
    ]
  };

  const mascots = [
    {
      id: 'hero',
      container: document.getElementById('hero-mascote-container'),
      bubble: document.getElementById('hero-mascote-bubble'),
      messages: MASCOTE_MESSAGES.hero
    },
    {
      id: 'espiando',
      container: document.getElementById('espiando-mascote-container'),
      bubble: document.getElementById('espiando-mascote-bubble'),
      messages: MASCOTE_MESSAGES.espiando
    },
    {
      id: 'placa',
      container: document.getElementById('placa-mascote-container'),
      bubble: document.getElementById('placa-mascote-bubble'),
      messages: MASCOTE_MESSAGES.placa
    },
    {
      id: 'footer',
      container: document.getElementById('footer-mascote-container'),
      bubble: document.getElementById('footer-mascote-bubble'),
      messages: MASCOTE_MESSAGES.footer
    }
  ];

  // 1. Interação por Clique / Toque em cada mascote
  mascots.forEach(item => {
    if (!item.container || !item.bubble) return;

    let msgIndex = 0;
    let hideTimer = null;
    const img = item.container.querySelector('img');

    // Remove classe de entrada assim que ela termina para não travar transformações futuras
    item.container.addEventListener('animationend', (e) => {
      if (e.animationName === 'mascoteEntrance') {
        item.container.classList.remove('mascote-entrance');
      }
    });

    const triggerReaction = (e) => {
      if (e) e.stopPropagation();

      // Salto alegre de desenho animado aplicado DIRETAMENTE NA IMAGEM (sem forçar reflow nem travar o balão)
      if (img && !isReducedMotion) {
        img.classList.remove('mascote-jump');
        // requestAnimationFrame garante execução limpa e sem engasgos a 60fps
        requestAnimationFrame(() => {
          img.classList.add('mascote-jump');
        });

        // Limpa a classe exatamente no término da animação sem engasgos
        img.addEventListener('animationend', () => {
          img.classList.remove('mascote-jump');
        }, { once: true });
      }

      // Exibe balão de fala acolhedor de forma estável
      const message = item.messages[msgIndex % item.messages.length];
      msgIndex++;
      item.bubble.textContent = message;
      item.bubble.classList.add('bubble-visible');

      if (hideTimer) clearTimeout(hideTimer);
      hideTimer = setTimeout(() => {
        item.bubble.classList.remove('bubble-visible');
      }, 2600);
    };

    item.container.addEventListener('click', triggerReaction);
    item.container.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        triggerReaction(e);
      }
    });
  });

  // 2. Aparição sutil ao rolar a página (IntersectionObserver)
  if (!isReducedMotion && 'IntersectionObserver' in window) {
    const espiandoContainer = document.getElementById('espiando-mascote-container');
    if (espiandoContainer) {
      const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            espiandoContainer.classList.add('mascote-peek-in');
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.3 });
      observer.observe(espiandoContainer);
    }
  }

  // 3. Mascote prestando atenção em botões ou elementos importantes
  const heroMascot = document.getElementById('hero-mascote-container');
  const attentiveTriggers = document.querySelectorAll(
    '#inicio a, #main-header a[href*="wa.me"], #main-header a[href="#consulta"], #material-search'
  );

  if (heroMascot && !isReducedMotion) {
    const makeAttentive = () => {
      const rect = heroMascot.getBoundingClientRect();
      if (rect.bottom > 0 && rect.top < window.innerHeight) {
        heroMascot.classList.add('mascote-attentive');
      }
    };

    const removeAttentive = () => {
      heroMascot.classList.remove('mascote-attentive');
    };

    attentiveTriggers.forEach(el => {
      el.addEventListener('mouseenter', makeAttentive);
      el.addEventListener('mouseleave', removeAttentive);
      el.addEventListener('focus', makeAttentive);
      el.addEventListener('blur', removeAttentive);
    });
  }
}

// ==========================================
// DOCK FLUTUANTE (MAPS + WHATSAPP): OCULTAÇÃO INTELIGENTE NO RODAPÉ
// ==========================================
function initFloatingDockObserver() {
  const footer = document.getElementById('site-footer');
  const fabDock = document.getElementById('fab-dock');
  if (!footer || !fabDock) return;

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        // Quando o rodapé começa a aparecer na tela, recolhe suavemente as bolinhas
        if (entry.isIntersecting) {
          fabDock.classList.add('fab-dock-hidden');
        } else {
          fabDock.classList.remove('fab-dock-hidden');
        }
      });
    }, { threshold: 0.08 });

    observer.observe(footer);
  }
}
