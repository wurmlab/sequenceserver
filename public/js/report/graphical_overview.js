import Circos from '../circos';
import ReportHeader from './report_header';

const GraphicalOverview = ({queries, program, plugins, path}) => {
    /**
    * Does the report have at least two hits? This is used to determine
    * whether Circos should be enabled or not.
    */
    const atLeastTwoHits = () => {
        let hitNum = 0;
        return queries.some((query) => {
            hitNum += query.hits.length;
            return hitNum > 1;
        });
    }

    const renderContent = () => {
        if(!atLeastTwoHits()) return null;

        return (
            <>
                <Circos queries={queries} program={program} />
                {plugins.generateStats(queries)}
            </>
        )
    }

    return (
        <ReportHeader name="Graphical Overview" path={path} renderContent={renderContent} renderable={atLeastTwoHits()} />
    )
}

export default GraphicalOverview;
