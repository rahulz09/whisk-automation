let isRunning = false;
let isPaused = false;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'startAutomation') {
    isRunning = true;
    isPaused = false;
    processPrompts(message.prompts, message.config);
  } else if (message.action === 'stopAutomation') {
    isRunning = false;
    isPaused = false;
  } else if (message.action === 'pauseAutomation') {
    isPaused = message.paused;
  }
});

async function processPrompts(prompts, config) {
  const existingFiles = new Set();
  
  for (let i = 0; i < prompts.length && isRunning; i++) {
    // Wait if paused
    while (isPaused && isRunning) {
      await sleep(500);
    }
    
    if (!isRunning) break;
    
    const prompt = prompts[i].trim();
    if (!prompt) continue;

    const filename = sanitizeFilename(prompt) + '.png';
    
    // Skip if already generated
    if (config.skipExisting && existingFiles.has(filename)) {
      continue;
    }

    chrome.runtime.sendMessage({
      action: 'progress',
      current: i + 1,
      total: prompts.length,
      prompt: prompt
    });

    let success = false;
    let attempts = 0;
    const maxAttempts = config.autoRetry ? 3 : 1;

    while (!success && attempts < maxAttempts && isRunning) {
      attempts++;
      
      if (attempts > 1) {
        chrome.runtime.sendMessage({
          action: 'retrying',
          prompt: prompt,
          attempt: attempts
        });
      }

      try {
        // Close any open dialogs
        const closeBtn = document.querySelector('[role="dialog"] button[aria-label*="close" i]');
        if (closeBtn) {
          closeBtn.click();
          await sleep(500);
        }

        // Find textarea
        const textarea = document.querySelector('textarea') || document.querySelector('input[type="text"]');
        if (!textarea) {
          throw new Error('Input field not found');
        }

        // Set prompt
        textarea.value = '';
        textarea.focus();
        await sleep(200);
        
        textarea.value = prompt;
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
        textarea.dispatchEvent(new Event('change', { bubbles: true }));
        
        await sleep(800);

        // Find generate button
        const buttons = Array.from(document.querySelectorAll('button'));
        const generateBtn = buttons.find(btn => {
          const text = btn.textContent.toLowerCase();
          const label = btn.getAttribute('aria-label')?.toLowerCase() || '';
          return text.includes('generate') || text.includes('create') || text.includes('remix') || 
                 label.includes('generate') || label.includes('create') || label.includes('remix');
        });
        
        if (generateBtn) {
          generateBtn.click();
        }
        
        await sleep(config.waitTime);

        // Find generated image
        const images = Array.from(document.querySelectorAll('img')).filter(img => 
          img.src && !img.src.includes('icon') && !img.src.includes('logo') && 
          img.naturalWidth > 100 && img.naturalHeight > 100
        );
        
        const generatedImage = images[images.length - 1];

        if (!generatedImage) {
          throw new Error('Generated image not found');
        }

        // Download image
        const blob = await fetchImageAsBlob(generatedImage.src);

        chrome.runtime.sendMessage({
          action: 'imageGenerated',
          filename: filename,
          blob: blob
        });

        existingFiles.add(filename);
        success = true;
        await sleep(1000);

      } catch (error) {
        if (attempts >= maxAttempts) {
          chrome.runtime.sendMessage({
            action: 'error',
            error: `${prompt}: ${error.message}`
          });
          break;
        }
        await sleep(2000);
      }
    }
    
    if (!success) break;
  }

  if (isRunning) {
    chrome.runtime.sendMessage({ action: 'complete' });
  }
  isRunning = false;
  isPaused = false;
}

async function fetchImageAsBlob(url) {
  const response = await fetch(url);
  return await response.blob();
}

function sanitizeFilename(text) {
  return text
    .substring(0, 50)
    .replace(/[^a-z0-9]/gi, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
