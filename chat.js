document.addEventListener("DOMContentLoaded", () => {
  const chatBox = document.getElementById("chat-box");
  const userInput = document.getElementById("user-input");
  const triggerBotBtn = document.getElementById("trigger-bot-btn");
  const clearChatBtn = document.getElementById("clear-chat-btn");
  const exportChatBtn = document.getElementById("export-chat-btn");
  const toggleThemeBtn = document.getElementById("toggle-theme-btn");
  const searchInput = document.getElementById("search-input");
  const searchBtn = document.getElementById("search-btn");

  let responseCounter = 1; // ボットのレスポンス識別番号
  let chatLog = []; // チャットの内容を記録する配列

  // ローカルストレージに保存するためのユーティリティ
  function saveChatLog() {
    localStorage.setItem("chatLog", JSON.stringify(chatLog));
  }

  // メッセージを画面に追加する関数
  function addMessage(text, type, timestamp) {
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message", type);

    // ボットのメッセージは識別番号（responseCounter）を付与
    let displayText = type === "bot" ? `[${responseCounter}] ${text}` : text;
    if (type === "bot") responseCounter++;

    // メッセージ部分とタイムスタンプ部分を分割して作成
    messageDiv.innerHTML = `
      <span class="message-text">${displayText}</span>
      <span class="timestamp">${timestamp.toLocaleString()}</span>
    `;
    
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  // メッセージを記録・保存する関数
  function logMessage(text, type, timestamp) {
    chatLog.push({ type, text, timestamp: timestamp.toISOString() });
    saveChatLog();
    console.log("チャットログ:", chatLog);
  }

  // ページ読み込み時にローカルストレージからログを復元
  const savedLog = localStorage.getItem("chatLog");
  if (savedLog) {
    try {
      chatLog = JSON.parse(savedLog);
    } catch (e) {
      console.error("チャットログの解析に失敗しました:", e);
      chatLog = [];
    }
    chatLog.forEach(entry => {
      addMessage(entry.text, entry.type, new Date(entry.timestamp));
    });
  }

  // ユーザーの入力処理
  userInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && userInput.value.trim() !== "") {
      const messageText = userInput.value.trim();
      const now = new Date();
      addMessage(messageText, "user", now);
      logMessage(messageText, "user", now);
      userInput.value = "";
    }
  });

  // ボットの応答を手動トリガー
  triggerBotBtn.addEventListener("click", () => {
    // 最新のユーザーメッセージを取得
    const userMessages = chatBox.querySelectorAll(".message.user .message-text");
    if (userMessages.length > 0) {
      const lastUserMessage = userMessages[userMessages.length - 1].textContent;
      const botResponse = getBotResponse(lastUserMessage);
      const now = new Date();
      addMessage(botResponse, "bot", now);
      logMessage(botResponse, "bot", now);
    }
  });

  // チャットクリア機能
  clearChatBtn.addEventListener("click", () => {
    if (confirm("チャットをクリアしてもよろしいですか？")) {
      chatBox.innerHTML = "";
      chatLog = [];
      saveChatLog();
    }
  });

  // チャットログをエクスポート（JSONファイルとしてダウンロード）
  exportChatBtn.addEventListener("click", () => {
    const dataStr = JSON.stringify(chatLog, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "chatLog.json";
    a.click();
    URL.revokeObjectURL(url);
  });

  // テーマ切替（ライト／ダーク）
  toggleThemeBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
  });

  // チャット内検索機能
  searchBtn.addEventListener("click", () => {
    const searchTerm = searchInput.value.toLowerCase().trim();
    // 事前にすべてのメッセージのハイライトを解除
    const messages = chatBox.querySelectorAll(".message");
    messages.forEach(message => {
      message.style.backgroundColor = "";
    });
    if (searchTerm !== "") {
      messages.forEach(message => {
        const msgText = message.querySelector(".message-text").textContent.toLowerCase();
        if (msgText.includes(searchTerm)) {
          message.style.backgroundColor = "yellow";
        }
      });
    }
  });

  // シンプルなボットの応答ロジック
  function getBotResponse(userMessage) {
    if (userMessage.includes("こんにちは")) {
      return "こんにちは！お元気ですか？";
    } else if (userMessage.includes("ありがとう")) {
      return "どういたしまして！";
    } else {
      return "申し訳ありません、よくわかりません。";
    }
  }
});
