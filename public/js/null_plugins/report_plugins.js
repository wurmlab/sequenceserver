import Histogram from 'histogram';
import chroma from 'chroma-js';

class ReportPlugins {
    constructor(parent) {
        this.parent = parent;
    }

    init() {
    }

    componentDidUpdate(_prevProps, _prevState) {
    }

    queryResults(_query) {
        return [];
    }

    generateStats() {
        return (<Histogram />);
    }
}

export default ReportPlugins;
