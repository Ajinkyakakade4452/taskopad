/**
 * Utility for opening and previewing task attachment documents reliably.
 */
export const openDocument = (docUrl: string, fileName?: string) => {
  if (!docUrl) {
    alert('No document URL or path available to open.');
    return;
  }

  const cleanUrl = docUrl.trim();
  const titleName = fileName || cleanUrl.split('/').pop() || 'document';

  // Normalize legacy hardcoded localhost:8081 URLs to current origin
  let targetUrl = cleanUrl;
  if (targetUrl.includes('localhost:8081')) {
    targetUrl = targetUrl.replace(/^https?:\/\/localhost:8081/, '');
  }
  if (targetUrl.startsWith('uploads/')) {
    targetUrl = '/' + targetUrl;
  }

  // 1. Data URLs, Blob URLs, and Full HTTP/HTTPS URLs
  if (targetUrl.startsWith('data:') || targetUrl.startsWith('blob:') || targetUrl.startsWith('http://') || targetUrl.startsWith('https://')) {
    try {
      const win = window.open(targetUrl, '_blank');
      if (!win) {
        // If pop-up is blocked by browser, fallback to anchor tag click
        const link = document.createElement('a');
        link.href = targetUrl;
        link.target = '_blank';
        link.download = titleName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch {
      // Fallback anchor tag download
      const link = document.createElement('a');
      link.href = targetUrl;
      link.target = '_blank';
      link.download = titleName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    return;
  }

  // 2. Relative URLs starting with '/'
  if (targetUrl.startsWith('/')) {
    const fullUrl = window.location.origin + targetUrl;
    window.open(fullUrl, '_blank');
    return;
  }

  // 3. Plain filenames or mock strings (e.g. "spec_doc_v1.pdf", "invoice.png")
  // Generate an interactive HTML preview page so admin/user can view document details & download
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Document Viewer - ${titleName}</title>
        <meta charset="utf-8" />
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background: #0D1631;
            color: #E2E8F0;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            padding: 20px;
          }
          .card {
            background: #141C38;
            border: 1px solid #1E293B;
            border-radius: 16px;
            padding: 32px;
            max-width: 550px;
            width: 100%;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
            text-align: center;
          }
          .icon {
            width: 64px;
            height: 64px;
            background: rgba(6, 182, 212, 0.1);
            color: #06B6D4;
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 20px;
            font-size: 28px;
          }
          h1 { font-size: 20px; margin: 0 0 8px; color: #F8FAFC; word-break: break-all; }
          p { font-size: 13px; color: #94A3B8; margin: 0 0 24px; }
          .details {
            background: rgba(15, 23, 42, 0.6);
            border: 1px solid rgba(255, 255, 255, 0.05);
            border-radius: 12px;
            padding: 16px;
            text-align: left;
            font-family: monospace;
            font-size: 12px;
            color: #CBD5E1;
            margin-bottom: 24px;
            word-break: break-all;
          }
          .btn {
            display: inline-block;
            background: linear-gradient(135deg, #06B6D4, #2563EB);
            color: #030712;
            font-weight: 700;
            font-size: 13px;
            padding: 12px 24px;
            border-radius: 12px;
            text-decoration: none;
            cursor: pointer;
            transition: opacity 0.2s;
          }
          .btn:hover { opacity: 0.9; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="icon">📄</div>
          <h1>${titleName}</h1>
          <p>Attached Task Document</p>
          <div class="details">
            <div><strong>Filename:</strong> ${titleName}</div>
            <div style="margin-top:6px;"><strong>File Path / Ref:</strong> ${cleanUrl}</div>
            <div style="margin-top:6px;"><strong>Status:</strong> Ready</div>
          </div>
          <a class="btn" id="downloadBtn">Download Document File</a>
        </div>
        <script>
          document.getElementById('downloadBtn').addEventListener('click', function() {
            const content = "Attachment Document Content for: ${titleName}\\nRef: ${cleanUrl}\\nGenerated on: " + new Date().toLocaleString();
            const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = "${titleName.endsWith('.txt') || titleName.includes('.') ? titleName : titleName + '.txt'}";
            link.click();
          });
        </script>
      </body>
    </html>
  `;

  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const blobUrl = URL.createObjectURL(blob);
  const win = window.open(blobUrl, '_blank');
  if (!win) {
    const link = document.createElement('a');
    link.href = blobUrl;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

/**
 * Reads a File object as Data URL so attached files persist & open reliably.
 */
export const readFileAsDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};
