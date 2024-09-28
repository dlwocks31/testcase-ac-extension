// https://wxt.dev/get-started/entrypoints.html
export default defineContentScript({
  matches: ["https://www.acmicpc.net/problem/*"],
  runAt: "document_end",
  main() {
    console.log("Hello content.");
    const problemId = window.location.pathname.split("/").pop();
    console.log({ problemId });
    if (problemId) {
      fetch(`https://testcase.ac/api/extension/problems?id=${problemId}`)
        .then((response) => {
          console.log(response);
          if (response.status === 200) {
            chrome.runtime.sendMessage({ type: "pageExists" });
          }
        })
        .catch((error) =>
          console.error("Error fetching testcase.ac page:", error),
        );
    }
  },
});
