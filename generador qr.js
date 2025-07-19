// seleccion 
const TextInput = document.querySelector(".text-imput");
const QrGenerar = document.querySelector(".btnQr", "#btnQr");
const QrGenerar2 = document.querySelector(".btnQr1");
const ContenedorQr = document.querySelector(".QR");
const BotonDescargar = document.querySelector(".Descargar-Qr");
const Aviso = document.querySelector(".aviso");


let QR;
// principal

QrGenerar.addEventListener("click", e => {
    e.preventDefault();
    const texto = TextInput.value;
    if (!texto) {
        mostrarAviso("no ha introducido ningun texto");
    } else {
        generarCodigoQr(texto);
        QrGenerar2.style.display = "block";
        BotonDescargar.style.display = "block";
    }
});

BotonDescargar.addEventListener("click", () => {
    descargarCodigoQr();
});

QrGenerar2.addEventListener("click", () => {
    if (QR) {
        QR = null;
    }
});


function generarCodigoQr(texto) {
    QR = new QRious({
        value: texto,
        size: 228
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
    }, (3000));
}

// lector Qr 
const video = document.getElementById("video");
const canvasElement = document.getElementById("canvas");
const canvas = canvasElement.getContext("2d");
const output = document.getElementById("output");
const fileInput = document.getElementById("fileInput")

// acceder a la camara 

const acceder = document.getElementById("acceder");
acceder.addEventListener("click", e => {
    e.preventDefault();
    navigator.mediaDevices.getUserMedia({
        video: {
            facingMode: "environment"
        }
    }).then(stream => {
        video.srcObject = stream;
        video.setAttribute("playsinline", true);
        video.play();
        requestAnimationFrame(scan);
    }
    ).catch(error => {
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
            const urlParttern = /^(https?:\/\/[^\s+])/i;
            if (urlParttern.test(qrText)) {
                output.innerHTML = `Resultado: <a href="${qrText}" target="_blank">${qrText}</a>`;
            } else {
                output.textContent = `Código detectado: ${qrText}`;
            }
            console.log("QR detectado", qrText);
        }
    }
    requestAnimationFrame(scan);
}
// lector qr en el mismo dispositivo
fileInput.addEventListener("change", e => {
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
            if (code.data.startsWith("http://") || code.data.startsWith("https://") || code.data.endsWith(".com")) {
                output.innerHTML = `Resultado: <a href="${code.data}" target="_blank">${code.data}</a>`;
            } else {
                output.textContent = `${code.data}`;
            }
        } else {
            output.textContent = `no se detecto ningun qr en la imagen`;
        }
    };

});
const files = document.querySelectorAll(".fancy-file");
Array.from(files).forEach(
    f => {
        f.addEventListener('change', e => {
            const span = document.querySelector('.fancy-file_fancy-file-name > span');
            span.innerHTML = f.files[0].name;
        });
    })