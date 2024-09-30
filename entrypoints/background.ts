export default defineBackground(() => {
  console.log("Hello background!", { id: browser.runtime.id });
  const markFound = (problemId: string, previouslySeen?: boolean) => {
    console.log("background: markFound");
    console.log(`testcase.ac page exists! ${problemId}`);
    chrome.storage.local.set({
      lastCheckedProblemId: problemId,
      lastCheckedExist: true,
    });
    chrome.action.setBadgeText({ text: "1" });
    chrome.action.setBadgeBackgroundColor({ color: "#FF0000" });

    // Do not check for popup if the problem is already seen
    if (previouslySeen) {
      return;
    }
    chrome.storage.local.get(["showPopup"], (result) => {
      if (result.showPopup !== false || result.showPopup === undefined) {
        console.log("before openPopup");
        chrome.action.openPopup();
        console.log("after openPopup");
      }
    });
  };
  const markNotFound = (problemId: string) => {
    console.log("background: markNotFound");
    console.log(`testcase.ac page does not exist! ${problemId}`);
    chrome.action.setBadgeText({ text: "" });
    chrome.storage.local.set({
      lastCheckedProblemId: problemId,
      lastCheckedExist: false,
    });
  };
  const performFetchAndUpdateState = (problemId: string) => {
    fetch(`https://testcase.ac/api/extension/problems?id=${problemId}`)
      .then((response) => {
        console.log(response);
        if (response.status === 200) {
          markFound(problemId);
        } else {
          console.log(
            `testcase.ac page does not exist! ${problemId}. status: ${response.status}`,
          );
          markNotFound(problemId);
        }
      })
      .catch((error) => {
        console.error("Error fetching testcase.ac page:", error);
        chrome.action.setBadgeText({ text: "" });
      });
  };

  chrome.runtime.onMessage.addListener(
    async (message, sender, sendResponse) => {
      console.log(`background: onMessage. message: ${message}`);
      if (message.type === "enterPage") {
        const problemId = message.problemId;
        if (!problemId) {
          chrome.action.setBadgeText({ text: "" });
          return;
        }
        chrome.storage.local.get(
          ["lastCheckedProblemId", "lastCheckedExist"],
          (result) => {
            if (result.lastCheckedProblemId === problemId) {
              console.log("background: same problem id");
              if (result.lastCheckedExist) {
                markFound(problemId, true);
              } else {
                markNotFound(problemId);
              }
              return;
            }
            performFetchAndUpdateState(problemId);
          },
        );
      }
    },
  );
});
