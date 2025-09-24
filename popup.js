const DICTIONARY_API_URL = "https://api.dictionaryapi.dev/api/v2/entries/en/";

// Create the context menu item
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "vocabBuilderDefine",
    title: "Define '%s'",
    contexts: ["selection"]
  });
});

// Listen for the context menu click
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "vocabBuilderDefine" && info.selectionText) {
    const word = info.selectionText.trim();
    if (!word) {
      alert("No word selected. Please highlight a word first.");
      return;
    }

    try {
      const response = await fetch(DICTIONARY_API_URL + word);
      if (!response.ok) {
        throw new Error('Word not found.');
      }
      const data = await response.json();

      if (data && data.length > 0) {
        const meaning = data[0].meanings[0];
        const definition = meaning.definitions[0].definition;
        const synonyms = meaning.definitions[0].synonyms;

        let result = `Definition: ${definition}`;
        if (synonyms && synonyms.length > 0) {
          result += `\n\nSynonyms: ${synonyms.join(', ')}`;
        }
        
        // Open the result in a new tab
        const htmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                padding: 20px;
                background-color: #f4f4f9;
              }
              .result-box {
                background: #fff;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                padding: 20px;
                max-width: 600px;
                margin: auto;
              }
              h1 { color: #333; }
              p { white-space: pre-wrap; }
            </style>
          </head>
          <body>
            <div class="result-box">
              <h1>Definition of "${word}"</h1>
              <p>${result}</p>
            </div>
          </body>
          </html>
        `;

        const dataUrl = 'data:text/html;charset=UTF-8,' + encodeURIComponent(htmlContent);
        chrome.tabs.create({ url: dataUrl });

      } else {
        alert("Definition not found.");
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  }
});