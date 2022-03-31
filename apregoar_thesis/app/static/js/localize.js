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

//DEFINE LOCALIZATION TOTALS
let tGaz = 0;
let uGaz = 0;
let eGaz = 0;

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
    var eSwitch = document.getElementById("eSwitch");
    //Get output text
    var newUgaz = document.getElementById("newUgaz");
    var eGazMap = document.getElementById("eGazMap");
    var toggleMode = document.getElementById("toggleMode");
    //If the checkbox is checked, display the output text
    if (tswitch.checked == true){
        console.log("CREATE NEW UGAZ MODE");
        toggleMode.innerHTML = "Desenhar localização";
        // De-toggle egazetteer association switch
        eSwitch.checked = false;
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
    updateGazTotals();
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


// See eGaz selection options
function eGazOpts(){
    //Get the checkbox
    var eSwitch = document.getElementById("eSwitch");
    var tSwitch = document.getElementById("tswitch");
    var eToggleMode = document.getElementById("eToggleMode");
    var chooseEGaz = document.getElementById("chooseEGaz");
    var summaryEGaz = document.getElementById("summaryEGaz");
    // If toggle activated, show selection of Gazetteers
    if (eSwitch.checked == true){
        console.log("Select EGAZ mode");
        tSwitch.checked = false;
        eToggleMode.innerHTML = "Escolher Gazetteers";
        chooseEGaz.style.display = "block";
        summaryEGaz.style.display = "none";
    } else {
        console.log("Summary EGAZ mdoe");
        eToggleMode.innerHTML = "Sumário das escolhas";
        chooseEGaz.style.display = "none";
        summaryEGaz.style.display = "block";
    }
};
// Adding fetches to get access to gazetteers
const loadingGaz = document.getElementById("loadingGaz");
function loadGaz(gazetteer) {
    //const loadingGaz = document.getElementById(gazetteer);
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
            $(function(){
                $(`#select_${gazetteer}`).multiSelect();
            });
        })
    })
    .catch(function(error){
        console.log("Fetch error: "+error);
    });
}


/*
// Visualize selection of eGaz item on the map
const selectedEgaz = document.getElementById("selectedEgaz");
let selectedP = [];




var selectEgazFreguesia = document.getElementsByName("selectEgazFreguesia")[0];
// new calc vals 
function calcEGaz(selectGaz) {
    // Resetting base values
    var numberPlace = 0;
    var selectedP = [];
    var selectedPBasic = [];
    var eGazVals = [];
    // Reworking for new dropdowns
    console.log("Freguesias: ",selectEgazFreguesia)
    var numberFreg = 0;
    for (var i = 0; i < selectGaz.length; i++) {
        if(selectEgazFreguesia[i].selected) {
            numberFreg++;
            console.log("Value checked: ",selectEgazFreguesia[i].value);
            var placeF = String(selectEgazFreguesia[i].value);
            var placeFString = `\'${placeF}\'`;
            console.log("Freguesia place: ",placeFString);
            selectedP.push(placeFString);
            //Just Int Values
            console.log("selectedFreg value ",selectEgazFreguesia[i].value)
            var fregVal = selectEgazFreguesia[i].value;
            for (j in fregVal) {
                var eGazVal = Number(j);
                eGazVals.push(eGazVal); 
            }
            console.log("eGazVals: ",eGazVals);
            selectedPBasic.push(selectEgazFreguesia[i].value);
        }
    }
}
*/


function prepGaz(selectedGaz,selectedStr,selectedInt) {
    console.log("selectedGaz",selectedGaz); //New selected Gazetteer values
    // Reset iterim counter vals
    var numberPlaces = 0;
    for (var i=0; i<selectedGaz.length; i++) {
        if (selectedGaz[i].selected){
            numberPlaces++;
            console.log("Value checked: ",selectedGaz[i].value);
            var place = String(selectedGaz[i].value);
            var placeString = `\'${place}\'`;
            selectedStr.push(placeString);
            selectedInt.push(selectedGaz[i].value);
            console.log("selectedStr: ",selectedStr);
        }
    }
    return {selectedStr, selectedInt}
}

