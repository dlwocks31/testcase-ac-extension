export default defineBackground(() => {
  console.log("Hello background!", { id: browser.runtime.id });

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "enterPage") {
      const problemId = message.problemId;
      if (!problemId) {
        chrome.action.setBadgeText({ text: "" });
        return;
      }
      fetch(`https://testcase.ac/api/extension/problems?id=${problemId}`)
        .then((response) => {
          console.log(response);
          if (response.status === 200) {
            console.log(`testcase.ac page exists! ${problemId}`);
            chrome.storage.local.set({
              lastCheckedProblemId: problemId,
              lastCheckedExist: true,
            });
            chrome.action.setBadgeText({ text: "1" });
            chrome.action.setBadgeBackgroundColor({ color: "#FF0000" });
            console.log("before openPopup");
            chrome.action.openPopup();
            console.log("after openPopup");
          } else {
            console.log(
              `testcase.ac page does not exist! ${problemId}. status: ${response.status}`,
            );
            chrome.action.setBadgeText({ text: "" });
            chrome.storage.local.set({
              lastCheckedProblemId: problemId,
              lastCheckedExist: false,
            });
          }
        })
        .catch((error) => {
          console.error("Error fetching testcase.ac page:", error);
          chrome.action.setBadgeText({ text: "" });
        });
    }
  });
});
