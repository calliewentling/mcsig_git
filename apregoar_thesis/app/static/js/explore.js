

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
        //This should be accessed to remove everything from selection;
        e.stopPropagation();
        var hc = $(this).prop("checked");
        $(this).closest(".MultiCheckBoxDetail").find(".MultiCheckBoxDetailBody input").prop("checked", hc);
        $(this).closest(".MultiCheckBoxDetail").next().UpdateSelect();
    });

    $(document).on("click", ".MultiCheckBoxDetailHeader", function (e) {
        //console.log("This enters a check all scenario");
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
        //console.log("this: ",this[0].id);
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
const popupTitle = document.getElementById('popupTitle');
const popupScroll = document.getElementById('popupScroll');
const popupScrollL = document.getElementById('scrollL');
const popupScrollR = document.getElementById('scrollR');
const popupScrollCount = document.getElementById('scrollCount');
const popupCloser = document.getElementById('popup-closer');

var popupInstances = [];
var popupIndex = 0;

const popupOverlay = new ol.Overlay({
    element: popupContainer,
    autoPan: true,
    autoPanAnimation: {
        duration: 250,
    },
});

popupCloser.onclick = function (){
    map.getView().fit(ol.extent.extend(brightlightLayer.getSource().getExtent(),highlightLayer.getSource().getExtent(),lowlightLayer.getSource().getExtent()))
    popupOverlay.setPosition(undefined);
    popupCloser.blur();
    return false;
};
 
var map = new ol.Map({
    overlays: [popupOverlay],
    target: 'map',
    view: view,
    interactions: ol.interaction.defaults({mouseWheelZoom:false}),
});
map.addLayer(backDrop);

let popupFeatures;
map.on('singleclick',function(evt){
    const coordinate = evt.coordinate;
    //Fetch info from WFS
    const currentLayers = map.getLayers();
    
    var popupFiltered = filteredSource.getFeaturesAtCoordinate(coordinate);
    var popupBrightlight = brightlightLayer.getSource().getFeaturesAtCoordinate(coordinate);
    var popupHighlight = highlightLayer.getSource().getFeaturesAtCoordinate(coordinate);
    var popupLowlight = lowlightLayer.getSource().getFeaturesAtCoordinate(coordinate);
    var popupNolight = nolightLayer.getSource().getFeaturesAtCoordinate(coordinate);


    var popupLights = [];
    popupInstances = [];
    popupIndex = 0;

      
    if (popupHighlight.length>0){
        for (i=0;i<popupHighlight.length;i++){
            popupLights.push(popupHighlight[i]["A"]["i_id"]);
        }
    };
    if (popupLowlight.length>0){
        for (i=0;i<popupLowlight.length;i++){
            popupLights.push(popupLowlight[i]["A"]["i_id"]);
        }
    };
    if (popupNolight.length>0){
        for (i=0;i<popupNolight.length;i++){
            popupLights.push(popupNolight[i]["A"]["i_id"]);
        }
    };
    if (popupBrightlight.length>0){
        for (i=0;i<popupBrightlight.length;i++){
            popupLights.push(popupBrightlight[i]["A"]["i_id"]);
        }
    };  
    
    if(popupLights.length>0){
        popupInstances = popupLights;
    } else if (popupFiltered.length>0){
        popupInstances = [];
        for (i=0;i<popupFiltered.length;i++){
            popupInstances.push(popupFiltered[i]["A"]["i_id"]);
        }
    }
    if(popupInstances.length>0){
        //numInstances = popupInstances.length;
        //firstIID = popupInstances[0];
        updatePopup(instanceID = popupInstances[0]);
        if(popupInstances.length>1){
            popupScrollCount.innerHTML = popupIndex+1+"/"+popupInstances.length;
            popupScroll.style.display="block";
        } else {
            popupScroll.style.display="none";
        }
        popupOverlay.setPosition(coordinate);
    } else {
        closeDeets();
    }    
});

map.on('moveend',function(evt){
    console.log("moveend triggered: ",evt);
    map.render();
});

function updatePopup(instanceID){
    console.log("Entering updatePopup");
    for (i=0;i<instances.length;i++){
        if(instances[i]["i_id"]==instanceID){
            cardD = instances[i];
            closeDeets();
            renderDeets(cardD = cardD);
            //Start here
            relations["intances_all"]=cardD["instances_all"];
            relations["instances_yes"] = cardD["instances_yes"];
            relations["instances_no"]=cardD["instances_no"];
            //updateHighlights(sourceID=firstIID, type="iCard", relations=relations);
            changeFocus(input=cardD);
            /*popupTitle.innerHTML = cardD["p_name"];
            popupContent.innerHTML = cardD["title"];
            popupContainer.style.display="block";*/
            break
        }
    }
    console.log("Leaving updatePopup");
};

popupScrollL.onclick = function(){
    console.log("popupInstances: ",popupInstances);
    console.log("popupIndex: ",popupIndex);
    if (popupIndex ==0){
        popupIndex = popupInstances.length-1;
    } else {
        popupIndex = popupIndex-1;
    }
    popupScrollCount.innerHTML = popupIndex+1+"/"+popupInstances.length;
    updatePopup(instanceID = popupInstances[popupIndex]);
};

popupScrollR.onclick = function(){
    console.log("popupInstances: ",popupInstances);
    console.log("popupIndex: ",popupIndex);
    if (popupIndex ==popupInstances.length-1){
        popupIndex = 0;
    } else {
        popupIndex = popupIndex+1;
    }
    popupScrollCount.innerHTML = popupIndex+1+"/"+popupInstances.length;
    updatePopup(instanceID = popupInstances[popupIndex]);
};

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


function refineFeatures(feature){
    //console.log("Entering refineFeatures");
    feature["pub_date"] = new Date(feature["pub_date"]);
    feature["t_begin"] = new Date(feature["t_begin"]);
    feature["t_end"] = new Date(feature["t_end"]);
    //console.log("Leaving refineFeatures");
    return feature
}

var maxLisbonExtent = [-9.500526607165842, 38.40907442337447,-8.490972125626802, 39.31772866134256];

//General update of layerExtent to be called on filters
function updateViewExtent(inputSource){
    layerExtent = inputSource.getExtent();
    console.log("Entering updateViewExtent with layerExtent: ",layerExtent);
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
    map.getView().fit(ol.extent.buffer(filterMaxExtent, .01));
    drawMap.getView().fit(ol.extent.buffer(filterMaxExtent, .01));
    console.log("Leaving updateViewExtent");
}

//Load source. Returns 
//let firstPubDate, lastPubDate, firstInstDate, lastInstDate;
function loadSourceToExplore(wfs_url, loadType) {
    console.log("Entering loadSourceToExplore()");
    var tempSource = new ol.source.Vector({
        format: new ol.format.GeoJSON(),
        loader: function (extent, resolution, projection, success, failure) {
            url = wfs_url;
            var xhr = new XMLHttpRequest();
            xhr.open('GET',url);
            var onError = function() {
                console.log("Error in loading vector source");
                tempSource.removeLoadedExtent(extent);
                failure();
            }
            xhr.onerror = onError;
            xhr.onloadend = function() {
                removeSkeleton();
            }
            xhr.onload = function() {
                console.log("XHR status: ",xhr.status);
                if (xhr.status == 200){
                    var features = [];
                    features = tempSource.getFormat().readFeatures(xhr.responseText);
                    tempSource.addFeatures(features);
                    var noFeatures = false;
                    if (features.length == 1) {
                        if (features[0]["A"]["geometry"] == null){
                            noFeatures = true;
                        }
                    }
                    success(features);
                    if (noFeatures == false) {
                        updateViewExtent(inputSource = tempSource);
                        //Getting info of preloaded features
                        preloadF = [];
                        console.log("Will enter refineFeatures")
                        for (i = 0; i<features.length; i++){
                            refinedFeature = refineFeatures(features[i]["A"]);
                            preloadF.push(refinedFeature);
                        }
                        console.log("left refineFeatures")                        
                    }
                } else {
                    onError();
                    console.log("Bad request: not 200");
                }
            }
            xhr.send();
        }
    });  
    console.log("leaving loadSourceToExplore()");
    return tempSource;
};



var fromSelect = document.getElementById("from");
var toSelect = document.getElementById("to");
// DATE RANGE PICKER + Other filters//
$( function() {
    var dateFormat = "mm/dd/yy",
    //var dateFormat = "D M dd yyyy",
    from = $( "#from" ).datepicker({
        gotoCurrent: true,
        altFormat: "D, d M y",
        changeMonth: true,
        numberOfMonths: 1,
        minDate: pubDate1,
        maxDate: pubDate2,
    }).datepicker('setDate',recentDate1).on( "change", function() {
        to.datepicker( "option", "minDate", getDate( this ) );
        to.value = getDate ( allFilters["pubDateR2"] );
        from.value = getDate( this ).toDateString();
        allFilters["pubDateR1"] = getDate(this);
        checkDates(thisDate = getDate( this ), tofrom = "from");
        allFilters["pubDateFilterMin"] = true;
    }),

    to = $( "#to" ).datepicker({
        gotoCurrent: true,
        defaultValue: recentDate2,
        altFormat: "D, d M y",
        changeMonth: true,
        numberOfMonths: 1,
        minDate: pubDate1,
        maxDate: pubDate2,
    }).datepicker('setDate',recentDate2).on( "change", function() {
        from.datepicker( "option", "maxDate", getDate( this ) );
        from.value = getDate(allFilters["pubDateR1"]);
        to.value = getDate( this );
        allFilters["pubDateR2"] = getDate(this);
        checkDates(thisDate = getDate( this ), tofrom = "to");
        allFilters["pubDateFilterMax"] = true;
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
    })

    //Handling autochecking of alldates, also reinserting the current value
    function checkDates(thisDate, tofrom) {
        console.log("entering checkDates");
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
        console.log("leaving checkDates");
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
        console.log("Leaving getDate");
        return date;
    }

});

//Incorporating "Select all" for publish date and instance occurances
const allPub = document.getElementById('allPub');
allPub.addEventListener('change', (event) => {
    if (event.currentTarget.checked) {
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
    }
});
const allInst = document.getElementById('allInst');
allInst.addEventListener('change', (event) => {
    if (event.currentTarget.checked) {
        $( "#fromI" ).datepicker("option", "minDate", iDate1);
        $( "#fromI" ).datepicker("option","maxDate", iDate2);
        $( "#toI" ).datepicker("option", "minDate", iDate1);
        $( "#toI" ).datepicker( "option", "maxDate", iDate2 );
        fromI.value = iDate1.toDateString();
        toI.value = iDate2.toDateString();
        allFilters["iDateR1"] = iDate1;
        allFilters["iDateR2"] = iDate2;
        allFilters["iDateFilter"] = false;
    }
});

/*INCLUDE TEXT SEARCH FIELDS IN FILTERING */


$("#pNameSearch").on("change", function() {
    allFilters["pNameSearch"] = $(this).val();
});


/*REFILTER VALUES*/
function extractTerms(list){
    console.log("Entering extractTerms")
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
    console.log("Leaving extractTerms");
    return terms;
}
let filteredSource = new ol.source.Vector();
var filteredLayer = new ol.layer.Vector({
    style: function(feature) {
        filterStyle.getText().setText(feature.get('p_name'));
        return filterStyle;
    },
    properties: {
        layerName: "filteredLayer",
    },
});
filterAllVals();

//Drawing and saving custom polygons
let polyJson;
let drawFeatures;
function drawResults() {
    console.log("Entering drawResults");
    drawFeatures = [];
    polyJson = {};
    drawFeatures = drawSource.getFeatures();
    if (drawFeatures.length > 0){
        var allCoords = [];
        for (let i = 0; i < drawFeatures.length; i++) {
            geom = drawFeatures[i].getGeometry();
            coords = geom.getCoordinates()[0];
            poly = coords
            allCoords.push(poly);
        }
        var multiPoly = {
            "type": "MultiPolygon",
            "coordinates": allCoords
        };
        polyJson = JSON.stringify(multiPoly);      
    };
    console.log("Leaving drawResults");
    return polyJson;
}

function clearDraw(){
    console.log("Entering clearDraw");
    allFilters["boundaryPolys"] = [];
    drawSource.clear();
    currentLayers = map.getLayers();
    if (drawVector in currentLayers) {
        map.removeLayer(drawVector);
    }
    console.log("Leaving clearDraw");
}

function saveDraw(){
    console.log("entering saveDraw");
    var drawFType = document.querySelector('input[name="drawFType"]:checked').value;
    allFilters["boundaryDefinition"] = drawFType;
    allFilters["boundaryPolys"] = [];
    allFilters["boundaryPolys"] = drawResults();
    document.getElementById("filterOverlay").style.display="none";
    filterAllVals();
    console.log("Leaving saveDraw");
}

function addSkeletons(){
    console.log("Entering addSkeletons");
    //CREATING SKELETON ELEMENTS HERE
    var existingCards = document.querySelectorAll("div.instance-card, div.story-card");
    existingCards.forEach(card => {
        if (!card.classList.contains("skeleton")){
            card.classList.add("skeleton"); //Avoid multiple skeleton associations 
        }
        card.childNodes[0].classList.add("hide-text"); //Add hide-text to title
        console.log("card.childNodes[1].childNodes: ",card.childNodes[1].childNodes);
        for(c=0;c<card.childNodes[1].childNodes.length;c++){
            card.childNodes[1].childNodes[c].classList.add("hide-text");
        }
    });
};

function removeSkeleton(){
    console.log("Entering removeSkeleton");
    var getSkeleton = document.getElementsByClassName("skeleton");
    while(getSkeleton.length>0){
        for (s=0;s<getSkeleton.length;s++){
            getSkeleton[s].classList.remove("skeleton");
        }
    };
    var hiddenTextItems = document.querySelectorAll(".hide-text");
    hiddenTextItems.forEach(item => {
        item.classList.remove("hide-text");
    });
    console.log("Leaving removeSkeleton");
};

//Communication with Python backend for filtering
var sIDs = [];
var iIDs = [];
let countAllStories;
let countAllInstances;
function filterAllVals(){
    console.log("Entering filterAllVals");
    document.getElementById("resultsArea").classList.add("skeleton");
    document.getElementById("map").classList.add("skeleton");
    var storyCount = document.getElementById("storyCount");
    storyCount.innerHTML = '<p>notícias</p>' ;
    var instanceCount = document.getElementById("instanceCount");
    instanceCount.innerHTML = '<p>instâncias</p>' ;
    addSkeletons();  
    currentLayers = map.getLayers();
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
            stories = resp["stories"];
            instances = resp["instances"];
            countAllStories = resp["countStories"];
            countAllInstances = resp["countInstances"];

            refreshStoryCards(stories=stories);
            storyCount.innerHTML = '<p>notícias</p><p>'+stories.length+' / '+countAllStories+'</p>' ;

            refreshInstanceCards(instances=instances);
            instanceCount.innerHTML = '<p>instáncias</p><p>'+instances.length+' / '+countAllInstances+'</p>' ;
            
            if (instances.length > 0){
                iIDFilter = "i_id IN ("+iIDs+")";
                cqlFilter = iIDFilter.replace(/%/gi,"%25").replace(/'/gi,"%27").replace(/ /gi,"%20");
                urlFiltered = 'http://localhost:8080/geoserver/wfs?service=wfs&'+
                    'version=2.0.0&request=GetFeature&typeNames=apregoar:geonoticias&'+
                    'cql_filter='+cqlFilter+'&'+
                    'sortby=area+D&'+
                    'outputFormat=application/json&srsname=EPSG:4326';
                filteredSource = loadSourceToExplore(wfs_url=urlFiltered, loadType="filtered")
                filteredLayer.setSource(filteredSource);// how do I define this?
                map.addLayer(filteredLayer);
                map.render();
            } else {
                map.removeLayer(filteredLayer);

                
                removeSkeleton();
            }
        })
    })
    console.log("Leaving filterAllVals");
    //Connect to python for dynamic filtering. Return SIDs, search these in OL (OR WFS) and load.
};

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
    for(i=0; i<stories.length; i++){
        var sCard = document.createElement('div');
        sCard.className = 'story-card skeleton';
        sCard.id = "sID_"+stories[i]["s_id"];

        var sCardTitle = document.createElement('div');
        sCardTitle.className = 'story-title hide-text';
        sCardTitle.innerHTML = stories[i]["title"];
        sCard.appendChild(sCardTitle);

        var sCardDetails = document.createElement('div');
        sCardDetails.className='story-details';
        sCard.appendChild(sCardDetails);

        var sCardSection = document.createElement('div');
        sCardSection.className = 'story-section hide-text';
        if (stories[i].section.length > 0){
            sCardSection.innerHTML = stories[i].publication+": "+stories[i].section+'<br>';

        } else {
            sCardSection.innerHTML = stories[i].publication+'<br>';
        }
        sCardDetails.appendChild(sCardSection);

        var sCardDate = document.createElement('div');
        sCardDate.className = 'pub-date hide-text';
        sCardDate.innerHTML = stories[i].pub_date+'<br>';
        sCardDetails.appendChild(sCardDate);
        //Eventually the tags should be broken out so they can lead to a search of just these results
        var sCardTags = document.createElement('div');
        sCardTags.className = 'story-tags hide-text';
        sCardTags.innerHTML = stories[i].tags;
        sCardDetails.appendChild(sCardTags);

        resultsStory.appendChild(sCard);
        sCard.onclick = loadStoryDeets;
    }
    resultsStory.style.display = "block";

    console.log("Leaving refreshStoryCards()")
}

