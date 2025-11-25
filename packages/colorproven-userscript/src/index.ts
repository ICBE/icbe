import type { IC_DOM } from "@infinite-craft/dom-types";

import { showToast } from "./lib/toast";

type ICInstanceDivElement = IC_DOM.InstanceDivElement;
type ICItemDivElement = IC_DOM.ItemDivElement;

type ElementsMap = Record<string, { color: string }>;
type ElementsData = { proven: string[]; disproven: string[] };
type UserscriptMetaHeaders = {
  name: string;
  match: string;
  version: string;
  description: string;
};
type UserscriptMeta = { headers: UserscriptMetaHeaders };

const colors = {
  /** Color for Proven Elements */
  proven: "#00cc1f",
  /** Color for Disproven Elements */
  disproven: "#ff1c1c",
} as const;

const elementsMap: ElementsMap = {};

const __VERSION__ = GM.info.script.version;

async function loadData(why: "load" | "update"): Promise<ElementsData> {
  const api_url = "https://icbe.rman.dev/api";
  const url = `${api_url}/get-elements?why=${why}`;
  const response = await fetch(url);
  const data: ElementsData = await response.json();
  return data;
}

function storeColorData(proven: string[], disproven: string[]): void {
  for (const elem of proven) {
    elementsMap[elem.toLowerCase()] = { color: colors.proven };
  }
  for (const elem of disproven) {
    elementsMap[elem.toLowerCase()] = { color: colors.disproven };
  }
}

function isDeadNumber(text: string): boolean {
  if (!/^\d+$/.test(text)) return false;
  const num = Number(text);
  if (isNaN(num)) return false;
  return num >= 1_000_000;
}

function handleDivColor(div: ICInstanceDivElement | ICItemDivElement): void {
  const textContent = div.childNodes[1].textContent;
  if (!textContent) throw new Error("Something went wrong!");
  const text = textContent.trim().toLowerCase();
  const elem = elementsMap[text];
  if (text.length > 30) {
    div.style.color = colors.disproven;
  } else if (isDeadNumber(text)) {
    div.style.color = colors.disproven;
  } else if (elem && elem.color) {
    div.style.color = elem.color;
  }
}

function handleInstanceColor(instance: ICInstanceDivElement): void {
  return handleDivColor(instance);
}

function handleItemColor(item: ICItemDivElement): void {
  return handleDivColor(item);
}

function handleNode(node: Node): void {
  if (!(node instanceof HTMLElement)) return;

  if (
    node.classList.contains("instance") &&
    node.querySelector(".instance-emoji")
  ) {
    const instance = IC.getInstances().find((x) => x.element === node);
    if (!instance) return;
    handleInstanceColor(instance.element);
  } else if (
    node.classList.contains("item-wrapper") &&
    node.querySelector(".item")
  ) {
    const item = Array.from(node.querySelectorAll(".item")).find(
      (x) => x === node.children[0]
    );
    if (!item) return;
    handleItemColor(item);
  }
}

function updateButtonText(
  button: HTMLButtonElement,
  texts: readonly string[],
  interval: number
): Promise<() => void> {
  let index = 0;
  return new Promise((resolve) => {
    const intervalId = window.setInterval(() => {
      button.textContent = texts[index]!;
      index = (index + 1) % texts.length;
    }, interval);
    resolve(() => {
      window.clearInterval(intervalId);
    });
  });
}

function setupButtonForUpdatingData(): void {
  const buttonForUpdatingData = document.createElement("button");
  buttonForUpdatingData.textContent = "Update data";
  buttonForUpdatingData.style.fontSize = "1.25rem";

  buttonForUpdatingData.addEventListener("click", async () => {
    buttonForUpdatingData.disabled = true;
    const stopAnimation = await updateButtonText(
      buttonForUpdatingData,
      ["Updating..", "Updating..."],
      300
    );

    let success = false;
    try {
      const { proven, disproven } = await loadData("update");

      storeColorData(proven, disproven);

      document.querySelectorAll(".instance").forEach((instance) => {
        handleInstanceColor(instance);
      });

      document.querySelectorAll(".item").forEach((item) => {
        handleItemColor(item);
      });

      success = true;
    } catch (error) {
      console.error("Update failed:", error);
    } finally {
      stopAnimation();
      buttonForUpdatingData.textContent = success
        ? "Data updated successfully ✅"
        : "Failed to update data ❌";
      window.setTimeout(() => {
        buttonForUpdatingData.textContent = "Update data";
      }, 5 * 1000);
      window.setTimeout(() => {
        buttonForUpdatingData.disabled = false;
      }, 120 * 1000);
    }
  });

  const sideControls = document.querySelector(".side-controls");
  sideControls.prepend(buttonForUpdatingData);
}

async function getLatestUserscriptMeta() {
  const response = await fetch(
    "https://userscripts.rman.dev/infinite-craft/color-proven/meta.json"
  );
  const data: UserscriptMeta = await response.json();
  return data;
}

async function getLatestUserscriptVersion() {
  const meta = await getLatestUserscriptMeta();
  return meta.headers.version;
}

async function checkUserscriptVersion() {
  const latestVersion = await getLatestUserscriptVersion();
  console.log({ __VERSION__, latestVersion });
  if (__VERSION__ === latestVersion) {
    console.log("Userscript is up to date");
    return;
  }

  showToast([
    "You are using an outdated version of the color-proven userscript.\n",
    "Please update to the latest version.\n",
    `Current version: ${__VERSION__}`,
    `Latest version: ${latestVersion}\n`,
  ]);
}

async function init(): Promise<void> {
  checkUserscriptVersion();

  const { proven, disproven } = await loadData("load");
  storeColorData(proven, disproven);

  const interval = window.setInterval(() => {
    if (typeof IC === "undefined") return;
    window.clearInterval(interval);
  }, 2000);

  const instanceObserver = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (!mutation.addedNodes.length) continue;
      for (const node of mutation.addedNodes) {
        handleNode(node);
      }
    }
  });

  instanceObserver.observe(document.querySelector(".infinite-craft"), {
    childList: true,
    subtree: true,
  });

  setupButtonForUpdatingData();
}

window.addEventListener("load", async () => {
  init();
});
