//// Initialize loader ////
const spinner = document.getElementById("spinner");


/*LOADING OL MAPS */
const key = 'Jf5RHqVf6hGLR1BLCZRY';
const attributions =
    '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> ' +
    '<a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>';
 

    /**
* Elements that make up the popup.
*/

var docTitle = document.title;
//console.log(docTitle);
const container = document.getElementById('popup');
const storyContent = document.getElementById('popup-story');
const instContent = document.getElementById('popup-instances');
const closer = document.getElementById('popup-closer');
const pageahead = document.getElementById('popup-pageahead');
const pagebehind = document.getElementById('popup-pagebehind');
const popupinstancecount = document.getElementById('popup-instance-count');
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
        featureFocus.getSource().clear();
        featureOverlay.getSource().clear();
        closer.blur();
        return false;
    };
}

/**
* Add a click handler to page through popups.
* @return {boolean} Don't follow the href.
*/
var popupInstances = [];
var currentF = 0;
var featureCount = document.getElementById('featureCount');
if (pageahead) {
    pageahead.onclick = function () {
        //console.log("entered pageahead");
        //console.log("popupInstances from pageahead: ",popupInstances);
        //console.log("popupInstances.length: ", popupInstances.length);
        //console.log("currentF: ",currentF);
        if (currentF+1 == popupInstances.length){
            var nextF = 0;
        } else {
            var nextF = currentF + 1;
        }
        //console.log("nextF: ",nextF);
        displayCount = nextF + 1;
        featureFocus.getSource().clear();
        featureFocus.getSource().addFeature(popupFeatures[nextF]);
        popupinstancecount.innerHTML = displayCount+'/'+popupInstances.length;
        //featureCount.innerHTML = displayCount+'/'+popupInstances.length;
        instContent.innerHTML = popupInstances[nextF]["instanceBlock"];
        //highlightInstance(popupInstance=popupInstances[nextF].properties.i_id);
        notpop.innerHTML = popupInstances[nextF]["instanceBlock"];
        currentF = nextF;
        return false;
    };
}
if (pagebehind) {
    pagebehind.onclick = function () {
        //console.log("entered pagebehind");
        //console.log("popupInstances from pagebehind: ",popupInstances);
        if (currentF == 0){
            nextF = popupInstances.length-1;
        } else {
            nextF = currentF - 1;
        }
        //console.log("nextF: ",nextF);
        displayCount = nextF + 1; //Instead of number "0" display "1"
        featureFocus.getSource().clear();
        featureFocus.getSource().addFeature(popupFeatures[nextF]);
        popupinstancecount.innerHTML = displayCount+'/'+popupInstances.length;
        //featureCount.innerHTML = displayCount+'/'+popupInstances.length;
        instContent.innerHTML = popupInstances[nextF]["instanceBlock"];
        notpop.innerHTML = popupInstances[nextF]["instanceBlock"];
        currentF = nextF;
        return false;
    };
}




//Basic story info
console.log("Geonoticia s_id: ",geonoticia.s_id);
var sID = geonoticia.s_id;
var sTags = geonoticia.tags;
mapStoryFilter = "s_id="+sID;
//console.log("mapStoryFilter: ",mapStoryFilter);
var pub = geonoticia.publication;
if (pub == "A Mensagem") {
    var pubColor = "#5AA0D5";
} else if (pub == "Campo de Ourique Notícias") {
    var pubColor = "#DC0C15";
} else if (pub == "JFC Facebook"){
    var pubColor = "#437943";
} else if (pub == "CML Notícias"){
    pubColor = "#000000";
} else {
    pubColor = "#ffff00";
}

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

// Style text of page
document.querySelector('h1').style.color = pubColor;


/* Preparing highlight maps of selected instances */
fillColor = 'rgba(255,255,255,0.6';
const style = new ol.style.Style({
    fill: new ol.style.Fill({
        color: fillColor,
    }),
    stroke: new ol.style.Stroke({
        color: pubColor,
        width: 1,
    }),
    text: new ol.style.Text({
        font: '12px Calibri,sans-serif',
        fill: new ol.style.Fill({
            color: pubColor,
        }),
        stroke: new ol.style.Stroke({
            color: '#fff',
            width: 3,
        }),
    }),
})

