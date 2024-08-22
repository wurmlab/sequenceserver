import Histogram from 'histogram';
import chroma from 'chroma-js';

class ReportPlugins {
    constructor(parent) {
        this.parent = parent;
    }

    init(_callback) {
    }


    queryResult(_query) {
        return null;
    }

    generateStats() {
        return (<Histogram />);
    }
}

export default ReportPlugins;
