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

//Zoom to instances
const vectorSource = new ol.source.Vector();
var wfs_url = 'http://localhost:8080/geoserver/wfs?service=wfs&version=2.0.0&request=GetFeature&typeNames=apregoar:geonoticias&cql_filter='+mapStoryFilter+'&outputFormat=application/json';
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
            map.getView().fit(ol.extent.buffer(layerExtent, .01)); //What does this number mean??
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
                        '<a href="' + webLink +'"> Notícia </a>';
                    
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


/* Geonoticias code
 SELECT si.s_id,
    si.title,
    si.summary,
    si.pub_date,
    si.web_link,
    si.section,
    si.tags,
    si.author,
    si.publication,
    si.u_id,
    si.i_id,
    si.t_begin,
    si.t_end,
    si.t_type,
    si.t_desc,
    si.p_desc,
    si.p_id,
    u.p_name,
    u.geom
   FROM ( SELECT s.s_id,
            s.title,
            s.summary,
            s.pub_date,
            s.web_link,
            s.section,
            s.tags,
            s.author,
            s.publication,
            s.u_id,
            i.i_id,
            i.t_begin,
            i.t_end,
            i.t_type,
            i.t_desc,
            i.p_desc,
            i.p_id
           FROM apregoar.stories s
             LEFT JOIN apregoar.instances i ON s.s_id = i.s_id
          ORDER BY s.s_id) si
     RIGHT JOIN apregoar.ugazetteer u ON si.p_id = u.p_id
  ORDER BY si.s_id;
  */

  /*
  SELECT ugaz.s_id,
    ugaz.title,
    ugaz.summary,
    ugaz.pub_date,
    ugaz.web_link,
    ugaz.section,
    ugaz.tags,
    ugaz.author,
    ugaz.publication,
    ugaz.u_id,
    ugaz.i_id,
    ugaz.t_begin,
    ugaz.t_end,
    ugaz.t_type,
    ugaz.t_desc,
    ugaz.p_id,
    ugaz.p_name,
    ugaz.geom AS ugaz_geom,
    egaz.e_id,
    egaz.explicit,
    egaz.name,
    egaz.type,
    egaz.t_geom AS egaz_geom,
    st_collect(ugaz.geom, egaz.t_geom) AS all_geom
   FROM ( SELECT si.s_id,
            si.title,
            si.summary,
            si.pub_date,
            si.web_link,
            si.section,
            si.tags,
            si.author,
            si.publication,
            si.u_id,
            si.i_id,
            si.t_begin,
            si.t_end,
            si.t_type,
            si.t_desc,
            si.p_desc,
            si.p_id,
            u.p_name,
            u.geom
           FROM ( SELECT s.s_id,
                    s.title,
                    s.summary,
                    s.pub_date,
                    s.web_link,
                    s.section,
                    s.tags,
                    s.author,
                    s.publication,
                    s.u_id,
                    i.i_id,
                    i.t_begin,
                    i.t_end,
                    i.t_type,
                    i.t_desc,
                    i.p_desc,
                    i.p_id
                   FROM apregoar.stories s
                     LEFT JOIN apregoar.instances i ON s.s_id = i.s_id
                  ORDER BY s.s_id) si
             RIGHT JOIN apregoar.ugazetteer u ON si.p_id = u.p_id
          ORDER BY si.s_id) ugaz
     LEFT JOIN ( SELECT inst.i_id,
            inst.t_begin,
            inst.t_end,
            inst.t_type,
            inst.t_desc,
            inst.p_desc,
            inst.s_id,
            inst.p_id,
            inst.p_name,
            inst.created,
            inst.edited,
            inst.e_id,
            inst.explicit,
            inst.last_edited,
            agaz.e_ids,
            agaz.name,
            agaz.type,
            agaz.t_geom
           FROM ( SELECT i.i_id,
                    i.t_begin,
                    i.t_end,
                    i.t_type,
                    i.t_desc,
                    i.p_desc,
                    i.s_id,
                    i.p_id,
                    i.p_name,
                    i.created,
                    i.edited,
                    place.e_id,
                    place.explicit,
                    place.last_edited
                   FROM apregoar.instances i
                     LEFT JOIN apregoar.instance_positioning place ON i.i_id = place.i_id
                  ORDER BY i.i_id) inst
             LEFT JOIN apregoar.admin_gaz agaz ON inst.e_id = agaz.e_ids
          ORDER BY inst.i_id) egaz ON ugaz.s_id = egaz.s_id
  ORDER BY ugaz.s_id;
  */