let url;
var layerExtent;
var numStoryFeatures;
var vSource = new ol.source.Vector({
    format: new ol.format.GeoJSON(),
    loader: function(extent, resolution, projection, success, failure) {
        var proj = projection.getCode();
        //console.log("proj: ",proj);
        url = 'http://localhost:8080/geoserver/wfs?service=wfs&'+
            'version=2.0.0&request=GetFeature&typeNames=apregoar:geonoticias&'+
            'cql_filter='+mapStoryFilter+'&'+
            'outputFormat=application/json&srsname='+proj+'&';
        //console.log("url: ",url);
        var xhr = new XMLHttpRequest();
        xhr.open('GET',url);
        var onError = function() {
            console.log("Error in loading vector source");
            vSource.removeLoadedExtent(extent);
            failure();
        }
        xhr.onerror = onError;
        xhr.onload = function() {
            if (xhr.status == 200){
                var features = vSource.getFormat().readFeatures(xhr.responseText);
                vSource.addFeatures(features);
                noFeatures = false;
                if (features.length == 1) {
                    if (features[0]["A"]["geometry"] == null){
                        console.log("no instances here");
                        noFeatures = true;
                    }
                }
                success(features);
                if (noFeatures == false) {
                    layerExtent = vSource.getExtent();
                    //console.log("layerExtent: ",layerExtent);
                    map.getView().fit(ol.extent.buffer(layerExtent, .01)); //What does this number mean??
                }
                var sourceFeatureInfo = vSource.getFeatures();
                //console.log("sourceFeatureInfo: ",sourceFeatureInfo);
                numStoryFeatures = sourceFeatureInfo.length;
                //console.log("Number of features in story: ", numStoryFeatures);
                console.log("Successful loading of vector source");
            } else {
                onError();
            }
        }
        xhr.send();
        //console.log("Passed send of xhr");
    },
    //strategy: ol.loadingstrategy.bbox,
});



const vectorLayer = new ol.layer.Vector({
    source: vSource,
    style: function (feature) {
        style.getText().setText(feature.get('p_name'));
        return style;
    },
});
map.addLayer(vectorLayer);


//Setting styles of vector layers
const highlightStyle = new ol.style.Style({
    stroke: new ol.style.Stroke({
        color: pubColor,
        width: 2,
    }),
    fill: new ol.style.Fill({
        color: fillColor,
    }),
    text: new ol.style.Text({
        font: '14px Calibri,sans-serif',
        fill: new ol.style.Fill({
            color: pubColor,
        }),
        stroke: new ol.style.Stroke({
            color: '#fff',
            width: 3,
        }),
    }),
});

const infoStyle = new ol.style.Style({
    stroke: new ol.style.Stroke({
        color: '#fff',
        width: 2,
    }),
    fill: new ol.style.Fill({
        color: pubColor+'80',
        opacity: .6,
    }),
    text: new ol.style.Text({
        font: '14px Calibri,sans-serif',
        fill: new ol.style.Fill({
            color: pubColor,
        }),
        stroke: new ol.style.Stroke({
            color: '#fff',
            width: 3,
        }),
    }),
});

const highlightFocus = new ol.style.Style({
    stroke: new ol.style.Stroke({
        color: '#ffff33',
        width: 3,
    })
})

const hoverOverlay = new ol.layer.Vector({
    source: new ol.source.Vector(),
    map: map,
    style: function (feature) {
        highlightStyle.getText().setText(feature.get('p_name'));
        return highlightStyle;
    },
});
const featureOverlay = new ol.layer.Vector({
    source: new ol.source.Vector(),
    map: map,
    style: function (feature) {
        infoStyle.getText().setText(feature.get('p_name'));
        return infoStyle;
    },
});
const featureFocus = new ol.layer.Vector({
    source: new ol.source.Vector(),
    map: map,
    style: highlightFocus,
});



