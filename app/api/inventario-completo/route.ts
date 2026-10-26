export async function GET() {
  const BASE = 'https://mbr.demachine.co';
  const TOKEN = process.env.DEMACHINE_TOKEN || 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjIyNywiZXhwIjoxNzkyNjkyMzk4fQ.Aut8OGm_jdZN_EDHVJn2nEy1hNx6rJRcMmrSqn2RTIs';

  let all: any[] = [];
  for (let p = 1; p <= 5; p++) {
    const url = `${BASE}/api/product/index?Page=${p}&maxPerPage=100&search=`;
    try {
      const r = await fetch(url, { headers: { 'Authorization': `Bearer ${TOKEN}`, 'Accept': 'application/json' } });
      const d = await r.json();
      const results = d?.data?.results || d?.results || d?.data || [];
      if (results.length === 0) break;
      const mapped = results.map((x:any)=>({nombre:x.product||x.name,codigo:x.code,marca:x.brand,tipo:x.product_type,color:x.color,talla:x.size,precio:x.price,stock:x.quantity,imagen:x.image_pre?BASE+x.image_pre:(x.image?BASE+x.image:'')}));
      all = all.concat(mapped);
    } catch (e) { break; }
  }
  return Response.json({ products: all, total: all.length, ok: true });
}
