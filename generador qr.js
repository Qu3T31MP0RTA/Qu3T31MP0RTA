// ========================
// SELECCIÓN DE ELEMENTOS
// ========================
const TextInput = document.querySelector(".text-imput");
const QrGenerar = document.querySelector(".btnQr", "#btnQr");
const QrGenerar2 = document.querySelector(".btnQr1");
const ContenedorQr = document.querySelector(".QR");
const BotonDescargar = document.querySelector(".Descargar-Qr");
const Aviso = document.querySelector(".aviso");

const video = document.getElementById("video");
const canvasElement = document.getElementById("canvas");
const canvas = canvasElement.getContext("2d");
const output = document.getElementById("output");
const fileInput = document.getElementById("fileInput");
const acceder = document.getElementById("acceder");
const files = document.querySelectorAll(".fancy-file");

let QR;

// ========================
// GENERACIÓN DE CÓDIGO QR
// ========================
QrGenerar.addEventListener("click", (e) => {
    e.preventDefault();
    const texto = TextInput.value;

    if (!texto) {
        mostrarAviso("No ha introducido ningún texto");
    } else {
        generarCodigoQr(texto);
        QrGenerar2.style.display = "block";
        BotonDescargar.style.display = "block";
    }
});

QrGenerar2.addEventListener("click", () => {
    if (QR) {
        QR = clearInterval; // ¿Esto debería ser clearInterval o un reseteo de QR?
    }
});

BotonDescargar.addEventListener("click", (e) => {
    e.preventDefault();
    descargarCodigoQr();
});

// ========================
// FUNCIONES QR
// ========================
function generarCodigoQr(texto) {
    QR = new QRious({
        value: texto,
        size: 228,
    });
    ContenedorQr.innerHTML = "";
    ContenedorQr.appendChild(QR.image);
}

function descargarCodigoQr() {
    if (QR) {
        const qrImageData = QR.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = qrImageData;
        link.download = "codigo_qr.png";
        link.click();
    }
}

function mostrarAviso(mensaje) {
    Aviso.style.color = "#f83292";
    Aviso.style.background = "none";
    Aviso.style.fontWeight = "800";
    Aviso.textContent = mensaje;
    Aviso.style.visibility = "visible";

    setTimeout(() => {
        Aviso.style.display = "none";
    }, 3000);
}

// ========================
// LECTOR DE QR CON CÁMARA
// ========================
acceder.addEventListener("click", (e) => {
    e.preventDefault();
    navigator.mediaDevices
        .getUserMedia({
            video: { facingMode: "environment" },
        })
        .then((stream) => {
            video.srcObject = stream;
            video.setAttribute("playsinline", true);
            video.play();
            requestAnimationFrame(scan);
        })
        .catch((error) => {
            console.error("Error al acceder a la cámara:", error);
            alert("No se pudo acceder a la cámara. Por favor, asegúrate de haber dado permiso.");
        });
});

function scan() {
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvasElement.height = video.videoHeight;
        canvasElement.width = video.videoWidth;
        canvas.drawImage(video, 0, 0, canvasElement.width, canvasElement.height);

        const imageData = canvas.getImageData(0, 0, canvasElement.width, canvasElement.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code) {
            const qrText = code.data;
            const urlPattern = /^(https?:\/\/[^\s+])/i;

            if (urlPattern.test(qrText)) {
                output.innerHTML = `Resultado: <a href="${qrText}" target="_blank">${qrText}</a>`;
            } else {
                output.textContent = `Código detectado: ${qrText}`;
            }

            console.log("QR detectado:", qrText);
        }
    }
    requestAnimationFrame(scan);
}

// ========================
// LECTOR QR DESDE IMAGEN
// ========================
fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const img = new Image();
    img.src = URL.createObjectURL(file);

    img.onload = () => {
        canvasElement.width = img.width;
        canvasElement.height = img.height;
        canvas.drawImage(img, 0, 0);

        const imageData = canvas.getImageData(0, 0, canvasElement.width, canvasElement.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code) {
            if (
                code.data.startsWith("http://") ||
                code.data.startsWith("https://") ||
                code.data.endsWith(".com")
            ) {
                output.innerHTML = `Resultado: <a href="${code.data}" target="_blank">${code.data}</a>`;
            } else {
                output.textContent = `${code.data}`;
            }
        } else {
            output.textContent = `No se detectó ningún QR en la imagen`;
        }
    };
});

// ========================
// INPUT FILE (NOMBRE ARCHIVO)
// ========================
Array.from(files).forEach((f) => {
    f.addEventListener("change", () => {
        const span = document.querySelector(".fancy-file_fancy-file-name > span");
        span.innerHTML = f.files[0].name;
    });
});
