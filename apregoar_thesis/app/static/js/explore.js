

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
        e.stopPropagation();
        var hc = $(this).prop("checked");
        $(this).closest(".MultiCheckBoxDetail").find(".MultiCheckBoxDetailBody input").prop("checked", hc);
        $(this).closest(".MultiCheckBoxDetail").next().UpdateSelect();
    });

    $(document).on("click", ".MultiCheckBoxDetailHeader", function (e) {
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
var allFilters = {
    "Tags": [],
    "Sections": [],
    "Authors": [],
    "Publications": [],
    "T_types": [],
    "P_types": [],
    "E_names": [],
    "pubDateR1": "",
    "pubDateR2": "",
    "iDateR1": "",
    "iDateR2": "",
    "pNameSearch": "",
    "iDateFilter": false,
    "pubDateFilterMin":false,
    "pubDateFilterMax":false,
};
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
        filterAllVals();

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
 
var map = new ol.Map({
    //overlays: [overlay],
    target: 'map',
    view: view,
});
map.addLayer(backDrop);

/* Preparing highlight maps of selected instances */
fill1 = 'rgba(156,34,15,0.2)';
fill2 = 'rgba(156,34,15,1)';
fill3 = 'rgba(83, 176, 126,1)';
fill4 = 'rgba(239, 223, 142,0.6)';
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
        width: 10,
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
}

//Load source. Returns 
//let firstPubDate, lastPubDate, firstInstDate, lastInstDate;
function loadSourceToExplore(wfs_url, loadType) {
    var tempSource = new ol.source.Vector({
        format: new ol.format.GeoJSON(),
        loader: function (extent, resolution, projection, success, failure) {
            var proj = projection.getCode();
            url = wfs_url
            console.log("url: ",url)
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
                if (xhr.status == 200){
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
                    var sourceFeatureInfo = recentSource.getFeatures();
                    //console.log("sourceFeatureInfo: ",sourceFeatureInfo);
                    numStoryFeatures = sourceFeatureInfo.length;
                    //console.log("Number of features in story: ", numStoryFeatures);
                    console.log("Successful loading of vector source");
                    if (loadType == "recent"){
                        console.log("recent features loaded")
                    }
                    if (loadType == "all") {
                        console.log("All resources loaded")
                    }
                } else {
                    onError();
                }
            }
            xhr.send();
            //console.log("Passed send of xhr");
        }
    });  
    return tempSource
};
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
        filterAllVals();
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
        filterAllVals();
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
        filterAllVals();
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
        filterAllVals();
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
        filterAllVals();
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
        filterAllVals();
    }
});

/*INCLUDE TEXT SEARCH FIELDS IN FILTERING */


$("#pNameSearch").on("change", function() {
    allFilters["pNameSearch"] = $(this).val();
    filterAllVals();
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
var sIDs = [];
var iIDs = [];
function filterAllVals(){
    currentLayers = map.getLayers();
    console.log("currentLayers: ",currentLayers);
    map.removeLayer(allLayer);
    map.removeLayer(recentLayer);
    map.removeLayer(filteredLayer);
    filteredSource.clear();
    console.log("allFilters: ",allFilters);
    bodyContent = JSON.stringify(allFilters);
    console.log("bodyContent: ",bodyContent);
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
            return;
        }
        response.json().then(function(resp){
            console.log(resp);
            sIDs = resp["sIDs"];
            iIDs = resp["iIDs"];
            if (iIDs.length > 0){
                iIDFilter = "i_id IN ("+iIDs+")";
                console.log(iIDFilter);
                cqlFilter = iIDFilter.replace(/%/gi,"%25").replace(/'/gi,"%27").replace(/ /gi,"%20");
                urlFiltered = 'http://localhost:8080/geoserver/wfs?service=wfs&'+
                    'version=2.0.0&request=GetFeature&typeNames=apregoar:geonoticias&'+
                    'cql_filter='+cqlFilter+'&'+
                    'sortby=pub_date+D&'+
                    'outputFormat=application/json&srsname=EPSG:4326';
                filteredSource = loadSourceToExplore(wfs_url=urlFiltered, loadType="filtered")
                filteredLayer.setSource(filteredSource);// how do I define this?
                map.addLayer(filteredLayer);
                recentResults.style.display = "none";
                instanceResults.innerHTML=`<p>Instâncias: ${iIDs.length}: ${iIDs}</p>`;
                storyResults.innerHTML=`<p>Histórias: ${sIDs.length}: ${sIDs}</p>`;
            } else {
                console.log("no features meeting criteria")
                map.removeLayer(filteredLayer);
                map.addLayer(recentLayer);
                recentResults.style.display = "block";
                instanceResults.innerHTML=`<p>Sem lugares</p>`;
                storyResults.innerHTML=`<p>Sem histórias</p>`;
            }
        })
    })
    //Connect to python for dynamic filtering. Return SIDs, search these in OL (OR WFS) and load.
};