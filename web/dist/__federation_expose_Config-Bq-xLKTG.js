import { j as e, G as i, A as s, __tla as __tla_0 } from "./GarageWidget-Dp6uAI07.js";
let c, t;
let __tla = Promise.all([
  (() => {
    try {
      return __tla_0;
    } catch {
    }
  })()
]).then(async () => {
  let a, l, n;
  a = ({ size: o = 40 }) => e.jsxs("svg", {
    width: o,
    height: o,
    viewBox: "0 0 48 48",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    children: [
      e.jsx("path", {
        d: "M7 21.5 24 8l17 13.5V40a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V21.5Z",
        fill: "#171717",
        stroke: "#ff6b00",
        strokeWidth: "3"
      }),
      e.jsx("path", {
        d: "M13 24h22v18H13V24Z",
        fill: "#232323",
        stroke: "#ff6b00",
        strokeWidth: "2"
      }),
      e.jsx("path", {
        d: "M16 35.5h16l-1.7-6.1a2 2 0 0 0-1.9-1.4h-8.8a2 2 0 0 0-1.9 1.4L16 35.5Z",
        fill: "#ff6b00"
      }),
      e.jsx("circle", {
        cx: "19",
        cy: "36",
        r: "2",
        fill: "white"
      }),
      e.jsx("circle", {
        cx: "29",
        cy: "36",
        r: "2",
        fill: "white"
      })
    ]
  });
  l = () => e.jsx(a, {});
  n = () => e.jsx(a, {
    size: 32
  });
  t = "/forge-npwd-garage";
  c = () => ({
    id: "forge-npwd-garage",
    nameLocale: "Forge Garage",
    color: "#ffffff",
    backgroundColor: "#171717",
    path: t,
    icon: l,
    app: s,
    notificationIcon: n,
    homeWidgets: [
      {
        id: "fleet",
        name: "Minha garagem",
        description: "Frota, localiza\xE7\xE3o, apreens\xF5es e multas pendentes.",
        sizes: [
          {
            width: 2,
            height: 1,
            label: "Compacto 2\xD71"
          },
          {
            width: 4,
            height: 1,
            label: "Resumo 4\xD71"
          },
          {
            width: 4,
            height: 2,
            label: "Completo 4\xD72"
          }
        ],
        Component: i,
        path: t
      }
    ]
  });
});
export {
  __tla,
  c as default,
  t as path
};
