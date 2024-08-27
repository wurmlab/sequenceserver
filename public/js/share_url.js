import { useState } from 'react';
import asMailtoHref from './mailto';

const ShareURLComponent = ({ querydb, program, queryLength, url }) => {
    const [copied, setCopied] = useState(false);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(url);
        setCopied(true);
    };

    return (
        <div className="share-url-component">
            <input className="w-full" name="shareableUrl" type="text" value={url} readOnly />
            <div className="py-4 flex justify-between">
                <button className="py-2 px-3 border border-transparent rounded-md shadow-sm text-white bg-seqblue hover:bg-seqorange focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-seqorange" onClick={copyToClipboard}>{copied ? 'Copied!' : 'Copy to Clipboard'}</button>
                <a href={asMailtoHref(querydb, program, queryLength, url, true)}>Share via email</a>
            </div>
        </div>
    );
};

export default ShareURLComponent;