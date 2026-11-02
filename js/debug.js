// Temporary layout diagnostics, loaded only with ?debug in the URL. Remove once the iPhone overflow is fixed.
(() => {
  const box = document.createElement("div");
  box.style.cssText = "position:fixed;left:8px;right:8px;bottom:8px;z-index:9999;max-height:45vh;overflow:auto;" +
    "background:#fff;color:#000;font:12px/1.4 monospace;padding:10px;border:2px solid red;border-radius:8px;white-space:pre-wrap;word-break:break-all";
  const btn = document.createElement("button");
  btn.textContent = "Measure again";
  btn.style.cssText = "display:block;margin-top:8px;font:inherit;padding:6px 10px";
  const out = document.createElement("div");
  box.append(out, btn);

  function measure() {
    document.querySelectorAll("[data-debug-wide]").forEach((e) => { e.style.outline = ""; e.removeAttribute("data-debug-wide"); });
    const html = document.documentElement;
    const vw = html.clientWidth;
    const cssVersion = getComputedStyle(html).overflowX;
    const saved = [html.style.overflowX, document.body.style.overflowX];
    html.style.overflowX = "visible"; document.body.style.overflowX = "visible";
    const rawWidth = html.scrollWidth;
    const wide = [...document.querySelectorAll("body *")]
      .filter((e) => !box.contains(e) && !e.matches(".skip-link, .spark"))
      .map((e) => [e, e.getBoundingClientRect()])
      .filter(([, r]) => r.width > 0 && (r.right > vw + 0.01 || r.left < -0.01));
    html.style.overflowX = saved[0]; document.body.style.overflowX = saved[1];
    wide.forEach(([e]) => { e.style.outline = "2px solid red"; e.setAttribute("data-debug-wide", ""); });
    out.textContent = [
      `screen ${screen.width} | innerWidth ${innerWidth} | clientWidth ${vw} | zoom ${visualViewport ? visualViewport.scale.toFixed(3) : "?"}`,
      `page width (unclipped) ${rawWidth} | scrollX ${scrollX} | root overflow-x ${cssVersion} (clip = latest CSS)`,
      `elements past the edge: ${wide.length}`,
      ...wide.slice(0, 15).map(([e, r]) =>
        `- ${e.tagName.toLowerCase()}${e.id ? "#" + e.id : ""}${typeof e.className === "string" && e.className ? "." + e.className.trim().split(/\s+/).join(".") : ""} left ${r.left.toFixed(1)} right ${r.right.toFixed(1)}`),
      navigator.userAgent,
    ].join("\n");
  }

  btn.addEventListener("click", measure);
  document.body.appendChild(box);
  measure();
  document.fonts.ready.then(measure);
  addEventListener("load", () => setTimeout(measure, 500));
})();
