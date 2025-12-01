// CameraGenerateScript.js

const form = document.getElementById("urlForm");
const generatedUrlEl = document.getElementById("generatedUrl");
const copyBtn = document.getElementById("copyBtn");
const hideToolbarCheck = document.getElementById("hideToolbarCheck");
const toolbarPositionGroup = document.getElementById("toolbarPositionGroup");

// Toggle toolbar position visibility
hideToolbarCheck.addEventListener("change", (e) => {
    toolbarPositionGroup.style.display = e.target.checked ? "none" : "block";
    generateURL();
});

// Listen to all form changes
form.addEventListener("input", generateURL);
form.addEventListener("change", generateURL);
document.addEventListener("DOMContentLoaded", generateURL);
copyBtn.addEventListener('click', copyToClipboard);

function generateURL() {
    const gamemode = document.getElementById("gamemodeSelect").value;
    const fullscreen = document.getElementById("fullscreenCheck").checked;
    const hideToolbar = hideToolbarCheck.checked;
    const toolbarPosition = document.getElementById("toolbarPositionSelect").value;

    const params = new URLSearchParams();
    if (gamemode) params.append("gamemode", gamemode);
    if (fullscreen) params.append("fullscreen", "true");
    if (hideToolbar) params.append("hideToolbar", "true");
    else if (toolbarPosition && toolbarPosition !== "up") params.append("toolbarPosition", toolbarPosition);

    const baseUrl = window.location.origin + window.location.pathname.replace("/generate", "/");
    const fullUrl = params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl;

    generatedUrlEl.textContent = fullUrl;
}

async function copyToClipboard() {
    const url = generatedUrlEl.textContent || "";
    try {
        await navigator.clipboard.writeText(url);
        copyBtn.textContent = "Copied!";
        setTimeout(() => (copyBtn.textContent = "Copy URL"), 2000);
    } catch (err) {
        console.error("Failed to copy:", err);
    }
}
