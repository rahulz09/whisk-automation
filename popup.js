let prompts = [];
let generatedImages = [];
let isPaused = false;

document.getElementById('fileInput').addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(event) {
      prompts = event.target.result.split('\n').filter(p => p.trim());
      document.getElementById('totalPrompts').textContent = prompts.length;
      showStatus(`✓ Loaded ${prompts.length} prompts`, 'success');
      document.getElementById('startBtn').disabled = false;
    };
    reader.readAsText(file);
  }
});

document.getElementById('startBtn').addEventListener('click', async () => {
  if (!prompts.length) {
    showStatus('⚠️ Please upload a .txt file first', 'error');
    return;
  }

  const config = {
    waitTime: parseInt(document.getElementById('waitTime').value) * 1000,
    autoRetry: document.getElementById('autoRetry').checked,
    skipExisting: document.getElementById('skipExisting').checked
  };

  document.getElementById('startBtn').disabled = true;
  document.getElementById('stopBtn').disabled = false;
  document.getElementById('pauseBtn').disabled = false;
  document.getElementById('downloadBtn').disabled = true;
  document.getElementById('progressBar').classList.add('visible');
  isPaused = false;
  generatedImages = [];
  document.getElementById('completedCount').textContent = '0';
  document.getElementById('downloadCount').textContent = '0';

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab.url.includes('labs.google')) {
      showStatus('⚠️ Please open Whisk page first: labs.google/fx/tools/whisk/project', 'error');
      document.getElementById('startBtn').disabled = false;
      document.getElementById('stopBtn').disabled = true;
      document.getElementById('pauseBtn').disabled = true;
      return;
    }
    
    chrome.tabs.sendMessage(tab.id, {
      action: 'startAutomation',
      prompts: prompts,
      config: config
    }, (response) => {
      if (chrome.runtime.lastError) {
        showStatus('❌ Error: Please refresh the Whisk page and try again', 'error');
        document.getElementById('startBtn').disabled = false;
        document.getElementById('stopBtn').disabled = true;
        document.getElementById('pauseBtn').disabled = true;
      }
    });
  } catch (error) {
    showStatus('❌ Error: ' + error.message, 'error');
    document.getElementById('startBtn').disabled = false;
    document.getElementById('stopBtn').disabled = true;
    document.getElementById('pauseBtn').disabled = true;
  }
});

document.getElementById('stopBtn').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.tabs.sendMessage(tab.id, { action: 'stopAutomation' });
  
  document.getElementById('startBtn').disabled = false;
  document.getElementById('stopBtn').disabled = true;
  document.getElementById('pauseBtn').disabled = true;
  document.getElementById('pauseBtn').textContent = '⏸️ Pause';
  showStatus('⏹️ Automation stopped', 'info');
});

document.getElementById('pauseBtn').addEventListener('click', async () => {
  isPaused = !isPaused;
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.tabs.sendMessage(tab.id, { action: 'pauseAutomation', paused: isPaused });
  
  document.getElementById('pauseBtn').textContent = isPaused ? '▶️ Resume' : '⏸️ Pause';
  showStatus(isPaused ? '⏸️ Paused' : '▶️ Resumed', 'info');
});

document.getElementById('downloadBtn').addEventListener('click', async () => {
  if (generatedImages.length === 0) {
    showStatus('No images to download', 'error');
    return;
  }

  showStatus('Creating ZIP file...', 'info');
  
  const zip = new JSZip();
  
  for (const img of generatedImages) {
    zip.file(img.filename, img.blob);
  }
  
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(zipBlob);
  
  chrome.downloads.download({
    url: url,
    filename: 'whisk_images.zip',
    saveAs: true
  });
  
  showStatus('ZIP file downloaded!', 'success');
});

chrome.runtime.onMessage.addListener(async (message) => {
  if (message.action === 'progress') {
    const percent = Math.round((message.current / message.total) * 100);
    document.getElementById('progressFill').style.width = percent + '%';
    document.getElementById('completedCount').textContent = message.current;
    showStatus(`⚙️ Processing ${message.current}/${message.total} - ${message.prompt.substring(0, 25)}...`, 'info');
  } else if (message.action === 'imageGenerated') {
    // Convert base64 to blob
    const response = await fetch(message.dataUrl);
    const blob = await response.blob();
    generatedImages.push({
      filename: message.filename,
      blob: blob
    });
    document.getElementById('downloadCount').textContent = generatedImages.length;
    showStatus(`✓ Saved: ${message.filename}`, 'success');
  } else if (message.action === 'retrying') {
    showStatus(`🔄 Retrying: ${message.prompt.substring(0, 25)}... (Attempt ${message.attempt}/3)`, 'info');
  } else if (message.action === 'complete') {
    document.getElementById('progressFill').style.width = '100%';
    showStatus(`🎉 Completed! Generated ${generatedImages.length} images`, 'success');
    document.getElementById('startBtn').disabled = false;
    document.getElementById('stopBtn').disabled = true;
    document.getElementById('pauseBtn').disabled = true;
    document.getElementById('pauseBtn').textContent = '⏸️ Pause';
    document.getElementById('downloadBtn').disabled = false;
  } else if (message.action === 'error') {
    showStatus(`❌ Error: ${message.error}`, 'error');
    document.getElementById('startBtn').disabled = false;
    document.getElementById('stopBtn').disabled = true;
    document.getElementById('pauseBtn').disabled = true;
    document.getElementById('pauseBtn').textContent = '⏸️ Pause';
    if (generatedImages.length > 0) {
      document.getElementById('downloadBtn').disabled = false;
    }
  }
});

function showStatus(text, type) {
  const status = document.getElementById('status');
  status.textContent = text;
  status.className = type + ' visible';
}
