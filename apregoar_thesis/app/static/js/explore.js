

// MULTISELECT CHECKBOX //

$(document).ready(function () {
    $("#checksTags").CreateMultiCheckBox({ width: '230px', defaultText : 'Tags', height:'250px', multiName: "checkTags" });
    $("#checksSections").CreateMultiCheckBox({ width: '230px', defaultText : 'Secções', height:'250px', multiName: "checkSections"});
    $("#checksAuthors").CreateMultiCheckBox({ width: '230px', defaultText : 'Escritores', height:'250px', multiName: "checkAuthors"});
    $("#checksPublications").CreateMultiCheckBox({ width: '230px', defaultText : 'Fontes', height:'250px', multiName: "checkPublications"});
    $("#checksT_types").CreateMultiCheckBox({ width: '230px', defaultText : 'Definição Temporal', height:'250px', multiName: "checkT_types"});
    $("#checksP_types").CreateMultiCheckBox({ width: '230px', defaultText : 'Definição Espacial', height:'250px', multiName: "checkP_types"});
    $("#checksE_names").CreateMultiCheckBox({ width: '230px', defaultText : 'Areas Administrativas', height:'250px', multiName: "checkE_names"});
});

$(document).ready(function () {
    $(document).on("click", ".MultiCheckBox", function () {
        var detail = $(this).next();
        detail.show();
    });

    $(document).on("click", ".MultiCheckBoxDetailHeader input", function (e) {
        console.log("Checkpoint");
        //This should be accessed to remove everything from selection;
        e.stopPropagation();
        var hc = $(this).prop("checked");
        console.log("hc: ",hc);
        $(this).closest(".MultiCheckBoxDetail").find(".MultiCheckBoxDetailBody input").prop("checked", hc);
        $(this).closest(".MultiCheckBoxDetail").next().UpdateSelect();
    });

    $(document).on("click", ".MultiCheckBoxDetailHeader", function (e) {
        console.log("This enters a check all scenario");
        var inp = $(this).find("input");
        var chk = inp.prop("checked");
        inp.prop("checked", !chk);
        $(this).closest(".MultiCheckBoxDetail").find(".MultiCheckBoxDetailBody input").prop("checked", !chk);
        $(this).closest(".MultiCheckBoxDetail").next().UpdateSelect();
    });

    $(document).on("click", ".MultiCheckBoxDetail .cont input", function (e) {
        e.stopPropagation();
        $(this).closest(".MultiCheckBoxDetail").next().UpdateSelect();

        var val = ($(".MultiCheckBoxDetailBody input:checked").length == $(".MultiCheckBoxDetailBody input").length)
        $(".MultiCheckBoxDetailHeader input").prop("checked", val);
    });

    $(document).on("click", ".MultiCheckBoxDetail .cont", function (e) {
        var inp = $(this).find("input");
        var chk = inp.prop("checked");
        inp.prop("checked", !chk);

        var multiCheckBoxDetail = $(this).closest(".MultiCheckBoxDetail");
        var multiCheckBoxDetailBody = $(this).closest(".MultiCheckBoxDetailBody");
        multiCheckBoxDetail.next().UpdateSelect();
        

        var val = ($(".MultiCheckBoxDetailBody input:checked").length == $(".MultiCheckBoxDetailBody input").length)
        $(".MultiCheckBoxDetailHeader input").prop("checked", val);
        
    });

    $(document).mouseup(function (e) {
        var container = $(".MultiCheckBoxDetail");
        if (!container.is(e.target) && container.has(e.target).length === 0) {
            container.hide();
        }
    });
});


var defaultMultiCheckBoxOption = { width: '220px', defaultText: "Selecionar", height: '200px' };

//var recentDate1 = new Date();
//var recentDate2 = new Date();
let stories;
const baseFilters = {
    "Tags": [],
    "Sections": [],
    "Authors": [],
    "Publications": [],
    "T_types": [],
    "P_types": [],
    "E_names": [],
    "pubDateR1": recentDate1,
    "pubDateR2": recentDate2,
    "iDateR1": "",
    "iDateR2": "",
    "pNameSearch": "",
    "iDateFilter": false,
    "pubDateFilterMin":false,
    "pubDateFilterMax":false,
    "boundaryPolys":[],
    "boundaryDefinition":"containPartial",
};
var allFilters = baseFilters;

// USING PYTHON PASSED RECENT VALUES TO ESTABLISH DATE LIMITS
console.log("recentDate1: ",recentDate1,". recentDate2: ",recentDate2);
    $( "#from" ).datepicker("option", "minDate", pubDate1);
    $( "#from" ).datepicker("option","maxDate", recentDate2);
    $( "#from" ).datepicker("setDate", new Date(recentDate1.getFullYear(), recentDate1.getMonth(), recentDate1.getDate()));
    $( "#to" ).datepicker("option", "minDate", recentDate1);
    $( "#to" ).datepicker( "option", "maxDate", pubDate2 );
    $( "#to" ).datepicker("setDate", new Date(recentDate2.getFullYear(), recentDate2.getMonth(), recentDate2.getDate()));


