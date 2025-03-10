# AbortController demo 

## Introduction

In this demo, I have showcased how to efficiently manage file downloads in the browser using JavaScript's `AbortController`. My implementation allows users to download a file in chunks, pause, and resume the download seamlessly.

## What is AbortController ?

`AbortController` is a built-in JavaScript API that allows you to abort asynchronous operations like fetch requests. It provides a `signal` property, which can be passed to an API that supports aborting. When `abort()` is called, all associated operations are immediately stopped. This is particularly useful for network requests where you want to cancel an operation without waiting for it to complete.

For more details, check out the official [MDN documentation on AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).

## Why Use AbortController?

`AbortController` provides an elegant way to cancel ongoing fetch requests. When downloading large files, users may want to pause or cancel the process. Instead of waiting for a fetch request to complete, we use `AbortController` to stop it instantly and resume from where it left off.

## How It Works

### 1. Chunked Downloading

Rather than downloading the entire file at once, my implementation fetches data in chunks of **500 KB** (configurable via `CHUNK_SIZE`).  
We can fetch a perticular chunk of a file from server using `Range` HTTP header.  
> [!NOTE]
> The server should be able to handle `Range` header.

### 2. Pausing a Download

The `abort()` method of `AbortController` is used to stop an ongoing fetch request. When paused, the downloader retains the already fetched chunks and resumes later from the same position.

### 3. Resuming a Download

When the user resumes the download, a new fetch request is sent with a `Range` header specifying the byte range to continue from where it left off.

## Key Code Highlights

### 1. Initializing the AbortController

```javascript
this.controller = new AbortController();
```

Every time we start fetching a new chunk, we create a new `AbortController` instance.

### 2. Aborting an Ongoing Download

```javascript
this.controller?.abort();
```

Before starting a new fetch request, we abort any previous request to avoid conflicts.

### 3. Fetching a Specific Chunk

```javascript
const fetchTill = this.receivedBytes + CHUNK_SIZE;

const response = await fetch(this.url, {
    signal: this.controller.signal,
    headers: { 'Range': `bytes=${this.receivedBytes}-${fetchTill}` }
});
```

The `Range` header ensures we fetch only the required chunk instead of downloading the entire file.

### 4. Handling Pause and Resume

```javascript
pauseResumeBtn.addEventListener("click", () => {
    if (pauseResumeBtn.classList.contains("pause")) {
        downloader?.controller?.abort();
    } else if (pauseResumeBtn.classList.contains("resume")) {
        downloader?.controller?.abort();
        downloader?.downloadIt();
    }
});
```

When the user clicks "Pause", `abort()` is called. When clicking "Resume", a new fetch operation starts from where it left off.

> [!NOTE]
> You can read the source code. I have added many relevent comments.

## Learn More

To explore more about AbortController and its various use cases, check out this YouTube video :

<p align="center">
  <a href="https://youtu.be/2sdXSczmvNc?si=eZzzYKQ_8ENiYs1W">
    <img src="https://img.youtube.com/vi/2sdXSczmvNc/maxresdefault.jpg" alt="Watch the video">
  </a>
  <br>
 <em>Abort Controller is Criminally Underrated (Every React Dev Should Use This)</em>
</p>

## Conclusion

Using `AbortController`, we enable users to control their downloads efficiently. This approach improves the user experience by allowing interruptions and resumptions without restarting the entire process.

Try it out and enhance your applications with better download management!
