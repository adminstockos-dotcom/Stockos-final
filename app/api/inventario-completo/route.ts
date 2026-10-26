export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const LINK = process.env.MBR_LINK!;
    const INSTANCIA = process.env.MBR_INSTANCIA!;
    const USER = process.env.MBR_USER!;
    const PASS = process.env.MBR_PASS!;

    // 1. Login automático a Demachine Mobile
    const loginRes = await fetch(`${LINK}api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        instancia: INSTANCIA,
        usuario: USER,
        password: PASS,
        estado: INSTANCIA,
        link: LINK
      }),
      cache: "no-store"
    });

    const loginJson = await loginRes.json().catch(() => null);
    
    // El token puede venir en diferentes campos
    const token = loginJson?.token || loginJson?.access_token || loginJson?.data?.token;

    if (!token) {
      return Response.json({ ok: false, error: "Login MBR falló", detalle: loginJson, credenciales: { LINK, INSTANCIA, USER } }, { status: 401 });
    }

    // 2. Traer inventario
    const stockRes = await fetch(`${LINK}api/stock`, {
      method: "GET",
      headers: { 
        "Authorization": `Bearer ${token}`,
        "X-Instancia": INSTANCIA,
        "Content-Type": "application/json"
      },
      cache: "no-store"
    });

    const stockJson = await stockRes.json().catch(() => null);
    const products = Array.isArray(stockJson) ? stockJson : (stockJson?.data || stockJson?.products || stockJson?.items || []);

    return Response.json({
      ok: true,
      total: products.length,
      login_ok: true,
      instancia: INSTANCIA,
      products
    });

  } catch (e: any) {
    return Response.json({ ok: false, error: e.message }, { status: 500 });
  }
}