jQuery.fn.extend({
    CreateMultiCheckBox: function (options) {

        var localOption = {};
        localOption.width = (options != null && options.width != null && options.width != undefined) ? options.width : defaultMultiCheckBoxOption.width;
        localOption.defaultText = (options != null && options.defaultText != null && options.defaultText != undefined) ? options.defaultText : defaultMultiCheckBoxOption.defaultText;
        localOption.height = (options != null && options.height != null && options.height != undefined) ? options.height : defaultMultiCheckBoxOption.height;
        this.hide();
        this.attr("multiple", "multiple");
        console.log("this: ",this[0].id);
        var divSel = $("<div class='MultiCheckBox' id='"+this[0].id+"Vals'>" + localOption.defaultText + "<span class='k-icon k-i-arrow-60-down'><svg aria-hidden='true' focusable='false' data-prefix='fas' data-icon='sort-down' role='img' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 512' class='svg-inline--fa fa-sort-down fa-w-10 fa-2x'><path fill='currentColor' d='M41 288h238c21.4 0 32.1 25.9 17 41L177 448c-9.4 9.4-24.6 9.4-33.9 0L24 329c-15.1-15.1-4.4-41 17-41z' class=''></path></svg></span></div>").insertBefore(this);
        divSel.css({ "width": localOption.width });

        var detail = $("<div class='MultiCheckBoxDetail'><div class='MultiCheckBoxDetailHeader'><input type='checkbox' class='mulinput' value='-1982' /><div>Tudo</div></div><div class='MultiCheckBoxDetailBody'></div></div>").insertAfter(divSel);
        detail.css({ "width": parseInt(options.width) + 10, "max-height": localOption.height });
        var multiCheckBoxDetailBody = detail.find(".MultiCheckBoxDetailBody");

        this.find("option").each(function () {
            var val = $(this).attr("value");

            if (val == undefined)
                val = '';

            multiCheckBoxDetailBody.append("<div class='cont'><div><input type='checkbox' class='mulinput' value='" + val + "' /></div><div>" + $(this).text() + "</div></div>");
        });

        multiCheckBoxDetailBody.css("max-height", (parseInt($(".MultiCheckBoxDetail").css("max-height")) - 28) + "px");

    },
    UpdateSelect: function () {
        var arr = [];
        var filterName = this[0].id.replace("checks","");
        var filterMultiName = this[0].id+'Vals';
        const filterMulti = document.getElementById(filterMultiName);

        this.prev().find(".mulinput:checked").each(function () {
            arr.push($(this).val());
        });

        this.val(arr);
        console.log("arr ",arr);
        allFilters[filterName] = arr;
        //filterAllVals();

        // Gathering values of inputs & updating dropdown viz based on selections
        filterVals = [];
        /*this.prev().find(".mulinput:checked").each(function() {
            filterVals.push($(this).attr("value"));
        })*/
        const attrFilters = document.getElementById("attrFilters");
        if (arr.length < 1) {
            filterVals = filterName;
        } else if (arr.length > 3) {
            filterVals = "("+arr.length+" "+ filterName.toLowerCase() +" selecionados)"
        } else {
            filterVals = arr
        }
        //attrFilters.innerHTML = filterVals;
        filterMulti.innerHTML= filterVals+"<span class='k-icon k-i-arrow-60-down'><svg aria-hidden='true' focusable='false' data-prefix='fas' data-icon='sort-down' role='img' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 512' class='svg-inline--fa fa-sort-down fa-w-10 fa-2x'><path fill='currentColor' d='M41 288h238c21.4 0 32.1 25.9 17 41L177 448c-9.4 9.4-24.6 9.4-33.9 0L24 329c-15.1-15.1-4.4-41 17-41z' class=''></path></svg></span>";
    },
});





/*LOADING OL MAPS */
const key = 'Jf5RHqVf6hGLR1BLCZRY';
const attributions =
    '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> ' +
    '<a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>';
 

//Generic Map Setup
const view = new ol.View({
    projection: 'EPSG:4326',
    center: [-9.150404956762742,38.72493479806579],
    zoom: 12
});

const backDrop = new ol.layer.Tile({
    source: new ol.source.Stamen({
        layer: 'toner-lite',
    }),
});

/*******************
 * Add overlay to map
 * 
 */
 const popupContainer = document.getElementById('popupContainer');
 const popupContent = document.getElementById('popupContent');
 const popupCloser = document.getElementById('popup-closer');
 
 const popupOverlay = new ol.Overlay({
     element: popupContainer,
     autoPan: true,
     autoPanAnimation: {
         duration: 250,
     },
 });
 
 popupCloser.onclick = function (){
     popupOverlay.setPosition(undefined);
     popupCloser.blur();
     return false;
 };
 
var map = new ol.Map({
    overlays: [popupOverlay],
    target: 'map',
    view: view,
});
map.addLayer(backDrop);

let popupFeatures;
map.on('singleclick',function(evt){
    const coordinate = evt.coordinate;
    //Fetch info from WFS
    popupFeatures = filteredSource.getFeaturesAtCoordinate(coordinate);
    console.log("popupFeatures: ",popupFeatures);
    if (popupFeatures.length>0){
        popupInstances = [];
        for (i=0;i<popupFeatures.length;i++){
            pInfo = popupFeatures[i]["A"];
            popupInstances.push(pInfo["i_id"]);
            //console.log("s_id: ",popupFeatures[i]["A"]["s_id"],", i_id: ",popupFeatures[i]["A"]["i_id"]);
        }
        iID = pInfo["i_id"];
        sID = pInfo["s_id"];
        for (j=0;j<stories.length;j++){
            if (instances[j]["i_id"] == iID){
                cardD = instances[j];
                stopVar = "instance";
            }
        }
        renderDeets(cardD = cardD);
        //popupContent.innerHTML = 's_id '+pInfo["s_id"]+'<br> i_id '+pInfo["i_id"]+"<br> Total instances: "+popupFeatures.length;
        popupContent.innerHTML = 'i_ids: '+popupInstances+'<br> ('+popupFeatures.length+')';
        popupContainer.style.display="block";
    } else {
        closeDeets();

    }
    
    popupOverlay.setPosition(coordinate);
})




/* Preparing highlight maps of selected instances */
fill1 = 'rgba(156,34,15,0.2)';
fill2 = 'rgba(156,34,15,1)';
fill3 = 'rgba(0,0,0,0.5)';
fill4 = 'rgba(155, 185, 193,0.4)';
const style = new ol.style.Style({
    fill: new ol.style.Fill({
        color: fill1,
    }),
    text: new ol.style.Text({
        font: '16px Calibri,sans-serif',
        fill: new ol.style.Fill({
            color: 'rgba(255,255,255,1)',
        }),
        stroke: new ol.style.Stroke({
            color: fill2,
            width: 1,
        }),
    }),
})
const filterStyle = new ol.style.Style({
    fill: new ol.style.Fill({
        color: fill4,
    }),
    stroke: new ol.style.Stroke({
        color: fill3,
        width: 5,
    }),
    text: new ol.style.Text({
        font: '12px Calibri,sans-serif',
        fill: new ol.style.Fill({
            color: fill2,
        }),
        stroke: new ol.style.Stroke({
            color: '#fff',
            width: 3,
        }),
    }),
});
const nullStyle = new ol.style.Style({
    fill: new ol.style.Fill({
        color: [255,255,255,0],
    }),
    stroke: new ol.style.Stroke({
        color: [244,244,255,0],
        width: 0,
    }),
});

var popupSource = new ol.source.Vector();

//Initiate drawMap
var drawSource = new ol.source.Vector({wrapX: false});
var drawVector = new ol.layer.Vector({
    source: drawSource,
});

const drawMap = new ol.Map({
    layers: [backDrop, drawVector], //includes basemap layer (backDrop) for consistency
    target: 'filterMap', //create target called 'filterMap'
    view: view, //use hte same base view as the main map ('map'). When 'map' view is updated, also setting 'filterMap'.
});

let draw = new ol.interaction.Draw({
    source: drawSource,
    type: "Polygon",
    freehand: true,
});
drawMap.addInteraction(draw);

