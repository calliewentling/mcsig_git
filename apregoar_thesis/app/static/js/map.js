//// Initialize loader ////
const spinner = document.getElementById("spinner");

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
if (closer) {
    closer.onclick = function () {
        overlay.setPosition(undefined);
        closer.blur();
        return false;
    };
}


/**
 * Renders a progress bar.
 * @param {HTMLElement} el The target element.
 * @class
 */
function Progress(el) {
this.el = el;
this.loading = 0;
this.loaded = 0;
}

/**
 * Increment the count of loading tiles.
 */
Progress.prototype.addLoading = function () {
if (this.loading === 0) {
    this.show();
}
++this.loading;
this.update();
};

/**
 * Increment the count of loaded tiles.
 */
Progress.prototype.addLoaded = function () {
const this_ = this;
setTimeout(function () {
    ++this_.loaded;
    this_.update();
}, 100);
};

/**
 * Update the progress bar.
 */
Progress.prototype.update = function () {
const width = ((this.loaded / this.loading) * 100).toFixed(1) + '%';
this.el.style.width = width;
if (this.loading === this.loaded) {
    this.loading = 0;
    this.loaded = 0;
    const this_ = this;
    setTimeout(function () {
    this_.hide();
    }, 500);
}
};

/**
 * Show the progress bar.
 */
Progress.prototype.show = function () {
this.el.style.visibility = 'visible';
};

/**
 * Hide the progress bar.
 */
Progress.prototype.hide = function () {
if (this.loading === this.loaded) {
    this.el.style.visibility = 'hidden';
    this.el.style.width = 0;
}
};

const progress = new Progress(document.getElementById('progress'));
  


 
const key = 'Jf5RHqVf6hGLR1BLCZRY';
const attributions =
    '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> ' +
    '<a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>';
 


//Styling layers
const styleStory = [
    new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: 'red',
            width: '3',
        }),
        fill: new ol.style.Fill({
            color: 'red',
        }),
    }),
];


//Generic Map Setup
const view = new ol.View({
    projection: 'EPSG:4326',
    center: [-9.150404956762742,38.72493479806579],
    zoom: 12
});


 
var map = new ol.Map({
    layers: [
        new ol.layer.Tile({
            source: new ol.source.OSM()
        })
    ],
    overlays: [overlay],
    target: 'map',
    view: view,
});




// Add Story shapes

const wmsSourceStory = new ol.source.ImageWMS({
    url: 'http://localhost:8080/geoserver/apregoar/wms',
    /*params: {"LAYERS":"apregoar:geonoticias"},*/ //OG
    params: {"LAYERS":"apregoar:geonoticias",
        "cql_filter":mapStoryFilter}, //Set on each individual page
    serverType: 'geoserver',
    crossOrigin: 'anonymous',
});
const wmsLayerStory = new ol.layer.Image({
    source: wmsSourceStory,
    style: styleStory,
});
wmsLayerStory.setOpacity(0.7);
map.addLayer(wmsLayerStory);
console.log("Story instances added");

//Progress bar
wmsSourceStory.on('imageloadstart', function () {
    progress.addLoading();
});

wmsSourceStory.on('imageloadend', function() {
    progress.addLoaded();
});

wmsSourceStory.on('imageloaderror', function() {
    progress.addLoaded();
})

//Zoom to instances
const vectorSource = new ol.source.Vector();
spinner.removeAttribute('hidden');
var wfs_url = 'http://localhost:8080/geoserver/wfs?service=wfs&version=2.0.0&request=GetFeature&typeNames=apregoar:geonoticias&cql_filter='+mapStoryFilter+'&outputFormat=application/json';
fetch(wfs_url).then(function (response) {
    json = response.json();
    console.log("JSON: ",json);
    return json;
})
.then(function (json) {
    const features = new ol.format.GeoJSON().readFeatures(json);
    console.log("Features: ",features);
    if (features[0]["A"]["st_astext"]) {
        console.log("Arrival to add features and future zoom")
        vectorSource.addFeatures(features);
        layerExtent = vectorSource.getExtent();
        map.getView().fit(ol.extent.buffer(layerExtent, .01)); //What does this number mean??
        spinner.setAttribute('hidden', '');
    }   
});
///

/**
* Add a click handler to the map to render the popup
*/

map.on('singleclick', function (evt) {
    const coordinate = evt.coordinate;
    const hdms = ol.coordinate.toStringHDMS(ol.proj.toLonLat(coordinate));
 
    //document.getElementById('info').innerHTML = '';
    const viewResolution = /** @type {number} */ (view.getResolution());
    const url = wmsSourceStory.getFeatureInfoUrl(
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
                    pubDate = new Date(features[f].properties.pub_date);
                    webLink = features[f].properties.web_link;
                    section = features[f].properties.section;
                    tags = features[f].properties.tags;
                    author = features[f].properties.author;
                    publication = features[f].properties.publication;

                    /* Preparing instance info */
                    iID = features[f].properties.i_id;
                    tBegin = new Date(features[f].properties.t_begin);
                    tEnd = new Date(features[f].properties.t_end);
                    //console.log("tBegin type: "+typeof(tBegin)+', value: '+tBegin);
                    tType = features[f].properties.t_type;
                    tDesc = features[f].properties.t_desc;
                    pDesc = features[f].properties.p_desc;
                    pID = features[f].properties.p_id;
                    pName = features[f].properties.p_name;
                    pGeom = features[f].properties.geom;

                    /* Publisher: All Stories Popup */
                    var storyBlock = 
                        '<h3>' + title + '</h3>' +
                        '<em>' + pubDate.toDateString() + '</em>'+
                        '<p> <b>' + section + '</b>' + tags + '</p>' +  
                        '<a href="' + webLink +'"> Not??cia </a>';
                    
                    /* Publisher: Story Review Popup */
                    var instanceBlock = 
                        '<h3>' + pName + '</h3>' +
                        '<p>'+pDesc+'</p>' +
                        '<em> <p>'+tBegin.toDateString()+' - '+tEnd.toDateString()+'</p>'+
                        '<p>'+tDesc+'</p></em>';
                    

                    if (docTitle === "Review") {
                        console.log("In Review if");
                        console.log("docTitle: "+docTitle);
                        instContent.innerHTML = instanceBlock;
                        notpop.innerHTML = instanceBlock;
                    } else if (docTitle === "Dashboard") {
                        console.log("In DASHBOARD if");
                        console.log("docTitle: "+docTitle);
                        storyContent.innerHTML = storyBlock;
                    } else if (docTitle === "Localize"){
                        console.log("In LOCALIZE if docTitle: "+docTitle);
                    } else {
                        console.log("In else");
                        console.log("docTitle: "+docTitle);
                        if (storyContent) {
                            storyContent.innerHTML = storyBlock;
                        }
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