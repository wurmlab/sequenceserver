const fetchResults = (callback, errCallback) => {
    const path = location.pathname + '.json' + location.search;
    pollPeriodically(path, callback, errCallback);
};

const pollPeriodically = (path, callback, errCallback) => {
    var intervals = [200, 400, 800, 1200, 2000, 3000, 5000];
    function poll() {
        fetch(path)
            .then(response => {
                // Handle HTTP status codes
                if (!response.ok) throw response;

                return response.text().then(data => {
                    if (data) {
                        data = parseJSON(data);
                    };
                    console.log({status: response.status, data});
                    return { status: response.status, data }
                });
            })
            .then(({ status, data }) => {
                switch (status) {
                    case 202:
                        var interval;
                        if (intervals.length === 1) {
                            interval = intervals[0];
                        } else {
                            interval = intervals.shift();
                        }
                        setTimeout(poll, interval);
                        break;
                    case 200:
                        console.log('.then2', data);
                        callback(data);
                        break;
                }
            })
            .catch(error => {
                if (error.text) {
                    error.text().then(errData => {
                        errData = parseJSON(errData);
                        switch (error.status) {
                            case 400:
                            case 422:
                            case 500:
                                console.log('.catch', errData, errCallback);
                                errCallback(errData);
                                break;
                            default:
                                console.error("Unhandled error:", error.status);
                        }
                    });
                } else {
                    console.error("Network error:", error);
                }
            });
    }


    function parseJSON(str) {
        let parsedJson = str;
        try {
            parsedJson = JSON.parse(str);
        } catch (e) {
            console.error("Error parsing JSON:", e);
        }

        return parsedJson;
    }
    poll();
}

export default fetchResults;
