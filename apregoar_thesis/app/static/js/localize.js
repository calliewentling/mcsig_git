//// Initialize loader ////
const spinner = document.getElementById("spinner");

    
    
///// Initialize map loader //////
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


////// MAP INITIALIZATION //////
//Generic Map Setup
const viewGaz = new ol.View({
    projection: 'EPSG:4326',
    center: [-9.150404956762742,38.72493479806579],
    zoom: 12
});
 


var styleJson = 'https://api.maptiler.com/maps/3b03922e-4557-48cb-9428-624bbbc242fb/style.json?key=DoqRHLdjG2tKhuJx9x3L';
const mapGaz = new ol.Map({
    layers: [
        new ol.layer.Tile({
            source: new ol.source.OSM()
        })
    ],
    target: 'map',
    view: viewGaz,
});
//olms.apply(mapGaz,styleJson);


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
});
wmsLayerStory.setOpacity(0.7);
mapGaz.addLayer(wmsLayerStory);
console.log("Story instances added");

//Progress bar
wmsSourceStory.on('imageloadstart', function () {
    progress.addLoading();
});

wmsSourceStory.on('imageloadend', function () {
    progress.addLoaded();
});
wmsSourceStory.on('imageloaderror', function () {
    progress.addLoaded();
});

//General Zoom Function
let layerExtent;
function zoomGaz(vectorSource){
    console.log("layerExtent (in zoomGaz): ",vectorSource.getExtent());
    var layerExtent = ol.extent.extend(sourceNominatimPoly.getExtent(),vectorSource.getExtent());
    //var layerExtent = vectorSource.getExtent();
    mapGaz.getView().fit(ol.extent.buffer(layerExtent, .01)); //What does this number mean??
    return layerExtent;
}

//Zoom to Story instances (already associated)
const vectorSourceStories = new ol.source.Vector();
var wfs_url_story = 'http://localhost:8080/geoserver/wfs?service=wfs&version=2.0.0&request=GetFeature&typeNames=apregoar:geonoticias&cql_filter='+mapStoryFilter+'&outputFormat=application/json';
fetch(wfs_url_story).then(function (response) {
    jsonS = response.json();
    console.log("JSON: ",jsonS);
    return jsonS;
})
.then(function (jsonS) {
    const featuresS = new ol.format.GeoJSON().readFeatures(jsonS);
    console.log("Features: ",featuresS);
    if (featuresS[0]["A"]["st_astext"]) {
        vectorSourceStories.addFeatures(featuresS);
        layerExtent = zoomGaz(vectorSource = vectorSourceStories);
    }
    spinner.setAttribute('hidden', '');
    return vectorSourceStories;
    //layerExtent = vectorSource.getExtent();
    //map.getView().fit(ol.extent.buffer(layerExtent, .01)); //What does this number mean??
});

//DEFINE LOCALIZATION TOTALS
let tGaz = 0;
let uGaz = 0;
let eGaz = 0;
let gazL = 0;

//// Preparation for map interaction ///
let snapDraw, drawDraw, modifyDraw; //
var typeSelect = document.getElementById('type');
const drawSource = new ol.source.Vector();
const drawVector = new ol.layer.Vector({
    source: drawSource,
    style: new ol.style.Style({
        fill: new ol.style.Fill({
            color: 'rgba(255,255,255,0.2)',
        }),
        stroke: new ol.style.Stroke({
            color: '#ff3333',
            width: 2,
        }),
        image: new ol.style.Circle({
            radius: 7,
            fill: new ol.style.Fill({
                color: '#ff3333',
            }),
        }),
    }),
});     
mapGaz.addLayer(drawVector);



///// Preparation for select and delete /////////
let selectedF;
var featureID = 0;
let select= null; //select and delete
const selectSingleClick = new ol.interaction.Select();
const selectClick = new ol.interaction.Select({
    condition: ol.events.condition.click,
});
const selectPointerMove = new ol.interaction.Select({
    condition: ol.events.condition.pointerMove,
});
const selectAltClick = new ol.interaction.Select({
    condition: function (mapBrowserEvent){
        return click(mapBrowserEvent) && ol.events.condition.altKeyOnly(mapBrowserEvent);
    },
});
const selectElement = document.getElementById('clickType');
const deleteButton = document.getElementById("deletedFeatures");
const changeInteraction = function() {
    if (select !== null) {
        mapGaz.removeInteraction(selectClick);
    }
    const valueClick = selectElement.value;
    if (valueClick == 'singleclick'){
        select = selectSingleClick;
    } else if (valueClick == 'click') {
        select  = selectClick;
    } else if (valueClick == 'pointermove') {
        select = selectPointerMove;
    } else if (valueClick == 'altclick') {
        select = selectAltClick;
    } else {
        select = null;
    }
    if (select !== null) {
        mapGaz.addInteraction(selectClick);
        select.on('select', function (e) {
            var numFeatures = e.target.getFeatures().getLength();            
            console.log(numFeatures,' selected features (last operation selected ',e.selected.length,' and deselected ',e.deselected.length,' features.');
        });
    }
};
selectElement.onchange = changeInteraction;
changeInteraction();



