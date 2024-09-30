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

export default defineContentScript({
  matches: ["https://www.acmicpc.net/*"],
  runAt: "document_end",
  main() {
    console.log("Hello content.");
    const problemId = extractProblemId(window.location.href);

    console.log({ problemId });

    chrome.runtime.sendMessage({ type: "enterPage", problemId });
  },
});