//Get interactive areas
var instanceResults = document.getElementById("instanceResults");
var storyResults = document.getElementById("storyResults");
var recentResults = document.getElementById("recentResults");


function refineFeatures(feature){
    feature["pub_date"] = new Date(feature["pub_date"]);
    feature["t_begin"] = new Date(feature["t_begin"]);
    feature["t_end"] = new Date(feature["t_end"]);
    return feature
}

var maxLisbonExtent = [-9.500526607165842, 38.40907442337447,-8.490972125626802, 39.31772866134256];

//General update of layerExtent to be called on filters
function updateViewExtent(inputSource){
    layerExtent = inputSource.getExtent();
    console.log("layerExtent: ",layerExtent);
    filterMaxExtent = layerExtent;
    if (layerExtent[0] < maxLisbonExtent[0]){
        filterMaxExtent[0] = maxLisbonExtent[0];
    };
    if (layerExtent[1] < maxLisbonExtent[1]){
        filterMaxExtent[1] = maxLisbonExtent[1];
    };
    if (layerExtent[2] > maxLisbonExtent[2]){
        filterMaxExtent[2] = maxLisbonExtent[2];
    };
    if (layerExtent[3] > maxLisbonExtent[3]){
        filterMaxExtent[3] = maxLisbonExtent[3];
    };
    console.log("new layer extent: ",filterMaxExtent);
    map.getView().fit(ol.extent.buffer(filterMaxExtent, .01));
    drawMap.getView().fit(ol.extent.buffer(filterMaxExtent, .01));
}

//Load source. Returns 
//let firstPubDate, lastPubDate, firstInstDate, lastInstDate;
function loadSourceToExplore(wfs_url, loadType) {
    console.log("Entering loadSourceToExplore()");
    console.log("wfs_url: ",wfs_url);
    console.log("loadType: ",loadType);
    var tempSource = new ol.source.Vector({
        format: new ol.format.GeoJSON(),
        loader: function (extent, resolution, projection, success, failure) {
            console.log("In loader");
            //var proj = projection.getCode();
            url = wfs_url;
            console.log("url: ",url);
            var xhr = new XMLHttpRequest();
            xhr.open('GET',url);
            var onError = function() {
                console.log("Error in loading vector source");
                tempSource.removeLoadedExtent(extent);
                failure();
            }
            xhr.onerror = onError;
            xhr.onloadstart = function() {
                console.log(loadType," load begun");
            };
            xhr.onloadend = function() {
                console.log(loadType," load end");
            }
            xhr.onload = function() {
                console.log("XHR status: ",xhr.status);
                if (xhr.status == 200){
                    console.log("XHR STATUS 200");
                    var features = [];
                    features = tempSource.getFormat().readFeatures(xhr.responseText);
                    tempSource.addFeatures(features);
                    var noFeatures = false;
                    if (features.length == 1) {
                        if (features[0]["A"]["geometry"] == null){
                            console.log("no instances here");
                            noFeatures = true;
                        }
                    }
                    success(features);
                    if (noFeatures == false) {
                        console.log("Features in ",loadType," exist!");
                        updateViewExtent(inputSource = tempSource);
                        //Getting info of preloaded features
                        preloadF = [];
                        console.log("features: ",features);
                        for (i = 0; i<features.length; i++){
                            refinedFeature = refineFeatures(features[i]["A"]);
                            preloadF.push(refinedFeature);
                        }
                        if (loadType == "recent") {
                            const recentDate1 = new Date(preloadF[preloadF.length-1]["pub_date"]);
                            allFilters["pubDateR1"] = recentDate1;
                            const recentDate2 = new Date(preloadF[0]["pub_date"]);
                            allFilters["pubDateR2"] = recentDate2;
                            console.log("recentDate1: ",recentDate1,". recentDate2: ",recentDate2);
                            $( "#from" ).datepicker("option", "minDate", pubDate1);
                            $( "#from" ).datepicker("option","maxDate", recentDate2);
                            $( "#from" ).datepicker("setDate", new Date(recentDate1.getFullYear(), recentDate1.getMonth(), recentDate1.getDate()));
                            $( "#to" ).datepicker("option", "minDate", recentDate1);
                            $( "#to" ).datepicker( "option", "maxDate", pubDate2 );
                            $( "#to" ).datepicker("setDate", new Date(recentDate2.getFullYear(), recentDate2.getMonth(), recentDate2.getDate()));
                            //document.getElementById("from").defaultValue = recentDate1.toDateString();
                            //document.getElementById("from").value = recentDate1.toDateString();
                            //document.getElementById("to").value = recentDate2.toDateString();
                            //document.getElementById("to").defaultValue = recentDate2.toDateString();
                            recentResults.innerHTML="<p>Monstrando as "+numRecent+" publicações mais recentes</p>";
                            console.log("allFilters after loading of recents: ",allFilters);
                        }
                        
                    }
                    //var sourceFeatureInfo = recentSource.getFeatures();
                    //console.log("sourceFeatureInfo: ",sourceFeatureInfo);
                    //numStoryFeatures = sourceFeatureInfo.length;
                    //console.log("Number of features in story: ", numStoryFeatures);
                    console.log("Successful loading of vector source");
                    if (loadType == "recent"){
                        console.log("recent features loaded");
                    }
                    if (loadType == "all") {
                        console.log("All resources loaded");
                    }
                    if (loadType=="storyInstAll"){
                        console.log("All story instances loaded");
                    }
                } else {
                    onError();
                    console.log("Bad request: not 200");
                }
            }
            xhr.send();
            console.log("Passed send of xhr");
        }
    });  
    
    console.log("tempSource: ",tempSource);
    console.log("end of loadSourceToExplore()");
    return tempSource;
};

/*
//Preload all entries in the background for filtering
urlAll = 'http://localhost:8080/geoserver/wfs?service=wfs&'+
    'version=2.0.0&request=GetFeature&typeNames=apregoar:geonoticias&'+
    'outputFormat=application/json&srsname=EPSG:4326';
var allSource = loadSourceToExplore(wfs_url = urlAll, loadType = "all");
const allLayer = new ol.layer.Vector({
    source: allSource,
    style: nullStyle,
})
map.addLayer(allLayer);
//map.removeLayer(filteredLayer);
*/