function refreshInstanceCards(instances){
    console.log("Entering refreshInstanceCards()");
    var prevInstanceCards = document.querySelectorAll(".instance-card");
    prevInstanceCards.forEach(card => {
        card.remove();
    });
    //Preparing new instance cards
    for(i=0; i<instances.length; i++){
        var iCard = document.createElement('div');
        iCard.className = 'instance-card skeleton';
        iCard.id = "iID_"+instances[i]["i_id"];

        var iCardTitle = document.createElement('div');
        iCardTitle.className = 'instance-title hide-text';
        iCardTitle.innerHTML = instances[i]["p_name"];
        iCard.appendChild(iCardTitle);

        var iCardDetails = document.createElement('div');
        iCardDetails.className='instance-details';
        iCard.appendChild(iCardDetails);

        var iCardDFrame = document.createElement('div');
        iCardDFrame.className = 'instance-dateframe hide-text';
        iCardDFrame.innerHTML = instances[i]["i_D"];
        iCardDetails.appendChild(iCardDFrame);

        var iCardTFrame = document.createElement('div');
        iCardTFrame.className = 'instance-timeframe hide-text';
        iCardTFrame.innerHTML = instances[i]["i_T"]+'<br>';
        iCardDetails.appendChild(iCardTFrame);

        var iCardSTitle = document.createElement('div');
        iCardSTitle.className = 'instance-stitle hide-text';
        iCardSTitle.innerHTML = instances[i]["title"];
        iCardDetails.appendChild(iCardSTitle);

        resultsInstance.appendChild(iCard);
        iCard.onclick = loadInstanceDeets;
    }
    resultsInstance.style.display = "block";
    console.log("Leaving refreshInstanceCards");
}