let highlight;
let getInfo;
const displayFeatureInfo = function (pixel, popupFeatures, type) {
    if (popupFeatures.length>0) {
        //console.log("number of popupfeatures returned: ",popupFeatures.length);
        /* No longer necessary: now loading the number of features per story as max
        if (popupFeatures.length == numStoryFeatures){
            alert("Cuidade! Monstrado "+numStoryFeatures+" instâncias neste posiçião. Se calhar há mais. Utiliza os filtros para identificar todos as opções desejável.");
        }
        */
        popupInstances = [];

        for (let f=0; f < popupFeatures.length; f++) {
        //for (let f = 0; f < 1; f++) {
            /* Preparing story info */
            var sID = popupFeatures[f]["A"]["s_id"];
            var title = popupFeatures[f]["A"]["title"];
            var summary = popupFeatures[f]["A"]["summary"];
            var pubDate = new Date(popupFeatures[f]["A"]["pub_date"]);
            var webLink = popupFeatures[f]["A"]["web_link"];
            var section = popupFeatures[f]["A"]["section"];
            var tags = popupFeatures[f]["A"]["tags"];
            var author = popupFeatures[f]["A"]["author"];
            var publication = popupFeatures[f]["A"]["publication"];

            /* Preparing instance info */
            var iID = popupFeatures[f]["A"]["i_id"];
            var tBegin = new Date(popupFeatures[f]["A"]["t_begin"]);
            var tEnd = new Date(popupFeatures[f]["A"]["t_end"]);

            //console.log("tBegin type: "+typeof(tBegin)+', value: '+tBegin);
            var tType = popupFeatures[f]["A"]["t_type"];
            if (tType == "allday_y"){
                if (tBegin == tEnd){
                    var vizDate = '<p><em>'+tBegin.toDateString()+'</em></p>';
                } else {
                    var vizDate  = '<p><em>'+tBegin.toDateString()+' - '+tEnd.toDateString()+'</em></p>';
                }
            } else if (tType == "allday_n"){
                if (tBegin.toDateString() == tEnd.toDateString()){
                    var vizDate = '<p><em>'+tBegin.toDateString()+'</em>'+tBegin.toTimeString()+' - '+tEnd.toTimeString()+'</p>'; 
                } else {
                    var vizDate = '<p><em>'+tBegin.toDateString()+'</em>'+tBegin.toTimeString()+' - <em>'+tEnd.toDateString()+'</em> '+tEnd.toTimeString()+'</p>'; 
                }
            } else {
                vizDate = '';
            }
            console.log("vizDate: ",vizDate);
            var tDesc = popupFeatures[f]["A"]["t_desc"];
            var pDesc = popupFeatures[f]["A"]["p_desc"];
            var pID = popupFeatures[f]["A"]["p_id"];
            var pName = popupFeatures[f]["A"]["p_name"];
            var pGeom = popupFeatures[f]["A"]["geom"];

            /* Publisher: All Stories Popup */
            var storyBlock = 
                '<h3>' + title + '</h3>' +
                '<em>' + pubDate.toDateString() + '</em>'+
                '<p> <b>' + section + '</b>' + tags + '</p>' +  
                '<a href="' + webLink +'"> Notícia </a>';
        
            /* Publisher: Story Review Popup */
            var instanceBlock = 
                '<h3>' + pName + '</h3>' +
                '<p>'+pDesc+'</p>' +
                vizDate +
                '<p>'+tDesc+'</p>';
            
            /*Publisher: Tag review Popup */
            var tagBlock = 
                '<h3>'+pName+'</h3>'+
                '<em>'+vizDate+'</em>'+
                '<p>'+title+' ('+pubDate.toDateString()+')</p>';

            //Constructing geojson reference
            if (type == "article") {
                popupInstances[f] = {
                    "iID": iID,
                    "tDesc": tDesc,
                    "pDesc": pDesc,
                    "pName": pName,
                    "instanceBlock": instanceBlock
                }
            } else {
                popupInstances[f] = {
                    "iID": iID,
                    "tDesc": tDesc,
                    "pDesc": pDesc,
                    "pName": pName,
                    "instanceBlock": tagBlock
                }
            }
        }
        //console.log("popupInstances");
        //console.log(popupInstances);
        currentF = 0;
        displayCount = currentF+1;
        featureFocus.getSource().clear();
        featureFocus.getSource().addFeature(popupFeatures[currentF]);
        popupinstancecount.innerHTML = displayCount+'/'+popupInstances.length;
        //featureCount.innerHTML = displayCount+'/'+popupFeatures.length;
        instContent.innerHTML = popupInstances[currentF]["instanceBlock"];
        notpop.innerHTML = popupInstances[currentF]["instanceBlock"];
        
        /* Set Position */
        overlay.setPosition(coordinate);
    }else{ //If click doesn't hit a polygon
        overlay.setPosition(undefined);
    }
    
    var featureLength = popupFeatures.length;
    //console.log("Number of features: ",featureLength);
    const info = document.getElementById('info');
    if (popupFeatures.length > 0){
        var infoFeature = [];
        for (var i=0; i<popupFeatures.length; ++i){
            infoFeature.push(popupFeatures[i].get('p_name'));
        }
        info.innerHTML = infoFeature.join(', ') || '(unknown)';
    } else {
        info.innerHTML = 'No features selected';
    }
    featureOverlay.getSource().clear();
    for (let i = 0; i<featureLength; i++) {
        featureOverlay.getSource().addFeature(popupFeatures[i]);
    }
};


