

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

let allFilters = {};
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
 
var map = new ol.Map({
    layers: [
        new ol.layer.Tile({
            source: new ol.source.Stamen({
                layer: 'toner-lite',
            }),
        }),
    ],
    //overlays: [overlay],
    target: 'map',
    view: view,
});

/* Preparing highlight maps of selected instances */
fill1 = 'rgba(255,255,255,0.3)';
fill2 = 'rgba(156,34,15,1)';
const style = new ol.style.Style({
    fill: new ol.style.Fill({
        color: fill1,
    }),
    stroke: new ol.style.Stroke({
        color: fill2,
        width: 1,
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
})

var popupSource = new ol.source.Vector();


function refineFeatures(feature){
    feature["pub_date"] = new Date(feature["pub_date"]);
    feature["t_begin"] = new Date(feature["t_begin"]);
    feature["t_end"] = new Date(feature["t_end"]);
    return feature
}
var recentDate1 = new Date();
var recentDate2 = new Date();
var maxLisbonExtent = [-9.500526607165842, 38.40907442337447,-8.490972125626802, 39.31772866134256];
//Preload recent entries (100)
var recentSource = new ol.source.Vector({
    format: new ol.format.GeoJSON(),
    loader: function (extent, resolution, projection, success, failure) {
        var proj = projection.getCode();
        url = 'http://localhost:8080/geoserver/wfs?service=wfs&'+
            'version=2.0.0&request=GetFeature&typeNames=apregoar:geonoticias&'+
            'count=100&'+
            'sortby=pub_date+D&'+
            'outputFormat=application/json&srsname='+proj;
        console.log("url: ",url)
        var xhr = new XMLHttpRequest();
        xhr.open('GET',url);
        var onError = function() {
            console.log("Error in loading vector source");
            recentSource.removeLoadedExtent(extent);
            failure();
        }
        xhr.onerror = onError;
        xhr.onload = function() {
            if (xhr.status == 200){
                var features = recentSource.getFormat().readFeatures(xhr.responseText);
                recentSource.addFeatures(features);
                var noFeatures = false;
                if (features.length == 1) {
                    if (features[0]["A"]["geometry"] == null){
                        console.log("no instances here");
                        noFeatures = true;
                    }
                }
                success(features);
                if (noFeatures == false) {
                    layerExtent = recentSource.getExtent();
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
                    map.getView().fit(ol.extent.buffer(filterMaxExtent, .01)); //What does this number mean??
                    

                    //Getting info of preloaded features
                    preloadF = [];
                    console.log("features: ",features);
                    for (i = 0; i<features.length; i++){
                        refinedFeature = refineFeatures(features[i]["A"]);
                        preloadF.push(refinedFeature);
                    }
                    recentDate1 = preloadF[preloadF.length-1]["pub_date"];
                    allFilters["pubDateR1"] = recentDate1;
                    recentDate2 = preloadF[0]["pub_date"];
                    allFilters["pubDateR2"] = recentDate2;
                    document.getElementById("from").defaultValue = recentDate1.toDateString();
                    document.getElementById("to").defaultValue = recentDate2.toDateString();
                }
                var sourceFeatureInfo = recentSource.getFeatures();
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
    }
});
const recentLayer = new ol.layer.Vector({
    source: recentSource,
    style: function(feature) {
        style.getText().setText(feature.get('p_name'));
        return style;
    },
});
map.addLayer(recentLayer);


// DATE RANGE PICKER + Other filters//
$( function() {
    //console.log("recentDates in datepicker load: ",recentDate1,"-",recentDate2);
    var dateFormat = "mm/dd/yy",
    from = $( "#from" ).datepicker({
        defaultDate: recentDate1,
        changeMonth: true,
        numberOfMonths: 1,
        minDate: pubDate1,
    }).on( "change", function() {
        to.datepicker( "option", "minDate", getDate( this ) );
        allFilters["pubDateR1"] = getDate(this);
        filterAllVals();
    }),
    to = $( "#to" ).datepicker({
        defaultDate: recentDate2,
        changeMonth: true,
        numberOfMonths: 1,
        maxDate: pubDate2,
    }).on( "change", function() {
        from.datepicker( "option", "maxDate", getDate( this ) );
        allFilters["pubDateR2"] = getDate(this);
        filterAllVals();
    });
    fromI = $( "#fromI" ).datepicker({
        defaultDate: new Date(),
        changeMonth: true,
        numberOfMonths: 1,
        minDate: iDate1,
    }).on( "change", function() {
        toI.datepicker( "option", "minDate", getDate( this ) );
        allFilters["iDateR1"] = getDate(this);
        filterAllVals();
    }),
    toI = $( "#toI" ).datepicker({
        defaultDate: new Date(),
        changeMonth: true,
        numberOfMonths: 1,
        maxDate: iDate2
    }).on( "change", function() {
        fromI.datepicker( "option", "maxDate", getDate( this ) );
        allFilters["iDateR2"] = getDate(this);
        filterAllVals();
    });

    function getDate( element ) {
        var date;
        try {
            date = $.datepicker.parseDate( dateFormat, element.value );
        } catch( error ) {
            date = null;
        }
        return date;
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
        if (i == 0){
            terms = "'%(";
        }
        if (i == list.length-1){
            terms = terms + "(" + item + "))%'";
        } else {
            terms = terms + "(" + item + ")|";
        }
    }
    terms.toLowerCase();
    return terms;
}

let tagSource;
function filterAllVals(){
    console.log("allFilters: ",allFilters);
    var cql = "";
    if (allFilters["Tags"]) {
        cql = cql + "strToLowerCase(tags) similar to "+extractTerms(allFilters["Tags"])+" and "; //Edit this bad boy to filter on the fly
    }
    if (cql == ""){
        console.log("no filters");
    } else {
        cql = cql.substring(0,cql.length-5);
        console.log("cql pre-formating: ",cql);
    }
    cql = "cql_filter="+cql.replace(/%/gi,"%25").replace(/'/gi,"%27").replace(/ /gi,"%20")+"&"; //Globals
    console.log("cql: ",cql);
    var tagSource = new ol.source.Vector({
        format: new ol.format.GeoJSON(),
        loader: function (extent, resolution, projection, success, failure) {
            var proj = projection.getCode();
            url = 'http://localhost:8080/geoserver/wfs?service=wfs&'+
                'version=2.0.0&request=GetFeature&typeNames=apregoar:geonoticias&'+
                cql +
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
                if (xhr.status == 200){
                    var features = tagSource.getFormat().readFeatures(xhr.responseText);
                    tagSource.addFeatures(features);
                    var noFeatures = false;
                    if (features.length == 1){
                        if (features[0]["A"]["geometry"] == null){
                            console.log("no instances here")
                            alert("Desculpa: a pesquisa não deu qualquer resultado")
                            noFeatures = true;
                        }
                    }
                    success(features);
                    if (noFeatures == false) {
                        layerExtent = tagSource.getExtent();
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
                        map.getView().fit(ol.extent.buffer(filterMaxExtent, .01)); //What does this number mean??
                    }
                    var tagFeatureInfo = tagSource.getFeatures();
                    numStoryFeatures = tagFeatureInfo.length;
                } else {
                    onError();
                }
            }
            xhr.send();
        }
    })
    var tagLayer = new ol.layer.Vector({
        source: tagSource,
        style: function(feature) {
            style.getText().setText(feature.get('p_name'));
            return style;
        },
    });
    map.removeLayer(recentLayer);
    map.addLayer(tagLayer);

};