//Generic Map Setup
const viewSCard = new ol.View({
    projection: 'EPSG:4326',
    center: [-9.150404956762742,38.72493479806579],
    zoom: 12
});

 
var mapStory = new ol.Map({
    target: 'mapStory',
    view: viewSCard,
});
mapStory.addLayer(backDrop);

let relations = {};
function loadStoryDeets(card){
    console.log("Entering loadStoryDeets");
    closeDeets();
    removeHighlights(itsTime = true);
    console.log("card: ",card);
    stopVar = "unkown";
    cardD = {};
    for (i=0; i<card["path"].length; i++){
        console.log(card["path"][i].className);
        if(card["path"][i].className == "story-card"){
            card["path"][i].classList.add('brightlight');
            console.log("great success!")
            console.log(card["path"][i].className);
            sID = parseInt(card["path"][i].id.substring(4),10);
            console.log("sID: ",sID);
            for (j=0;j<stories.length;j++){
                if (stories[j]["s_id"]==sID){
                    cardD = stories[j];
                    console.log("cardD Story: ",cardD);
                    stopVar = "story";
                    relations={}
                    relations["instances_all"] = cardD["instances_all"];
                    relations["instances_no"] = cardD["instances_no"];
                    relations["instances_yes"] = cardD["instances_yes"];
                    console.log("relations: ",relations);
                    updateMapHighlights(sourceID = sID, type = "sCard", relations = relations);
                    for (iH in cardD["instances_yes"]){ //highlight associated instances
                        iHigh = cardD["instances_yes"][iH];
                        document.getElementById("iID_"+iHigh).classList.add("highlight");
                    };
                }
            }
        }
    }
    renderDeets(cardD = cardD);
    console.log("Leaving loadStoryDeets");
};