/*
//Preload recent entries (100)
const numRecent = 100;
urlRecent = 'http://localhost:8080/geoserver/wfs?service=wfs&'+
    'version=2.0.0&request=GetFeature&typeNames=apregoar:geonoticias&'+
    'count='+numRecent+'&'+
    'sortby=pub_date+D&'+
    'outputFormat=application/json&srsname=EPSG:4326';
var recentSource = loadSourceToExplore(wfs_url = urlRecent, loadType = "recent");
const recentLayer = new ol.layer.Vector({
    source: recentSource,
    style: function(feature) {
        style.getText().setText(feature.get('p_name'));
        return style;
    },
});
map.addLayer(recentLayer);
*/

var fromSelect = document.getElementById("from");
var toSelect = document.getElementById("to");




// DATE RANGE PICKER + Other filters//
$( function() {
    //console.log("recentDates in datepicker load: ",recentDate1,"-",recentDate2);
    var dateFormat = "mm/dd/yy",
    //var dateFormat = "D M dd yyyy",
    from = $( "#from" ).datepicker({
        gotoCurrent: true,
        altFormat: "D, d M y",
        changeMonth: true,
        numberOfMonths: 1,
        minDate: pubDate1,
        maxDate: pubDate2,
    }).on( "change", function() {
        to.datepicker( "option", "minDate", getDate( this ) );
        to.value = getDate ( allFilters["pubDateR2"] );
        from.value = getDate( this ).toDateString();
        allFilters["pubDateR1"] = getDate(this);
        checkDates(thisDate = getDate( this ), tofrom = "from");
        allFilters["pubDateFilterMin"] = true;
        //filterAllVals();
    }),

    to = $( "#to" ).datepicker({
        gotoCurrent: true,
        altFormat: "D, d M y",
        changeMonth: true,
        numberOfMonths: 1,
        minDate: pubDate1,
        maxDate: pubDate2,
    }).on( "change", function() {
        from.datepicker( "option", "maxDate", getDate( this ) );
        from.value = getDate(allFilters["pubDateR1"]);
        to.value = getDate( this );
        allFilters["pubDateR2"] = getDate(this);
        checkDates(thisDate = getDate( this ), tofrom = "to");
        allFilters["pubDateFilterMax"] = true;
        //filterAllVals();
    }),

    fromI = $( "#fromI" ).datepicker({
        defaultDate: new Date(),
        changeMonth: true,
        numberOfMonths: 1,
        minDate: iDate1,
        maxDate: iDate2,
    }).on( "change", function() {
        toI.datepicker( "option", "minDate", getDate( this ) );
        allFilters["iDateR1"] = getDate(this);
        allFilters["iDateFilter"] = true;
        //filterAllVals();
    }),

    toI = $( "#toI" ).datepicker({
        defaultDate: new Date(),
        changeMonth: true,
        numberOfMonths: 1,
        minDate: iDate1,
        maxDate: iDate2
    }).on( "change", function() {
        fromI.datepicker( "option", "maxDate", getDate( this ) );
        allFilters["iDateR2"] = getDate(this);
        allFilters["iDateFilter"] = true;
        //filterAllVals();
    })

    //Handling autochecking of alldates, also reinserting the current value
    function checkDates(thisDate, tofrom) {
        console.log();
        console.log("entering check date");
        console.log("thisDate: ",thisDate,". Tofrom: ",tofrom);
        console.log("to.value: ",to.value,". from.value: ",from.value);
        console.log("pubDateR2: ",allFilters["pubDateR2"],". pubDateR1: ",allFilters["pubDateR1"]);
        if (tofrom == "from"){    
            if (thisDate > allFilters["pubDateR2"] ){
                console.log("from loop: from value exceeds existing to value");
                to.value = thisDate.toDateString();
                allFilters["pubDateR2"] = thisDate;
            } else {
                console.log("from loop: from value less than existing to value");
                to.value = allFilters["pubDateR2"];
            }
        } else if (tofrom == "to") {
            if (thisDate < allFilters["pubDateR1"] ){
                console.log("to loop: to value exceeds existing from value");
                from.value = thisDate.toDateString();
                allFilters["pubDateR1"] = thisDate;
            } else {
                console.log("to loop: to value greater than existing to value");
                from.value = allFilters["pubDateR1"];
            }
        } else {
            console.log("How did we end up here?");
        }
        if (allFilters["pubDateR1"].toDateString() != pubDate1.toDateString()){
            console.log("From is not min date");
            allPub.checked = false;
        } else if (allFilters["pubDateR2"].toDateString() != pubDate2.toDateString()){
            console.log("To is not max date");
            allPub.checked = false;
        } else{
            console.log("Full range achieved")
            allPub.checked = true;
        }
        console.log("leaving check date");
        console.log();
    }

    function getDate( element ) {
        console.log("getDate element: ",element)
        var date;
        try {
            date = $.datepicker.parseDate( dateFormat, element.value );
        } catch( error ) {
            date = null;
        }
        return date;
    }

});


//Incorporating "Select all" for publish date and instance occurances
const allPub = document.getElementById('allPub');
allPub.addEventListener('change', (event) => {
    if (event.currentTarget.checked) {
        console.log("allPub checked");
        $( "#from" ).datepicker("option", "minDate", pubDate1);
        $( "#from" ).datepicker("option","maxDate", pubDate2);
        $( "#from" ).datepicker("setDate", new Date(pubDate1.getFullYear(), pubDate1.getMonth(), pubDate1.getDate()));
        $( "#to" ).datepicker("option", "minDate", pubDate1);
        $( "#to" ).datepicker( "option", "maxDate", pubDate2 );
        $( "#to" ).datepicker("setDate", new Date(pubDate2.getFullYear(), pubDate2.getMonth(), pubDate2.getDate()));
        allFilters["pubDateR1"] = pubDate1;
        allFilters["pubDateR2"] = pubDate2;
        allFilters["pubDateFilterMin"] = true;
        allFilters["pubDateFilterMax"] = true;
        //filterAllVals();
    }
});
const allInst = document.getElementById('allInst');
allInst.addEventListener('change', (event) => {
    if (event.currentTarget.checked) {
        console.log("allInst checked");
        $( "#fromI" ).datepicker("option", "minDate", iDate1);
        $( "#fromI" ).datepicker("option","maxDate", iDate2);
        $( "#toI" ).datepicker("option", "minDate", iDate1);
        $( "#toI" ).datepicker( "option", "maxDate", iDate2 );
        fromI.value = iDate1.toDateString();
        toI.value = iDate2.toDateString();
        allFilters["iDateR1"] = iDate1;
        allFilters["iDateR2"] = iDate2;
        allFilters["iDateFilter"] = false;
        //filterAllVals();
    }
});

/*INCLUDE TEXT SEARCH FIELDS IN FILTERING */


$("#pNameSearch").on("change", function() {
    allFilters["pNameSearch"] = $(this).val();
    //filterAllVals();
});


