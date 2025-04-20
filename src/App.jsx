// App.jsx
import React, { useRef, useState, useCallback } from "react";
import "./App.css";
import logo from "/logo.png";

function App() {
  const canvasElementoReferencia = useRef(null);
  const svgReferencia = useRef(null);

  const [alturaObjeto, setAlturaObjeto] = useState(10);
  const [larguraExtrusora, setLarguraExtrusora] = useState(1.2);
  const [quantidadePerimetros, setQuantidadePerimetros] = useState(2);
  const [espessuraBase, setEspessuraBase] = useState(0);
  const [diametroFilamento, setDiametroFilamento] = useState(1.75);
  const [densidadeFilamento, setDensidadeFilamento] = useState(1.27);
  const [precoPorQuilo, setPrecoPorQuilo] = useState(90);

  const [areaCalculada, setAreaCalculada] = useState(0);
  const [perimetroCalculado, setPerimetroCalculado] = useState(0);
  const [contadorEstimativa, setContadorEstimativa] = useState(1);
  const [mensagemResultado, setMensagemResultado] = useState("");

  const alturaCamada = 0.55;

  const processarSvg = useCallback(() => {
    const elementoSvg = document.querySelector("#canvas-container svg");
    if (!elementoSvg) return;
    svgReferencia.current = elementoSvg;

    const larguraOriginal = parseFloat(elementoSvg.getAttribute("width")) || 0;
    const viewBox = elementoSvg.getAttribute("viewBox").split(" ").map(Number);
    const fatorEscala =
      larguraOriginal && viewBox[2] ? larguraOriginal / viewBox[2] : 1;
    elementoSvg.removeAttribute("width");
    elementoSvg.removeAttribute("height");

    const caixa = elementoSvg.getBBox();
    const areaTotalBruta =
      caixa.width * caixa.height * fatorEscala * fatorEscala;

    const canvas = canvasElementoReferencia.current;
    const contexto = canvas.getContext("2d");
    const resolucao = 2000;
    canvas.width = resolucao;
    canvas.height = Math.round((resolucao * caixa.height) / caixa.width);
    contexto.clearRect(0, 0, resolucao, canvas.height);

    const svgClonado = elementoSvg.cloneNode(true);
    svgClonado.removeAttribute("style");
    svgClonado.querySelectorAll("defs, style").forEach((e) => e.remove());
    svgClonado.setAttribute("viewBox", elementoSvg.getAttribute("viewBox"));
    svgClonado.setAttribute("width", resolucao);
    svgClonado.setAttribute("height", canvas.height);
    svgClonado.setAttribute("fill-rule", "evenodd");
    svgClonado.querySelectorAll("path, polygon").forEach((elemento) => {
      elemento.removeAttribute("class");
      elemento.setAttribute("fill", "#000");
      elemento.removeAttribute("stroke");
    });

    const blob = new Blob([new XMLSerializer().serializeToString(svgClonado)], {
      type: "image/svg+xml",
    });
    const imagem = new Image();
    imagem.onload = () => {
      contexto.drawImage(imagem, 0, 0, resolucao, canvas.height);
      URL.revokeObjectURL(imagem.src);
      const dados = contexto.getImageData(0, 0, resolucao, canvas.height).data;
      let contadorPixels = 0;
      for (let i = 3; i < dados.length; i += 4)
        if (dados[i] > 0) contadorPixels++;
      const areaReal =
        areaTotalBruta * (contadorPixels / (resolucao * canvas.height));
      setAreaCalculada(areaReal);
    };
    imagem.src = URL.createObjectURL(blob);

    let perimetro = 0;
    elementoSvg
      .querySelectorAll("path")
      .forEach((p) => (perimetro += p.getTotalLength() * fatorEscala));
    elementoSvg.querySelectorAll("polygon").forEach((poligono) => {
      const pontos = poligono
        .getAttribute("points")
        .trim()
        .split(/\s+/)
        .map((pt) => pt.split(",").map(Number));
      let soma = 0;
      pontos.forEach((ponto, i) => {
        const [x1, y1] = ponto;
        const [x2, y2] = pontos[(i + 1) % pontos.length];
        soma += Math.hypot(x2 - x1, y2 - y1);
      });
      perimetro += soma * fatorEscala;
    });
    setPerimetroCalculado(perimetro);
  }, []);

  const calcularGastoFilamento = () => {
    if (!svgReferencia.current || areaCalculada <= 0)
      return alert("Envie e processe o SVG primeiro.");
    const quantidadeCamadas = Math.ceil(espessuraBase / alturaCamada);
    const volumeBase = areaCalculada * quantidadeCamadas * alturaCamada;
    const volumePerimetros =
      perimetroCalculado *
      larguraExtrusora *
      alturaObjeto *
      quantidadePerimetros;
    const volumeTotal = volumeBase + volumePerimetros;
    const areaSecaoFilamento = Math.PI * (diametroFilamento / 2) ** 2;
    const comprimentoFilamento = volumeTotal / areaSecaoFilamento / 1000;
    const pesoFinal = (volumeTotal / 1000) * densidadeFilamento;
    const custoTotal = (pesoFinal / 1000) * precoPorQuilo;
    setContadorEstimativa((anterior) => anterior + 1);
    setMensagemResultado(
      `Estimativa ${contadorEstimativa}\n\nComprimento: ${comprimentoFilamento.toFixed(
        2
      )} m\nPeso: ${pesoFinal.toFixed(2)} g\nCusto: R$ ${custoTotal.toFixed(2)}`
    );
  };

  const lidarComUploadArquivo = (e) => {
    const arquivo = e.target.files[0];
    if (!arquivo) return;
    const leitor = new FileReader();
    leitor.onload = (evento) => {
      document.getElementById("canvas-container").innerHTML =
        evento.target.result;
      setTimeout(processarSvg, 100);
    };
    leitor.readAsText(arquivo);
  };

  return (
    <div className="container">
      <div className="header">
        <div className="logomenu">
          <img src={logo} alt="Letrajato Logo" className="logo" />
          <span className="title">Orçamento</span>
        </div>
      </div>

      <div className="formimage">
        <div className="form">
          <div className="form2">
            <label>Arquivo SVG</label>
            <input type="file" onChange={lidarComUploadArquivo} />

            <fieldset>
              <legend>Altura da peça (Z, mm)</legend>
              {[10, 20, 30, 40, 50, 60].map((valor) => (
                <label key={valor}>
                  <input
                    type="radio"
                    name="alturaObjeto"
                    value={valor}
                    checked={alturaObjeto === valor}
                    onChange={() => setAlturaObjeto(valor)}
                  />
                  <span>{valor}</span>
                </label>
              ))}
            </fieldset>

            <label>
              Largura do extrusor (mm)
              <input
                type="number"
                value={larguraExtrusora}
                onChange={(e) => setLarguraExtrusora(+e.target.value)}
              />
            </label>

            <label>
              N° de perímetros (shells)
              <input
                type="number"
                value={quantidadePerimetros}
                onChange={(e) => setQuantidadePerimetros(+e.target.value)}
              />
            </label>

            <label>
              Espessura do fundo (mm)
              <input
                type="number"
                value={espessuraBase}
                onChange={(e) => setEspessuraBase(+e.target.value)}
              />
            </label>

            <label>
              Diâmetro do filamento (mm)
              <input
                type="number"
                value={diametroFilamento}
                onChange={(e) => setDiametroFilamento(+e.target.value)}
              />
            </label>

            <label>
              Densidade (g/cm³)
              <input
                type="number"
                value={densidadeFilamento}
                onChange={(e) => setDensidadeFilamento(+e.target.value)}
              />
            </label>

            <label>
              Preço por kg (R$)
              <input
                type="number"
                value={precoPorQuilo}
                onChange={(e) => setPrecoPorQuilo(+e.target.value)}
              />
            </label>

            <button onClick={calcularGastoFilamento}>Calcular Consumo</button>
            <div className="resultado">{mensagemResultado}</div>
          </div>
        </div>
        <div className="svgimage">
          <div id="canvas-wrapper">
            <div className="wrapper-cota-h"></div>
            <div className="wrapper-cota-v"></div>
            <div id="canvas-container"></div>
            <div id="wrapper-label-w" className="wrapper-label-h"></div>
            <div id="wrapper-label-h" className="wrapper-label-v"></div>
          </div>

          <canvas
            ref={canvasElementoReferencia}
            style={{ display: "none" }}
          ></canvas>
        </div>
      </div>
      <div className="footer">Desenvolvido por LetraJato 2025</div>
    </div>
  );
}

export default App;
