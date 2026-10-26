export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const LINK = (process.env.MBR_LINK || "https://estock-mobile.demachine.co/").replace(/\/$/, "");
    const INSTANCIA = process.env.MBR_INSTANCIA || "MBR";
    const USER = process.env.MBR_USER || "CARLSO ROJAS";
    const PASS = process.env.MBR_PASS || "CARLSO2026";

    const headers = {
      "Content-Type": "application/json",
      "User-Agent": "Mozilla/5.0",
      "Accept": "application/json",
      "Origin": LINK,
      "Referer": `${LINK}/`
    };

    // PROBAMOS TODAS LAS RUTAS REALES DE DEMACHINE
    const intentosLogin = [
      { url: `${LINK}/api/login`, body: { username: USER, password: PASS, instancia: INSTANCIA } },
      { url: `${LINK}/api/auth/login`, body: { username: USER, password: PASS, instancia: INSTANCIA } },
      { url: `${LINK}/api/v1/auth/login`, body: { user: USER, pass: PASS, instance: INSTANCIA } },
      { url: `${LINK}/login`, body: { usuario: USER, clave: PASS, instancia: INSTANCIA } },
    ];

    let token: string | null = null;
    let ultimoError: any = null;

    for (const intento of intentosLogin) {
      try {
        const res = await fetch(intento.url, {
          method: "POST",
          headers,
          body: JSON.stringify(intento.body),
          cache: "no-store",
          // @ts-ignore
          next: { revalidate: 0 }
        });
        const txt = await res.text();
        let json: any = null;
        try { json = JSON.parse(txt); } catch { json = { raw: txt.slice(0, 500) }; }
        
        const posibleToken = json?.token || json?.access_token || json?.data?.token || json?.result?.token;
        if (posibleToken) {
          token = posibleToken;
          break;
        }
        ultimoError = { url: intento.url, status: res.status, json };
      } catch (e: any) {
        ultimoError = { url: intento.url, error: e.message };
      }
    }

    if (!token) {
      return Response.json({ 
        ok: false, 
        error: "Login MBR no responde desde Vercel - el servidor bloquea",
        detalle: ultimoError,
        solucion: "Hay que habilitar CORS o usar proxy",
        credenciales_usadas: { LINK, INSTANCIA, USER }
      }, { status: 200 });
    }

    // Si logramos token, traemos stock
    const stockRes = await fetch(`${LINK}/api/stock`, { headers: { ...headers, Authorization: `Bearer ${token}` }, cache: "no-store" });
    const stock = await stockRes.json().catch(async () => await stockRes.text());

    return Response.json({ ok: true, total: Array.isArray(stock) ? stock.length : (stock?.data?.length || 0), products: stock, token_ok: true });

  } catch (e: any) {
    return Response.json({ ok: false, error: "fetch failed", detalle: e.message, stack: e.stack?.slice(0,500) }, { status: 200 });
  }
}
