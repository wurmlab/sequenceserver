import React from 'react';

const WarningBlast = ({ downloadLinks = [] }) => {
    return (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-6 gap-4">
                <div className="col-start-1 col-end-7 text-center">
                    <h1 className="mb-4 text-4xl">
                        <i className="fa fa-exclamation-triangle"></i>&nbsp; Warning
                    </h1>
                    <p className="mb-2">
                        The BLAST result might be too large to load in the browser. If you have a powerful machine you can try loading the results anyway. Otherwise, you can download the results and view them locally.
                    </p>
                    <p className="mb-2 space-x-2">
                        {downloadLinks.map((link, index) => (
                            <a
                                href={link.url}
                                className="btn btn-secondary"
                                key={`download_link_${index}`}
                            >
                                {link.name}
                            </a>
                        ))}
                    </p>
                    <p>
                        <a
                            href={location.pathname + '?bypass_file_size_warning=true'}
                            className="py-2 px-3 border border-transparent rounded-md shadow-sm text-white bg-seqblue hover:bg-seqorange focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-seqorange"
                        >
                            View results in browser anyway
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default WarningBlast;
