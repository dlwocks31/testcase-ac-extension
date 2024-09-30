// https://wxt.dev/get-started/entrypoints.html
export default defineContentScript({
  matches: ["https://www.acmicpc.net/problem/*"],
  runAt: "document_end",
  main() {
    console.log("Hello content.");
    const problemId = window.location.pathname.split("/").pop();
    console.log({ problemId });
    if (problemId) {
      chrome.runtime.sendMessage({ type: "checkProblem", problemId });
    }
  },
});
