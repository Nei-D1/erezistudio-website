/* ==========================================================================
   EREZI STUDIO — Interactions
   ========================================================================== */

(function () {
    'use strict';

    /* ----------------------------------------------------------------------
       NAVIGATION
       ---------------------------------------------------------------------- */
    const hamburger = document.getElementById('hamburger-btn');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    function toggleMenu() {
        const isOpen = navMenu.classList.toggle('active');
        hamburger.classList.toggle('is-active', isOpen);
        hamburger.setAttribute('aria-expanded', String(isOpen));
        document.body.style.overflow = isOpen ? 'hidden' : '';
    }

    function closeMenu() {
        navMenu.classList.remove('active');
        hamburger.classList.remove('is-active');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    }

    if (hamburger) {
        hamburger.addEventListener('click', toggleMenu);
        navLinks.forEach((link) => link.addEventListener('click', closeMenu));
    }

    /* ----------------------------------------------------------------------
       MODALES PORTFOLIO
       ---------------------------------------------------------------------- */
    const portfolioCards = document.querySelectorAll('.portfolio-card');

    function openModal(id) {
        const modal = document.getElementById(id);
        if (!modal) return;
        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function closeModal(modal) {
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    portfolioCards.forEach((card) => {
        card.addEventListener('click', () => openModal(card.dataset.modal));
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openModal(card.dataset.modal);
            }
        });
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'button');
    });

    document.querySelectorAll('.portfolio-modal').forEach((modal) => {
        const closeBtn = modal.querySelector('.close-modal');

        if (closeBtn) closeBtn.addEventListener('click', () => closeModal(modal));

        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal(modal);
        });
    });

    document.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape') return;
        document.querySelectorAll('.portfolio-modal.is-open').forEach(closeModal);
        if (navMenu && navMenu.classList.contains('active')) closeMenu();
    });

    /* ----------------------------------------------------------------------
       FORMULAIRE DE CONTACT
       ----------------------------------------------------------------------
       Deux modes possibles :
       1) FORMSPREE — créez un compte gratuit sur formspree.io, récupérez
          votre endpoint (ex: https://formspree.io/f/xabc1234) et collez-le
          ci-dessous. Recommandé : marche sans backend, gère les pièces jointes,
          vous envoie un email à chaque soumission.
       2) MAILTO — fallback automatique si l'endpoint Formspree n'est pas
          configuré. Ouvre le client mail de l'utilisateur avec le message
          pré-rempli. Moins élégant mais 100% fonctionnel sans inscription.
       ---------------------------------------------------------------------- */

    const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xzdnewrk'; // ← collez votre endpoint ici
    const FALLBACK_EMAIL = 'contact.erezistudio@gmail.com';

    const form = document.getElementById('contact-form');
    const submitBtn = document.getElementById('submit-btn');
    const statusBox = document.getElementById('form-status');

    if (!form) return;

    /* Validation helpers */
    const validators = {
        name: (v) => v.trim().length >= 2 || 'Merci d\'indiquer votre nom.',
        email: (v) =>
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ||
            'Merci d\'indiquer un email valide.',
        service: (v) => v !== '' || 'Merci de sélectionner un service.',
        budget: (v) => v !== '' || 'Merci de sélectionner une fourchette.',
        message: (v) => v.trim().length >= 10 || 'Décrivez votre projet en quelques mots.',
    };

    function clearErrors() {
        form.querySelectorAll('.has-error').forEach((el) => el.classList.remove('has-error'));
        setStatus('', '');
    }

    function setStatus(message, type) {
        statusBox.textContent = message;
        statusBox.className = 'form-status';
        if (message) {
            statusBox.classList.add('is-visible');
            if (type) statusBox.classList.add(`is-${type}`);
        }
    }

    function validate(data) {
        let firstError = null;

        Object.keys(validators).forEach((field) => {
            const input = form.elements[field];
            if (!input) return;

            const result = validators[field](data[field] || '');
            if (result !== true) {
                input.classList.add('has-error');
                if (!firstError) firstError = { input, message: result };
            }
        });

        return firstError;
    }

    function collectData() {
        const fd = new FormData(form);
        const data = {};
        fd.forEach((value, key) => {
            data[key] = typeof value === 'string' ? value : value;
        });
        return data;
    }

    function buildMailto(data) {
        const serviceLabels = {
            branding: 'Identité visuelle & branding',
            web: 'Site web / e-commerce',
            retainer: 'Retainer social media',
            audit: 'Audit & conseil express',
            full: 'Pack complet',
            custom: 'Projet sur-mesure',
        };
        const budgetLabels = {
            starter: 'Moins de 100 $ US',
            standard: '100 – 500 $ US',
            premium: '500 – 1 500 $ US',
            corporate: '1 500 $ US et plus',
            unsure: 'Non défini',
        };

        const subject = `Nouveau projet — ${serviceLabels[data.service] || data.service}`;
        const body = [
            `Nom / Entreprise : ${data.name}`,
            `Email : ${data.email}`,
            `Téléphone : ${data.phone || '—'}`,
            `Service : ${serviceLabels[data.service] || data.service}`,
            `Budget : ${budgetLabels[data.budget] || data.budget}`,
            '',
            'Message :',
            data.message,
        ].join('\n');

        return `mailto:${FALLBACK_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }

    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        clearErrors();

        const data = collectData();
        const error = validate(data);

        if (error) {
            error.input.focus();
            setStatus(error.message, 'error');
            return;
        }

        submitBtn.classList.add('is-loading');
        submitBtn.disabled = true;

        try {
            if (FORMSPREE_ENDPOINT) {
                const response = await fetch(FORMSPREE_ENDPOINT, {
                    method: 'POST',
                    headers: { Accept: 'application/json' },
                    body: new FormData(form),
                });

                if (!response.ok) throw new Error('Échec de l\'envoi.');

                setStatus(
                    'Merci. Votre demande a bien été reçue — nous revenons vers vous sous 24 à 48h.',
                    'success'
                );
                form.reset();
            } else {
                window.location.href = buildMailto(data);
                setStatus(
                    'Votre client mail va s\'ouvrir avec le message pré-rempli. Si rien ne s\'ouvre, écrivez-nous directement à ' +
                        FALLBACK_EMAIL +
                        '.',
                    'success'
                );
            }
        } catch (err) {
            setStatus(
                'Une erreur est survenue. Écrivez-nous directement à ' + FALLBACK_EMAIL + '.',
                'error'
            );
        } finally {
            submitBtn.classList.remove('is-loading');
            submitBtn.disabled = false;
        }
    });

    /* Retire l'état d'erreur dès que l'utilisateur corrige */
    form.querySelectorAll('input, select, textarea').forEach((field) => {
        field.addEventListener('input', () => {
            if (field.classList.contains('has-error')) field.classList.remove('has-error');
            if (statusBox.classList.contains('is-error')) setStatus('', '');
        });
    });

    /* ----------------------------------------------------------------------
       MARQUEE — duplication automatique du contenu pour boucle infinie
       ---------------------------------------------------------------------- */
    const track = document.querySelector('.marquee-track');
    if (track) {
        track.innerHTML += track.innerHTML;
    }
})();