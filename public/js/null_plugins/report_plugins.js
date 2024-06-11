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
        var colors = chroma.scale('RdYlBu').colors(1);
        return (
          <div className='histogram-container'>
            <Histogram query="evalue" name="E-Value Distribution" color={colors[0]} />
          </div>
        );
    }
}

export default ReportPlugins;
