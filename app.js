// app.js

const DIST = [2, 3, 5, 6, 10, 12, 17, 22, 30, 32, 62, 102, 122, 162, 182];

function povrsina(r, d) {
  const h = r - d;
  const theta = Math.acos((r - h) / r);
  return r * r * theta - (r - h) * Math.sqrt(2 * r * h - h * h);
}

function najdi(cilj) {
  const INF = 1e9;
  const DP = Array(cilj + 1).fill().map(() => [INF, null]);
  DP[0] = [0, {}];
  for (let i = 1; i <= cilj; i++) {
    for (let d of DIST) {
      if (i - d >= 0 && DP[i - d][1] !== null) {
        const [cnt, comb] = DP[i - d];
        if (cnt + 1 < DP[i][0]) {
          const nc = { ...comb };
          nc[d] = (nc[d] || 0) + 1;
          DP[i] = [cnt + 1, nc];
        }
      }
    }
  }
  return DP[cilj][1];
}

document.getElementById('gaterForm').onsubmit = e => {
  e.preventDefault();
  const m   = +document.getElementById('mala').value / 10;
  const km  = +document.getElementById('km').value;
  const M   = +document.getElementById('velika').value / 10;
  const KM  = +document.getElementById('KM').value;
  const pr  = +document.getElementById('premer').value;
  const r   = pr / 2;

  // krajvnek
  const zsir = m * km * 2 + M * KM + (km * 2 + KM + 1) * 0.5;
  const d    = zsir / 2;
  const Aedge= povrsina(r, d) * 2;
  const Atot = Math.PI * r * r;
  const pct  = Aedge / Atot * 100;
  const deb  = r - d;

  // stihi in distančniki
  const os   = m * 10 * km * 2 + M * 10 * KM + (km * 2 + KM + 1) * 2 + 18;
  const raz  = 550 - os;
  const rob  = raz / 2;
  const cilj = Math.round(rob);
  const komb = najdi(cilj);

  let txt = `
Odstotek krajvnka: ${pct.toFixed(2)} %
Debelina krajvnka: ${deb.toFixed(2)} cm
Žagalna širina: ${zsir.toFixed(2)} cm

Stihi (robovi):
  Osnova = ${os.toFixed(2)} mm
  Preostanek = ${raz.toFixed(2)} mm
  Rob na eni strani = ${rob.toFixed(2)} mm
`;
  if (!komb) {
    txt += `\nNe morem zapolniti ${cilj} mm.`;
  } else {
    const deli = Object.entries(komb)
      .sort((a,b)=>+a[0]-+b[0])
      .map(([w,c])=>`${c}×${w}mm`)
      .join(' + ');
    txt += `\nDistančniki: ${deli} = ${cilj} mm`;
  }

  document.getElementById('rezultat').textContent = txt;
  narisi(deski(m, km, M, KM), r);
};

function deski(m, km, M, KM) {
  const rez = 0.5, arr = [];
  for (let i = 0; i < km; i++) { arr.push(['str', m]); arr.push(['rez', rez]); }
  for (let i = 0; i < KM; i++) { arr.push(['mid', M]); arr.push(['rez', rez]); }
  for (let i = 0; i < km; i++) { arr.push(['str', m]); arr.push(['rez', rez]); }
  arr.pop();
  return arr;
}

function narisi(deske, r) {
  const cv = document.getElementById('graf');
  const ctx= cv.getContext('2d');
  ctx.clearRect(0,0,cv.width,cv.height);

  ctx.save();
  ctx.translate(cv.width/2, cv.height/2);
  const scale = cv.width / (2 * r + 10);
  ctx.scale(scale, -scale);

  // centriramo po skupni širini
  const skupna = deske.reduce((s, [_, w]) => s + w, 0);
  let x = -skupna / 2;

  // krog
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, 2 * Math.PI);
  ctx.stroke();

  // deske
  for (let [tip, w] of deske) {
    if (tip === 'rez') { x += w; continue; }
    const pts = [];
    for (let i = 0; i <= 20; i++) {
      const xi = x + i * (w / 20);
      if (Math.abs(xi) <= r) {
        const yi = Math.sqrt(r * r - xi * xi);
        pts.push([xi, yi]);
      }
    }
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let [xi, yi] of pts) ctx.lineTo(xi, yi);
    for (let i = pts.length - 1; i >= 0; i--) ctx.lineTo(pts[i][0], -pts[i][1]);
    ctx.closePath();
    ctx.fillStyle   = tip === 'str' ? 'lightblue' : 'lightgreen';
    ctx.strokeStyle = tip === 'str' ? 'blue'      : 'green';
    ctx.fill();
    ctx.stroke();
    x += w;
  }

  ctx.restore();
}
