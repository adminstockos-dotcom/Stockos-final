"use client";
import { useState, useEffect } from "react";

export default function Page() {
  const [estado, setEstado] = useState("Conectando a MBR...");
  const [total, setTotal] = useState<number | null>(null);
  const [productos, setProductos] = useState<any[]>([]);
  const [detalle, setDetalle] = useState<any>(null);

  useEffect(() => {
    async function conectar() {
      try {
        setEstado("1/3 Haciendo login en estock-mobile.demachine.co...");
        
        const LINK = "https://estock-mobile.demachine.co";
        const payloads = [
          { url: `${LINK}/api/login`, body: { instancia: "MBR", usuario: "CARLSO ROJAS", password: "CARLSO2026" } },
          { url: `${LINK}/api/login`, body: { username: "CARLSO ROJAS", password: "CARLSO2026", instancia: "MBR" } },
          { url: `${LINK}/api/auth/login`, body: { instancia: "MBR", usuario: "CARLSO ROJAS", password: "CARLSO2026" } },
        ];

        let token = null;
        let loginData = null;

        for (const p of payloads) {
          try {
            const r = await fetch(p.url, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(p.body),
            });
            const j = await r.json().catch(() => ({}));
            const t = j.token || j.access_token || j.data?.token || j.result?.token;
            if (t) { token = t; loginData = j; break; }
            setDetalle({ intento: p.url, respuesta: j });
          } catch {}
        }

        if (!token) {
          setEstado("❌ Login MBR falló. Revisa que estés en estock-mobile.demachine.co y que CARLSO ROJAS siga activo.");
          return;
        }

        setEstado("2/3 Login OK. Guardando token y trayendo inventario...");

        // Guardamos token en tu backend para que quede automatizado
        try {
          await fetch("/api/save-token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token, instancia: "MBR", usuario: "CARLSO ROJAS" })
          });
        } catch {}

        // Ahora traemos el stock
        const endpointsStock = [
          `${LINK}/api/stock`,
          `${LINK}/api/productos`,
          `${LINK}/api/inventario`,
          `${LINK}/api/articulos`,
        ];

        let lista: any[] = [];
        for (const url of endpointsStock) {
          try {
            const r = await fetch(url, {
              headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" }
            });
            const j = await r.json().catch(() => []);
            const arr = Array.isArray(j) ? j : (j.data || j.productos || j.result || []);
            if (Array.isArray(arr) && arr.length > 0) { lista = arr; break; }
          } catch {}
        }

        setProductos(lista);
        setTotal(lista.length);
        setEstado(lista.length > 0 ? `✅ CONECTADO - MBR - CARLSO ROJAS - Total: ${lista.length}` : "Login OK pero no devuelve productos. Verifica endpoint de stock.");
        setDetalle(loginData);

      } catch (e: any) {
        setEstado(`❌ Error: ${e.message}`);
      }
    }
    conectar();
  }, []);

  return (
    <div style={{ padding: 20, fontFamily: "system-ui", background: "#0a0a0a", color: "white", minHeight: "100vh" }}>
      <h1 style={{ fontSize: 22, fontWeight: 800 }}>STOCKOS FINAL - ACTIVO</h1>
      <p>MBR - CARLSO ROJAS - Total automático</p>
      <div style={{ background: "#1a1a1a", padding: 16, borderRadius: 12, marginTop: 16 }}>
        <b>Estado:</b> {estado}
        {total !== null && <div style={{ fontSize: 48, fontWeight: 900, marginTop: 10 }}>{total} productos</div>}
      </div>
      {productos.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <h3>Primeros 5 productos:</h3>
          <pre style={{ background: "#111", padding: 12, borderRadius: 8, overflow: "auto" }}>
            {JSON.stringify(productos.slice(0, 5), null, 2)}
          </pre>
        </div>
      )}
      <details style={{ marginTop: 20 }}><summary>Detalle técnico</summary><pre style={{ fontSize: 11 }}>{JSON.stringify(detalle, null, 2)}</pre></details>
    </div>
  );
}
