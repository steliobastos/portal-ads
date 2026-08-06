import { ImageResponse } from "next/og";

/**
 * Imagem de prévia do link (WhatsApp, Classroom, Telegram).
 *
 * Gerada no build, não é um PNG versionado: mudar a paleta ou o texto é mexer
 * neste arquivo. Usa a fonte padrão do `next/og` de propósito — carregar Space
 * Grotesk aqui exigiria buscar o arquivo da fonte pela rede durante o build.
 */
export const alt = "Portal de Disciplinas — IFCE Campus Horizonte";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function ImagemDeCompartilhamento() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#fbfaf5",
          padding: "72px 80px",
          borderTop: "18px solid #1b878f",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 16,
              background: "#1b878f",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fbfaf5",
              fontSize: 40,
              fontWeight: 700,
            }}
          >
            {">_"}
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 24, color: "#5b6058", letterSpacing: 2 }}>
              INSTITUTO FEDERAL DO CEARÁ
            </span>
            <span style={{ fontSize: 24, color: "#5b6058" }}>Campus Horizonte</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <span style={{ fontSize: 68, fontWeight: 700, color: "#20241f", lineHeight: 1.1 }}>
            Portal de Disciplinas
          </span>
          <span style={{ fontSize: 34, color: "#5b6058", lineHeight: 1.3 }}>
            Tecnologia em Análise e Desenvolvimento de Sistemas
          </span>
        </div>

        <div style={{ display: "flex", gap: 14 }}>
          {["Sistemas Operacionais", "Linux", "Docker"].map((etiqueta) => (
            <span
              key={etiqueta}
              style={{
                fontSize: 26,
                color: "#1b878f",
                border: "2px solid #8fc7ca",
                borderRadius: 10,
                padding: "10px 22px",
              }}
            >
              {etiqueta}
            </span>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
