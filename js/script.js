/* ==========================================================================
   VITTA AUTO SEGUROS — SCRIPT PRINCIPAL
   ========================================================================== */

(function () {
  'use strict';

  /* ======================================================================
     CONFIGURAÇÃO CENTRAL DO WHATSAPP
     Altere apenas os valores abaixo para configurar o número da empresa.
     ====================================================================== */
  const WHATSAPP_CONFIG = {
    // Número no formato internacional, apenas dígitos (DDI + DDD + número)
    number: '5582999990000',
    // Mensagem padrão usada quando não há dados de formulário
    defaultMessage:
      'Olá! Vim pelo site da Vitta Auto e gostaria de falar com um consultor sobre seguro automotivo.'
  };

  /**
   * Monta a URL do WhatsApp (wa.me) com uma mensagem opcional.
   * @param {string} message
   * @returns {string}
   */
  function buildWhatsAppUrl(message) {
    const text = encodeURIComponent(message || WHATSAPP_CONFIG.defaultMessage);
    return `https://wa.me/${WHATSAPP_CONFIG.number}?text=${text}`;
  }

  /**
   * Monta a mensagem de cotação a partir dos dados do formulário.
   */
  function buildQuoteMessage(data) {
    return (
      `Olá! Gostaria de solicitar uma cotação de seguro automotivo.%0A%0A` +
      `*Nome:* ${data.nome}%0A` +
      `*WhatsApp:* ${data.whatsapp}%0A` +
      `*Veículo:* ${data.modelo} (${data.ano})%0A` +
      `*Cidade:* ${data.cidade}%0A` +
      `*Tipo de seguro desejado:* ${data.tipoSeguro}`
    ).replace(/%0A/g, '\n');
  }

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    setupStaticWhatsAppLinks();
    setupHeaderScroll();
    setupMobileMenu();
    setupSmoothAnchorClose();
    setupQuoteForm();
    setupAccordion();
    setupRevealOnScroll();
    setupCounters();
    setupProcessRoute();
  }

  /* ---------------------------------------------------------------------
     Links estáticos de WhatsApp (botão flutuante, contato, "falar com consultor")
     --------------------------------------------------------------------- */
  function setupStaticWhatsAppLinks() {
    const floatBtn = document.getElementById('whatsapp-float');
    const contactLink = document.getElementById('contact-whatsapp');
    const talkToConsultant = document.getElementById('talk-to-consultant');

    const url = buildWhatsAppUrl();

    if (floatBtn) floatBtn.setAttribute('href', url);
    if (contactLink) contactLink.setAttribute('href', url);
    if (talkToConsultant) {
      talkToConsultant.setAttribute('href', url);
      talkToConsultant.setAttribute('target', '_blank');
      talkToConsultant.setAttribute('rel', 'noopener');
    }
  }

  /* ---------------------------------------------------------------------
     Header: fundo sólido + sombra ao rolar
     --------------------------------------------------------------------- */
  function setupHeaderScroll() {
    const header = document.getElementById('header');
    if (!header) return;

    function toggleHeader() {
      if (window.scrollY > 40) {
        header.classList.add('is-scrolled');
      } else {
        header.classList.remove('is-scrolled');
      }
    }

    toggleHeader();
    window.addEventListener('scroll', toggleHeader, { passive: true });
  }

  /* ---------------------------------------------------------------------
     Menu mobile (hamburger)
     --------------------------------------------------------------------- */
  function setupMobileMenu() {
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobile-menu');
    if (!hamburger || !mobileMenu) return;

    function closeMenu() {
      hamburger.classList.remove('is-active');
      hamburger.setAttribute('aria-expanded', 'false');
      mobileMenu.classList.remove('is-open');
    }

    hamburger.addEventListener('click', function () {
      const isOpen = mobileMenu.classList.toggle('is-open');
      hamburger.classList.toggle('is-active', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
    });

    mobileMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });
  }

  /* ---------------------------------------------------------------------
     Fecha o menu mobile ao clicar em qualquer âncora do header desktop
     --------------------------------------------------------------------- */
  function setupSmoothAnchorClose() {
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        const targetId = link.getAttribute('href');
        if (!targetId || targetId === '#') return;
        const target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          const headerHeight = document.getElementById('header').offsetHeight;
          const top = target.getBoundingClientRect().top + window.scrollY - headerHeight + 1;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      });
    });
  }

  /* ---------------------------------------------------------------------
     Formulário de cotação -> redireciona para o WhatsApp
     --------------------------------------------------------------------- */
  function setupQuoteForm() {
    const form = document.getElementById('quote-form');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const data = {
        nome: form.nome.value.trim(),
        whatsapp: form.whatsapp.value.trim(),
        modelo: form.modelo.value.trim(),
        ano: form.ano.value.trim(),
        cidade: form.cidade.value.trim(),
        tipoSeguro: form.tipoSeguro.value
      };

      const message = buildQuoteMessage(data);
      const url = buildWhatsAppUrl(message);

      window.open(url, '_blank', 'noopener');
    });
  }

  /* ---------------------------------------------------------------------
     Accordion do FAQ
     --------------------------------------------------------------------- */
  function setupAccordion() {
    const items = document.querySelectorAll('.accordion-item');
    if (!items.length) return;

    items.forEach(function (item) {
      const trigger = item.querySelector('.accordion-item__trigger');
      const panel = item.querySelector('.accordion-item__panel');

      trigger.addEventListener('click', function () {
        const isOpen = item.classList.contains('is-open');

        // Fecha os outros itens abertos
        items.forEach(function (other) {
          if (other !== item) {
            other.classList.remove('is-open');
            other.querySelector('.accordion-item__trigger').setAttribute('aria-expanded', 'false');
            other.querySelector('.accordion-item__panel').style.maxHeight = null;
          }
        });

        if (isOpen) {
          item.classList.remove('is-open');
          trigger.setAttribute('aria-expanded', 'false');
          panel.style.maxHeight = null;
        } else {
          item.classList.add('is-open');
          trigger.setAttribute('aria-expanded', 'true');
          panel.style.maxHeight = panel.scrollHeight + 'px';
        }
      });
    });
  }

  /* ---------------------------------------------------------------------
     Animações de entrada (fade in / slide up) via IntersectionObserver
     --------------------------------------------------------------------- */
  function setupRevealOnScroll() {
    const items = document.querySelectorAll('.reveal');
    if (!items.length) return;

    if (!('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry, index) {
          if (entry.isIntersecting) {
            const el = entry.target;
            const delay = (index % 4) * 70;
            setTimeout(function () { el.classList.add('is-visible'); }, delay);
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
    );

    items.forEach(function (el) { observer.observe(el); });
  }

  /* ---------------------------------------------------------------------
     Contadores animados (estatísticas)
     --------------------------------------------------------------------- */
  function setupCounters() {
    const counters = document.querySelectorAll('[data-count], [data-decimal]');
    if (!counters.length) return;

    function animateCounter(el) {
      const suffix = el.getAttribute('data-suffix') || '';
      const isDecimal = el.hasAttribute('data-decimal');
      const target = parseFloat(el.getAttribute(isDecimal ? 'data-decimal' : 'data-count'));
      const duration = 1400;
      const start = performance.now();

      function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = target * eased;

        el.textContent = isDecimal
          ? current.toFixed(1) + suffix
          : Math.round(current).toLocaleString('pt-BR') + suffix;

        if (progress < 1) {
          requestAnimationFrame(tick);
        }
      }

      requestAnimationFrame(tick);
    }

    if (!('IntersectionObserver' in window)) {
      counters.forEach(animateCounter);
      return;
    }

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach(function (el) { observer.observe(el); });
  }

  /* ---------------------------------------------------------------------
     Desenha a linha da seção "Como funciona" quando ela entra na tela
     --------------------------------------------------------------------- */
  function setupProcessRoute() {
    const route = document.getElementById('process-route');
    const line = route ? route.querySelector('.process__line') : null;
    if (!route || !line) return;

    if (!('IntersectionObserver' in window)) {
      line.classList.add('is-drawn');
      return;
    }

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            line.classList.add('is-drawn');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );

    observer.observe(route);
  }
})();
