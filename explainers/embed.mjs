// Shared glue for anatomy figures embedded in the Privaini site as iframes.
// Every explainer build passes its pageHtml() output through privainiPage().

export const PRIVAINI_CSS = `
@font-face{font-family:"Urbanist";font-style:normal;font-weight:100 900;font-display:swap;src:url("/fonts/urbanist-latin-wght-normal.woff2") format("woff2-variations")}
@font-face{font-family:"JetBrains Mono";font-style:normal;font-weight:100 800;font-display:swap;src:url("/fonts/jetbrains-mono-latin-wght-normal.woff2") format("woff2-variations")}
.iso{
  --anatomy-page:#061923;--anatomy-card:#09202a;--anatomy-text:#94b0b6;--anatomy-strong:#eaf6f8;--anatomy-muted:#628087;
  --anatomy-paper:#0a222c;--anatomy-face:#0f2f3a;--anatomy-top:#12353f;
  --anatomy-shade-0:#06171f;--anatomy-shade-1:#081d26;--anatomy-shade-2:#0b242e;--anatomy-shade-3:#0e2a35;
  --anatomy-lit-top:#145561;--anatomy-lit-shade:#0e3f48;
  --anatomy-hi:#cfe7ea;--anatomy-mid:#5f8890;--anatomy-lo:#36565d;--anatomy-faint:#1d3a42;--anatomy-lit:#5ee6f5;
  --anatomy-halo:#000;--anatomy-halo-opacity:.9;--anatomy-dot:#d6eef1;
  --anatomy-red:#ff6b5a;--anatomy-green:#4fd1a5;--anatomy-blue:#5ea8f5;
  --anatomy-mono:"JetBrains Mono",ui-monospace,Consolas,monospace;
}
.iso[data-theme="light"]{
  --anatomy-page:#ffffff;--anatomy-card:#f7fbfc;--anatomy-text:#426e78;--anatomy-strong:#0a3d47;--anatomy-muted:#6d8f97;
  --anatomy-paper:#fbfdfd;--anatomy-face:#ffffff;--anatomy-top:#ffffff;
  --anatomy-shade-0:#d6e5e8;--anatomy-shade-1:#e1edef;--anatomy-shade-2:#eaf3f5;--anatomy-shade-3:#f3f9fa;
  --anatomy-lit-top:#e6f8fb;--anatomy-lit-shade:#cdeef3;
  --anatomy-hi:#0a3d47;--anatomy-mid:#6a9098;--anatomy-lo:#a6c1c7;--anatomy-faint:#cfe0e3;--anatomy-lit:#0896ab;
  --anatomy-halo:#5f878f;--anatomy-halo-opacity:.28;--anatomy-dot:#0a3d47;
  --anatomy-red:#c9402e;--anatomy-green:#0f8059;--anatomy-blue:#2f6fc4;
}
html,body{background:var(--anatomy-page)}
body{font-family:"Urbanist",ui-sans-serif,system-ui,sans-serif}
.iso-page{width:100%;max-width:none;margin:0;padding:2px}
.iso-page>.iso-figure:first-child,.iso-page>figure:first-child{margin-top:0}
`;

// Runs inside the iframe: reports content height and forwards wheel input so the
// parent page's Lenis smooth scroll keeps working while the pointer is over the figure.
export function embedScript(id) {
  return `
(() => {
  if (window.parent === window) return;
  const id = ${JSON.stringify(id)};
  const page = () => document.querySelector(".iso-page") || document.body;
  const post = () => window.parent.postMessage({ type: "privaini-explainer", id, height: Math.ceil(page().getBoundingClientRect().height) }, "*");
  new ResizeObserver(post).observe(page());
  addEventListener("load", post);
  post();
  addEventListener("wheel", (e) => {
    e.preventDefault();
    window.parent.postMessage({ type: "privaini-explainer-wheel", id, dx: e.deltaX, dy: e.deltaY, mode: e.deltaMode }, "*");
  }, { passive: false });
})();
`;
}

// The kit inlines its own source (which contains "</body>" text) in a module script, so the glue
// goes before the LAST </body>; the palette goes into the first (head) </style>.
export function privainiPage(html, id) {
  const styled = html.replace("</style>", `${PRIVAINI_CSS}</style>`);
  const at = styled.lastIndexOf("</body>");
  return `${styled.slice(0, at)}<script>${embedScript(id)}</script>${styled.slice(at)}`;
}
