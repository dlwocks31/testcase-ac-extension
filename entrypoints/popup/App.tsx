import { useState, useEffect } from "react";
import "./App.css";

// Define default values as constants
const DEFAULT_SHOW_POPUP = true;
const DEFAULT_SHOW_IN_LIST = true;

interface LastChecked {
  lastCheckedProblemId: string;
  lastCheckedExist: boolean;
}

function App() {
  const [lastChecked, setLastChecked] = useState<LastChecked | null>(null);
  const [showPopup, setShowPopup] = useState(DEFAULT_SHOW_POPUP);
  const [showInList, setShowInList] = useState(DEFAULT_SHOW_IN_LIST);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    // Load initial state from storage
    chrome.storage.local.get(
      ["lastCheckedProblemId", "lastCheckedExist", "showPopup", "showInList"],
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
        setShowPopup(result.showPopup ?? DEFAULT_SHOW_POPUP);
        setShowInList(result.showInList ?? DEFAULT_SHOW_IN_LIST);
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

  const handleShowPopupChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const newValue = event.target.checked;
    setShowPopup(newValue);
    chrome.storage.local.set({ showPopup: newValue });
  };

  const handleShowInListChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const newValue = event.target.checked;
    setShowInList(newValue);
    chrome.storage.local.set({ showInList: newValue });
  };

  const handleOpenTestcase = () => {
    if (lastChecked && lastChecked.lastCheckedExist) {
      window.open(
        `https://testcase.ac/problems/${lastChecked.lastCheckedProblemId}`,
        "_blank",
      );
    }
  };

  const toggleSettings = () => {
    setShowSettings(!showSettings);
  };

  return (
    <div className="app-container">
      {!lastChecked && (
        <p className="last-checked-label">
          마지막으로 확인한 문제 번호가 없습니다. 백준 문제 페이지 진입 시
          자동으로 업데이트됩니다.
        </p>
      )}

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
                추가되지 않은 문제입니다.
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
      <button
        className="settings-button"
        onClick={toggleSettings}
        style={{ marginTop: "20px" }}
      >
        설정 {showSettings ? "닫기" : "열기"}
      </button>

      {showSettings && (
        <div>
          <div className="settings-container">
            <div className="checkbox-container">
              <label>
                <input
                  type="checkbox"
                  checked={showPopup}
                  onChange={handleShowPopupChange}
                />
                반례 찾을 수 있는 문제 진입 시, 자동으로 팝업 띄우기
              </label>
            </div>
            <div className="checkbox-container" style={{ marginTop: "2px" }}>
              <label>
                <input
                  type="checkbox"
                  checked={showInList}
                  onChange={handleShowInListChange}
                />
                반례 찾을 수 있는 문제를 목록에서 표시하기
              </label>
            </div>
          </div>
          <div className="links-container">
            <a
              href="https://github.com/dlwocks31/testcase-ac-extension"
              target="_blank"
              className="custom-link"
            >
              GitHub
            </a>{" "}
            /{" "}
            <a
              href="https://testcase.ac"
              target="_blank"
              className="custom-link"
            >
              testcase.ac
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