function loadInstanceDeets(card){
    console.log("Entering loadInstanceDeets");
    closeDeets();
    removeHighlights(itsTime = true);
    stopVar = "unkown";
    cardD = {};

    for (k=0; k<card["path"].length; k++){
        if(card["path"][k].className == "instance-card"){
            card["path"][k].classList.add('brightlight');
            iID = parseInt(card["path"][k].id.substring(4),10);
            console.log("iID: ",iID);
            for (j=0; j<instances.length;j++){
                if (instances[j]["i_id"]==iID){
                    cardD = instances[j];
                    console.log("cardD Instnace: ",cardD);
                    stopVar = "instance";
                    relations={}
                    relations["instances_all"] = cardD["instances_all"];
                    relations["instances_no"] = cardD["instances_no"];
                    relations["instances_yes"] = cardD["instances_yes"];
                    updateMapHighlights(sourceID = iID, type = "iCard", relations = relations);
                    //Updated related story and instances to highlight
                    sID = cardD["s_id"];
                    document.getElementById("sID_"+sID).classList.add("highlight"); //highlight associated story
                    for (iH in cardD["instances_yes"]){ //highlight associated instances
                        iHigh = cardD["instances_yes"][iH];
                        document.getElementById("iID_"+iHigh).classList.add("highlight");
                    };
                }
            }
        }

    }
    renderDeets(cardD = cardD);
    refresh=false;
    console.log("Leaving loadInstanceDeets");
};

