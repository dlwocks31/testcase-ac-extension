export default defineBackground(() => {
  console.log("Hello background!", { id: browser.runtime.id });

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "checkProblem") {
      const problemId = message.problemId;
      fetch(`https://testcase.ac/api/extension/problems?id=${problemId}`)
        .then((response) => {
          console.log(response);
          if (response.status === 200) {
            console.log("testcase.ac page exists!");
            const iconUrl = chrome.runtime.getURL("icon/16.png");
            console.log({ iconUrl });
            chrome.action.setIcon({ path: iconUrl });
            chrome.action.setTitle({ title: "testcase.ac page exists!" });
            chrome.action.setBadgeText({ text: "1" });
            chrome.action.setBadgeBackgroundColor({ color: "#FF0000" });
            console.log("before openPopup");
            chrome.action.openPopup();
            console.log("after openPopup");
          }
        })
        .catch((error) =>
          console.error("Error fetching testcase.ac page:", error),
        );
    }
  });
});