///// TOGGLE TO UGAZ /////////////
//Toggle Map Views (using existing gaz vs. design new place)
function toggleLocalization(){
    //Get the checkbox
    var tswitch = document.getElementById("tswitch");
    //Get output text //
    var newUgaz = document.getElementById("newUgaz");
    var eGazMap = document.getElementById("eGazMap");
    var toggleMode = document.getElementById("toggleMode");
    var poiGaz = document.getElementById("poiGaz");
    var poiNominatim = document.getElementById("poiNominatim");
    //If the checkbox is checked, display the output text
    if (tswitch.checked == true){
        console.log("CREATE NEW UGAZ MODE");
        toggleMode.innerHTML = "Desenhar localização";
        poiGaz.style.display = "block";
        poiNominatim.style.display = "block";
        //Draw new areas on the map
        const modifyDraw = new ol.interaction.Modify({
            source: drawSource,
        });
        mapGaz.addInteraction(modifyDraw);
        function addInteractions() {
            drawDraw = new ol.interaction.Draw({
                source: drawSource,
                type: "Polygon"
            });
            drawDraw.on('drawend',function(event) {
                featureID = featureID + 1;
                event.feature.setProperties({
                    'id': featureID
                })
            })
            mapGaz.addInteraction(drawDraw);
            snapDraw = new ol.interaction.Snap({source: drawSource});
            mapGaz.addInteraction(snapDraw);
        };
        typeSelect.onchange = function() {
            mapGaz.removeInteraction(drawDraw);
            mapGaz.removeInteraction(snapDraw);
            mapGaz.removeInteraction(modifyDraw);
        };
        addInteractions();
        deleteButton.style.display = "none";
    } else {
        console.log("UGAZ MODIFY MODE");
        toggleMode.innerHTML = "Ver localizações";
        poiGaz.style.display = "none";
        poiNominatim.style.display = "none";
        //remove interactivity
        mapGaz.removeInteraction(drawDraw);
        mapGaz.removeInteraction(snapDraw); 
        mapGaz.removeInteraction(modifyDraw);
        // Show geometry results in console
        drawResults();
        select.on('select', function (e) {
            var selFeatures = e.target.getFeatures();
            var numFeatures = selFeatures.getLength();
            console.log(numFeatures,' selected features (last operation selected ',e.selected.length,' and deselected ',e.deselected.length,' features.');
            console.log("e",e);
            console.log("selFeatures ",selFeatures);
            console.log("numFeatures: ",numFeatures);
            if (numFeatures == 0) {
                deleteButton.style.display = "none";
            } else {
                if (numFeatures == 1) {
                    dButtonText = "Eliminar um elemento.";
                } else {
                    dButtonText = "Eliminar "+numFeatures+" elementos.";
                }
                deleteButton.innerHTML = `<button type ="button" class="btn btn-primary" id="buttonDeleteUgazF">`+dButtonText+`</button>`;
                deleteButton.style.display = "block";
                var buttonDeleteUgazF = document.getElementById("buttonDeleteUgazF");
                buttonDeleteUgazF.onclick = function() {
                    console.log("arrived in deleteUgazFeatures");
                    console.log("numFeatures: ",numFeatures);
                    console.log("drawSource features before: ",drawSource.getFeatures());
                    selFeatures.forEach(function(feature){
                        drawSource.removeFeature(feature)
                    });
                    console.log("drawSource features after: ",drawSource.getFeatures());
                    deleteButton.innerHTML = `<p> ${numFeatures} elementos eliminados.`;
                }; 
            }
        });
    }
};

let polyJson = {};
function drawResults() {
    console.log("Begin drawResults");
    drawFeatures = drawSource.getFeatures();
    console.log("drawFeatures: ",drawFeatures);
    if (drawFeatures.length > 0){
        var allCoords = [];
        for (let i = 0; i < drawFeatures.length; i++) {
            geom = drawFeatures[i].getGeometry();
            console.log("geom ",geom);
            coords = geom.getCoordinates()[0];
            console.log("coords: ",coords);
            poly = coords
            allCoords.push(poly);
        }
        var multiPoly = {
            "type": "MultiPolygon",
            "coordinates": allCoords
        };
        console.log("number of polygons: ",drawFeatures.length);
        //console.log("multiPoly: ",multiPoly);
        polyJson = JSON.stringify(multiPoly);
        console.log("polyJson: ",polyJson);        
    } else {
        console.log("No polygons drawn");
    };
    //Update total Gaz Numbers
    uGaz = drawFeatures.length;
    tGaz = updateGazTotals(uGaz, gazL);
}

//On added feature adjustments:
drawSource.on('addfeature',function(evt){
    console.log("addfeature begin",evt);
    var feature = evt.feature;
    console.log("added feature: ",feature.getGeometry().getCoordinates());
    drawResults();
});
drawSource.on('changefeature',function(evt){
    console.log("changefeature begin",evt);
    var feature = evt.feature;
    console.log("changed feature: ",feature.getGeometry().getCoordinates());
    drawResults();
});
drawSource.on('removefeature',function(evt){
    console.log("remove feature begin",evt);
    var feature = evt.feature;
    console.log("removed feature: ",feature.getGeometry().getCoordinates());
    drawResults();
});
drawSource.on('clear',function(evt){
    console.log("clear begin",evt);
    var feature = evt.feature;
    console.log("all cleared ",feature.getGeometry().getCoordinates());
    drawResults();
});


// Add Localize EGaz
//Define map layers for future update
const styleGazAdmin = [
    new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: 'blue',
            width: '3',
        }),
        fill: new ol.style.Fill({
            color: 'rgba(0,0, 255, 0.1)',
        }),
    }),
];

// Initialize Egaz map layers
const wmsSourceEGaz = new ol.source.ImageWMS({
    url: 'http://localhost:8080/geoserver/apregoar/wms',
    serverType: 'geoserver',
    crossOrigin: 'anonymous',
});
console.log("Source defined")
const wmsLayerEGaz = new ol.layer.Image({
    source: wmsSourceEGaz,
    style: styleGazAdmin,
});
mapGaz.addLayer(wmsLayerEGaz);
console.log("EGaz Layer added");

// Initialize Ugaz map layers
const wmsSourceUGaz = new ol.source.ImageWMS({
    url: 'http://localhost:8080/geoserver/apregoar/wms',
    serverType: 'geoserver',
    crossOrigin: 'anonymous',
});
console.log("Source defined")
const wmsLayerUGaz = new ol.layer.Image({
    source: wmsSourceUGaz,
    style: styleGazAdmin,
});
mapGaz.addLayer(wmsLayerUGaz);
console.log("UGaz Layer added");

// Adding fetch to view POIs
const preverPOI = document.getElementById("preverPOI");
function loadGazPOI(gazetteer) {
    var bodyContent = {}
    if (gazetteer == "poi_poi"){
        var searchTerm = prompt("Pode especificar a pesquisa:");
        bodyContent = JSON.stringify({
            "gazetteer": gazetteer,
            "searchTerm": searchTerm
        })
    } /*else if (gazetteer == "poi_locale"){
        var getBottomLeft = mapGaz.getView().extent.getBottomLeft();
        console.log("layerExtent: ",layerExtent)
        bodyContent = JSON.stringify({
            "gazetteer":gazetteer,
            "layerExent":getBottomLeft
        })
    }*/

    fetch(`${window.origin}/publisher/${sID}/gazetteer`, {
        method: "POST",
        credentials: "include",
        body: bodyContent,
        cache: "no-cache",
        headers: new Headers({
            "content-type":"application/json"
        })
    })
    .then(function(response) {
        if (response.status !== 200) {
            window.alert("Erro no carragemento do gazetteer");
            console.log(`Error status code: ${response.status}`);
            return;
        }
        response.json().then(function(data){
            console.log(data);
            var select = document.getElementById(`select_${gazetteer}`)
            console.log("select: ",select)
            while (select.hasChildNodes()) {
                select.removeChild(select.firstChild);
            }
            for (var i=0; i < data.length; i++) {
                var option = document.createElement("option");
                option.textContent = data[i]["gaz_name"];
                option.value = data[i]["gaz_id"];
                select.appendChild(option);
            }
            select.style.display="block";
            preverPOI.style.display="block";

        })
    })
    .catch(function(error){
        console.log("Fetch error: "+error);
    });
}

