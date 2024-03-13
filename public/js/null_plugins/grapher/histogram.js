import Grapher from 'grapher';

class Graph {
    static canCollapse() {
        return false;
    }

    static name() {
        return null;
    }

    static className() {
        return null;
    }

    static dataName(_props) {
        return null;
    }
}

export default Grapher(Graph);