function removeHighlights(itsTime){
    console.log("entering removeHighlights");
    if (itsTime == true){
        brightlitCards = document.getElementsByClassName("brightlight");
        for (i=0; i<brightlitCards.length;i++){
            brightlitCards[i].classList.remove('brightlight');
        };
        highlitCards = document.getElementsByClassName("highlight");
        while (highlitCards.length>0){
            for (j=0; j<highlitCards.length;j++){
                highlitCards[j].classList.remove('highlight');
            };
        }
    }
    updateMapHighlights(sourceID = 0, type="none", relations=[]);
    console.log("Leaving removeHighlights");
    //return true;
};

function renderDeets(cardD){
    console.log("Entering renderDeets w cardD: ",cardD);
    
    var deetsOverlay = document.getElementById('deetsOverlay');
    openOverlay = true;

    var dOverlay = document.createElement('div');
    dOverlay.id = "dStory_"+cardD["s_id"];
    dOverlay.className = 'dStory';
    deetsOverlay.appendChild(dOverlay);


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

    console.log("cardD instances all: ",cardD["instances_all"]);

    mainIID = 0;

    yesInt = cardD["instances_yes"];

    for (subInst in cardD["instances_all"]){
        if (yesInt.includes(subInst*1)){ //multiplying by 1 (*1) converts string subInst to number
            if (subInst*1 == cardD["i_id"]*1) {
                subInstance(dOverlay = dOverlay, instance=cardD, lightLevel = "brightlight");
            } else {
                //Instance filtered out
                subInstance(dOverlay = dOverlay, instance = cardD["instances_all"][subInst], lightLevel = "highlight");
            }
        } else {
            //Instance filtered In
            subInstance(dOverlay = dOverlay, instance = cardD["instances_all"][subInst], lightLevel = "lowlight");
        };
    };

    //THIS IS THE MOCK SOURCE
    var cButtonA = document.createElement('div');
    cButtonA.className = 'dO-buttonA';
    cButtonA2 = document.createElement('div');
    cButtonA2.className = 'dO-buttonA2';

    var contextSource = document.createElement('a');
    contextSource.href = "/jornal/"+cardD["s_id"]+"/historia";
    contextSource.target = "_blank";
    var contextButton = document.createElement('button');
    contextButton.className = "button2";
    contextButton.id = "contextButton";
    contextButton.innerHTML = "Ver fonte";
    contextSource.appendChild(contextButton);

    cButtonA2.appendChild(contextSource);
    cButtonA.appendChild(cButtonA2);
    dOverlay.appendChild(cButtonA);

    //THIS IS THE ACTUAL SOURCE
    var dButtonA = document.createElement('div');
    dButtonA.className = 'dO-buttonA';
    dButtonA2 = document.createElement('div');
    dButtonA2.className = 'dO-buttonA2';

    var dSource = document.createElement('a');
    dSource.href = cardD["web_link"];
    dSource.target = "_blank";
    var dButton = document.createElement('button');
    dButton.className = "button2 buttonHide";
    dButton.id = "dButton";
    dButton.innerHTML = "Ver fonte real";
    dSource.appendChild(dButton);

    dButtonA2.appendChild(dSource);
    dButtonA.appendChild(dButtonA2);
    dOverlay.appendChild(dButtonA);
    

    deetsOverlay.style.display = "block";

    console.log("Leaving renderDeets");
};

