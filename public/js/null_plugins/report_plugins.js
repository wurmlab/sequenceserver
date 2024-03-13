import Histogram from 'histogram';

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
        return (<Histogram />)
    }
}

export default ReportPlugins;
