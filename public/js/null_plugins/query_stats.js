import React from 'react';

class QueryStats extends React.Component{
    render () {}

    componentDidUpdate() {
      console.log("Query stats:", this.props)
    }
}

export default QueryStats;