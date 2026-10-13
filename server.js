const PORT = process.env.PORT || 3000;
const PUBLIC = './public';

Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);
    let pathname = url.pathname;
    if (pathname === '/') pathname = '/index.html';

    const file = Bun.file(`${PUBLIC}${pathname}`);
    if (!(await file.exists())) {
      return new Response(Bun.file(`${PUBLIC}/index.html`), {
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
    }
    return new Response(file);
  }
});

console.log(`ⵜⵉⴼⵉⵏⴰⵖⵉⵏⵓ → http://localhost:${PORT}`);
