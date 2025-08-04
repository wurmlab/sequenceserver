import React from 'react';

const LoadingBlast = () => {
    const isCloudEnv = process.env.targetEnv === 'cloud';

    return (
        <div className="grid grid-cols-6 gap-4">
            <div className="col-start-1 col-end-7 text-center pt-3">
                <h1 className="mb-8 text-4xl">
                    <i className="fa fa-cog fa-spin"></i>&nbsp; BLAST-ing
                </h1>
                <div className="mb-5 w-full">
                    <p className="m-auto w-full md:w-6/12 text-sm">
                        This can take some time depending on the size of your query and database(s). The page will update automatically when BLAST is done.
                    </p>
                </div>
                <p className="mb-9 text-sm">
                    You can bookmark the page and come back to it later or share the link with someone.
                </p>
                <p className="text-sm">
                    {isCloudEnv && (
                        <b>
                            If the job takes more than 10 minutes to complete, we will send you an email upon completion.
                        </b>
                    )}
                </p>
            </div>
        </div>
    );
};

export default LoadingBlast;
