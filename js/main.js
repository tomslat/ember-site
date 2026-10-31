// Ember: site behaviour (no dependencies)
(function () {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const escapeHtml = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  // ----- Nav: background on scroll + mobile menu -----
  const nav = $(".nav");
  const toggle = $(".nav__toggle");
  const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 40);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const setMenu = (open) => {
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  };
  toggle.addEventListener("click", () => setMenu(!nav.classList.contains("is-open")));
  $$("#nav-menu a").forEach((a) => a.addEventListener("click", () => setMenu(false)));

  // ----- Hero sparks -----
  if (!reduceMotion) {
    const sparks = $(".hero__sparks");
    const count = window.innerWidth < 600 ? 18 : 36;
    for (let i = 0; i < count; i++) {
      const s = document.createElement("span");
      s.className = "spark";
      const size = 2 + Math.random() * 4;
      s.style.cssText =
        `left:${Math.random() * 100}%;width:${size}px;height:${size}px;` +
        `animation-duration:${6 + Math.random() * 8}s;animation-delay:${-Math.random() * 14}s;` +
        `--drift:${(Math.random() - 0.5) * 160}px`;
      sparks.appendChild(s);
    }
  }

  // ----- Reveal sections on scroll -----
  const revealTargets = $$(".section .container > *");
  if ("IntersectionObserver" in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -60px" });
    revealTargets.forEach((el) => { el.classList.add("reveal"); io.observe(el); });
  }

  // ----- Gigs (data/gigs.json) -----
  const gigList = $("#gig-list");
  const parseDate = (iso) => { const [y, m, d] = iso.split("-").map(Number); return new Date(y, m - 1, d); };

  function renderGigs(gigs) {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const upcoming = gigs
      .filter((g) => g.date && parseDate(g.date) >= today)
      .sort((a, b) => parseDate(a.date) - parseDate(b.date));

    if (!upcoming.length) {
      gigList.innerHTML = `<li class="gigs__empty">No public gigs announced right now. Follow us on socials for the next one, or <a href="#book">book us for your event</a>.</li>`;
      return;
    }

    gigList.innerHTML = upcoming.map((g) => {
      const d = parseDate(g.date);
      const day = d.getDate();
      const mon = d.toLocaleDateString("en-IE", { month: "short" }).toUpperCase();
      const weekday = d.toLocaleDateString("en-IE", { weekday: "long" });
      const meta = [weekday, escapeHtml(g.town), g.time ? escapeHtml(g.time) : ""].filter(Boolean).join(" · ");
      const action = g.private
        ? `<span class="gig__tag">Private event</span>`
        : g.link
          ? `<a class="btn btn--small" href="${escapeHtml(g.link)}" target="_blank" rel="noopener">Details</a>`
          : g.note ? `<span class="gig__tag">${escapeHtml(g.note)}</span>` : "<span></span>";
      return `<li class="gig">
        <div class="gig__date"><span class="gig__day">${day}</span><span class="gig__mon">${mon}</span></div>
        <div><p class="gig__venue">${escapeHtml(g.venue)}</p><p class="gig__meta">${meta}</p></div>
        ${action}
      </li>`;
    }).join("");
  }

  fetch("data/gigs.json", { cache: "no-cache" })
    .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
    .then(renderGigs)
    .catch(() => renderGigs([]));

  // ----- Setlist (data/setlist.json) with search -----
  const setlistEl = $("#setlist-list");
  const search = $("#setlist-search");
  let songs = [];
  const ERA_ORDER = ["50s & 60s", "70s", "80s", "90s", "2000s", "2010s+"];

  function renderSetlist(filter = "") {
    const q = filter.trim().toLowerCase();
    const matches = songs.filter((s) => !q || `${s.song} ${s.artist}`.toLowerCase().includes(q));
    if (!matches.length) {
      setlistEl.innerHTML = `<p class="setlist__empty">Not on the list? Ask us. We love a request.</p>`;
      return;
    }
    const groups = {};
    matches.forEach((s) => (groups[s.era || "Other"] ||= []).push(s));
    const order = Object.keys(groups).sort((a, b) => {
      const ia = ERA_ORDER.indexOf(a), ib = ERA_ORDER.indexOf(b);
      return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
    });
    setlistEl.innerHTML = order.map((era) => `
      <div class="setlist__group">
        <h3>${escapeHtml(era)}</h3>
        <ul>${groups[era].map((s) => `<li>${escapeHtml(s.song)} <span>· ${escapeHtml(s.artist)}</span></li>`).join("")}</ul>
      </div>`).join("");
  }

  fetch("data/setlist.json", { cache: "no-cache" })
    .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
    .then((data) => { songs = data; renderSetlist(); })
    .catch(() => { setlistEl.innerHTML = `<p class="setlist__empty">Setlist coming soon.</p>`; });
  search.addEventListener("input", () => renderSetlist(search.value));

  // ----- Videos: click-to-load YouTube (keeps the page fast) -----
  $$(".video").forEach((v) => {
    const id = v.dataset.youtube;
    if (!id) {
      v.classList.add("video--empty");
      v.textContent = "Live video coming soon";
      return;
    }
    v.style.backgroundImage = `url(https://i.ytimg.com/vi/${encodeURIComponent(id)}/hqdefault.jpg)`;
    const btn = document.createElement("button");
    btn.className = "video__play";
    btn.setAttribute("aria-label", `Play: ${v.dataset.title || "video"}`);
    btn.addEventListener("click", () => {
      v.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1" title="${escapeHtml(v.dataset.title || "Ember video")}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`;
    });
    v.appendChild(btn);
  });

  // ----- Gallery lightbox -----
  const lb = $("#lightbox");
  const lbImg = $("img", lb);
  const links = $$(".gallery a");
  let current = 0;
  const show = (i) => {
    current = (i + links.length) % links.length;
    lbImg.src = links[current].href;
    lbImg.alt = $("img", links[current]).alt;
  };
  const open = (i) => { show(i); lb.hidden = false; document.body.style.overflow = "hidden"; $(".lightbox__close", lb).focus(); };
  const close = () => { lb.hidden = true; document.body.style.overflow = ""; links[current].focus(); };
  links.forEach((a, i) => a.addEventListener("click", (e) => { e.preventDefault(); open(i); }));
  $(".lightbox__close", lb).addEventListener("click", close);
  $(".lightbox__prev", lb).addEventListener("click", () => show(current - 1));
  $(".lightbox__next", lb).addEventListener("click", () => show(current + 1));
  lb.addEventListener("click", (e) => { if (e.target === lb) close(); });
  document.addEventListener("keydown", (e) => {
    if (lb.hidden) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") show(current - 1);
    if (e.key === "ArrowRight") show(current + 1);
  });

  // ----- Booking form (Web3Forms) -----
  const form = $("#booking-form");
  const status = $(".form__status", form);
  const dateInput = form.querySelector('input[type="date"]');
  dateInput.min = new Date().toISOString().slice(0, 10);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    status.className = "form__status";

    const btn = form.querySelector("button[type=submit]");
    btn.disabled = true;
    status.textContent = "Sending…";
    try {
      const res = await fetch(form.action, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.message || res.status);
      form.reset();
      status.textContent = "Thanks! Your enquiry is in. We'll be in touch shortly.";
      status.classList.add("is-ok");
    } catch {
      status.textContent = "Sorry, something went wrong. Please try again, or message us on Facebook or Instagram.";
      status.classList.add("is-err");
    } finally {
      btn.disabled = false;
    }
  });

  $("#year").textContent = new Date().getFullYear();
})();
