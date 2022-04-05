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

//General Zoom Function
let layerExtent;
function zoomGaz(vectorSource){
    console.log("layerExtent (in zoomGaz): ",vectorSource.getExtent());
    var layerExtent = vectorSource.getExtent();
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
    vectorSourceStories.addFeatures(featuresS);
    if (featuresS.length > 0) {
        layerExtent = zoomGaz(vectorSource = vectorSourceStories);
    }
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
    //If the checkbox is checked, display the output text
    if (tswitch.checked == true){
        console.log("CREATE NEW UGAZ MODE");
        toggleMode.innerHTML = "Desenhar localização";
        poiGaz.style.display = "block";
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
function loadGazPOI(poi) {
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
    gazL = selectedIntE.length + selectedIntU.length;
    tGaz = updateGazTotals(uGaz, gazL);
    results = vizGaz(selectedIntE,selectedIntU);
    results["tGaz"] = tGaz;
    console.log(results);
    return results;
}

function vizGaz(selectedIntE,selectedIntU){
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
    results = initGaz();
    tGaz = results.tGaz;
    selectedIntE = results.selectedIntE;
    selectedIntU = results.selectedIntU;

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
        var entry = {
            type: "Feature",
            properties: {
                pName: pNamef.value,
                pDesc: pDescf.value,
                allDay: tBeginf.type,
                tBegin: tBeginf.value,
                tEnd: tEndf.value,
                tDesc: tDescf.value,
                eIds: selectedIntE,
                pIds: selectedIntU,
            },
            geometry: polyJson
        };
        console.log(entry);
        //Send to flask
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
            });
        })
        .catch(function(error) {
        console.log("Fetch error: " + error);
        });
    }
}


