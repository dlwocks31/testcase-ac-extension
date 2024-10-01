// https://wxt.dev/get-started/entrypoints.html

const extractProblemId = (url_string: string) => {
  const url = new URL(url_string);
  let problemId: string | null = null;

  // Existing regex patterns
  const problemRegex = /^\/problem\/(\d+)$/;
  const boardSearchRegex = /^\/board\/search\/all\/problem\/(\d+)$/;

  // New regex patterns
  const submitRegex = /^\/submit\/(\d+)$/;
  const problemStatusRegex = /^\/problem\/status\/(\d+)$/;
  const shortStatusRegex = /^\/short\/status\/(\d+)$/;
  const problemHistoryRegex = /^\/problem\/history\/(\d+)$/;

  // Check for matches
  const match =
    url.pathname.match(problemRegex) ||
    url.pathname.match(boardSearchRegex) ||
    url.pathname.match(submitRegex) ||
    url.pathname.match(problemStatusRegex) ||
    url.pathname.match(shortStatusRegex) ||
    url.pathname.match(problemHistoryRegex);

  if (match) {
    problemId = match[1];
  }
  // Check for /status with problem_id query parameter
  else if (url.pathname === "/status" && url.searchParams.has("problem_id")) {
    problemId = url.searchParams.get("problem_id");
  }

  return problemId;
};

const extractProblemIdsFromList = (): string[] => {
  const problemIds: string[] = [];
  const tableElements = document.querySelectorAll("table");

  tableElements.forEach((table) => {
    const links = table.querySelectorAll('a[href^="/problem/"]');
    links.forEach((link) => {
      const match = link.getAttribute("href")?.match(/^\/problem\/(\d+)$/);
      if (match) {
        problemIds.push(match[1]);
      }
    });
  });

  return problemIds;
};

const addImageLinkToLeft = (element: Element, problemId: string) => {
  const anchor = document.createElement("a");
  anchor.href = `https://testcase.ac/problems/${problemId}`;
  anchor.target = "_blank";
  anchor.style.marginRight = "1px";
  anchor.onclick = () => {
    console.log("img clicked");
  };
  const img = document.createElement("img");
  img.src = chrome.runtime.getURL("icon/32.png");
  img.style.border = "1px solid lightgrey";
  img.style.marginRight = "2px";
  img.style.verticalAlign = "sub";
  img.style.width = "1.2em";
  img.style.height = "1.2em";

  anchor.appendChild(img);
  element.parentNode?.insertBefore(anchor, element);
};

export default defineContentScript({
  matches: ["https://www.acmicpc.net/*"],
  runAt: "document_end",
  async main() {
    console.log("Hello content.");
    const currentProblemId = extractProblemId(window.location.href);
    console.log({ currentProblemId });

    const problemIds = extractProblemIdsFromList();
    chrome.runtime.sendMessage({
      type: "pageLoaded",
      problemIds,
      currentProblemId,
    });

    // Listen for messages from the background script
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === "problemsExist") {
        console.log("received problemsExist", message.problemIds);
        const existingProblemIds: string[] = message.problemIds;

        existingProblemIds.forEach((problemId) => {
          const links = document.querySelectorAll(
            `td > a[href="/problem/${problemId}"]`,
          );
          links.forEach((link) => {
            addImageLinkToLeft(link, problemId);
          });

          const problemTitle = document.querySelector("#problem_title");
          if (problemTitle) {
            console.log("problemTitle", problemTitle);
            addImageLinkToLeft(problemTitle, problemId);
          } else {
            console.log("problemTitle not found");
          }
        });
      }
    });
  },
});
