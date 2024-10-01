export default defineBackground(() => {
  console.log("Hello background!", { id: browser.runtime.id });

  // 현재 testcase.ac에 등록된 문제에 들어옴이 감지됐을 때 호출하는 함수
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
      if (result.showPopup === true) {
        console.log("before openPopup");
        chrome.action.openPopup();
        console.log("after openPopup");
      }
    });
  };

  // testcase.ac에 등록되지 않은 문제에 들어옴이 감지됐을 때 호출하는 함수
  const markNotFound = (problemId: string) => {
    console.log("background: markNotFound");
    console.log(`testcase.ac page does not exist! ${problemId}`);
    chrome.action.setBadgeText({ text: "" });
    chrome.storage.local.set({
      lastCheckedProblemId: problemId,
      lastCheckedExist: false,
    });
  };

  // 문제 번호 목록을 받아서, testcase.ac에 등록되어 있는지까지만 확인하고 결과 반환
  const checkProblemExistsBatch = async (
    problemIds: string[],
  ): Promise<{ existProblemIds: string[]; notExistProblemIds: string[] }> => {
    try {
      const response = await fetch(
        `https://testcase.ac/api/extension/problems?ids=${problemIds.join(
          ",",
        )}`,
      );
      if (response.status === 200) {
        const data = await response.json();
        return {
          existProblemIds: Array.isArray(data.existProblemIds)
            ? data.existProblemIds.filter(
                (id: string) => typeof id === "string",
              )
            : [],
          notExistProblemIds: Array.isArray(data.notExistProblemIds)
            ? data.notExistProblemIds.filter(
                (id: string) => typeof id === "string",
              )
            : [],
        };
      } else {
        console.error(
          `Error fetching batch problems. Status: ${response.status}`,
        );
        return { existProblemIds: [], notExistProblemIds: problemIds };
      }
    } catch (error) {
      console.error("Error fetching batch problems:", error);
      return { existProblemIds: [], notExistProblemIds: problemIds };
    }
  };

  chrome.runtime.onMessage.addListener(
    async (message, sender, sendResponse) => {
      console.log(`background: onMessage. message:`, message);
      if (message.type === "pageLoaded") {
        const { currentProblemId, problemIds } = message;
        if (!currentProblemId) {
          // 지금 들어온 페이지는 한 문제를 다루는 페이지가 아님.
          // 뱃지 일단 업데이트
          chrome.action.setBadgeText({ text: "" });
        }

        // 네트워크 쿼리로 있는 문제 가져옴
        const queryList = [currentProblemId, ...problemIds];
        const uniqueQueryList = Array.from(new Set(queryList));
        uniqueQueryList.sort();
        const { existProblemIds } = await checkProblemExistsBatch(
          uniqueQueryList,
        );

        // 현재 페이지가 한 문제를 다루는 페이지일 때, 이에 맞게 뱃지 업데이트 등 진행
        if (currentProblemId) {
          if (existProblemIds.includes(currentProblemId)) {
            markFound(currentProblemId);
          } else {
            markNotFound(currentProblemId);
          }
        }

        // 백준 페이지에서 리스트, 제목 등에 로고 업데이트하도록 메세지 전송
        const senderId = sender.tab?.id;
        if (senderId) {
          console.log("background: sending problemsExist message to", senderId);
          chrome.tabs.sendMessage(senderId, {
            type: "problemsExist",
            problemIds: existProblemIds,
          });
        } else {
          console.error("background: senderId not found");
        }
      }
    },
  );

  chrome.tabs.onActivated.addListener((activeInfo) => {
    // activeInfo contains tabId and windowId

    chrome.tabs.get(activeInfo.tabId, (tab) => {
      console.log(`Tab switched to: ${activeInfo.tabId}, url: ${tab.url}`);
      if (!tab.url || !tab.url.startsWith("https://www.acmicpc.net/")) {
        chrome.action.setBadgeText({ text: "" });
      }
    });
  });
});
