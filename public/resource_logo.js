function add_logo(dataset_metadata) {
    var homepage_url = dataset_metadata["metadata"]["homepage_url"];
    var logo_url = dataset_metadata["metadata"]["logo_url"];
    var logo_element = document.createElement("a");
    logo_element.setAttribute("id", "resource_logo_a");
    logo_element.setAttribute("class", "navbar-brand");
    logo_element.setAttribute("href", homepage_url);
    logo_element.setAttribute("target", "_blank");

    header = document.getElementById("header");
    header.insertBefore(logo_element, header.children[0]);

    var image_element = document.createElement("img");
    image_element.setAttribute("id", "resource_logo");
    image_element.setAttribute("class", "logo");
    image_element.setAttribute("src", logo_url);
    image_element.setAttribute("alt", "sequenceserver_logo");
    
    resource_log_a = document.getElementById("resource_logo_a");
    resource_log_a.appendChild(image_element);
}

var base_url = window.location.protocol + "//" + window.location.host;
var segments = window.location.pathname.split('/');
segments = segments.filter(function(str) { return str !== ""; });
var url_parts = [base_url, "blast", "environments"]
url_parts.push(segments[1] + "/" + segments[2] + "/" + "environment.json");
var url = url_parts.join("/");

fetch(url)
    .then((response) => response.json())
    .then((json) => add_logo(json));