const highlightInstance = function (pixel) {
    const feature = map.forEachFeatureAtPixel(pixel, function (feature) {
        return feature;
    });    
    if (feature !== highlight) {
        if (highlight) {
            hoverOverlay.getSource().removeFeature(highlight);
        }
        if (feature) {
            hoverOverlay.getSource().addFeature(feature);
        }
        highlight = feature;
    }
};

/*
map.on('pointermove', function (evt) {
    if (evt.dragging) {
        return;
    } 
    const pixel = map.getEventPixel(evt.originalEvent);
    highlightInstance(pixel);
});
*/

let popupFeatures;
let popupTags;
map.on('click', function (evt) {
    coordinate = evt.coordinate;
    featureFocus.getSource().clear();
    console.log("currentZIndex: ",currentZIndex)
    //popupFeatures = vSource.getFeaturesAtCoordinate(coordinate);
    if (currentZIndex > 1){
        popupFeatures = tagSource.getFeaturesAtCoordinate(coordinate);
        console.log("popupFeatures: ",popupFeatures);
        displayFeatureInfo(evt.pixel, popupFeatures, type="tag");
    } else {
        popupFeatures = vSource.getFeaturesAtCoordinate(coordinate);
        console.log("popupFeatures: ",popupFeatures);
        displayFeatureInfo(evt.pixel, popupFeatures, type="article");
    }
    
    
    
});





// Creating a layer that clusters the overlapping values as an array
/*
var clusterSource = new ol.source.Cluster({
    distance: 0,
    source: vSource,
    geometryFunction: function(feature) {
        var geometry = feature.getGeometry();
        var type = geometry.getType();
        //console.log("type: ",type);
        // Requires definition of geometry for polygon (for all feature types except points, which works out of the box)
        if (type == 'MultiPolygon'){
            //console.log("MultiPolygon geometry");
            return geometry.getInteriorPoints();
        } else {
            console.log("not MultiPolygon geometry");
        }
    }
})

const clusterLayer = new ol.layer.Vector({
    source: clusterSource,
});
map.addLayer(clusterLayer);
*/

///// LOADING IFRAME ////
var iframeH = document.getElementById("iframeH");
function badIFrame(){
    console.log("bad iframe");
    iframeH.style.display = "none";
    document.getElementById("noArticle").style.display = "block";
    alert("Peço desculpa, a notícia não está a carregar a partir do anfitrião original");
};

function goodIFrame(){
    console.log("good iframe");
    iframeH.style.display = "block";
    document.getElementById("noArticle").style.display="none";
}


var timePast = false;
setTimeout(function() {
    timePast = true;
},1000);
const urlRedirect = "http://127.0.0.1:5000/";
if (iframeH.attachEvent){
    iframeH.attachEvent("onload",function(){
        if(timePast) {
            iframeH.style.display = "block";
        } else {
            iframeH.style.display = "none";
            document.getElementById("noArticle").style.display = "block";
            alert("Peço desculpa, a notícia não está a carregar a partir do anfitrião original");
            //window.open(urlRedirect, "_self");
        }
    });
} else {
    iframeH.onload = function(){
        if(timePast){
            iframeH.style.display = "block";
        } else {
            iframeH.style.display = "none";
            document.getElementById("noArticle").style.display = "block";
            alert("Peço desculpa, a notícia não está a carregar a partir do anfitrião original")
            //window.open(urlRedirect, "_self");
        }
    };
}