/*REFILTER VALUES*/
function extractTerms(list){
    terms = "";
    for (i=0; i<list.length; i++){
        item = list[i];
        item.trim();
        if (list.length == 1){
            terms = "like '%"+item+"%'";
        } else {
            if (i == 0){
                terms = "in ('%";
            }
            if (i == list.length-1){
                terms = terms + item + "%')";
            } else {
                terms = terms + item + "%','%";
            };
        };
    };
    terms.toLowerCase();
    return terms;
}
let filteredSource = new ol.source.Vector();
var filteredLayer = new ol.layer.Vector({
    style: function(feature) {
        filterStyle.getText().setText(feature.get('p_name'));
        return filterStyle;
    },
});
filterAllVals();

//Drawing and saving custom polygons
let polyJson;
let drawFeatures;
function drawResults() {
    console.log("Begin drawResults");
    console.log("DrawSource: ",drawSource);
    drawFeatures = [];
    polyJson = {};
    drawFeatures = drawSource.getFeatures();
    console.log("drawFeatures: ",drawFeatures);
    if (drawFeatures.length > 0){
        var allCoords = [];
        for (let i = 0; i < drawFeatures.length; i++) {
            geom = drawFeatures[i].getGeometry();
            //console.log("geom ",geom);
            coords = geom.getCoordinates()[0];
            //console.log("coords: ",coords);
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
        console.log("Adding draw vector to main map");        
    } else {
        console.log("No polygons drawn");
    };
    return polyJson;
}

function clearFilters(){
    console.log("clearFilters");
    console.log("allFilters before clear: ",allFilters);
    
    //Need to actually remove checks from filters
    //Why is everything false?
}

function clearDraw(){
    console.log("clearDraw");
    console.log("allFilters in clear draw: ",allFilters);
    console.log("Clearing drawn polygon filter")
    allFilters["boundaryPolys"] = [];
    drawSource.clear();
    currentLayers = map.getLayers();
    if (drawVector in currentLayers) {
        map.removeLayer(drawVector);
    }
    console.log("drawSource: ",drawSource);
    console.log("boundaryPolys: ",allFilters["boundaryPolys"]);
    document.getElementById("filterOverlay").style.display="none";
    /*
    multiChecks = ["#checksTags", "#checksSections", "#checksAuthors", "#checksPublications", "#checksT_types", "#checksP_types", "#checksE_names"]; //Future: rework this to automatically include all checkboxes by class for scalability
    for (i=0;i<multiChecks.length;i++) {
        $(i).closest(".MultiCheckBoxDetail").find(".MultiCheckBoxDetailBody input").prop("checked", false);
        //$(i).closest(".MultiCheckBoxDetail").next().UpdateSelect();
    }
    allFilters = baseFilters;
    console.log("allFilters: ",allFilters);
    console.log("leaving clearDraw");
    filterAllVals();
    */

}

function saveDraw(){
    var drawFType = document.querySelector('input[name="drawFType"]:checked').value;
    console.log("drawFType: ",drawFType);
    allFilters["boundaryDefinition"] = drawFType;
    allFilters["boundaryPolys"] = [];
    allFilters["boundaryPolys"] = drawResults();
    document.getElementById("filterOverlay").style.display="none";
    filterAllVals();
}

//Communication with Python backend for filtering
var sIDs = [];
var iIDs = [];
function filterAllVals(){
    console.log("filterAllVals");
    console.log("allFitlers in filterAllVals: ",allFilters);
    currentLayers = map.getLayers();
    console.log("currentLayers: ",currentLayers);
    //map.removeLayer(allLayer);
    //map.removeLayer(recentLayer);
    map.removeLayer(filteredLayer);
    map.removeLayer(drawVector);
    if (allFilters["boundaryPolys"].length>0){
        map.addLayer(drawVector);
    }
    filteredSource.clear();
    //console.log("allFilters: ",allFilters);
    bodyContent = JSON.stringify(allFilters);
    //console.log("bodyContent: ",bodyContent);
    fetch(`${window.origin}/explore/map`, {
        method: "POST",
        credentials: "include",
        body: bodyContent,
        cache: "no-cache",
        headers: new Headers({
            "content-type": "application/json"
        })
    })
    .then(function(response){
        if (response.status !== 200){
            window.alert("Erro no filtros");
            console.log(`Error status code: ${response.status}`);
            resultsArea.style.display="none";
            stories = [];
            return;
        }
        response.json().then(function(resp){
            console.log(resp);
            sIDs = resp["sIDs"];
            iIDs = resp["iIDs"];
            console.log("stories preparse: ",resp["stories"]);
            stories = resp["stories"];
            instances = resp["instances"];
            //Testing Cards
            console.log("stories: ",stories);
            refreshStoryCards(stories=stories);
            refreshInstanceCards(instances=instances);
            
            /*
            if (sIDs.length > 0){
                refreshStoryCards(stories=stories, instances=instances)
            } else {
                document.getElementById("resultsStory").style.display = "none";
            }
            */
            resultsArea.style.display="block";
            if (iIDs.length > 0){
                iIDFilter = "i_id IN ("+iIDs+")";
                console.log(iIDFilter);
                cqlFilter = iIDFilter.replace(/%/gi,"%25").replace(/'/gi,"%27").replace(/ /gi,"%20");
                urlFiltered = 'http://localhost:8080/geoserver/wfs?service=wfs&'+
                    'version=2.0.0&request=GetFeature&typeNames=apregoar:geonoticias&'+
                    'cql_filter='+cqlFilter+'&'+
                    //'sortby=pub_date+D&'+
                    'sortby=area+D&'+
                    'outputFormat=application/json&srsname=EPSG:4326';
                filteredSource = loadSourceToExplore(wfs_url=urlFiltered, loadType="filtered")
                filteredLayer.setSource(filteredSource);// how do I define this?
                map.addLayer(filteredLayer);
                //recentResults.style.display = "none";
                instanceResults.innerHTML=`<p>Instâncias: ${iIDs.length}: ${iIDs}</p>`;
                storyResults.innerHTML=`<p>Histórias: ${sIDs.length}: ${sIDs}</p>`;
                map.render();
            } else {
                console.log("no features meeting criteria")
                map.removeLayer(filteredLayer);
                //map.addLayer(recentLayer);
                resultsArea.style.display="none";
                //recentResults.style.display = "block";
                instanceResults.innerHTML=`<p>Sem lugares</p>`;
                storyResults.innerHTML=`<p>Sem histórias</p>`;
            }
        })
    })
    //Connect to python for dynamic filtering. Return SIDs, search these in OL (OR WFS) and load.
};

function loadingCards(){
    //Prepare results area
    const $el = document.querySelector(".story-card");
    // Loading finished
    /*
    setTimeout(() => {
        $el.classList.remove("skeleton");
        $el
            .querySelectorAll(".hide-text")
            .forEach((el) => el.classList.remove("hide-text"));
    }, 3000);
    */


   $el.classList.remove("skeleton");
   $el
    .querySelectorAll(".hide-text")
    .forEach((el) => el.classList.remove("hide-text"));
}

const resultsStory = document.getElementById("resultsStory"); 
const resultsInstance = document.getElementById("resultsInstance");

function refreshStoryCards(stories){
    console.log("Entering refreshStoryCards()")
    //Removing old cards
    var prevStoryCards = document.querySelectorAll(".story-card");
    prevStoryCards.forEach(card => {
        card.remove();
    });
    
    //Preparing new story cards
    console.log("stories.length: ",stories.length);
    for(i=0; i<stories.length; i++){
        console.log("story: ",stories[i])
        var sCard = document.createElement('div');
        sCard.className = 'story-card';
        sCard.id = "sID_"+stories[i]["s_id"];
        console.log("sCard.id: ",sCard.id);
        var sCardTitle = document.createElement('div');
        sCardTitle.className = 'story-title';
        sCardTitle.innerHTML = stories[i]["title"];
        console.log("title: ",stories[i]["title"]);
        sCard.appendChild(sCardTitle);
        var sCardDetails = document.createElement('div');
        sCardDetails.className='story-details';
        sCard.appendChild(sCardDetails);
        var sCardSection = document.createElement('div');
        sCardSection.className = 'story-section';
        if (stories[i].section.length > 0){
            sCardSection.innerHTML = stories[i].publication+": "+stories[i].section+'<br>';

        } else {
            sCardSection.innerHTML = stories[i].publication+'<br>';
        }
        sCardDetails.appendChild(sCardSection);
        var sCardDate = document.createElement('div');
        sCardDate.className = 'pub-date';
        sCardDate.innerHTML = stories[i].pub_date+'<br>';
        sCardDetails.appendChild(sCardDate);
        //Eventually the tags should be broken out so they can lead to a search of just these results
        var sCardTags = document.createElement('div');
        sCardTags.className = 'story-tags';
        sCardTags.innerHTML = stories[i].tags;
        sCardDetails.appendChild(sCardTags);
        resultsStory.appendChild(sCard);
        console.log("sCard: ",sCard);
        sCard.onclick = loadStoryDeets;
    }
    resultsStory.style.display = "block";

    console.log("Leaving refreshStoryCards()")
    //loadingCards(); //Not yet doing loading animation. first lets make the load work!
}


function refreshInstanceCards(instances){
    console.log("refreshInstanceCards()");
    var prevInstanceCards = document.querySelectorAll(".instance-card");
    prevInstanceCards.forEach(card => {
        card.remove();
    });
    //Preparing new instance cards
    console.log("instances.length: ",instances.length);
    for(i=0; i<instances.length; i++){
        console.log("instance: ",instances[i])
        var iCard = document.createElement('div');
        iCard.className = 'instance-card';
        iCard.id = "iID_"+instances[i]["i_id"];
        console.log("iCard.id: ",iCard.id);

        var iCardTitle = document.createElement('div');
        iCardTitle.className = 'instance-title';
        iCardTitle.innerHTML = instances[i]["p_name"];
        console.log("title: ",instances[i]["p_name"]);
        iCard.appendChild(iCardTitle);

        var iCardDetails = document.createElement('div');
        iCardDetails.className='instance-details';
        iCard.appendChild(iCardDetails);

        var iCardDFrame = document.createElement('div');
        iCardDFrame.className = 'instance-dateframe';
        iCardDFrame.innerHTML = instances[i]["i_D"];
        iCardDetails.appendChild(iCardDFrame);

        var iCardTFrame = document.createElement('div');
        iCardTFrame.className = 'instance-timeframe';
        iCardTFrame.innerHTML = instances[i]["i_T"]+'<br>';
        iCardDetails.appendChild(iCardTFrame);

        var iCardSTitle = document.createElement('div');
        iCardSTitle.className = 'instance-stitle';
        iCardSTitle.innerHTML = instances[i]["title"];
        iCardDetails.appendChild(iCardSTitle);

        resultsInstance.appendChild(iCard);
        console.log("iCard: ",iCard);
        iCard.onclick = loadInstanceDeets;
    }
    resultsInstance.style.display = "block";
}

//Generic Map Setup
const viewSCard = new ol.View({
    projection: 'EPSG:4326',
    center: [-9.150404956762742,38.72493479806579],
    zoom: 12
});

 
var mapStory = new ol.Map({
    //overlays: [overlay],
    target: 'mapStory',
    view: viewSCard,
});
mapStory.addLayer(backDrop);
//mapStory.addLayer(recentLayer);

//let storyInstAllSource = new ol.source.Vector();
/*var storyInstAllLayer = new ol.layer.Vector({
    style: function(feature) {
        filterStyle.getText().setText(feature.get('p_name'));
        return filterStyle;
    },
});*/

let relations = {};
function loadStoryDeets(card){
    closeDeets();
    removeHighlights(itsTime = true);
    console.log("card: ",card);
    stopVar = "unkown";
    cardD = {};
    for (i=0; i<card["path"].length; i++){
        console.log(card["path"][i].className);
        if(card["path"][i].className == "story-card"){
            card["path"][i].classList.add('highlight');
            console.log("great success!")
            console.log(card["path"][i].className);
            sID = parseInt(card["path"][i].id.substring(4),10);
            console.log("sID: ",sID);
            for (j=0;j<stories.length;j++){
                //console.log("cycling through story IDS: ",stories[j]["s_id"]);
                if (stories[j]["s_id"]==sID){
                    cardD = stories[j];
                    console.log("cardD Story: ",cardD);
                    stopVar = "story";
                    relations={}
                    relations["instances_all"] = stories[j]["instances_all"];
                    relations["instances_no"] = stories[j]["instances_no"];
                    relations["instances_yes"] = stories[j]["instances_yes"];
                    updateHighlights(sourceID = sID, type = "sCard", relations = relations);
                }
            }
        }
    }
    renderDeets(cardD = cardD);
}

function loadInstanceDeets(card){
    closeDeets();
    removeHighlights(itsTime = true);
    console.log("card: ",card);
    stopVar = "unkown";
    cardD = {};
    
    for (k=0; k<card["path"].length; k++){
        console.log(card["path"][k].className);
        if(card["path"][k].className == "instance-card"){
            card["path"][k].classList.add('highlight');
            console.log(card["path"][k]);
            //preiID = card["path"][k].id.substring(4);
            //console.log("preiID: ",preiID);
            iID = parseInt(card["path"][k].id.substring(4),10);
            //iID = card["Path"][k].id;
            console.log("iID: ",iID);
            for (j=0; j<instances.length;j++){
                //console.log("cycling through instance ID:",instances[j]["i_id"]);
                if (instances[j]["i_id"]==iID){
                    cardD = instances[j];
                    console.log("cardD Instnace: ",cardD);
                    stopVar = "instance";
                }
            }
        }

    }
    renderDeets(cardD = cardD);
}

function removeHighlights(itsTime){
    if (itsTime == true){
        highlitCards = document.getElementsByClassName("highlight");
        for (i=0; i<highlitCards.length;i++){
            highlitCards[i].classList.remove('highlight');
        }
    }
    updateHighlights(sourceID = 0, type="none", relations=[]);
    
    //return true;
};

function renderDeets(cardD){
    //closeDeets();
    
    console.log("cardD: ",cardD);
    //var storyDeets = document.getElementById("deetsOverlay");
    //mapStory.removeLayer(storyInstAllLayer);

    var dOverlay = document.getElementById('deetsOverlay');
    openOverlay = true;

    var dClose = document.createElement('div');
    dClose.innerHTML = 'X'
    dClose.className = 'close';
    dClose.onclick = closeDeets;
    dOverlay.appendChild(dClose);

    var dTitle = document.createElement('div');
    dTitle.className = 'dO-title';
    dTitle.innerHTML = cardD["title"];
    dOverlay.appendChild(dTitle);

    var dOStory = document.createElement('div');
    dOStory.className = 'dO-story';
    
    dOverlay.appendChild(dOStory);

    var dAuthor = document.createElement('div');
    dAuthor.innerHTML = cardD["author"];
    dAuthor.className = 'dO-author';
    dOStory.appendChild(dAuthor);

    var dPubdate = document.createElement('div');
    dPubdate.className = 'dO-pubdate';
    dPubdate.innerHTML = cardD["pub_date"];
    dOStory.appendChild(dPubdate);

    var dSection = document.createElement('div');
    dSection.className = 'dO-section';
    if (cardD["section"].length > 0){
        dSection.innerHTML = cardD["publication"],': ',cardD["section"];
    } else {
        dSection.innerHTML = cardD["publication"];
    }
    dOStory.appendChild(dSection);


    var dTags = document.createElement('div');
    dTags.className = 'dO-tags';
    dTags.innerHTML = cardD["tags"];
    dOStory.appendChild(dTags);

    var dSummary = document.createElement('div');
    dSummary.className = 'dO-summary';
    dSummary.innerHTML = cardD["summary"];
    dOStory.appendChild(dSummary);

    if(stopVar == "instance"){
            
        var dOInstance = document.createElement('div');
        dOInstance.className = 'dO-instance';
        dOverlay.appendChild(dOInstance);

        var dITitle = document.createElement('div');
        dITitle.className = "dO-ititle";
        dITitle.innerHTML = cardD["p_name"];
        dOInstance.appendChild(dITitle);

        var dDateframe = document.createElement('div');
        dDateframe.className = 'dO-dateframe';
        dDateframe.innerHTML = cardD["i_D"];
        dOInstance.appendChild(dDateframe);
        
        var dTimeframe = document.createElement('div');
        dTimeframe.className = 'dO-timeframe';
        dTimeframe.innerHTML = cardD["i_T"];
        dOInstance.appendChild(dTimeframe);

        var dTDesc = document.createElement('div');
        dTDesc.className = 'dO-tdesc';
        dTDesc.innerHTML = cardD["t_desc"];
        dOInstance.appendChild(dTDesc);

        var dPDesc = document.createElement('div');
        dPDesc.className = 'dO-pdesc';
        dPDesc.innerHTML = cardD["p_desc"];
        dOInstance.appendChild(dPDesc);
    }

    var dSource = document.createElement('a');
    dSource.href = cardD["web_link"];
    dSource.target = "_blank";
    var dButton = document.createElement('button');
    dButton.className = "dO-button";
    dButton.id = "dButton";
    dButton.innerHTML = "Ver fonte";
    dSource.appendChild(dButton);
    dOverlay.appendChild(dSource);

    dOverlay.style.display = "block";
};


let itsTime = false;
function closeDeets(){
    console.log("close deets");
    popupContainer.style.display="none";
    var deetsOverlay = document.getElementById('deetsOverlay');
    var first = deetsOverlay.firstElementChild;
    while (first) {
        first.remove();
        first = deetsOverlay.firstElementChild;
    }
    deetsOverlay.style.display="none";
    //itsTime = true;
    removeHighlights(itsTime = true);
    itsTime = false;
}

function showFilters() {
    document.getElementById("filterOverlay").style.display="block";
}



let brightlights;
const brightlightLayer = new ol.layer.Vector({
    source: new ol.source.Vector(),
    map: map,
    style: new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: 'rgba(255,255,0,1)',
            width: 5,
        }),
        fill: new ol.style.Fill({
            color: 'rgba(155, 185, 193)',
        })
    }),
    zindex: 4,
});

