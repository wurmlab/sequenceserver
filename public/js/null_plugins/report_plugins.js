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
      return (
        <div className="histogram-container">
          <Histogram query="evalue" label-type="E-Value Distribution" />
        </div>
      );
    }
}

export default ReportPlugins;