function vizGaz(){
    console.log("Entering vizGaz");
    // Initializing values
    var selectedStrE = [];
    var selectedIntE = [];
    var selectedStrU = [];
    var selectedIntU = [];
    let selectedGaz;
    // Preparing freguesias
    var selectEgazFreguesia = document.getElementsByName("selectEgazFreguesia")[0];
    console.log("vizGaz selectEgazFreguesia: ",selectEgazFreguesia);
    var result = prepGaz(selectedGaz = selectEgazFreguesia,selectedStr = selectedStrE,selectedInt = selectedIntE);
    selectedIntE = result.selectedInt;
    selectedStrE = result.selectedStr;
    console.log("selectedStrE after Freguesia: ",selectedIntE);
    // Preparing concelhos
    var selectEgazConcelho = document.getElementsByName("selectEgazConcelho")[0];
    result = prepGaz(selectedGaz = selectEgazConcelho, selectStr = selectedStrE, selectedInt = selectedIntE);
    selectedIntE = result.selectedInt;
    selectedStrE = result.selectedStr;
    console.log("selectedStrE after Concelho: ",selectedIntE);
    // Preparing other administrative areas
    var selectEgazExtra = document.getElementsByName("selectEgazExtra")[0];
    console.log("selectEgazExtra: ",selectEgazExtra);
    result = prepGaz(selectedGaz = selectEgazExtra, selectStr = selectedStrE, selectedInt = selectedIntE);
    selectedIntE = result.selectedInt;
    selectedStrE = result.selectedStr;
    console.log("selectedStrE after Extra: ",selectedIntE);
    //Update Gaz Totals
    var gazL = selectedStrE.length;
    //gazL = selectedStrE.length + selectedStrU.length;
    updateGazTotals(gazL);
    // Get EGaz map images
    if (selectedStrE.length > 0){
        console.log("selectedStrE for Filter: ",selectedStrE);
        mapEAGazFilter = "e_ids IN ("+selectedStrE+")";
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
    return {selectedStrE, selectedIntE, selectedStrU, selectedIntU}
}


//Update Gaz Totals
function updateGazTotals(gazL) {
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

function submitInstance() {
    // Get all checked values
    var results = calcEGaz();
    var selectedP = results.selectedP;
    console.log("selectedP: ",selectedP);
    var stringP = "";
    for (p in selectedP) {
        stringP.concat(String(selectedP[p]));
    }
    console.log("stringP: ",stringP);
    
    selectedPBasic = results.selectedPBasic;
    console.log("selectedPBasic",selectedPBasic);
    // Get form values for validation
    var pNamef = document.getElementById("pName");
    var pDescf = document.getElementById("pDesc");
    var tBeginf = document.getElementById("tBegin");
    var tEndf = document.getElementById("tEnd");
    var tDescf = document.getElementById("tDesc");
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
    if (faltas.length > 0){
        window.alert("Falta alguns campos requeridos");
        validation.style.display="block";
        successAnnouncement.style.display="block";
        successAnnouncement.innerHTML = `<em style="color:red">Falta: ${faltas}</em>`;
        return
    } else {
        //Remove validation commentary
        validation.style.display="none";
        successAnnouncement.style.display="none";
        //Prepare data for sending to flask
        console.log("selectedPBasic: ",selectedPBasic)
        var entry = {
            type: "Feature",
            properties: {
                pName: pNamef.value,
                pDesc: pDescf.value,
                allDay: tBeginf.type,
                tBegin: tBeginf.value,
                tEnd: tEndf.value,
                tDesc: tDescf.value,
                eIds: selectedPBasic
            },
            geometry: polyJson
        };
        console.log(entry);
        //Send to flask
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


                    
                    //window.location.href = 'https://www.google.com';
                }
                );
            })
            .catch(function(error) {
            console.log("Fetch error: " + error);
            });
    }
}


/*
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
*/