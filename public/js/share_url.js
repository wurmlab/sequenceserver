import React, { useState } from 'react';
import asMailtoHref from './mailto';

const ShareURLComponent = ({ querydb, program, queryLength, url }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
  };

  return (
    <div className="share-url-component">
      <input name="shareableUrl" type="text" value={url} readOnly />
      <div className="actions">
        <button className="btn btn-primary" onClick={copyToClipboard}>{copied ? 'Copied!' : 'Copy to Clipboard'}</button>
        <a href={asMailtoHref(querydb, program, queryLength, url, true)}>Share via email</a>
      </div>
    </div>
  );
};

export default ShareURLComponent;