let highlights;
const highlightLayer = new ol.layer.Vector({
    source: new ol.source.Vector(),
    map: map,
    style: new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: 'rgba(255,255,0,1)',
            width: 5,
        }),
        fill: new ol.style.Fill({
            color: 'rgba(155,185,193,1)',
        })
    }),
    zindex: 3,
});


let lowlights;
const lowlightLayer = new ol.layer.Vector({
    source: new ol.source.Vector(),
    map: map,
    style: new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: 'rgba(255,255,0,.5)',
            width: 3,
        }),
        fill: new ol.style.Fill({
            color: 'rgba(255,255,0,.2)',
        })
    }),
    zindex: 2,
});

let nolights;
const nolightLayer = new ol.layer.Vector({
    source: new ol.source.Vector(),
    map: map,
    style: new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: 'rgba(250,250,250,.5)',
            width: 3,
        }),
        fill: new ol.style.Fill({
            color: 'rgba(150,150,150,.2)',
        })
    }),
    zindex: 1,
});

function updateHighlights(sourceID, type, relations){
    console.log("stories: ",stories);
    console.log("instances: ",instances);
    brightlights = {};
    highlights = {};
    lowlights = {};
    nolights = {};
    filteredFeatures = filteredSource.getFeatures();
    console.log("Features: ",filteredFeatures);

    nolightLayer.getSource().clear();
    lowlightLayer.getSource().clear();
    highlightLayer.getSource().clear();
    brightlightLayer.getSource().clear();
    map.removeLayer(filteredLayer);

    if(type=="none"){
        map.addLayer(filteredLayer);
    } else {
        if (type=="sCard"){
            for (i=0; i<filteredFeatures.length; i++){
                if (relations["instances_yes"].includes(filteredFeatures[i]["A"]["i_id"])){
                    highlightLayer.getSource().addFeature(filteredFeatures[i]);
                } else {
                    nolightLayer.getSource().addFeature(filteredFeatures[i]);
                }
            };
            brightlights["sIDs"] = sourceID;
            if (relations["instances_no"].length>0){
                iIDFilter = "i_id IN ("+relations["instances_no"]+")";
                cqlFilter = iIDFilter.replace(/%/gi,"%25").replace(/'/gi,"%27").replace(/ /gi,"%20");
                urlFiltered = 'http://localhost:8080/geoserver/wfs?service=wfs&'+
                    'version=2.0.0&request=GetFeature&typeNames=apregoar:geonoticias&'+
                    'cql_filter='+cqlFilter+'&'+
                    //'sortby=pub_date+D&'+
                    'sortby=area+D&'+
                    'outputFormat=application/json&srsname=EPSG:4326';
                const lowlightSource = loadSourceToExplore(wfs_url = urlFiltered, loadType = "lowlight");
                lowlightLayer.setSource(lowlightSource);
            };
            //lowlights["iIDs"] = relations["instances_no"];
            //highlights["iIDs"] = relations["instances_yes"];
            //nolights["iIDs"] = [];
            //console.log('relations["instances_yes"]: ',relations["instances_yes"]);
            /*for (i=0; i<instances.length;i++){
                //if (instances[i]["i_id"] in relations["instances_yes"]){
                if (!relations["instances_yes"].includes(instances[i]["i_id"])){
                    //console.log("ID should be nolighted: ", instances[i]["i_id"]);
                    nolights["iIDs"].push(instances[i]["i_id"]);
                }
            }*/
        } else if (type=="iCard"){
            iID = sourceID;
        } else {
            //If it comes from the map
            //see line 439 in jornal.js
            iID = sourceID;
        }

        nolightLayer.setZIndex(1);
        lowlightLayer.setZIndex(2);
        highlightLayer.setZIndex(3);
        brightlightLayer.setZIndex(4);

        bhExtent = ol.extent.extend(brightlightLayer.getSource().getExtent(),highlightLayer.getSource().getExtent(),lowlightLayer.getSource().getExtent());
        //map.getView().fit(ol.extent.buffer(bhExtent, 0.1));
        map.getView().fit(bhExtent);
    
        console.log("brightlights: ",brightlightLayer.getSource().getFeatures());
        console.log("highlights: ",highlightLayer.getSource().getFeatures());
        console.log("lowlights: ",lowlightLayer.getSource().getFeatures());
        console.log("nolights: ",nolightLayer.getSource().getFeatures());
    }
};

/*document.addEventListener("click", (event)=>{
        const isClickInside = dOverlay.contains(event.target);
        if (openOverlay == true){
            if (!isClickInside){
                dOverlay.style.display="none";
                openOverlay = false;
            }
        }
        
    })*/


    /*
    if (stopVar == "instance"){
        document.getElementById('deetsITitle').innerHTML = cardD["p_name"];
        document.getElementById('deetsIDateframe').innerHTML = cardD["i_D"];
        document.getElementById('deetsITimeframe').innerHTML = cardD["i_T"];
        document.getElementById('deetsITdesc').innerHTML = cardD["t_desc"];
        document.getElementById('deetsIPdesc').innerHTML = cardD["p_desc"];
        document.getElementById('deetsTitle2').innerHTML = cardD["title"];
        console.log("Here is where we should define a layer with only the instance highlighted")
    }
    
    //Appropriate for all cards
    document.getElementById('deetsTitle').innerHTML = cardD["title"];
    document.getElementById('deetsAuthor').innerHTML =cardD["author"];
    document.getElementById('deetsSection').innerHTML = cardD["section"];
    document.getElementById('deetsPubdate').innerHTML = cardD["pub_date"];
    document.getElementById('deetsTags').innerHTML = cardD["tags"];
    document.getElementById('deetsSummary').innerHTML = cardD["summary"];
    document.getElementById('buttonLink').href = cardD["web_link"];
    */
    /*
    if (cardD["instances_all"].length>0){
        document.getElementById('deetsICount').innerHTML = cardD["instances_all"].length;
        iIDFilter = "i_id IN ("+storyD["instances_all"]+")";
        console.log("iIDFilter ",iIDFilter);
        cqlFilter = iIDFilter.replace(/%/gi,"%25").replace(/'/gi,"%27").replace(/ /gi,"%20");
        urlIAll = 'http://localhost:8080/geoserver/wfs?service=wfs&'+
            'version=2.0.0&request=GetFeature&typeNames=apregoar:geonoticias&'+
            'cql_filter='+cqlFilter+'&'+
            'sortby=area+D&'+
            'outputFormat=application/json&srsname=EPSG:4326';
        console.log(urlIAll);
        //storyInstAllSource = loadSourceToExplore(wfs_url=urlIAll, loadType="storyInstAll")
        var storyInstAllSource = new ol.source.Vector({
            format: new ol.format.GeoJSON(),
            loader: function(extent, resolution, projection, success,failure) {
                var xhr = new XMLHttpRequest();
                xhr.open('GET', urlIAll);
                var onError = function() {
                    storyInstAllSource.removeLoadedExtent(extent);
                    failure();
                }
                xhr.onerror = onError;
                xhr.onload = function() {
                    if (xhr.status == 200) {
                        var features = storySource.getFormat().readFeatures(xhr.responseText);
                        storyInstAllSource.addFeatures(features);
                        success(features);
                    } else {
                        onError()
                    }
                }
                xhr.send();
            },
            strategy: ol.loadingstrategy.all
            
        });  
        
        console.log("storyInstAllSource: ",storyInstAllSource);
        var storyInstAllLayer = new ol.layer.Vector({
            source: storyInstAllSource,
            style: function(feature) {
                filterStyle.getText().setText(feature.get('p_name'));
                return filterStyle;
            },
        });
        mapStory.addLayer(storyInstAllLayer);
        document.getElementById("mapStory").style.display="block";
    } else {
        document.getElementById("mapStory").style.display="none";
    }
    */
    //storyDeets.style.display = "block";