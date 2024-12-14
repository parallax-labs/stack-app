fetch(chrome.runtime.getURL('dist/.vite/manifest.json'))
  .then(response => response.json())
  .then(manifest => {
    console.log(manifest);
    const entry = manifest['sidebar/main.ts'];
    if (entry && entry.file) {
      const script = document.createElement('script');
      script.type = 'module';
      script.src = chrome.runtime.getURL(`dist/${entry.file}`);
      document.body.appendChild(script);
    } else {
      console.error('Sidebar entry not found in manifest:', manifest);
    }
  })
  .catch(error => console.error('Failed to load manifest:', error));
