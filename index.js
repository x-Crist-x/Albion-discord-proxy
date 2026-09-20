const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Servir la actividad principal
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// Proxy avanzado para Albion Online 2D
app.use(
    "/albion-proxy",
    createProxyMiddleware({
        target: "https://albiononline2d.com",
        changeOrigin: true,
        autoRewrite: true, // Reescribe las redirecciones internas automáticamente
        followRedirects: true, // Sigue las redirecciones del servidor original
        pathRewrite: {
            "^/albion-proxy": "",
        },
        onProxyReq: function (proxyReq, req, res) {
            // Hacemos que el servidor de Albion piense que somos un navegador común
            proxyReq.setHeader("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
        },
        onProxyRes: function (proxyRes, req, res) {
            // Limpieza absoluta de cabeceras de seguridad
            delete proxyRes.headers["x-frame-options"];
            delete proxyRes.headers["content-security-policy"];
            delete proxyRes.headers["x-content-security-policy"];
            delete proxyRes.headers["x-webkit-csp"];
            
            // Forzamos a que las cookies ignoren las restricciones del iframe
            if (proxyRes.headers["set-cookie"]) {
                proxyRes.headers["set-cookie"] = proxyRes.headers["set-cookie"].map(cookie => 
                    cookie.replace(/SameSite=Lax|SameSite=Strict/gi, "SameSite=None").replace(/\$/i, "; Secure")
                );
            }
        }
    })
);

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor puente corriendo en el puerto ${PORT}`);
});
