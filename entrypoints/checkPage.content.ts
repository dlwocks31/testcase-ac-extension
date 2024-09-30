// https://wxt.dev/get-started/entrypoints.html
export default defineContentScript({
  matches: ["https://www.acmicpc.net/*"],
  runAt: "document_end",
  main() {
    console.log("Hello content.");

    const url = new URL(window.location.href);
    let problemId: string | null = null;

    // Regex for /problem/[problemId] format
    const problemRegex = /^\/problem\/(\d+)$/;
    // Regex for /board/search/all/problem/[problemId] format
    const boardSearchRegex = /^\/board\/search\/all\/problem\/(\d+)$/;

    const problemMatch = url.pathname.match(problemRegex);
    const boardSearchMatch = url.pathname.match(boardSearchRegex);

    if (problemMatch) {
      problemId = problemMatch[1];
    } else if (boardSearchMatch) {
      problemId = boardSearchMatch[1];
    }
    // Check for /status with problem_id query parameter
    else if (url.pathname === "/status" && url.searchParams.has("problem_id")) {
      problemId = url.searchParams.get("problem_id");
    }

    console.log({ problemId });

    chrome.runtime.sendMessage({ type: "enterPage", problemId });
  },
});