//Calling RESTAPI of geonames to search gazetteer
function searchGeoNames() {
    var selectGeonames = document.getElementById('select_geonames');
    var buttonZoomGeonames = document.getElementById("buttonZoomGeonames");
    buttonZoomGeonames.style.display="none";
    while (selectGeonames.hasChildNodes()) {
        selectGeonames.removeChild(selectGeonames.firstChild);
    }
    selectGeonames.style.display="none";
    var searchTerm = prompt("Pode especificar a pesquisa para Geonames:");
    encodedSearch = encodeURIComponent(searchTerm);
    var url = "http://api.geonames.org/search?q="+encodedSearch+"&east=-7.74577887999189&west=-9.517104891617194&north=39.83801908704823&south=38.40907442337447&type=json&isNameRequired=true&maxRows=20&username=cwentling";
    console.log("URL: ",url);
    fetch(url)
        .then((response) => {
            if (!response.ok) {
                throw new Error('HTTP error! Status: ${ resonse.status }');
            }
            return response.json();
        })
        .then((response) => {
            console.log("Response: ",response);
            var totalResults = response.totalResultsCount;
            console.log("Number of total results: ",totalResults);
            var geonames = response["geonames"];
            
            if (totalResults == 0) {
                geonamesComment.innerHTML = "<i>Desculpa, pesquisa sem resultos</i>";
                selectGeonames.style.display="none";
            } else {
                for (var i=0; i < geonames.length; i++) {
                    var option = document.createElement("option");
                    option.textContent = geonames[i]["name"];
                    console.log("option text: ",option.textContent);
                    option.value = geonames[i]["lng"].concat(",",geonames[i]["lat"]);
                    console.log("option value: ",option.value);
                    selectGeonames.appendChild(option);
                }
                selectGeonames.style.display="block";
                buttonZoomGeonames.style.display="block";
            }
            
        })
}
// Zooming to GeoNames results
function zoomGeonames(){
    console.log("Entering zoomGeonames");
    var sourceGeonames = new ol.source.Vector();
    var selectGeonames = document.getElementsByName("selectGeonames")[0];
    for (var i=0; i<selectGeonames.length; i++){
        if (selectGeonames[i].selected){
            var value = selectGeonames[i]["value"].split(",")
            var lat = parseFloat(value[1]);
            var lon = parseFloat(value[0]);
            console.log("Lat/Lon: ",lat," ",lon);
            console.log("Type: ",typeof(lat));
            coords = [lon,lat];
            var feature = new ol.Feature({
                geometry: new ol.geom.Point(coords),
                name: selectGeonames["name"]
            })
            console.log("feature geom: ",feature["geometry"]);
            sourceGeonames.addFeature(feature);
            var pGeom = feature.getGeometry();
            console.log("pGeom: ",pGeom);
            var gFeatures = sourceGeonames.getFeatures();
            console.log("gFeatures: ",gFeatures);
        }
    }
    var layerGeonames = new ol.layer.Vector({
        source: sourceGeonames,
        style: new ol.style.Style({
            image: new ol.style.Circle({
                radius: 7,
                fill: new ol.style.Fill({
                    color: '#ff3333',
                }),
            }),
        }),
    });
    
    //REUNITE
    mapGaz.addLayer(layerGeonames);
    var layerExtent = sourceGeonames.getExtent();
    console.log("layerExtent: ",layerExtent);
    mapGaz.getView().fit(ol.extent.buffer(layerExtent, .01));
}

let libraryNominatim;

//Calling RESTAPI of geonames to search gazetteer
function searchNominatim() {
    var selectNominatim = document.getElementById('select_nominatim');
    while (selectNominatim.hasChildNodes()) {
        selectNominatim.removeChild(selectNominatim.firstChild);
    }
    selectNominatim.style.display="none";

    var guideNominatim = document.getElementById('guide_nominatim');
    while(guideNominatim.hasChildNodes()){
        guideNominatim.removeChild(guideNominatim.firstChild);
    }
    guideNominatim.style.display="none";

    var buttonZoomNominatim = document.getElementById("buttonZoomNominatim");
    buttonZoomNominatim.style.display="none";

    var searchTerm = prompt("Pode especificar a pesquisa para Nominatim:");
    encodedSearch = encodeURIComponent(searchTerm);
    //var url = "http://api.geonames.org/search?q="+encodedSearch+"&east=-7.74577887999189&west=-9.517104891617194&north=39.83801908704823&south=38.40907442337447&type=json&isNameRequired=true&maxRows=20&username=cwentling";
    var url = "https://nominatim.openstreetmap.org/search?q="+encodedSearch+"&format=jsonv2&countrycodes=pt&limit=50&viewbox=-7.74577887999189,39.83801908704823,-9.517104891617194,38.40907442337447&polygon_geojson=1"
    console.log("URL: ",url);
    fetch(url)
        .then((response) => {
            if (!response.ok) {
                throw new Error('HTTP error! Status: ${ resonse.status }');
            }
            return response.json();
        })
        .then((response) => {
            console.log("Response: ",response);
            var nominatim = response;
            const totalResults = nominatim.length;
            console.log("totalResults: ",totalResults);
            //libraryNominatim = {};
            
            if (totalResults == 0) {
                geonamesComment.innerHTML = "<i>Desculpa, pesquisa sem resultos</i>";
                selectGeonames.style.display="none";
            } else {
                for (var i=0; i < nominatim.length; i++) {
                    var option = document.createElement("option");
                    option.textContent = nominatim[i]["display_name"];
                    console.log("option text: ",option.textContent);
                    var valueN = {
                        "name": nominatim[i]["display_name"],
                        "geojson" : nominatim[i]["geojson"],
                        "id": nominatim[i]["osm_type"]+nominatim[i]["osm_id"] //If you need an ID that is consistent over multiple installations of Nominatim, then you should use the combination of osm_type+osm_id+class. https://nominatim.org/release-docs/latest/api/Output/#notes-on-field-values
                    };
                
                    option.value = JSON.stringify(valueN);
                    nameN = nominatim[i]["display_name"];
                    const geojson = JSON.stringify(nominatim[i]["geojson"]);
                    console.log("geojson ",geojson);
                    //libraryNominatim[nameN] = geojson;
                    if (nominatim[i]["geojson"]["type"]=="Polygon"){
                        selectNominatim.appendChild(option);
                    } else if (nominatim[i]["geojson"]["type"]=="Point"){
                        guideNominatim.appendChild(option);
                    }
                    
                }
                if (selectNominatim.hasChildNodes()){
                    selectNominatim.style.display="block";
                }
                
                
                guideNominatim.style.display="block";
                buttonZoomNominatim.style.display="block";
            }
            //console.log("libraryNominatim: ", libraryNominatim);
            
        })
}


