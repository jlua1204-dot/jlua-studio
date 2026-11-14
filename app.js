/* JLUA STUDIO — interface behaviour */
(function () {
  'use strict';

  document.documentElement.classList.add('js');
  // ?capture — 스크린샷 도구가 페이지를 통째로 담을 때 등장 애니메이션을 끕니다
  if (/[?&]capture\b/.test(window.location.search)) {
    document.documentElement.classList.remove('js');
  }

  /* ---------- header state ---------- */
  var header = document.getElementById('header');
  var onScroll = function () {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 24);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- mobile menu ---------- */
  var burger = document.getElementById('burger');
  var mobileMenu = document.getElementById('mobile-menu');

  function closeMenu() {
    if (!burger || !mobileMenu) return;
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', '메뉴 열기');
    mobileMenu.classList.remove('is-open');
    document.body.style.overflow = '';
    window.setTimeout(function () {
      if (burger.getAttribute('aria-expanded') === 'false') mobileMenu.hidden = true;
    }, 320);
  }

  function openMenu() {
    if (!burger || !mobileMenu) return;
    mobileMenu.hidden = false;
    // force reflow so the fade transition runs
    void mobileMenu.offsetWidth;
    mobileMenu.classList.add('is-open');
    burger.setAttribute('aria-expanded', 'true');
    burger.setAttribute('aria-label', '메뉴 닫기');
    document.body.style.overflow = 'hidden';
  }

  if (burger && mobileMenu) {
    burger.addEventListener('click', function () {
      if (burger.getAttribute('aria-expanded') === 'true') closeMenu();
      else openMenu();
    });

    mobileMenu.addEventListener('click', function (event) {
      if (event.target.closest('a')) closeMenu();
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') closeMenu();
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth >= 900 && burger.getAttribute('aria-expanded') === 'true') closeMenu();
    });
  }

  /* ---------- reveal on scroll ---------- */
  var revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealItems.length) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in');
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
    );
    revealItems.forEach(function (item, index) {
      item.style.transitionDelay = (index % 3) * 60 + 'ms';
      observer.observe(item);
    });
  } else {
    revealItems.forEach(function (item) {
      item.classList.add('is-in');
    });
  }

  /* ---------- comparison: differences only ---------- */
  var diffOnly = document.getElementById('diffOnly');
  if (diffOnly) {
    diffOnly.addEventListener('change', function () {
      var block = diffOnly.closest('.table-block');
      if (block) block.classList.toggle('is-diff-only', diffOnly.checked);
    });
  }

  /* ---------- project modals ---------- */
  var openers = document.querySelectorAll('[data-modal]');
  openers.forEach(function (opener) {
    opener.addEventListener('click', function () {
      var dialog = document.getElementById(opener.getAttribute('data-modal'));
      if (!dialog || typeof dialog.showModal !== 'function') return;
      dialog.showModal();
      document.body.style.overflow = 'hidden';
    });
  });

  document.querySelectorAll('dialog.modal').forEach(function (dialog) {
    var closeBtn = dialog.querySelector('.modal__close');

    function close() {
      dialog.close();
    }

    if (closeBtn) closeBtn.addEventListener('click', close);

    dialog.addEventListener('click', function (event) {
      var rect = dialog.getBoundingClientRect();
      var inside =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom;
      if (!inside) close();
    });

    dialog.addEventListener('close', function () {
      document.body.style.overflow = '';
    });
  });

  /* ---------- copy email ---------- */
  var copyBtn = document.getElementById('copyMail');
  if (copyBtn) {
    var originalLabel = copyBtn.textContent;
    copyBtn.addEventListener('click', function () {
      var value = copyBtn.getAttribute('data-mail') || '';
      var done = function () {
        copyBtn.textContent = '복사했어요 ✓';
        window.setTimeout(function () {
          copyBtn.textContent = originalLabel;
        }, 2000);
      };
      var failed = function () {
        copyBtn.textContent = '직접 선택해 주세요';
        window.setTimeout(function () {
          copyBtn.textContent = originalLabel;
        }, 2400);
      };

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(value).then(done, function () {
          fallbackCopy(value) ? done() : failed();
        });
      } else {
        fallbackCopy(value) ? done() : failed();
      }
    });
  }

  function fallbackCopy(text) {
    try {
      var input = document.createElement('textarea');
      input.value = text;
      input.setAttribute('readonly', '');
      input.style.position = 'fixed';
      input.style.top = '-1000px';
      document.body.appendChild(input);
      input.select();
      var ok = document.execCommand('copy');
      document.body.removeChild(input);
      return ok;
    } catch (error) {
      return false;
    }
  }

  /* ---------- active nav highlight ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav a[href^="#"]'));
  var sections = navLinks
    .map(function (link) {
      return document.querySelector(link.getAttribute('href'));
    })
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    var navObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          navLinks.forEach(function (link) {
            var on = link.getAttribute('href') === '#' + entry.target.id;
            link.style.color = on ? '#fff' : '';
          });
        });
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );
    sections.forEach(function (section) {
      navObserver.observe(section);
    });
  }
})();
