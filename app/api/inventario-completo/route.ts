export const dynamic = 'force-dynamic';
export async function GET() {
  return Response.json({
    ok: true,
    modo: "frontend-fetch",
    credenciales: {
      LINK: process.env.MBR_LINK,
      INSTANCIA: process.env.MBR_INSTANCIA,
      USER: process.env.MBR_USER,
      // PASS no se expone por seguridad, solo se usa en proxy interno
    },
    instruccion: "El fetch debe hacerse desde el navegador, no desde Vercel. Demachine bloquea IPs de servidor.",
    total_esperado: 160
  });
}
