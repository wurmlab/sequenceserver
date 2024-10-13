import ReportHeader from './report_header';
import _ from 'underscore';

const RunSummary = (props) => {
    const renderContent = () => {
        return (
            <div className="overview mr-0 mb-0">
                <p className="m-0 text-sm">
                    <strong>SequenceServer {props.seqserv_version}</strong> using{' '}
                    <strong>{props.program_version}</strong>
                    {props.submitted_at &&
                        `, query submitted on ${props.submitted_at}`}
                </p>
                <p className="m-0 text-sm">
                    <strong> Databases: </strong>
                    {props.querydb
                        .map((db) => {
                            return db.title;
                        })
                        .join(', ')}{' '}
                    ({props.stats.nsequences} sequences,&nbsp;
                    {props.stats.ncharacters} characters)
                </p>
                <p className="m-0 text-sm">
                    <strong>Parameters: </strong>{' '}
                    {_.map(props.params, function (val, key) {
                        return key + ' ' + val;
                    }).join(', ')}
                </p>
                <p className="m-0 text-sm">
                    Please cite:{' '}
                    <a href="https://doi.org/10.1093/molbev/msz185" className="text-seqblue hover:text-seqorange">
                        https://doi.org/10.1093/molbev/msz185
                    </a>
                </p>
            </div>
        );
    };

    return <ReportHeader name="Run Summary" renderContent={renderContent} />;
};

export default RunSummary;
