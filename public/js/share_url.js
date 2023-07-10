import React, { useState } from 'react';

const ShareURLComponent = ({ url }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
  };

  return (
    <div className="share-url-component">
      <input type="text" value={url} readOnly />
      <div className="actions">
        <button className="btn btn-primary" onClick={copyToClipboard}>{copied ? 'Copied!' : 'Copy to Clipboard'}</button>
        <a href={`mailto:?subject=SequenceServer result&body=${encodeURIComponent(url)}`}>Share via email</a>
      </div>
    </div>
  );
};

export default ShareURLComponent;