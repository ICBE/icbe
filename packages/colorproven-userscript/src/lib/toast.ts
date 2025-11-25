function showToast(message: string | string[]) {
  let container = document.getElementById("userscript-toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "userscript-toast-container";
    container.style.position = "fixed";
    container.style.top = "0";
    container.style.left = "0";
    container.style.width = "100vw";
    container.style.height = "100vh";
    container.style.display = "flex";
    container.style.justifyContent = "center";
    container.style.alignItems = "center";
    container.style.zIndex = "9999";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.style.background = "hsl(0, 0%, 0%)";
  toast.style.color = "hsl(0, 0%, 100%)";
  toast.style.padding = "1.5rem 2rem";
  toast.style.borderRadius = "0.75rem";
  toast.style.boxShadow = "0 4px 12px hsla(0, 0%, 0%, 0.6)";
  toast.style.fontSize = "1.25rem";
  toast.style.overflowWrap = "break-word";
  toast.style.display = "flex";
  toast.style.flexDirection = "column";
  toast.style.alignItems = "center";
  toast.style.gap = "1rem";

  const textElem = document.createElement("div");
  textElem.textContent = Array.isArray(message) ? message.join("\n") : message;
  textElem.style.whiteSpace = "pre-wrap";
  textElem.style.textAlign = "left";
  textElem.style.width = "100%";
  textElem.style.fontSize = "1.1rem";
  textElem.style.color = "hsl(0, 0%, 100%)";
  textElem.style.margin = "0";
  textElem.style.padding = "0";
  textElem.style.maxWidth = "360px";
  textElem.style.fontFamily = "monospace";
  toast.appendChild(textElem);

  const closeBtn = document.createElement("button");
  closeBtn.textContent = "Close";
  closeBtn.style.padding = "0.5rem 1rem";
  closeBtn.style.fontSize = "1rem";
  closeBtn.style.border = "none";
  closeBtn.style.borderRadius = "0.5rem";
  closeBtn.style.cursor = "pointer";
  closeBtn.style.background = "hsla(0, 0%, 100%, 0.15)";
  closeBtn.style.color = "white";
  closeBtn.style.alignSelf = "flex-end";
  closeBtn.addEventListener("click", () => {
    toast.remove();
    if (!container!.childElementCount) container!.remove();
  });

  toast.appendChild(closeBtn);
  container.appendChild(toast);

  toast.style.opacity = "0";
  toast.style.transition = "opacity 0.3s ease";
  requestAnimationFrame(() => {
    toast.style.opacity = "1";
  });
}

export { showToast };
