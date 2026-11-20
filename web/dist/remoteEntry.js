let m, T, C;
let __tla = (async () => {
  const u = {}, b = /* @__PURE__ */ new Set([
    "Module",
    "__esModule",
    "default",
    "_export_sfc"
  ]);
  let p = {
    "./config": () => (m([], false, "./config"), y("./__federation_expose_Config-Bq-xLKTG.js").then((e) => Object.keys(e).every((r) => b.has(r)) ? () => e.default : () => e))
  };
  let E;
  E = {};
  m = (e, r, l) => {
    const s = import.meta.url;
    if (typeof s > "u") {
      console.warn('The remote style takes effect only when the build.target option in the vite.config.ts file is higher than that of "es2020".');
      return;
    }
    const i = s.substring(0, s.lastIndexOf("remoteEntry.js")), _ = "/";
    "", e.forEach((a) => {
      let n = "";
      const c = _ || i;
      if (c) {
        const o = {
          trailing: (t) => t.endsWith("/") ? t.slice(0, -1) : t,
          leading: (t) => t.startsWith("/") ? t.slice(1) : t
        }, w = (t) => t.startsWith("http") || t.startsWith("//"), d = o.trailing(c), h = o.leading(a), g = o.trailing(i);
        w(c) ? n = [
          d,
          h
        ].filter(Boolean).join("/") : g.includes(d) ? n = [
          g,
          h
        ].filter(Boolean).join("/") : n = [
          g + d,
          h
        ].filter(Boolean).join("/");
      } else n = a;
      if (r) {
        const o = "css__forge-npwd-garage__" + l;
        window[o] = window[o] || [], window[o].push(n);
        return;
      }
      if (n in E) return;
      E[n] = true;
      const f = document.createElement("link");
      f.rel = "stylesheet", f.href = n, document.head.appendChild(f);
    });
  };
  async function y(e) {
    return u[e] ?? (u[e] = import(e).then(async (m2) => {
      await m2.__tla;
      return m2;
    })), u[e];
  }
  T = (e) => {
    if (!p[e]) throw new Error("Can not find remote module " + e);
    return p[e]();
  };
  C = (e) => {
    globalThis.__federation_shared__ = globalThis.__federation_shared__ || {}, Object.entries(e).forEach(([r, l]) => {
      for (const [s, i] of Object.entries(l)) {
        const _ = i.scope || "default";
        globalThis.__federation_shared__[_] = globalThis.__federation_shared__[_] || {};
        const a = globalThis.__federation_shared__[_];
        (a[r] = a[r] || {})[s] = i;
      }
    });
  };
})();
export {
  __tla,
  m as dynamicLoadingCss,
  T as get,
  C as init
};
