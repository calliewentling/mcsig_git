////// MAP INITIALIZATION //////
//Generic Map Setup
const viewGaz = new ol.View({
    projection: 'EPSG:4326',
    center: [-9.150404956762742,38.72493479806579],
    zoom: 12
});
 

const mapGaz = new ol.Map({
    layers: [
        new ol.layer.Tile({
            source: new ol.source.OSM()
        })
    ],
    target: 'map',
    view: viewGaz,
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
});
wmsLayerStory.setOpacity(0.7);
mapGaz.addLayer(wmsLayerStory);
console.log("Story instances added");

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

///// TOGGLE TO UGAZ /////////////
//Toggle Map Views (using existing gaz vs. design new place)
function toggleLocalization(){
    //Get the checkbox
    var tswitch = document.getElementById("tswitch");
    //Get output text
    var newUgaz = document.getElementById("newUgaz");
    var eGazMap = document.getElementById("eGazMap");
    var toggleMode = document.getElementById("toggleMode");
    //If the checkbox is checked, display the output text
    if (tswitch.checked == true){
        console.log("Should show Ugaz");
        newUgaz.style.display = "block";
        toggleMode.innerHTML = "Desenhar localização";
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
    } else {
        console.log("Should show Egaz");
        newUgaz.style.display = "none";
        toggleMode.innerHTML = "Ver localizações";
        //remove interactivity
        mapGaz.removeInteraction(drawDraw);
        mapGaz.removeInteraction(snapDraw); 
        mapGaz.removeInteraction(modifyDraw);
        // Show geometry results in console
        drawResults();
    }
}
function drawResults() {
    console.log("Begin drawResults");
    drawFeatures = drawSource.getFeatures();
    console.log("drawFeatures: ",drawFeatures);
    var allCoords = [];
    for (let i = 0; i < drawFeatures.length; i++) {
        geom = drawFeatures[i].getGeometry();
        console.log("geom ",geom);
        coords = geom.getCoordinates();
        console.log("coords: ",coords);
        poly = [coords];
        allCoords.push(poly);
    }
    var multiPoly = {
        "type": "MultiPolygon",
        "coordiantes": [
            allCoords
        ]
    };
    console.log("multiPoly: ",multiPoly);
    console.log("string: ", String(multiPoly));
    console.log("End drawResults");
}

drawSource.on('addfeature', function(evt){
    console.log("after feature begin")
    var feature = evt.feature;
    var geom = feature.getGeometry();
    console.log("geom: ",geom);
    var coords = feature.getGeometry().getCoordinates();
    console.log("coords: ",coords);
    console.log("after feature end");
})


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

const wmsSourceEAGaz = new ol.source.ImageWMS({
    url: 'http://localhost:8080/geoserver/apregoar/wms',
    serverType: 'geoserver',
    crossOrigin: 'anonymous',
});
console.log("Source defined")
const wmsLayerEAGaz = new ol.layer.Image({
    source: wmsSourceEAGaz,
    style: styleGazAdmin,
});
mapGaz.addLayer(wmsLayerEAGaz);
console.log("Layer added");



// Visualize selection of eGaz item on the map
const selectedEgaz = document.getElementById("selectedEgaz");
let selectedP = [];

//console.log("eGazAll: ",eGazAll)
let selectedPNames = [];

function vizEgaz(typeGaz) {
    console.log("Entering vizEgaz");
    drawResults();
    var selectedFreg = document.getElementsByName("eGazFreg");
    var selectedConcelho = document.getElementsByName("eGazConcelho");
    var numberOfFreg = 0;
    var selectedP = [];
    for (var i = 0; i < selectedConcelho.length; i++) {
        if(selectedConcelho[i].checked) {
            numberOfFreg++;
            var place = String(selectedConcelho[i].value);
            var placeString = `\'${place}\'`
            console.log("place: ",placeString);
            selectedP.push(placeString);
        }
    }
    console.log("selectedP: ",selectedP);
    if (selectedP.length > 0){
        mapEAGazFilter = "e_ids IN ("+selectedP+")";
        console.log("mapFilter: ",mapEAGazFilter);
        //Zoom to selected Extent
        const vectorSource = new ol.source.Vector();
        var wfs_url = 'http://localhost:8080/geoserver/wfs?service=wfs&version=2.0.0&request=GetFeature&typeNames=apregoar:admin_gaz&cql_filter='+mapEAGazFilter+'&outputFormat=application/json';
        fetch(wfs_url).then(function (response) {
            json = response.json();
            console.log("JSON: ",json);
            return json;
        })
        .then(function (json) {
            const features = new ol.format.GeoJSON().readFeatures(json);
            console.log("Features: ",features);
            vectorSource.addFeatures(features);
            layerExtent = vectorSource.getExtent();
            mapGaz.getView().fit(ol.extent.buffer(layerExtent, .01)); //What does this number mean??
        });
        // Add eGaz shapes     
        wmsLayerEAGaz.setOpacity(0.5);
        wmsSourceEAGaz.updateParams({
            "LAYERS": "apreagoar:admin_gaz",
            "cql_filter": mapEAGazFilter
        });
        console.log("source updated")
        console.log("Egaz added to map")
    } else {
        wmsSourceEAGaz.updateParams({
            "LAYERS": "apreagoar:admin_gaz",
            "cql_filter": "e_ids = 0"
        });
        console.log("replaced layer with empty");
    }
}


