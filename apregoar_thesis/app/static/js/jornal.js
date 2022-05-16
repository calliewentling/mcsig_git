//// Initialize loader ////
const spinner = document.getElementById("spinner");


/*LOADING OL MAPS */
const key = 'Jf5RHqVf6hGLR1BLCZRY';
const attributions =
    '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> ' +
    '<a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>';
 


//Basic story info
console.log("Geonoticia s_id: ",geonoticia.s_id);
var sID = geonoticia.s_id;
mapStoryFilter = "s_id="+sID;
console.log("mapStoryFilter: ",mapStoryFilter);
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
    //overlays: [overlay],
    target: 'map',
    view: view,
});



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
var layerExtent;
var vSource = new ol.source.Vector({
    format: new ol.format.GeoJSON(),
    loader: function(extent, resolution, projection, success, failure) {
        var proj = projection.getCode();
        console.log("proj: ",proj);
        var url = 'http://localhost:8080/geoserver/wfs?service=wfs&'+
            'version=2.0.0&request=GetFeature&typeNames=apregoar:geonoticias&'+
            'cql_filter='+mapStoryFilter+'&'+
            'outputFormat=application/json&srsname='+proj+'&';
            //'bbox='+extent.join(',')+','+proj; //Can't have bbox and cgl filter simultaneously
        console.log("url: ",url);
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
                success(features);
                layerExtent = vSource.getExtent();
                console.log("layerExtent: ",layerExtent);
                map.getView().fit(ol.extent.buffer(layerExtent, .01)); //What does this number mean??
                console.log("Successful loading of vector source");
            } else {
                onError();
            }
        }
        xhr.send();
        console.log("Passed send of xhr");
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

let highlight;
let getInfo;
const displayFeatureInfo = function (pixel) {
    const feature = map.forEachFeatureAtPixel(pixel, function (feature) {
        return feature;
    });
    const info = document.getElementById('info');
    if (feature) {
        info.innerHTML = feature.getId()+': '+feature.get('name');
    } else {
        info.innerHTML = '&nbsp;';
    }

    if (feature !== getInfo) {
        //Include pop up. Include multiple features in the same place
        if (getInfo) {
            featureOverlay.getSource().removeFeature(getInfo);
        }
        if (feature) {
            featureOverlay.getSource().addFeature(feature);
        }
        getInfo = feature;
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

map.on('pointermove', function (evt) {
    if (evt.dragging) {
        return;
    } 
    const pixel = map.getEventPixel(evt.originalEvent);
    highlightInstance(pixel);
});

map.on('click', function (evt) {
    displayFeatureInfo(evt.pixel);
});