var sourceNominatimPoly = new ol.source.Vector();

// Zooming to GeoNames results
function zoomNominatim(){
    console.log("Entering zoomNominatim");
    var sourceNominatimPoint = new ol.source.Vector();
    var guideNominatim = document.getElementsByName("guideNominatim")[0];
    for (var i=0; i<guideNominatim.length; i++){
        if (guideNominatim[i].selected){
            console.log("guideNominatim[i]: ",guideNominatim[i]);
            console.log("guideNominatim[i]['value']: ",guideNominatim[i]['value']);
            const valueN = JSON.parse(guideNominatim[i]['value']);
            const geojson = valueN["geojson"];
            console.log("geojson: ",geojson); 
            const coords = geojson["coordinates"];
            console.log("coords:", coords);
            const geomType = geojson["type"];
            console.log("geomType ",geomType);
            //let feature;
            
            feature = new ol.Feature({
                geometry: new ol.geom.Point(coords),
                name: guideNominatim["name"]
            })
            sourceNominatimPoint.addFeature(feature);
            console.log("feature.getGeometry(): ",feature.getGeometry());
        }
    }
    var layerNominatimPoly = new ol.layer.Vector({
        source: sourceNominatimPoly,
        style: new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: 'rgba(238,130,238,1)',
                width: '2',
            }),
            fill: new ol.style.Fill({
                color: 'rgba(238,130,238,.25)',
            }),
        }),
    });
    var layerNominatimPoint = new ol.layer.Vector({
        source: sourceNominatimPoint,
        style: new ol.style.Style({
            image: new ol.style.Circle({
                radius: 7,
                fill: new ol.style.Fill({
                    color: '#ff3333',
                }),
            }),
        }),
    });
    //REUNITE
    //mapGaz.addLayer(layerNominatimPoly);
    mapGaz.addLayer(layerNominatimPoint);
    var layerExtent = sourceNominatimPoint.getExtent()
    //var layerExtent = ol.extent.extend(sourceNominatimPoly.getExtent(),sourceNominatimPoint.getExtent());
    console.log("layerExtent: ",layerExtent);
    mapGaz.getView().fit(ol.extent.buffer(layerExtent, .01));
}


