"use strict";

const progressBar = document.querySelector("#progressbar");
const progressPercent = document.querySelector("#progress-percent");
const downloadBtn = document.querySelector("#download-btn");
const cancelBtn = document.querySelector("#cancel");

let controller;

async function fetchVideo() {

    controller = new AbortController();
    
    const response = await fetch("/javascript.mp4", { signal: controller.signal });
    
    const contentLength = response.headers.get('Content-Length');

    const totalBytes = parseInt(contentLength);
    let receivedBytes = 0;

    const reader = response.body.getReader();
    const chunks = [];

    while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        chunks.push(value);
        receivedBytes += value.length;

        const percent = ((receivedBytes / totalBytes) * 100).toFixed(2);

        progressBar.value = percent;
        progressPercent.innerHTML = percent;
    }

    const result = new Blob(chunks);
    console.log(result);
    return result;
}

downloadBtn.addEventListener("click", () => {
    controller?.abort();

    fetchVideo()
        .then((blob) => {
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = "javascript.mp4";
            document.body.append(link);
            link.click();
            link.remove();
        })
        .catch((err) => {
            if (err.name === "AbortError") {
                alert("Download Aborted");
            }
            else {
                console.error(err);
            }
        });
});

cancelBtn.addEventListener("click", () => {
    controller?.abort();
});