export default defineBackground(() => {
  console.log("Hello background!", { id: browser.runtime.id });

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "pageExists") {
      console.log("testcase.ac page exists!");
      const problemId = 1000; // holder
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
  });
});