// Adding fetch to search through all previous areas
const selectPrev = document.getElementById("selectPrev");
function searchGazPrev(gazetteer) {
    var selectUgazPersonal = document.getElementById('select_ugaz_personal');
    while (selectUgazPersonal.hasChildNodes()) {
        selectUgazPersonal.removeChild(selectUgazPersonal.firstChild);
    }
    selectUgazPersonal.style.display="none";
    var selectUgazEmpresa = document.getElementById('select_ugaz_empresa');
    while (selectUgazEmpresa.hasChildNodes()) {
        selectUgazEmpresa.removeChild(selectUgazEmpresa.firstChild);
    }
    selectUgazEmpresa.style.display="none";
    var selectUgazAll = document.getElementById('select_ugaz_all');
    while (selectUgazAll.hasChildNodes()) {
        selectUgazAll.removeChild(selectUgazAll.firstChild);
    }
    selectUgazAll.style.display="none";
    var selectEgazFreguesia = document.getElementById('select_egaz_freguesia');
    while (selectEgazFreguesia.hasChildNodes()) {
        selectEgazFreguesia.removeChild(selectEgazFreguesia.firstChild);
    }
    selectEgazFreguesia.style.display="none";
    var selectEgazConcelho = document.getElementById('select_egaz_concelho');
    while (selectEgazConcelho.hasChildNodes()) {
        selectEgazConcelho.removeChild(selectEgazConcelho.firstChild);
    }
    selectEgazConcelho.style.display="none";
    var selectEgazExtra = document.getElementById('select_egaz_extra');
    while (selectEgazExtra.hasChildNodes()) {
        selectEgazExtra.removeChild(selectEgazExtra.firstChild);
    }
    selectEgazExtra.style.display="none";
    var selectEgazGreen = document.getElementById('select_egaz_green');
    while (selectEgazGreen.hasChildNodes()) {
        selectEgazGreen.removeChild(selectEgazGreen.firstChild);
    }
    selectEgazGreen.style.display="none";
    var selectEgazArchive = document.getElementById('select_egaz_archive');
    while (selectEgazArchive.hasChildNodes()) {
        selectEgazArchive.removeChild(selectEgazArchive.firstChild);
    }
    selectEgazArchive.style.display="none";
    var selectNominatim = document.getElementById('select_nominatim');
    while (selectNominatim.hasChildNodes()){
        selectNominatim.removeChild(selectNominatim.firstChild);
    }
    selectNominatim.style.display="none";
    var bodyContent = {}
    if (gazetteer == "gaz_prev"){
        var searchTerm = prompt("Pode especificar a pesquisa:");
        bodyContent = JSON.stringify({
            "gazetteer": gazetteer,
            "searchTerm": searchTerm
        })
        var searchTermDisplay = document.getElementById("searchTermDisplay");
        searchTermDisplay.innerHTML = "<p>"+searchTerm+"</p>";
        searchTermDisplay.style.display="block";
    }
    fetch(`${window.origin}/publisher/${sID}/gazetteer`, {
        method: "POST",
        credentials: "include",
        body: bodyContent,
        cache: "no-cache",
        headers: new Headers({
            "content-type":"application/json"
        })
    })
    .then(function(response) {
        if (response.status !== 200) {
            window.alert("Erro no carragemento do gazetteer");
            console.log(`Error status code: ${response.status}`);
            return;
        }
        response.json().then(function(data){
            console.log(data);          
            for (var i=0; i < data.length; i++) {
                var option = document.createElement("option");
                option.textContent = data[i]["gaz_name"];
                option.value = data[i]["gaz_id"];
                gazType = data[i]["gaz_desc"];
                console.log("gazType: ",gazType);
                console.log("Option: ",option);
                if (gazType.includes("ugaz")) {
                    console.log("Entering UGAZ if statement");
                    gazUID = parseInt(gazType.substr(4));
                    console.log("gazUID: ",gazUID);
                    if (gazUID == uID) {
                        console.log("My place");
                        selectUgazPersonal.appendChild(option);
                        selectUgazPersonal.style.display="block";
                        console.log("selectUgazPersonal: ",selectUgazPersonal);
                        console.log("child element count: ",selectUgazPersonal.childElementCount);
                    }
                    else {
                        console.log("not my place");
                        selectUgazAll.appendChild(option);
                        selectUgazAll.style.display="block";
                    }
                }
                else if (gazType == "freguesia") {
                    selectEgazFreguesia.appendChild(option);
                    selectEgazFreguesia.style.display="block";
                }
                else if (gazType == "concelho") {
                    selectEgazConcelho.appendChild(option);
                    selectEgazConcelho.style.display="block";
                }
                else if (gazType == "espaço_verde") {
                    selectEgazGreen.appendChild(option);
                    selectEgazGreen.style.display="block";
                }
                else if (gazType.includes("archiv")) {
                    console.log("In Archive");
                    selectEgazArchive.appendChild(option);
                    selectEgazArchive.style.display="block";
                }
                else {
                    selectEgazExtra.appendChild(option);
                    selectEgazExtra.style.display="block";
                }
            }
            styleSelectGaz(gaz=selectUgazPersonal);
            styleSelectGaz(gaz=selectUgazEmpresa);
            styleSelectGaz(gaz=selectUgazAll);
            styleSelectGaz(gaz=selectEgazFreguesia);
            styleSelectGaz(gaz=selectEgazConcelho);
            styleSelectGaz(gaz=selectEgazArchive);
            styleSelectGaz(gaz=selectEgazExtra);
            //$(function(){
            //    $(`#select_${gazetteer}`).multiSelect();
            //});
            
        })
    })
    .catch(function(error){
        console.log("Fetch error: "+error);
    });

    //CHECK NOMINATIM
    encodedSearch = encodeURIComponent(searchTerm);
    var url = "https://nominatim.openstreetmap.org/search?q="+encodedSearch+"&format=jsonv2&countrycodes=pt&limit=50&viewbox=-7.74577887999189,39.83801908704823,-9.517104891617194,38.40907442337447&polygon_geojson=1"
    console.log("URL: ",url);
    fetch(url)
        .then((response) => {
            if (!response.ok) {
                throw new Error('HTTP error! Status: ${ resonse.status }');
            }
            return response.json();
        })
        .then((response) => {
            console.log("Response: ",response);
            var nominatim = response;
            const totalResults = nominatim.length;
            console.log("totalResults: ",totalResults);
            //libraryNominatim = {};
            
            if (totalResults == 0) {
                geonamesComment.innerHTML = "<i>Desculpa, pesquisa sem resultos</i>";
                selectGeonames.style.display="none";
            } else {
                for (var i=0; i < nominatim.length; i++) {
                    var option = document.createElement("option");
                    option.textContent = nominatim[i]["display_name"];
                    console.log("option text: ",option.textContent);
                    var valueN = {
                        "name": nominatim[i]["display_name"],
                        "geojson" : nominatim[i]["geojson"],
                        "id": nominatim[i]["osm_type"]+nominatim[i]["osm_id"] //If you need an ID that is consistent over multiple installations of Nominatim, then you should use the combination of osm_type+osm_id+class. https://nominatim.org/release-docs/latest/api/Output/#notes-on-field-values
                    };
                
                    option.value = JSON.stringify(valueN);
                    nameN = nominatim[i]["display_name"];
                    //libraryNominatim[nameN] = geojson;
                    if (nominatim[i]["geojson"]["type"]=="Polygon"){
                        selectNominatim.appendChild(option);
                    } 
                    
                }
                if (selectNominatim.hasChildNodes()){
                    selectNominatim.style.display="block";
                }
            }
            //console.log("libraryNominatim: ", libraryNominatim);
            
        })
}

function styleSelectGaz(gaz) {
    maxOptions = 8;
    if (gaz.options.length < maxOptions) {
        gaz.size = gaz.options.length +1;
    } else {
        gaz.size = maxOptions;
    }
}

// Adding fetches to get access to gazetteers
const loadingGaz = document.getElementById("loadingGaz");
function loadGaz(gazetteer) {
    //const loadingGaz = document.getElementById(gazetteer);
    spinner.removeAttribute('hidden');
    fetch(`${window.origin}/publisher/${sID}/gazetteer`, {
        method: "POST",
        credentials: "include",
        body: JSON.stringify({"gazetteer": gazetteer}),
        cache: "no-cache",
        headers: new Headers({
            "content-type":"application/json"
        })
    })
    .then(function(response) {
        if (response.status !== 200) {
            window.alert("Erro no carragemento do gazetteer");
            console.log(`Error status code: ${response.status}`);
            return;
        }
        response.json().then(function(data){
            console.log(data);
            var select = document.getElementById(`select_${gazetteer}`)
            for (var i=0; i < data.length; i++) {
                var option = document.createElement("option");
                option.textContent = data[i]["gaz_name"];
                option.value = data[i]["gaz_id"];
                select.appendChild(option);
            }
            select.style.display = "block";
            //$(function(){
            //    $(`#select_${gazetteer}`).multiSelect();
            //});
            styleSelectGaz(gaz=select);

        })
    })
    .catch(function(error){
        console.log("Fetch error: "+error);
    });
    spinner.setAttribute('hidden', '');
}

// Initialize POI map layers
const wmsSourcePOI = new ol.source.ImageWMS({
    url: 'http://localhost:8080/geoserver/apregoar/wms',
    serverType: 'geoserver',
    crossOrigin: 'anonymous',
});
console.log("Source defined")
const wmsLayerPOI = new ol.layer.Image({
    source: wmsSourcePOI,
    style: styleGazAdmin,
});
mapGaz.addLayer(wmsLayerPOI);
console.log("POI Layer added");


