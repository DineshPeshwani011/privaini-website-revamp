// Samples land points for the coverage globe from Natural Earth 1:110m land (world-atlas, TopoJSON).
// usage: node scripts/build-globe.mjs <path/to/land-110m.json>  → src/data/globe-land.json
import fs from 'node:fs';
import path from 'node:path';

const src = process.argv[2];
if (!src) throw new Error('usage: node scripts/build-globe.mjs <land-110m.json>');
const topo = JSON.parse(fs.readFileSync(src, 'utf8'));
const [sx, sy] = topo.transform.scale;
const [tx, ty] = topo.transform.translate;

const arcs = topo.arcs.map((arc) => {
  let x = 0, y = 0;
  return arc.map(([dx, dy]) => { x += dx; y += dy; return [x * sx + tx, y * sy + ty]; });
});
const ring = (indexes) => indexes.flatMap((i, k) => {
  const pts = i < 0 ? arcs[~i].slice().reverse() : arcs[i];
  return k === 0 ? pts : pts.slice(1);
});

const polygons = [];
for (const geom of topo.objects.land.geometries) {
  const list = geom.type === 'Polygon' ? [geom.arcs] : geom.arcs;
  for (const poly of list) polygons.push(poly.map(ring));
}

const inRing = (lon, lat, pts) => {
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i], [xj, yj] = pts[j];
    if ((yi > lat) !== (yj > lat) && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
};
const onLand = (lon, lat) => polygons.some((rings) => inRing(lon, lat, rings[0]) && !rings.slice(1).some((h) => inRing(lon, lat, h)));

const N = 16000;
const golden = Math.PI * (3 - Math.sqrt(5));
const out = [];
for (let i = 0; i < N; i++) {
  const y = 1 - (i / (N - 1)) * 2;
  const lat = (Math.asin(y) * 180) / Math.PI;
  if (lat < -58) continue;
  const lon = ((((i * golden) * 180) / Math.PI) % 360 + 540) % 360 - 180;
  if (onLand(lon, lat)) out.push([+lat.toFixed(2), +lon.toFixed(2)]);
}

const dest = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/, '$1')), '..', 'src', 'data', 'globe-land.json');
fs.writeFileSync(dest, JSON.stringify(out));
console.log('land points', out.length, '→', dest);
