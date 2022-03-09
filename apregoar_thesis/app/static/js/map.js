/**
* Elements that make up the popup.
*/
var docTitle = document.title;
console.log(docTitle);
const container = document.getElementById('popup');
const storyContent = document.getElementById('popup-story');
const instContent = document.getElementById('popup-instances');
const closer = document.getElementById('popup-closer');
const notpop = document.getElementById('info');
 
/**
* Create an overlay to anchor the popup to the map.
*/
const overlay = new ol.Overlay({
    element: container,
    autoPan: true,
    autoPanAnimation: {
        duration: 250,
    },
});
 
/**
* Add a click handler to hide the popup.
* @return {boolean} Don't follow the href.
*/
closer.onclick = function () {
    overlay.setPosition(undefined);
    closer.blur();
    return false;
};
 
const key = 'Jf5RHqVf6hGLR1BLCZRY';
const attributions =
    '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> ' +
    '<a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>';
 
const wmsSource = new ol.source.ImageWMS({
    url: 'http://localhost:8080/geoserver/apregoar/wms',
    /*params: {"LAYERS":"apregoar:geonoticias"},*/ //OG
    params: {"LAYERS":"apregoar:geonoticias",
        "cql_filter":mapFilter}, //test
    serverType: 'geoserver',
    crossOrigin: 'anonymous',
});
 
const wmsLayer = new ol.layer.Image({
    source: wmsSource,
});
 
const view = new ol.View({
    projection: 'EPSG:4326',
    center: [-9.150404956762742,38.72493479806579],
    zoom: 12
});
 
const map = new ol.Map({
    layers: [
        new ol.layer.Tile({
            source: new ol.source.OSM()
        })
    ],
    overlays: [overlay],
    target: 'map',
    view: view,
   });
 
wmsLayer.setOpacity(0.7)
map.addLayer(wmsLayer);
 
 
 
/**
* Add a click handler to the map to render the popup
*/
map.on('singleclick', function (evt) {
    const coordinate = evt.coordinate;
    const hdms = ol.coordinate.toStringHDMS(ol.proj.toLonLat(coordinate));
 
    document.getElementById('info').innerHTML = '';
    const viewResolution = /** @type {number} */ (view.getResolution());
    const url = wmsSource.getFeatureInfoUrl(
        evt.coordinate,
        viewResolution,
        'EPSG:4326',
        {'INFO_FORMAT': 'application/json'}
    );
 
 
 
    if (url) {
        fetch(url)
        .then((response) => response.text())
        .then((data) => {
            var features = [];
            var title = [];
            var webLink =[];
            var message = [];
            var pName = [];
            var pDesc = [];
            var tBegin = [];
            var tEnd = [];
            var tDesc = [];
            console.log(data);
            var geonoticia = JSON.parse(data);
            if (geonoticia.numberReturned > 0) {
                features = geonoticia.features;
                console.log("Features:")
                console.log(features);
                // for (let f=0; f < features.lenght; f++) {
                for (let f = 0; f < 1; f++) {
                    /* Preparing story info */
                    sID = features[f].properties.s_id;
                    title = features[f].properties.title;
                    summary = features[f].properties.summary;
                    pubDate = features[f].properties.pub_date;
                    webLink = features[f].properties.web_link;
                    section = features[f].properties.section;
                    tags = features[f].properties.tags;
                    author = features[f].properties.author;
                    publication = features[f].properties.publication;

                    /* Preparing instance info */
                    iID = features[f].properties.i_id;
                    tBegin = features[f].properties.t_begin;
                    tEnd = features[f].properties.t_end;
                    tType = features[f].properties.t_type;
                    tDesc = features[f].properties.t_desc;
                    pDesc = features[f].properties.p_desc;
                    pID = features[f].properties.p_id;
                    pName = features[f].properties.p_name;
                    pGeom = features[f].properties.geom;

                    /* Publisher: All Stories Popup */
                    var storyBlock = '<h3>' + title + '</h3>' +
                    '<a href="' + webLink +'"> Notícia </a>';
                    

                    /* Publisher: Story Review Popup */
                    var instanceBlock = '<h3>' + pName + '</h3> <p>'+tBegin+' - '+tEnd+'<p>';
                    instContent.innerHTML = instanceBlock;
                    notpop.innerHTML = instanceBlock; 

                    if (docTitle === "Review") {
                        instContent.innerHTML = instanceBlock;
                        notpop.innerHTML = instanceBlock;
                    } else if (docTitle === "Dashboard") {
                        storyContent.innerHTML = storyBlock;
                    } else {
                        storyContent.innerHTML = storyBlock;
                    }

                    /* Set Position */
                    overlay.setPosition(coordinate);
                }
            }else{
                overlay.setPosition(undefined);
            }
        });
    }
});