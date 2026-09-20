const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// 1. Servir el archivo principal de nuestra Actividad
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// 2. El Proxy Mágico: Descarga Albion Online 2D y le borra la seguridad
app.use(
    "/albion-proxy",
    createProxyMiddleware({
        target: "https://albiononline2d.com",
        changeOrigin: true,
        pathRewrite: {
            "^/albion-proxy": "", // Mapea la raíz
        },
        onProxyRes: function (proxyRes, req, res) {
            // Borramos las cabeceras que le dicen a Discord "bloquea este iframe"
            delete proxyRes.headers["x-frame-options"];
            delete proxyRes.headers["content-security-policy"];
        },
    }),
);

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor puente corriendo en el puerto ${PORT}`);
});