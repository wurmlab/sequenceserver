import ReportHeader from './report_header';
import Hits from '../hits';

const AlignmentResults = (props) => {
    const renderContent = () => (
        <div>
            {props.state.results}
            <Hits
                {...props}
                componentFinishedUpdating={(_) => props.componentFinishedUpdating(_)}
            />
        </div>
    );

    return <ReportHeader name="Alignment Results" renderContent={renderContent} />;
};

export default AlignmentResults;
