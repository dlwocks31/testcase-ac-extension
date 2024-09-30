import { useState, useEffect } from "react";
import "./App.css";

interface LastChecked {
  lastCheckedProblemId: string;
  lastCheckedExist: boolean;
}

function App() {
  const [lastChecked, setLastChecked] = useState<LastChecked | null>(null);

  useEffect(() => {
    // Load initial state from storage
    chrome.storage.local.get(
      ["lastCheckedProblemId", "lastCheckedExist"],
      (result) => {
        if (
          result.lastCheckedProblemId &&
          result.lastCheckedExist !== undefined
        ) {
          setLastChecked({
            lastCheckedProblemId: result.lastCheckedProblemId,
            lastCheckedExist: result.lastCheckedExist,
          });
        }
      },
    );

    // Listen for changes in storage
    const listener = (changes: {
      [key: string]: chrome.storage.StorageChange;
    }) => {
      if (changes.lastCheckedProblemId || changes.lastCheckedExist) {
        setLastChecked({
          lastCheckedProblemId: changes.lastCheckedProblemId?.newValue,
          lastCheckedExist: changes.lastCheckedExist?.newValue,
        });
      }
    };

    chrome.storage.onChanged.addListener(listener);

    return () => {
      chrome.storage.onChanged.removeListener(listener);
    };
  }, []);

  const handleOpenTestcase = () => {
    if (lastChecked && lastChecked.lastCheckedExist) {
      window.open(
        `https://testcase.ac/problems/${lastChecked.lastCheckedProblemId}`,
        "_blank",
      );
    }
  };

  return (
    <div className="app-container">
      <p className="last-checked-label">
        {lastChecked
          ? `마지막으로 확인한 문제 번호: ${lastChecked.lastCheckedProblemId}`
          : "마지막으로 확인한 문제 번호가 없습니다."}
      </p>
      {lastChecked && (
        <div className="result-container">
          {lastChecked.lastCheckedExist ? (
            <>
              <p className="result-text">
                {lastChecked.lastCheckedProblemId}번 문제의 반례를
                testcase.ac에서 찾아볼 수 있습니다!
              </p>
              <button className="open-button" onClick={handleOpenTestcase}>
                문제 보러가기
              </button>
            </>
          ) : (
            <>
              <p className="result-text">
                {lastChecked.lastCheckedProblemId}번 문제는 아직 testcase.ac에
                등록되지 않은 문제입니다.
              </p>
              <button
                className="open-button"
                onClick={() => window.open("https://testcase.ac/", "_blank")}
              >
                직접 추가하기 / 요청하기
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