function prepGaz(selectedGaz,selectedInt) {
    console.log("selectedGaz",selectedGaz); //New selected Gazetteer values
    for (var i=0; i<selectedGaz.length; i++) {
        if (selectedGaz[i].selected){
            console.log("Value checked: ",selectedGaz[i].value);
            selectedInt.push(selectedGaz[i].value);
            console.log("selectedInt: ",selectedInt);
        }
    }
    return selectedInt
}

function initGaz(){
    spinner.removeAttribute('hidden');
    console.log("Entering initGaz");
    // Initializing values
    var selectedIntE = [];
    var selectedIntU = [];
    // Preparing freguesias
    var selectEgazFreguesia = document.getElementsByName("selectEgazFreguesia")[0];
    console.log("initGaz selectEgazFreguesia: ",selectEgazFreguesia);
    var result = prepGaz(selectedGaz = selectEgazFreguesia,selectedInt = selectedIntE);
    selectedIntE = selectedInt;
    console.log("selectedIntE after Freguesia: ",selectedIntE);
    // Preparing concelhos
    var selectEgazConcelho = document.getElementsByName("selectEgazConcelho")[0];
    result = prepGaz(selectedGaz = selectEgazConcelho, selectedInt = selectedIntE);
    selectedIntE = selectedInt;
    console.log("selectedIntE after Concelho: ",selectedIntE);
    // Preparing Archive
    var selectEgazArchive = document.getElementsByName("selectEgazArchive")[0];
    result = prepGaz(selectedGaz = selectEgazArchive, selectedInt = selectedIntE);
    selectedIntE = selectedInt;
    console.log("selectedIntE after Concelho: ",selectedIntE);
    // Preparing Green Space
    var selectEgazGreen = document.getElementsByName("selectEgazGreen")[0];
    result = prepGaz(selectedGaz = selectEgazGreen, selectedInt = selectedIntE);
    selectedIntE = selectedInt;
    console.log("selectedIntE after GreenSpace: ",selectedIntE);
    // Preparing other administrative areas
    var selectEgazExtra = document.getElementsByName("selectEgazExtra")[0];
    console.log("selectEgazExtra: ",selectEgazExtra);
    result = prepGaz(selectedGaz = selectEgazExtra, selectedInt = selectedIntE);
    selectedIntE = selectedInt;
    console.log("selectedIntE after Extra: ",selectedIntE);
    // Preparing Sítios pessoais
    var selectUgazPersonal = document.getElementsByName("selectUgazPersonal")[0];
    console.log("selectUgazPersonal: ",selectUgazPersonal);
    result = prepGaz(selectedGaz = selectUgazPersonal, selectedInt = selectedIntU);
    selectedIntU = selectedInt;
    console.log("selectedIntU after Ugaz Personal: ",selectedIntU);
    // Preparing Sítios Empresiais
    var selectUgazEmpresa = document.getElementsByName("selectUgazEmpresa")[0];
    console.log("selectUgazEmpresa: ",selectUgazEmpresa);
    result = prepGaz(selectedGaz = selectUgazEmpresa, selectedInt = selectedIntU);
    selectedIntU = selectedInt;
    console.log("selectedIntU after Ugaz Empresa: ",selectedIntU);
    // Preparing Sítios Empresiais
    var selectUgazAll = document.getElementsByName("selectUgazAll")[0];
    console.log("selectUgazAll: ",selectUgazAll);
    result = prepGaz(selectedGaz = selectUgazAll, selectedInt = selectedIntU);
    selectedIntU = selectedInt;
    console.log("selectedIntU after Ugaz All: ",selectedIntU);

    
    // Preparing sítios Nominatim
    var selectedIntN = [];
    sourceNominatimPoly.clear();
    mapGaz.removeLayer(layerNominatimPoly);
    var selectNominatim = document.getElementById("select_nominatim");
    console.log("selectNominatim: ",selectNominatim);
    for (var i=0; i<selectNominatim.length; i++){
        if (selectNominatim[i].selected){
            console.log("selectNominatim[i]: ",selectNominatim[i]);
            console.log("selectNominatim[i]['value']: ",selectNominatim[i]['value']);
            const valueN = JSON.parse(selectNominatim[i]['value']);
            const geojson = valueN["geojson"];
            console.log("geojson: ",geojson); 
            const coords = geojson["coordinates"];
            console.log("coords:", coords);
            const geomType = geojson["type"];
            console.log("geomType ",geomType);
            //let feature;
            feature = new ol.Feature({
                geometry: new ol.geom.Polygon(coords),
                name: selectNominatim["name"]
            })
            selectedIntN.push(valueN);
            sourceNominatimPoly.addFeature(feature);
            console.log("feature.getGeometry(): ",feature.getGeometry());
        }
    }
    layerNominatimPoly.setSource(sourceNominatimPoly) 
    mapGaz.addLayer(layerNominatimPoly);
    
    
    
    //Calcuate totals
    gazL = selectedIntE.length + selectedIntU.length + selectedIntN.length;
    tGaz = updateGazTotals(uGaz, gazL);
    //
    results = vizGaz(selectedIntE,selectedIntU);
    //zoomGaz()
    zoomGaz(vectorSource=vectorSourceStories);
    results["tGaz"] = tGaz;
    results["selectedIntN"] = selectedIntN;
    console.log(results);
    return results;
}
var layerNominatimPoly = new ol.layer.Vector({
    source: sourceNominatimPoly,
    style: new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: 'rgba(238,130,238,1)',
            width: '2',
        }),
        fill: new ol.style.Fill({
            color: 'rgba(238,130,238,.25)',
        }),
    }),
});

