document.addEventListener('DOMContentLoaded', function() {
  // Get DOM elements
  const statusDiv = document.getElementById('status');
  const proxyHostInput = document.getElementById('proxyHost');
  const proxyPortInput = document.getElementById('proxyPort');
  const applyProxyBtn = document.getElementById('applyProxy');
  const disableProxyBtn = document.getElementById('disableProxy');

  // Load saved settings
  chrome.storage.local.get(['proxyHost', 'proxyPort'], function(result) {
    if (result.proxyHost) proxyHostInput.value = result.proxyHost;
    if (result.proxyPort) proxyPortInput.value = result.proxyPort;
  });

  // Check current proxy status
  chrome.proxy.settings.get(
    { incognito: false },
    function(config) {
      if (config.value.mode === "fixed_servers") {
        statusDiv.textContent = "Status: Connected";
        statusDiv.style.color = "#00ffff";
      } else {
        statusDiv.textContent = "Status: Disconnected";
        statusDiv.style.color = "rgba(255, 255, 255, 0.6)";
      }
    }
  );

  // Apply proxy settings
  applyProxyBtn.addEventListener('click', function() {
    const proxyHost = proxyHostInput.value;
    const proxyPort = proxyPortInput.value;

    if (!proxyHost || !proxyPort) {
      statusDiv.textContent = "Status: Please fill in all fields";
      statusDiv.style.color = "#ff3366";
      return;
    }

    // Save settings
    chrome.storage.local.set({
      proxyHost: proxyHost,
      proxyPort: proxyPort
    });

    statusDiv.textContent = "Status: Connecting...";
    statusDiv.style.color = "#00ffff";

    // Send message to background script and handle response
    chrome.runtime.sendMessage({
      type: 'setProxy',
      config: {
        host: proxyHost,
        port: proxyPort
      }
    }, function(response) {
      if (response && response.success) {
        statusDiv.textContent = "Status: Connected";
        statusDiv.style.color = "#00ffff";
      } else {
        statusDiv.textContent = "Status: Connection failed" + (response.error ? ` - ${response.error}` : '');
        statusDiv.style.color = "#ff3366";
      }
    });
  });

  // Disable proxy
  disableProxyBtn.addEventListener('click', function() {
    statusDiv.textContent = "Status: Disconnecting...";
    chrome.runtime.sendMessage({ type: 'disableProxy' }, function(response) {
      if (response && response.success) {
        statusDiv.textContent = "Status: Disconnected";
        statusDiv.style.color = "rgba(255, 255, 255, 0.6)";
      } else {
        statusDiv.textContent = "Status: Error disconnecting" + (response.error ? ` - ${response.error}` : '');
        statusDiv.style.color = "#ff3366";
      }
    });
  });
});