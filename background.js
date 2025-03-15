chrome.webRequest.onCompleted.addListener(
  async (details) => {
    if (details.url.includes("&summarizer=1")) return;

    const consent = await new Promise((resolve) => {
      chrome.storage.local.get(["consent"], (result) =>
        resolve(result.consent)
      );
    });

    if (!consent) return;

    chrome.scripting.executeScript({
      target: { tabId: details.tabId },
      args: [details.tabId, details.url],
      func: mainFunction,
    });
  },
  {
    urls: ["https://mail.naver.com/json/list?*"],
  }
);

async function mainFunction(tabId, apiUrl) {
  const fetchWithRetryJson = async (
    url,
    options,
    retries = 10,
    delayMs = 1000
  ) => {
    for (let i = 0; i < retries; i++) {
      const response = await fetch(url, options);
      if (response.ok) return response.json();
      if (response.status === 429) {
        console.warn(
          `⏳ ${url} ${
            i + 1
          }회 시도 후 429 에러 발생! ${delayMs}ms 후 재시도...`
        );
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      } else {
        console.log("🚫 Fetch 요청 실패:", response.status);
      }
    }
    return null;
  };

  const getEmailList = async (apiUrl) => {
    const response = await fetchWithRetryJson(apiUrl + "&summarizer=1", {
      method: "POST",
    });
    return response?.mailData || [];
  };

  const getCachedContent = async (emailId) => {
    return new Promise((resolve) => {
      chrome.storage.local.get(["content_" + emailId], (result) =>
        resolve(result["content_" + emailId])
      );
    });
  };

  const setCachedContent = async (emailId, content) => {
    chrome.storage.local.set({ ["content_" + emailId]: content });
  };

  const getCachedSummary = async (emailId) => {
    return new Promise((resolve) => {
      chrome.storage.local.get(["summary_" + emailId], (result) =>
        resolve(result["summary_" + emailId])
      );
    });
  };

  const setCachedSummary = async (emailId, summary) => {
    chrome.storage.local.set({ ["summary_" + emailId]: summary });
  };

  const divideEmailList = async (emailList) => {
    const cachedEmailList = await Promise.all(
      emailList.map(async (email, index) => {
        const content = await getCachedContent(email.mailSN);
        const summary = await getCachedSummary(email.mailSN);
        return {
          content: content,
          summary: summary,
          id: email.mailSN,
          index: index,
        };
      })
    );

    const contentAndSummaryCached = [];
    const contentCached = [];
    const noCached = [];

    for (const cachedEmail of cachedEmailList) {
      if (cachedEmail.content && cachedEmail.summary) {
        contentAndSummaryCached.push(cachedEmail);
      } else if (cachedEmail.content && !cachedEmail.summary) {
        contentCached.push(cachedEmail);
      } else {
        noCached.push(cachedEmail);
      }
    }

    return { contentAndSummaryCached, contentCached, noCached };
  };

  const fetchEmailContents = async (emailList) => {
    const emailContents = [];
    await Promise.all(
      emailList.map(async (email) => {
        const params = new URLSearchParams();
        params.append("mailSN", email.id);
        params.append("markRead", "false");

        const emailResponse = await fetchWithRetryJson(
          `https://mail.naver.com/json/read`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              Accept: "application/json",
            },
            body: params.toString(),
          }
        );
        console.log(email.id);
        const content = emailResponse?.mailInfo?.body || "";
        setCachedContent(email.id, content);
        emailContents.push({ ...email, content: content });
      })
    );
    return emailContents;
  };

  const fetchLLM = async (emailContents, initWebUrl) => {
    const apiKey = await new Promise((resolve) => {
      chrome.storage.local.get(["apiToken"], (result) =>
        resolve(result.apiToken)
      );
    });

    for (const email of emailContents) {
      console.log("🔹 요약 요청 메시지:", email);
      const responseData = await fetchWithRetryJson(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini-2024-07-18",
            messages: [
              {
                role: "system",
                content:
                  "You are a useful assistant to summarize emails concisely. You should summarize each of your emails in one sentence in Korean.",
              },
              {
                role: "user",
                content: `email:\n\n${email.content}`,
              },
            ],
            max_tokens: 1024,
            n: 1,
          }),
        }
      );
      const summary = responseData?.choices[0]?.message?.content;
      console.log("🔹 요약 결과:", summary);
      if (summary) setCachedSummary(email.id, summary);

      currentUrl = window.location.href;
      if (initWebUrl != currentUrl) return;
      updateDomWithOneSummary(summary, email.index);
    }
  };

  const updateDomWithOneSummary = (summary, index) => {
    const emailTitleElements = document.querySelectorAll(".mail_title");
    const emailTitle = emailTitleElements[index];

    if (!emailTitle) return;

    const linkElement = emailTitle.querySelector("a");
    if (!linkElement) return;

    const spanElement = document.createElement("span");
    spanElement.className = "text";
    spanElement.textContent = " ✨요약: " + summary + "✨";
    spanElement.style.fontSize = "12px";
    spanElement.style.fontStyle = "italic";

    linkElement
      .querySelector(".text")
      .insertAdjacentElement("afterend", spanElement);
  };

  const summary = async () => {
    try {
      const initWebUrl = window.location.href;
      const emailList = await getEmailList(apiUrl);
      if (!emailList.length) return console.warn("📭 이메일이 없습니다.");
      const { contentAndSummaryCached, contentCached, noCached } =
        await divideEmailList(emailList);

      console.log(contentAndSummaryCached, contentCached, noCached);

      if (initWebUrl == window.location.href) {
        contentAndSummaryCached.forEach((email) => {
          updateDomWithOneSummary(email.summary, email.index);
        });
      }

      let emails;
      try {
        emails = await fetchEmailContents(noCached);
      } catch (e) {
        throw Error("fetchEmailContents error");
      }
      console.log("emails", emails.concat(contentCached));
      const sortedEmails = emails.concat(contentCached).sort((a, b) => {
        return a.index - b.index;
      });
      await fetchLLM(sortedEmails, initWebUrl);
    } catch (error) {
      console.error("⚠️ 이메일 데이터 처리 중 오류 발생:", error);
    }
  };

  summary();
}