function vizGaz(selectedIntE,selectedIntU, selectedIntN){

    //Update Gaz Totals
    var vectorSource = vectorSourceStories;
    // Get EGaz map images
    if (selectedIntE.length > 0){
        console.log("selectedIntE for Filter: ",selectedIntE);
        mapEgazFilter = "e_id IN ("+selectedIntE+")";
        console.log("mapFilter: ",mapEgazFilter);
        //Get Egaz extent
        var wfs_url_E = 'http://localhost:8080/geoserver/wfs?service=wfs&version=2.0.0&request=GetFeature&typeNames=apregoar:egazetteer&cql_filter='+mapEgazFilter+'&outputFormat=application/json';
        fetch(wfs_url_E).then(function (response) {
            jsonE = response.json();
            console.log("JSON: ",jsonE);
            return jsonE;
        })
        .then(function (jsonE) {
            const featuresE = new ol.format.GeoJSON().readFeatures(jsonE);
            console.log("Features: ",featuresE);
            if (featuresE.length < selectedIntE.length){
                window.alert("Cuidade! Todos elementos não foram carregados (",featuresE.length," de ",selectedIntE.length," com successo).");
            }
            vectorSource.addFeatures(featuresE);
            console.log("layerExtent: in Egaz",vectorSource.getExtent());
            layerExtent = zoomGaz(vectorSource);
            spinner.setAttribute('hidden', '');
            return vectorSource;
        });
        // Add eGaz shapes     
        wmsLayerEGaz.setOpacity(0.5);
        wmsSourceEGaz.updateParams({
            "LAYERS": "apreagoar:egazetteer",
            "cql_filter": mapEgazFilter
        });
        console.log("source updated")
        console.log("Egaz added to map")
    } else {
        wmsSourceEGaz.updateParams({
            "LAYERS": "apreagoar:egazetteer",
            "cql_filter": "e_id = 0"
        });
        console.log("replaced Egaz layer with empty");
    }
    if(selectedIntU.length > 0){
        console.log("selectedIntU for Filter: ",selectedIntU);
        mapUgazFilter = "p_id IN ("+selectedIntU+")";
        console.log("mapFilter: ",mapUgazFilter);
        // Get Ugaz extent
        var wfs_url_U= 'http://localhost:8080/geoserver/wfs?service=wfs&version=2.0.0&request=GetFeature&typeNames=apregoar:access_ugaz&cql_filter='+mapUgazFilter+'&outputFormat=application/json';
        fetch(wfs_url_U).then(function (response) {
            jsonU = response.json();
            console.log("JSON: ",jsonU);
            return jsonU;
        })
        .then(function (jsonU) {
            const featuresU = new ol.format.GeoJSON().readFeatures(jsonU);
            console.log("Features: ",featuresU);
            if (featuresU.length < selectedIntU.length){
                window.alert('Cuidade! Todos elementos não foram carregados.');
            }
            vectorSource.addFeatures(featuresU);
            console.log("layerExtent: in get Ugaz",vectorSource.getExtent());
            layerExtent = zoomGaz(vectorSource);
            spinner.setAttribute('hidden', '');
            return vectorSource;
        });
        // Add eGaz shapes     
        wmsLayerUGaz.setOpacity(0.5);
        wmsSourceUGaz.updateParams({
            "LAYERS": "apreagoar:access_ugaz",
            "cql_filter": mapUgazFilter
        });
        console.log("source updated")
        console.log("Ugaz added to map")
    } else {
        wmsSourceUGaz.updateParams({
            "LAYERS": "apreagoar:access_ugaz",
            "cql_filter": "p_id = 0"
        });
        console.log("replaced Ugaz layer with empty");
    }

    return {selectedIntE,selectedIntU}
}
//let layerNominatimPoly;


//Update Gaz Totals
function updateGazTotals(uGaz,gazL) {
    var totalEGaz = document.getElementById("totalEGaz");
    var totalUGaz = document.getElementById("totalUGaz");
    var totalNumGaz = document.getElementById("totalNumGaz");
    var alertPoly = document.getElementById("alertPoly");
    tGaz = uGaz + gazL;
    totalEGaz.innerHTML = gazL;
    totalUGaz.innerHTML = uGaz;
    totalNumGaz.innerHTML = tGaz;
    if (totalNumGaz == 0) {
        alertPoly.style.display="block";
        alertPoly.style.color="red";
        totalNumGaz.style.color="red";
    } else {
        alertPoly.style.display="none";
        totalNumGaz.style.color="green";
    }
    console.log("total gaz features selected: ", tGaz)
    return tGaz;
}

//Return to previous story button
const btnReturn = document.getElementById("btnReturn");
btnReturn.innerHTML = '<a href="/publisher/'+sID+'/review"> <button type ="button" class="btn btn-primary">Volta à notícia</button> </a>';

//Setting default temporal inputs
document.getElementsByName("allDay").value="allday_y";
const tBeginInput = document.getElementById("tBegin");
const tEndInput = document.getElementById("tEnd");
tBeginInput.type="date";
tEndInput.type="date";

tBeginInput.valueAsDate= new Date();
tEndInput.valueAsDate= new Date();

/* Switching between date and datetime temporal inputs */
function timeDefH(){
    var tBVal = new Date(document.getElementById("tBegin").value);
    var tEVal = new Date(document.getElementById("tEnd").value);
    var allDay = document.getElementsByName("allDay");
    allDay.value = "allday_n";
    tBText = tBVal.toISOString().substring(0,16);
    tEText = tEVal.toISOString().substring(0,16);
    console.log("tBText: ")
    console.log(tBText);
    var tBeginInput = document.getElementById("tBegin");
    var tEndInput = document.getElementById("tEnd");
    tBeginInput.type = 'datetime-local';
    tEndInput.type = 'datetime-local';
    tBeginInput.value = tBText;
    tEndInput.value = tEText;
    tBeginInput.style.display = 'block';
    tEndInput.style.display = 'block';
}
function timeDefD(){
    var tBVal = new Date(document.getElementById("tBegin").value);
    var tEVal = new Date(document.getElementById("tEnd").value);
    var allDay = document.getElementsByName("allDay");
    allDay.value = "allday_y";
    tBText = tBVal.toISOString().substring(0,10);
    tEText = tEVal.toISOString().substring(0,10);
    console.log("tBText");
    console.log(tBText);
    const tBeginInput = document.getElementById("tBegin");
    const tEndInput = document.getElementById("tEnd");
    tBeginInput.type = 'date';
    tEndInput.type = 'date';
    tBeginInput.value = tBText;
    tEndInput.value = tEText;
    tBeginInput.style.display = 'block';
    tEndInput.style.display = 'block';
}
function timeDefP(){
    var tBVal = new Date(document.getElementById("tBegin").value);
    var tEVal = new Date(document.getElementById("tEnd").value);
    var allDay = document.getElementsByName("allDay");
    allDay.value = "allday_p";
    tBText = tBVal.toISOString().substring(0,10);
    tEText = tEVal.toISOString().substring(0,10);
    console.log("tBText");
    console.log(tBText);
    const tBeginInput = document.getElementById("tBegin");
    const tEndInput = document.getElementById("tEnd");
    tBeginInput.type = 'date';
    tEndInput.type = 'date';
    tBeginInput.value = tBText;
    tEndInput.value = tEText;
    tBeginInput.style.display = 'none';
    tEndInput.style.display = 'none';
}