function subInstance(dOverlay, instance, lightLevel){
    console.log("Entering subInstance");
    //CHANGE cardD to access the instace results
    //console.log(instance["i_id"],": ",lightLevel);
    var dOInstance = document.createElement('div');
    dOInstance.className = 'dO-instance';
    dOInstance.classList.add(lightLevel);
    dOInstance.id = "i_"+instance["i_id"];
    dOverlay.appendChild(dOInstance);

    var dITitle = document.createElement('div');
    dITitle.className = "dO-ititle";
    dITitle.innerHTML = instance["p_name"];
    dITitle.id = "dITitle_"+instance["i_id"];
    dITitle.onclick = changeFocus;
    dOInstance.appendChild(dITitle);

    var dDateframe = document.createElement('div');
    dDateframe.className = 'dO-dateframe';
    dDateframe.innerHTML = instance["i_D"];
    dOInstance.appendChild(dDateframe);
    
    var dTimeframe = document.createElement('div');
    dTimeframe.className = 'dO-timeframe';
    dTimeframe.innerHTML = instance["i_T"];
    dOInstance.appendChild(dTimeframe);

    var dTDesc = document.createElement('div');
    dTDesc.className = 'dO-tdesc';
    dTDesc.innerHTML = instance["t_desc"];
    dOInstance.appendChild(dTDesc);

    var dPDesc = document.createElement('div');
    dPDesc.className = 'dO-pdesc';
    dPDesc.innerHTML = instance["p_desc"];
    dOInstance.appendChild(dPDesc);
    console.log("leaving subInstance");
}

