"use strict";

// Chunk size of downloads (in bytes)
const CHUNK_SIZE = 500 * 1024;

// Enum holding the various status of Downloader
const downloadStatus = Object.freeze({
    ERROR: -1,
    UNSTARTED: 0,
    FETCHING: 1,
    PAUSED: 2,
    DONE: 3,
});

// Convert the download status into String to log it on console
function stateString(state) {
    switch (state) {
        case downloadStatus.ERROR:
            return "ERROR";
        case downloadStatus.UNSTARTED:
            return "UNSTARTED";
        case downloadStatus.FETCHING:
            return "FETCHING";
        case downloadStatus.PAUSED:
            return "PAUSED";
        case downloadStatus.DONE:
            return "DONE";
        default:
            return "NULL";
    }
}

class Downloader {
    constructor(url, filename, handleStatusUpdate) {
        this.url = url;
        this.filename = filename;
        this.controller = null;
        this.chunks = [];
        this.receivedBytes = 0;
        this.totalBytes = null;
        this.state = downloadStatus.UNSTARTED;
        this.handleStatusUpdate = handleStatusUpdate;
    }

    // Print the current download status and progress to console. And Update the DOM using callback function.
    print() {
        const percent = ((this.receivedBytes / this.totalBytes) * 100).toFixed(2);
        console.log(`[${stateString(this.state)}]: ${percent}% = ${this.receivedBytes}/${this.totalBytes}`);
        this.handleStatusUpdate(this.state, percent, this.chunks, this.filename);
    }

    // Fetch the next chunk of size specifies above by CHUNK_SIZE
    async fetchNextChunk() {
        // Abort any previous fetching operation to avoid conflict & Reinitialize the abort controller.
        this.controller?.abort();
        this.controller = new AbortController();

        // sequence number of last byte to fetch in this chunk
        const fetchTill = this.receivedBytes + CHUNK_SIZE;

        // Send the request with abort controller & "Range" header specifying the perticular chunks.
        const response = await fetch(this.url, {
            signal: this.controller.signal,
            headers: {
                'Range': `bytes=${this.receivedBytes}-${fetchTill}`
            }
        });

        // if the status codee is 416 (Range Not Satisfiable), the download is already completed.
        if (response.status === 416) {
            this.print();
            console.log("DOWNLOAD IS ALREADY COMPLETED.");
            return;
        }

        // Parse the total no. of bytes of resource from "Content-Range" header.
        const contentRange = response.headers.get("Content-Range");
        const totalBytesParsed = parseInt(contentRange.substring(contentRange.lastIndexOf("/") + 1));
        this.totalBytes = totalBytesParsed;

        this.print();

        // Get the input stream from response body
        const reader = response.body.getReader();

        // Read from input stream until it's done.
        while (true) {
            const { done, value } = await reader.read();

            if (done) break;

            // Push the readed value to chunks and update the this.receivedBytes variable.
            this.chunks.push(value);
            this.receivedBytes += value.length;

            this.print();
        }
    }

    // Executes the "fetchNextChunk" in loop until whole resource is downloaded.
    async downloadIt() {
        this.state = downloadStatus.FETCHING;
        this.print();

        do {

            try {
                await this.fetchNextChunk();
            }
            catch (err) {
                // Handle aborting the download.
                if (err.name === "AbortError") {
                    this.state = downloadStatus.PAUSED;
                    console.log("DOWNLOAD ABORTED");
                    this.print();
                    return;
                }
                this.state = downloadStatus.ERROR;
                this.print();
                throw err;
            }

        } while (this.receivedBytes < this.totalBytes);

        this.state = downloadStatus.DONE;
        this.print();
    }

};