//Establishing connections to html elements
const answer = document.getElementById('calculated-area');
const saveG = document.getElementById('selectGeom');
const saveN = document.getElementById('selectName');
const saveD = document.getElementById('selectDesc');
const saveB = document.getElementById('formButton');
saveG.innerHTML = `Desenhar um ou mais áreas.`;
const numPoly = 0;
answer.innerHTML = `<strong>${numPoly}</strong>`;

function limparGazSelect(selectGaz) {
    for (var i = 0; i < selectGaz.length; i++) {
        selectGaz[i].selected = false;
    }
}

// Clear the existing values
function limparTudo() {
    /*
    document.getElementById("pName").value = '';
    document.getElementById("pDesc").value = '';
    document.getElementById("tBegin").value = '';
    document.getElementById("tEnd").value = '';
    document.getElementById("tDesc").value = '';
    // Reset loaded gazetteer selections
    var selectUgazPersonal = document.getElementsByName("selectUgazPersonal");
    console.log("selectUgazPersonal for deconstructing: ",selectUgazPersonal);
    limparGazSelect(selectGaz = selectUgazPersonal[0]);  
    limparGazSelect(selectGaz = document.getElementsByName("selectUgazEmpresa")[0]);
    limparGazSelect(selectGaz = document.getElementsByName("selectUgazAll")[0]);
    limparGazSelect(selectGaz = document.getElementsByName("selectEgazFreguesia")[0]);
    limparGazSelect(selectGaz = document.getElementsByName("selectEgazConcelho")[0]);
    limparGazSelect(selectGaz = document.getElementsByName("selectEgazExtra")[0]);
    initGaz();
    

    // Delete custom features
    var allCustomFeatures = drawSource.getFeatures();
    allCustomFeatures.forEach(function(feature){
        drawSource.removeFeature(feature)
    });
    */
    location.reload();
    console.log("should be clean");

}

function submitInstance() {
    
    // Get all checked values
    console.log("Beginning Submit");
    results = initGaz();
    tGaz = results.tGaz;
    selectedIntE = results.selectedIntE;
    selectedIntU = results.selectedIntU;
    var selectedIntN = results.selectedIntN;

    // Get form values for validation
    var pNamef = document.getElementById("pName");
    var pDescf = document.getElementById("pDesc");
    var tBeginf = document.getElementById("tBegin");
    var tEndf = document.getElementById("tEnd");
    var tDescf = document.getElementById("tDesc");
    var allDay = document.getElementsByName("allDay");
    console.log("tBeginf.value: ",tBeginf.value)
    console.log("allDay value: ",allDay.value);
    // Geovalues: polyJson is UGaz definition. selectedP is EGaz definition.
    // Get validation announcement areas
    var successAnnouncement = document.getElementById("successAnnouncement");
    var validation = document.getElementById("validation");
    //Check for places assigned
    var faltas = [];
    console.log("tGaz: ",tGaz);
    if (tGaz == 0){
        console.log("No geometry associated");
        faltas.push("Geometria");
    }
    if (! pNamef.value){
        console.log('pNamef: ');
        console.log(pNamef);
        faltas.push(" "+pNamef.placeholder);
        console.log('faltas: ');
        console.log(faltas);
    }
    console.log("allDay.value: ",allDay.value);
    if (allDay.value !== "allday_p") {
        if (! tBeginf.value) {
            console.log('tBeginf: ');
            console.log(tBeginf);
            faltas.push(" Tempo do início");
        }
        if (! tEndf.value) {
            console.log('tEndf: ');
            console.log(tEndf);
            faltas.push(" Tempo do fim");
        }
        if (tEndf.value < tBeginf.value){
            console.log("Ending before beginning");
            faltas.push(" Altura fecha antes o início")
        }
    }     
    if (faltas.length > 0){
        window.alert("Falta alguns campos requeridos");
        validation.style.display="block";
        successAnnouncement.style.display="block";
        successAnnouncement.innerHTML = `<em style="color:red">Falta: ${faltas}</em>`;
        return
    } else {
        console.log("Preparating of entry");
        if (allDay.value !=="allday_p") {
            console.log("Scenario: Specific time defined")
            var tBeginVal = tBeginf.value;
            var tEndVal = tEndf.value;
            
        } else {
            console.log("Scenario: Persistent time")
            var tBeginVal = null;
            var tEndVal = null;
        }
        console.log("tBeginVal: ",tBeginVal);
        console.log("tEndVal: ",tEndVal);
        //Remove validation commentary
        validation.style.display="none";
        successAnnouncement.style.display="none";
        //Prepare data for sending to flask
        var entry = {
            type: "Feature",
            properties: {
                pName: pNamef.value,
                pDesc: pDescf.value,
                allDay: allDay.value,
                tBegin: tBeginVal,
                tEnd: tEndVal,
                tDesc: tDescf.value,
                eIds: selectedIntE,
                pIds: selectedIntU,
                nominatims: selectedIntN,
            },
            geometry: polyJson
        };
        console.log("entry: ",entry);
        console.log("entry properties: ",entry.properties);
        //Send to flask
        spinner.removeAttribute('hidden');
        fetch(`${window.origin}/publisher/${sID}/save_instance`, {
            method: "POST",
            credentials: "include",
            body: JSON.stringify(entry),
            cache: "no-cache",
            headers: new Headers({
                "content-type": "application/json"
            })
        })
        .then(function(response) {
            if (response.status !== 200) {
                window.alert("Error");
                console.log(`Looks like there was a problem. Status code: ${response.status}`);
                return;
            }
            response.json().then(function(data) {
                console.log(data);
                let maisUm = confirm("Parabéns! A instância foi guardada com sucesso. Quer associar mais uma instância?")
                if (maisUm) {
                    location.reload();
                } else {
                    window.location.href = "review";
                }
                spinner.setAttribute('hidden','');
            });
        })
        .catch(function(error) {
        console.log("Fetch error: " + error);
        });

    }
}