let tagSource;
let tagLayer;
var storyTags = {};
console.log("sTags: ",sTags);
for (let i=0; i < sTags.length; i++){
    tag = sTags[i]
    console.log("tag: ",tag);
    storyTags[tag] = false;
};
console.log("storyTags: ",storyTags);
// Attributes and next steps
function exploreMap(tag) {
    console.log("tag selected: ",tag);
    console.log("pub: ",pub);
    if (tag == "nearby"){
        console.log("Allow user to choose a radius to search within")
    } else if (tag == "freguesia"){
        console.log("Load all news happening in the same freguesia")
    } else {
        if (storyTags[tag] == true){
            console.log("storyTag ",tag," is already loaded");
            storyTags[tag] = false;
            map.removeLayer(tagLayer);
        }
        else {
            tagFilter = "publication='"+pub+"' and strToLowerCase(tags) like '%"+tag.toLowerCase()+"%'";
            console.log("tagFilter: ",tagFilter);
            cqlFilter = tagFilter.replace(/%/gi,"%25").replace(/'/gi,"%27").replace(/ /gi,"%20"); //Gloval
            console.log("cqlFilter: ",cqlFilter);
            //cql_filter=publication=%27A%20Mensagem%27&strToLowerCase(tags)=%27mobilidade%27&outputFormat=application/json&srsname=EPSG:4326
            tagSource = new ol.source.Vector({
                format: new ol.format.GeoJSON(),
                loader: function (extent, resolution, projection, success, failure) {
                    var proj = projection.getCode();
                    url = 'http://localhost:8080/geoserver/wfs?service=wfs&'+
                    'version=2.0.0&request=GetFeature&typeNames=apregoar:geonoticias&'+
                    'cql_filter='+cqlFilter+'&'+
                    'sortby=area+D&'+
                    'outputFormat=application/json&srsname='+proj;
                    console.log(url);
                    var xhr = new XMLHttpRequest();
                    xhr.open('GET',url);
                    var onError = function() {
                        console.log("Error in loading vector source (tags)");
                        tagSource.removeLoadedExtent(extent);
                        failure();
                    }
                    xhr.onerror = onError;
                    xhr.onload = function() {
                        if(xhr.status == 200){
                            var tagFeatures = tagSource.getFormat().readFeatures(xhr.responseText);
                            tagSource.addFeatures(tagFeatures);
                            noFeatures = false;
                            if (tagFeatures.length == 1){
                                if (features[0]["A"]["geometry"] == null){
                                    console.log("no instances here");
                                    noFeatures = true;
                                }
                            }
                            success(tagFeatures);
                            if (noFeatures == false){
                                layerExtent = tagSource.getExtent();
                                map.getView().fit(ol.extent.buffer(layerExtent,0.1));
                            }
                            var sourceFeatureInfo = tagSource.getFeatures();
                            numTagFeatures = sourceFeatureInfo.length;
                            console.log("sourceFeatureInfo (",numTagFeatures,"): ",sourceFeatureInfo);
                            console.log("Successful loading of tag source")
                        } else {
                            onError();
                        }
                    }
                    xhr.send();
                },
            });
            const tagLayer = new ol.layer.Vector({
                source: tagSource,
                /*style: function (feature) {
                    tagStyle.getText().setText(feature.get('p_name'));
                    return tagStyle;
                }*/
                style: tagStyle,
            });
            map.addLayer(tagLayer);
            tagLayer.setZIndex(currentZIndex);
            currentZIndex +=1;
            vectorLayer.setZIndex(currentZIndex);
            storyTags[tag] = true;
            console.log("tagSource (",tagSource.length,"): ",tagSource);
        }
    }
}
currentZIndex = 1;
const tagStyle = new ol.style.Style({
    stroke: new ol.style.Stroke({
        color: '#fff',
        width: 1,
    }),
    fill: new ol.style.Fill({
        color: pubColor+'40',
    }),
    /*text: new ol.style.Text({
        font: '14px Calibri,sans-serif',
        fill: new ol.style.Fill({
            color: pubColor+'E6',
        }),
        stroke: new ol.style.Stroke({
            color: '#fff',
            width: 2,
        }),
    }),*/
});

// BUTTON CLICK TO EXPLORE TAGS
/*
if (goToTag){
    fetch(`${window.origin}/jornal/explore`, {
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
*/