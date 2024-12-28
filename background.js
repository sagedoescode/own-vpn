// background.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'setProxy') {
    if (!message.config.host || !message.config.port) {
      console.error('Missing required proxy configuration');
      sendResponse({ success: false, error: 'Missing configuration' });
      return;
    }

    const config = {
      mode: "fixed_servers",
      rules: {
        singleProxy: {
          scheme: "http",
          host: message.config.host,
          port: parseInt(message.config.port)
        }
      }
    };

    chrome.proxy.settings.set(
      { value: config, scope: 'regular' },
      () => {
        if (chrome.runtime.lastError) {
          console.error('Error setting proxy:', chrome.runtime.lastError);
          sendResponse({ success: false, error: chrome.runtime.lastError.message });
        } else {
          console.log('Proxy settings applied successfully');
          sendResponse({ success: true });
        }
      }
    );
    return true; // Required to use sendResponse asynchronously
  } else if (message.type === 'disableProxy') {
    chrome.proxy.settings.clear(
      { scope: 'regular' },
      () => {
        if (chrome.runtime.lastError) {
          console.error('Error clearing proxy:', chrome.runtime.lastError);
          sendResponse({ success: false, error: chrome.runtime.lastError.message });
        } else {
          console.log('Proxy settings cleared successfully');
          sendResponse({ success: true });
        }
      }
    );
    return true; // Required to use sendResponse asynchronously
  }
});