function changeFocus(input){
    console.log("entering changeFocus");
    if (input instanceof PointerEvent){
        popupContainer.style.display="none";
        var iID = parseInt(input["path"][0].id.substring(8),10);
        var sID = parseInt(input["path"][2].id.substring(7),10);
        var brightID = input["path"][1].id;
        var brightLightID = document.getElementById(brightID);
        type="iCard";

    } else {
        //If not a pointer instance that initiated the changeFocus
        sID = input["s_id"];
        iID = input["i_id"];
        brightID = "i_"+iID;
        var brightLightID = document.getElementById(brightID);
        type="map";
    }
   

    var iNoFocus = document.querySelectorAll('.dO-instance');
    iNoFocus.forEach(i => {
        i.classList.remove("brightlight");
        i.classList.add("highlight");
    });


    var highlightedItems = document.querySelectorAll('.brightlight, .highlight');
    highlightedItems.forEach(i => {
        if (i.classList.contains("story-card")){
            i.classList.remove("brightlight");
            i.classList.remove("highlight");
        } else if (i.classList.contains("instance-card")){
            i.classList.remove("brightlight");
            i.classList.remove("highlight");
        }
    })

    for(instance in instances){
        if (instances[instance]["i_id"] == iID){
            console.log("instance: ",instances[instance]);
            cardD = instances[instance];
            relations["instances_all"]=cardD["instances_all"]; 
            relations["instances_no"]=cardD["instances_no"];
            relations["instances_yes"]=cardD["instances_yes"];
            updateMapHighlights(sourceID = iID, type = type, relations = relations);
            brightLightID.classList.add("brightlight"); //Focus on chosen instance within dO
            document.getElementById("sID_"+sID).classList.add("highlight"); //highlight associated story
            document.getElementById("iID_"+iID).classList.add("brightlight"); //brightlight chosen istance
            //console.log("instances_yes", cardD["instances_yes"]);
            for (iH in cardD["instances_yes"]){ //highlight associated instances
                iHigh = cardD["instances_yes"][iH];
                document.getElementById("iID_"+iHigh).classList.add("highlight");
            };
        };
    };
    console.log("Leaving changeFocus");
};

let itsTime = false;
function closeDeets(){
    console.log("Entering closeDeets");
    popupContainer.style.display="none";
    var deetsOverlay = document.getElementById('deetsOverlay');
    var first = deetsOverlay.firstElementChild;
    while (first) {
        first.remove();
        first = deetsOverlay.firstElementChild;
    }
    deetsOverlay.style.display="none";
    removeHighlights(itsTime = true);
    itsTime = false;
    console.log("Leaving closeDeets");
}

function showFilters() {
    console.log("Entering showFilters");
    closeDeets();
    document.getElementById("filterOverlay").style.display="block";
    drawMap.updateSize();
    console.log("Leaving showFilters");
};

function saveFilters(){
    console.log("Entering saveFilters");
    console.log("allFilters: ",allFilters);
    console.log("This function is incomplete");
    console.log("Leaving saveFilters");
};

