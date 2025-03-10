"use strict";

// Grab DOM elements to manipulate during the download.
const progressBar = document.querySelector("#progressbar");
const progressPercentContainer = document.querySelector("#progress-percent-container");
const progressPercent = document.querySelector("#progress-percent");
const downloadBtn = document.querySelector("#download-btn");
const cancelBtn = document.querySelector("#cancel");
const pauseResumeBtn = document.querySelector("#pause-resume");

// Save the file from Blob.
function saveFile(blob, name) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = name;
    document.body.append(link);
    link.click();
    link.remove();
}

// Show all elements
function showAll() {
    [progressBar, progressPercentContainer, pauseResumeBtn, cancelBtn].forEach((ele) => {
        ele.classList.remove("hide");
    });
}

// Hide all elements
function hideAll() {
    [progressBar, progressPercentContainer, pauseResumeBtn, cancelBtn].forEach((ele) => {
        ele.classList.add("hide");
    });
}

// Update the progress bar and its percentage label.
function updateProgressBar(percent) {
    if (!isNaN(percent)) {
        progressBar.value = percent;
        progressPercent.innerHTML = percent;
    }
}

// Update elements based on Download status.
function displayStatus(status, percent, chunks, filename) {
    updateProgressBar(percent);
    if (status === downloadStatus.ERROR) {
        alert("An Unexpected Error occured while downloading.");
        hideAll();
    }
    else if (status === downloadStatus.UNSTARTED) {
        hideAll();
    }
    else if (status === downloadStatus.FETCHING) {
        showAll();
        pauseResumeBtn.innerHTML = "Pause";
        pauseResumeBtn.classList.remove("resume");
        pauseResumeBtn.classList.add("pause");
    }
    else if (status === downloadStatus.PAUSED) {
        showAll();
        pauseResumeBtn.innerHTML = "Resume";
        pauseResumeBtn.classList.remove("pause");
        pauseResumeBtn.classList.add("resume");
    }
    else if (status === downloadStatus.DONE) {
        // Wait for 100 milisecond, so that 100% value of progressbar is updated on page.
        setTimeout(() => {
            alert("Download Completed.");
            saveFile(new Blob(chunks), filename);
            hideAll();
        }, 100);
    }
    else {
        alert("Invalid Download State");
        hideAll();
    }
}

let downloader;

// Abort previous download and initialize a new download.
downloadBtn.addEventListener("click", () => {
    downloader?.controller?.abort();

    downloader = new Downloader("/javascript.mp4", "javascript.mp4", displayStatus);

    downloader.downloadIt();

});

// Handle Pause and Resume.
pauseResumeBtn.addEventListener("click", () => {
    if (pauseResumeBtn.classList.contains("pause")) {
        downloader?.controller?.abort();
    }
    else if (pauseResumeBtn.classList.contains("resume")) {
        downloader?.controller?.abort();
        downloader?.downloadIt();
    }
});

// Kill the current download operations.
cancelBtn.addEventListener("click", () => {
    downloader?.controller?.abort();
    downloader = null;
    // Use setTimeout to override other handlers updating the page.
    setTimeout(() => {
        updateProgressBar(0);
        hideAll();
    }, 0);
});