//Return to previous story button
const btnReturn = document.getElementById("btnReturn");
btnReturn.innerHTML = '<a href="/publisher/'+sID+'/review"> <button type ="button" class="btn btn-primary">Volta à notícia</button> </a>';

//Setting default temporal inputs
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
}
function timeDefD(){
    var tBVal = new Date(document.getElementById("tBegin").value);
    var tEVal = new Date(document.getElementById("tEnd").value);
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

function limparTudo() {
    document.getElementById("pName").value = '';
    document.getElementById("pDesc").value = '';
    document.getElementById("tBegin").value = '';
    document.getElementById("tEnd").value = '';
    document.getElementById("tDesc").value = '';
}


///// MAPBOX DRAW /////////////
// Loading mapbox background    
mapboxgl.accessToken = 'pk.eyJ1IjoiY3dlbnRsaW5nIiwiYSI6ImNqd2F0cmVvajA5bHAzemx6NDF3bmZ6NGsifQ.2qy1Q4WfMf4XFllp2v96HQ';
const mapDesign = new mapboxgl.Map({
    container: 'mapDesign', // container ID
    style: 'mapbox://styles/cwentling/cksfd4uh6532w18nt3bbtxtae', // style URL
    center: [-9.150404956762742, 38.72493479806579], // starting position [lng, lat]
    zoom: 13 // starting zoom
});

// Add the control to the map.
mapDesign.addControl(
    new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        mapboxgl: mapboxgl
    })
);

//Drawing controls to polygon design
const draw = new MapboxDraw({
    displayControlsDefault: false,
    // Select which mapbox-gl-draw control buttons to add to the map.
    controls: {
        polygon: true,
        trash: true
    },
    // Set mapbox-gl-draw to draw by default.
    // The user does not have to click the polygon control button first.
    defaultMode: 'draw_polygon'
});

mapDesign.addControl(draw);

mapDesign.on('draw.create', updateArea);
mapDesign.on('draw.delete', updateArea);
mapDesign.on('draw.update', updateArea);



function updateArea(e) {
    console.log(e);
    const data = draw.getAll();
    if (data.features.length > 0) {
        //console.log("Data features lenght:")
        //console.log(data.features.length)
        const numPoly = data.features.length
        //const area = turf.area(data);
        // Restrict the area to 2 decimal points.
        //const rounded_area = Math.round(area * 100) / 100;
        answer.innerHTML = `<p><strong>${numPoly}</strong></p>`;
        // Getting coordinates input polygons
        console.log("data features (allPoly):");
        let allPoly = data.features;
        console.log(allPoly);
        let newPoly = data.features[0].geometry.coordinates[0];
        console.log("newPoly:");
        console.log(newPoly);
        geoPoly = JSON.stringify(allPoly);
        console.log("geoPoly");
        console.log(geoPoly);
        nGon = newPoly.length;
        console.log("Saving allPoly")
        
        saveG.innerHTML = `<select name="selectGeom" id="selectGeom"> <option value=${geoPoly}> ${numPoly} área(s)</option> </select>`;
        saveB.innerHTML = `<button type="button" class="btn btn-primary" id="submitGeom" onClick="submit_poly();">Atribua</button>`;
        
    } else {
        answer.innerHTML = '';
        if (e.type !== 'draw.delete')
            alert('Desenhar uma área');
            ;
        nGon=0;
        saveG.innerHTML = `<p>Sim geometria</p>`;
    }
    
}; 

/////SUBMIT FORM ///////
function submit_poly() {
    const successA = document.getElementById('successAnnouncement');
    successA.innerHTML = `<p>Saving... </p>`;
    var pNamef = document.getElementById("pName")
    var pDescf = document.getElementById("pDesc")
    var geom = geoPoly
    var tBeginf = document.getElementById("tBegin")
    var tEndf = document.getElementById("tEnd")
    var tDescf = document.getElementById("tDesc")

    var faltas = [];
    if (! pNamef.value) {
        console.log('pNamef: ');
        console.log(pNamef);
        faltas.push(pNamef.placeholder);
        console.log('faltas: ');
        console.log(faltas);
    }
    if (! tBeginf.value) {
        console.log('tBeginf: ');
        console.log(tBeginf);
        faltas.push(" Tempo do início")
    }
    if (! tEndf.value) {
        console.log('tEndf: ');
        console.log(tEndf);
        faltas.push(" Tempo do fim")
    }
    if (faltas.length > 0){
        successA.innerHTML = `<em style="color:red">Falta: ${faltas}</em>`;
        return
    }
    else {
        var entry = {
            type: "Feature",
            properties : {
                pName: pNamef.value,
                pDesc: pDescf.value,
                allDay: tBeginf.type,
                tBegin: tBeginf.value,
                tEnd: tEndf.value,
                tDesc: tDescf.value
            },
            geometry: geom
        };
        console.log(entry);
        
        fetch(`${window.origin}/publisher/${sID}/save_instance`, {
        //fetch(`${window.origin}/save_instance`, {
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
                console.log(`Looks like there was a problem. Status code: ${response.status}`);
                return;
            }
            response.json().then(function(data) {
                console.log(data);
                successA.innerHTML = `<p> Parabéns! Os dados ficam guardados. </p>`;
                //window.location.href = 'https://www.google.com';
            }
            );
        })
        .catch(function(error) {
        console.log("Fetch error: " + error);
        });
    }
}