function saveResults(){
    console.log("Entering saveFilters");
    console.log("This function is incomplete");
    console.log("Leaving saveResults");
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
            color: 'rgba(255,255,0,.5)',
        })
    }),
    zindex: 4,
    properties: {
        layerName: "filteredLayer",
    },
});

let highlights;
const highlightLayer = new ol.layer.Vector({
    source: new ol.source.Vector(),
    map: map,
    style: new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: 'rgba(155,185,193,1)',
            width: 5,
        }),
        fill: new ol.style.Fill({
            color: 'rgba(255,255,0,.5)',
        })
    }),
    zindex: 3,
    properties: {
        layerName: "filteredLayer",
    },
});

let lowlights;
const lowlightLayer = new ol.layer.Vector({
    source: new ol.source.Vector(),
    map: map,
    style: new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: 'rgba(255,255,0,.2)',
            width: 1,
        }),
        fill: new ol.style.Fill({
            color: 'rgba(255,255,0,.2)',
        })
    }),
    zindex: 2,
    properties: {
        layerName: "filteredLayer",
    },
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
    properties: {
        layerName: "filteredLayer",
    },
});

function updateMapHighlights(sourceID, type, relations){
    console.log("Entering updateMapHighlights");
    brightlights = {};
    highlights = {};
    lowlights = {};
    nolights = {};
    filteredFeatures = filteredSource.getFeatures();
    //console.log("filteredFeatures: ",filteredFeatures);

    nolightLayer.getSource().clear();
    lowlightLayer.getSource().clear();
    highlightLayer.getSource().clear();
    brightlightLayer.getSource().clear();
    map.removeLayer(filteredLayer);

    console.log("relations: ",relations);

    if(type=="none"){
        map.addLayer(filteredLayer);
    } else {
        //cards = ["sCard","iCard"];
        //if(cards.includes(type)){}
        if (type=="sCard"){
            brightlights["sIDs"] = sourceID;
            for (i=0; i<filteredFeatures.length; i++){
                if (relations["instances_yes"].includes(filteredFeatures[i]["A"]["i_id"])){
                    highlightLayer.getSource().addFeature(filteredFeatures[i]);
                } else {
                    nolightLayer.getSource().addFeature(filteredFeatures[i]);
                }
            };
            
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
            }
        } else {
        //else if (type=="iCard"){
            brightlights["iIDs"] = sourceID;
            console.log("iID: ",sourceID);
            for (i=0; i<filteredFeatures.length; i++){
                //console.log("filteredFeature ID = ",filteredFeatures[i]["A"]["i_id"]);
                if (sourceID == filteredFeatures[i]["A"]["i_id"]){
                    brightlightLayer.getSource().addFeature(filteredFeatures[i]);
                    c_astext = filteredFeatures[i]["A"]["centroid_text"];
                    var regex = /[+-]?\d+(\.\d+)?/g;
                    var brightCentroid = c_astext.match(regex).map(function(v){
                        return parseFloat(v);
                    });
                    console.log("brightCentroid: ",brightCentroid);
                } else if (relations["instances_yes"].includes(filteredFeatures[i]["A"]["i_id"])){
                    highlightLayer.getSource().addFeature(filteredFeatures[i]);
                } else {
                    nolightLayer.getSource().addFeature(filteredFeatures[i]);
                }
            };
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
            }
        } 

        nolightLayer.setZIndex(1);
        lowlightLayer.setZIndex(2);
        highlightLayer.setZIndex(3);
        brightlightLayer.setZIndex(4);

        if (type=="sCard"){
            try {
                bhExtent = ol.extent.extend(brightlightLayer.getSource().getExtent(),highlightLayer.getSource().getExtent(),lowlightLayer.getSource().getExtent());
                map.getView().fit(bhExtent);
            } catch(error) {
                console.log("error: ",error);
                return;
            }
            
            
        } else if (type=="map"){
            popupTitle.innerHTML = cardD["p_name"];
            popupContent.innerHTML = cardD["title"];            
            popupContainer.style.display="block";
        } else {
            popupTitle.innerHTML = cardD["p_name"];
            popupContent.innerHTML = cardD["title"];
            popupScroll.style.display="none";
            //console.log("brightlight feature(s): ");
            popupOverlay.setPosition(brightCentroid);
            popupContainer.style.display="block";
            map.getView().fit(brightlightLayer.getSource().getExtent());
        }
    }
    console.log("Leaving updateMapHighlights");
};