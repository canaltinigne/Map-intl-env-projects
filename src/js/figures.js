var active_subchapter
var choropleth_fips={}
var choropleth_map_objs = {}
var waterfund_objs={}
var waterfund_markers={}
var case_6_1_button_active = '1'
var lineplot_data;
var case_6_1_fig3_data;
var case_6_1_fig2_data;
var case_7_2_fig1_layer;
var case_7_4_fig1_layer;
var case_9_1_fig1_data;
var choropleth_map_county;
var progress_bar = 0;
var case_8_1_fig1_layer1;
var case_8_1_fig1_layer2;
var case_8_1_fig1_layer3;

//marker options
var geojsonMarkerOptions = {
    radius: 8,
    fillColor: "#ff7800",
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
};

//progress bar on loading page
var progress_bar = {
    progress: 0,
    get _progress() { return this.progress; },
    set _progress(value) { this.progress = value; $('.progress-bar').css({'width': this.progress + '%'}) }
  };

//read csv files, meanwhile update progress bar and create all leaflet layers on pre-loading page
const start_reading = async function() {
    //preload 6_1-1
    lineplot_data = await d3.csv("data/line_plot.csv");
    data_points_acres=[];
    data_points_money=[];

    for(var i=0;i<lineplot_data.length;i++){
        data_points_acres.push({x: parseInt(lineplot_data[i]['yr'],10) ,y:lineplot_data[i]['Total_Acres']/1000000})
        data_points_money.push({x: parseInt(lineplot_data[i]['yr'],10),y:lineplot_data[i]['Total_Money']/1000000})
    }

    progress_bar._progress += 20;

    //preload case_6_1-2
    choropleth_map_county = await shp("data/county/counties");
    data = await $.getJSON('data/mitigation_bank.json');
    case_6_1_fig2_data = await d3.csv("data/acres_new.csv");
    
    case_6_1_choropleth_from_csv(case_6_1_fig2_data, ['2014','2015','2016'],[0, 0, 1, 5, 10],true,2);

    //preload case_6_1-3
    case_6_1_fig3_data = await d3.csv("data/acres_payments.csv");
    case_6_1_choropleth_from_csv(case_6_1_fig3_data, ['2016'],[0, 0, 20, 40, 80],false,3);

    progress_bar._progress += 20;

    //preload case 7_2-1
    case_7_2_fig1_layer = L.geoJson(data, {
        pointToLayer: function (feature, latlng) {
            label = String(feature.properties.NUMPOINTS)
            return new L.circleMarker(latlng, geojsonMarkerOptions).bindTooltip(label, {permanent: true, opacity: 0.7}).openTooltip();
        }
    });

    progress_bar._progress += 20;

    //preload case_7_4-1
    geojson = await shp("data/forest/forest.offset.projects.updated2017");
    case_7_4_fig1_layer = L.geoJson(geojson, {
        pointToLayer: function (feature, latlng) {
            return new L.marker(latlng, {
                icon: L.divIcon({
                html: '<i class="fa fa-tree" aria-hidden="true" style="color:lightgreen"></i>',
                className: 'myDivIcon'
                })
            }).bindPopup('<i>'+String(feature.properties.NAME)+'</i><br>'+String(feature.properties.Area2)+' <strong>hectares.</strong>').on('mouseover', function (e) {
                this.openPopup();
            }).on('mouseout', function (e) {
                this.closePopup();
            });
        }
    })

    progress_bar._progress += 20;

    case_9_1_fig1_data = await d3.csv("data/Water_Funds.csv");
    geojson = await shp("data/brazil/ucs_arpa_br_mma_snuc_2017_w");
    case_8_1_fig1_layer1 = L.geoJson(geojson, {style: {"color": "#00994c","opacity": 0.65}});

    data = await $.getJSON('data/brazil/amapoly_ivb.json');
    case_8_1_fig1_layer2 = L.geoJson(data, {style: {"color": "#665BCE"}});

    data = await $.getJSON('data/brazil/amazonriver_865.json');
    case_8_1_fig1_layer3 = L.geoJson(data, {style: {"weight": 5}});

    progress_bar._progress += 20;

    setTimeout(function(){$('.progress').trigger('loaded')}, 600);
}

// create progress bar
$( 'body' ).ready(function() {

    $('.progress').bind('loaded',function(){
        $('.progress').hide();
        $('.entry-button').show();
    });

    start_reading();
});

// add figures on right menu
function right_menu_figures(chapter, subchapter){
  if (subchapter == '6-1'){
    $('#'+subchapter+'-summary').after('<div id="chart-container" style="height: 300px;"></div>');
    case_6_1_fig1();
    //add case 6 buttons
    $('#chart-container').after('<div id="button-div"></div><br><br>');
    $('#button-div').append('<br><button type="button" class="btn btn-light case-6-1-button" id="button-1" onclick="case_6_1_fig2();">Enrollment per county</button>');
    $('#button-div').append('<button type="button" class="btn btn-light case-6-1-button" id="button-2" onclick="case_6_1_fig3();" style="float:right;">Soil rental rate per county</button><br>');
  }
  else if (subchapter == '9-1'){
    }

  else if (case_with_figure.includes(subchapter)){
    //add divs for figures of case studies
    $('#'+subchapter+'-summary').after('<div id="figure-'+subchapter+' style="float:right; margin: 0 0 0.5vh 1vw;"></div>');
    cases_static_figs(subchapter);

  }
}

// display figures of each study
function display_figure(subchapter){
  if (!(subchapter == active_subchapter)){
    clean_layers()
    handle_view(subchapter)
    active_subchapter = subchapter
    switch(subchapter){
      case '6-1':
        if (case_6_1_button_active==1) case_6_1_fig2(scrolled=true)
        else case_6_1_fig3(scrolled=true);
        break
      case '6-3':
        case_6_3_fig1();
        break
      case '7-2':
        case_7_2_fig1_layer.addTo(map);
        break
      case '7-4':
        case_7_4_fig1_layer.addTo(map);
        break
      case '8-1':
        case_8_1_fig1();
        break
      case '9-1':
        case_9_1_fig1(scrolled=true)
        break
    }
  }
}

// add static visuals
function cases_static_figs(subchapter){
    fig_file = './static/figure_and_images/'+subchapter.toString().replace('-','_')+'-1.png';
    $('#'+subchapter+'-summary').append('<img class="img-center" src="' + fig_file + '">');
    $('#'+subchapter+'-summary').append('<p class="figure-text">Figure: ' + case_no_fig_title[subchapter]+ '</p>');
}

//create line plot of case study 6.1
function case_6_1_fig1() {
    //set options of line plot
    var options={
        animationEnabled: true,
        title:{
            text: "CRP Enrollments and Payment"
        },
        toolTip: {
            shared: true
        },
        axisX: {
            title: "Year",
            suffix : "",
            valueFormatString:"####"
        },
        axisY: {
            title: "Land Enrolled",
            titleFontColor: "#4F81BC",
            suffix : "M",
            lineColor: "#4F81BC",
            tickColor: "#4F81BC",
            valueFormatString:"####"
        },
        axisY2: {
            title: "CRP Payments",
            titleFontColor: "#C0504E",
            suffix : "M",
            lineColor: "#C0504E",
            tickColor: "#C0504E"
        },
        data: [{
            type: "spline",
            name: "Land Enrolled",
            xValueFormatString: "####",
            yValueFormatString: "#### million acres",
            dataPoints: data_points_acres
        },
        {
            type: "spline",
            axisYType: "secondary",
            name: "CRP Payments",
            yValueFormatString: "$####",
            xValueFormatString: "####",
            dataPoints: data_points_money
        }]
    };

    $("#chart-container").CanvasJSChart(options);

};


function case_6_1_fig2(scrolled=false) {
    case_6_1_button_active = '1'
    if(active_subchapter!='6-1')// if chapter 6 is active  
        $('#right-menu').stop().animate({scrollTop:$('#right-menu').scrollTop() + $('#right-subchapter-6-1').offset().top - $('#right-menu').position().top+1}, 500, 'swing');
    else {
        if(!scrolled) clean_layers();// clean layers if navigating to another case 
        $("#button-1").css('background-color','#39ac73');
        choropleth_map_objs['2014geo-2'].addTo(map)//add choropleth layer
        choropleth_map_objs['legend-2'].addTo(map);//add legend
        $('#button-div').after('<div id="slider" style="margin: 16px"></div>')
        map.addControl(choropleth_map_objs['slider']);//add slider to map

        var htmlObject = choropleth_map_objs['slider'].getContainer();//get slider container

        var newpos = document.getElementById('slider');//set time slider

        function setParent(el, newParent)
        {
        newParent.appendChild(el);
        }
        setParent(htmlObject, newpos);
        choropleth_map_objs['slider'].startSlider();//starting slider
    }
};

// add choropleth of case 6.1 fig3 to map 
function case_6_1_fig3(scrolled=false) {
    case_6_1_button_active = '2'
    if(active_subchapter!='6-1')
        $('#right-menu').stop().animate({scrollTop:$('#right-menu').scrollTop() + $('#right-subchapter-6-1').offset().top - $('#right-menu').position().top+1}, 500, 'swing');
    else {
        if(!scrolled) clean_layers();
        $("#button-2").css('background-color','#39ac73');
        choropleth_map_objs['2016geo-3'].addTo(map)
        choropleth_map_objs['legend-3'].addTo(map);
    }
};

// creating choropleth layer given values for each county data as parameter
function case_6_1_choropleth_from_csv(data, year_list,grades,percent,fig){
    choropleth_fips['grades']=grades;
    layers=[]
    
    for (year_idx=0;year_idx<year_list.length;year_idx++){

        year = year_list[year_idx];

        for(var i=0;i< data.length;i++){
            if (percent){
                var sum = sum_values(data,year);
                choropleth_fips[ data[i]['FIPS']]= (parseInt( data[i][year].replace('.',''))/sum)*10000;
            }
            else{
                choropleth_fips[data[i]['FIPS']]= parseInt( data[i][year])/2.4711;
            }
        }

        choropleth_map_objs[year+'geo-'+fig] = L.geoJson(choropleth_map_county, {style: style, time: year})
        layers.push(choropleth_map_objs[year+'geo-'+fig]);

        choropleth_map_objs['legend-'+fig] = L.control({position: 'bottomleft'});

        choropleth_map_objs['legend-'+fig].onAdd = function (map) {
            return legend(grades)
        };

    }
    if (year_list.length>1){
        var layerGroup = L.layerGroup(layers);
        //initiate slider, follow = 1 means, show one feature at a time
        choropleth_map_objs['slider'] = L.control.sliderControl({position: "topleft",layer:layerGroup, follow: 1});
    }
    //choropleth_map_objs['legend'].addTo(map);
}

// add png of south africa on map
function case_6_3_fig1() {
    var lg;
      var imageUrl = './data/sonuc.png';

      case_6_3_fig1_legend = L.control({position: 'bottomleft'});
      geojson.eachLayer(function(layer) {
          if (layer.feature.properties.name == 'South Africa') {
              layer.setStyle({fillOpacity: 0});
          }
      });

      case_6_3_fig1_legend.onAdd = function (map) {
          var div = L.DomUtil.create('div', 'info legend');
          categories = ['0 or no data','0 - 5%','5 - 10%','> 10%','Clearing areas'];
          colors = ['#ffffff', '#EBB57D', '#CF6042', '#980001', '#386507']
          lgnd = [];

          for (var i = 0; i < categories.length; i++) {
              div.innerHTML +=  lgnd.push('<i style="background:' + colors[i] + '"></i> ' + (categories[i]));
          }

          div.innerHTML = lgnd.join('<br>');
          return div;
          };
      //add legend
      case_6_3_fig1_legend.addTo(map);

      imageBounds = [[-22.046289062500017, 33.80013281250005], [-34.885742187500006, 15.747558593750045]];
      case_6_3_fig1_layer = L.imageOverlay(imageUrl, imageBounds).addTo(map);//add image as overlay on the map using boundaries of South Africa


};

function case_8_1_fig1() {
    //add layers of ARPA
    case_8_1_fig1_layer1.addTo(map);
    case_8_1_fig1_layer2.addTo(map);
    case_8_1_fig1_layer3.addTo(map);

    case_8_1_fig1_legend = L.control({position: 'bottomleft'});

    //create legend
    case_8_1_fig1_legend.onAdd = function (map) {
        var div = L.DomUtil.create('div', 'info legend');
        categories = ['Amazon Basin','ARPA System','Amazon River'];
        colors = ["rgb(102, 91, 206)", "rgb(110, 168, 117)", "rgb(84, 131, 244)"]
        lgnd = [];

        for (var i = 0; i < categories.length; i++) {
            div.innerHTML +=  lgnd.push('<i style="background:' + colors[i] + '"></i> ' + (categories[i]));
        }

        div.innerHTML = lgnd.join('<br>');
        return div;
    };
  
    case_8_1_fig1_legend.addTo(map);

};

// add water fund markers
function case_9_1_fig1(scrolled=false) {
    data=case_9_1_fig1_data;
    case_6_1_button_active = '1'
    if(active_subchapter!='9-1') $('#right-menu').stop().animate({scrollTop:$('#right-menu').scrollTop() + $('#right-subchapter-9-1').offset().top - $('#right-menu').position().top+1}, 500, 'swing');
    else {
        if(!scrolled) clean_layers();
    }

    case_no = 9.1;
    fig_no = 1;
    wasActive=false;

    if(!wasActive){
            //init marker lists of each phase
            waterfund_markers['phase_'] = [];
            waterfund_markers['phase_0'] = [];
            waterfund_markers['phase_1'] = [];
            waterfund_markers['phase_2'] = [];
            waterfund_markers['phase_3'] = [];
            waterfund_markers['phase_4'] = [];
            waterfund_markers['phase_5'] = [];

            // iterate over water funds
            for(var i=0;i< data.length;i++){
                //create marker
                var marker = L.marker([data[i]['Latitude'],data[i]['Longitude']], {
                    icon: L.divIcon({
                      html: '<i class="fa fa-tint fa-lg" aria-hidden="true" style="color:'+get_marker_color('phase_'+data[i]['Phase_Code'])+'"></i>',
                      className: 'myDivIcon'
                    })}
                );
                
                //set values in popup
                if (data[i]['Phase']==('Operation'||'Maturity')){
                    marker.bindPopup("<b>Phase:</b>" +data[i]['Phase']+"<br>"+"<b>City:</b>"+data[i]['City']
                    +"<br>"+"<b>Country:</b>"+data[i]['Country']+"<br>"+"<b>State:</b>"+data[i]['State']
                    +"<br>"+"<b>Operational since:</b>"+data[i]['Operational']).on('mouseover', function (e) {
                        this.openPopup();
                    }).on('mouseout', function (e) {
                        this.closePopup();
                    });
                }
                else{
                    marker.bindPopup("<b>Phase:</b>"+data[i]['Phase']+"<br>"+"<b>City:</b>"+data[i]['City']
                    +"<br>"+"<b>Country:</b>"+data[i]['Country']+"<br>"+"<b>State:</b>"+data[i]['State']).on('mouseover', function (e) {
                        this.openPopup();
                    }).on('mouseout', function (e) {
                        this.closePopup();
                    });;
                }
                waterfund_markers['phase_'+data[i]['Phase_Code']].push(marker);
                //waterfund_objs[i]=marker
            }
            //create layer groups containing markers for each case
            waterfund_objs['phase_'] = L.layerGroup(waterfund_markers['phase_']).addTo(map);
            waterfund_objs['phase_0'] = L.layerGroup(waterfund_markers['phase_0']).addTo(map);
            waterfund_objs['phase_1'] = L.layerGroup(waterfund_markers['phase_1']).addTo(map);
            waterfund_objs['phase_2'] = L.layerGroup(waterfund_markers['phase_2']).addTo(map);
            waterfund_objs['phase_3'] = L.layerGroup(waterfund_markers['phase_3']).addTo(map);
            waterfund_objs['phase_4'] = L.layerGroup(waterfund_markers['phase_4']).addTo(map);
            waterfund_objs['phase_5'] = L.layerGroup(waterfund_markers['phase_5']).addTo(map);
            
            var overlayMaps = {
                "Being Explored":               waterfund_objs['phase_'] ,
                "Phase 0: Pre-Feasibility ":    waterfund_objs['phase_0'],
                "Phase 1: Feasibility ":        waterfund_objs['phase_1'],
                "Phase 2: Design":              waterfund_objs['phase_2'],
                "Phase 3: Creation":            waterfund_objs['phase_3'],
                "Phase 4: Operation":           waterfund_objs['phase_4'],
                "Phase 5: Maturity":            waterfund_objs['phase_5']
            };
            //create layer control by adding layer groups 
            waterfund_objs['con_layers']=L.control.layers(null,overlayMaps,{collapsed:false, position: 'bottomleft'}).addTo(map);
            $('.leaflet-control-layers-selector:checked')
 
            //document.getElementById('water_marker_control').appendChild(waterfund_objs['con_layers'].getContainer());
       
        waterfund_bool=true;
    }
}



function handle_view(subchapter){

  //At title
  if(subchapter=='0') view_world();
  else{
  //User clicked on active subchapter: reset
    lat = case_location_view[subchapter].split(',')[0];
    long = parseFloat(case_location_view[subchapter].split(',')[1]);
    zoom = case_location_view[subchapter].split(',')[2]
    map.flyTo([lat, long],zoom);
}
}

function clean_layers(){

  if(active_subchapter=='6-1'){
    $('#button-1').css('background-color', 'rgba(255, 255, 255, 0.8)');
    $('#button-2').css('background-color', 'rgba(255, 255, 255, 0.8)');
    map.removeControl(choropleth_map_objs['legend-2']);
    map.removeControl(choropleth_map_objs['legend-3']);
    map.removeControl(choropleth_map_objs['slider']);

    Object.keys(choropleth_map_objs).forEach(function(key) {
        map.removeLayer(choropleth_map_objs[key]);
    });

  }

  //case_6_3_fig1
  else if(active_subchapter=='6-3'){
    map.removeLayer(case_6_3_fig1_layer);
    map.removeControl(case_6_3_fig1_legend);
    geojson.eachLayer(function(layer) {

        if (layer.feature.properties.name == 'South Africa') {
            //layer.setStyle({fillOpacity: 0});
            geojson.resetStyle(layer);
        }
    });
  }

  //case_7_2_fig1
  else if(active_subchapter=='7-2'){
    map.removeLayer(case_7_2_fig1_layer);
  }

  //case_7_4_fig1
  else if(active_subchapter=='7-4'){
    map.removeLayer(case_7_4_fig1_layer);
  }

  //case_8_1_fig1
  else if(active_subchapter=='8-1'){
    map.removeLayer(case_8_1_fig1_layer1);
    map.removeLayer(case_8_1_fig1_layer2);
    map.removeLayer(case_8_1_fig1_layer3);
    map.removeControl(case_8_1_fig1_legend);
  }

  //case_9_1_fig1
  else if(active_subchapter=='9-1'){
    waterfund_markers=[]
    waterfund_objs['con_layers'].remove(map);
    waterfund_objs['phase_'].clearLayers();
    waterfund_objs['phase_0'].clearLayers();
    waterfund_objs['phase_1'].clearLayers();
    waterfund_objs['phase_2'].clearLayers();
    waterfund_objs['phase_3'].clearLayers();
    waterfund_objs['phase_4'].clearLayers();
    waterfund_objs['phase_5'].clearLayers();
  }

}

//create legends, give grades as parameter
function legend(grades){
    var div = L.DomUtil.create('div', 'info legend'),
    labels = [];

    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        if (i==0){
            div.innerHTML += '<i style="background:' + getColor(grades[i],grades) + '"></i> ' + (grades[i + 1]) + '<br>';
        }
        else{
            div.innerHTML +=
        '<i style="background:' + getColor(grades[i] + 1,grades) + '"></i> ' +
        grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
        }
    }
    return div;
}

//get color of water fund marker
function get_marker_color(phase){
    return phase == 'phase_' ?  'Maroon' :
           phase == 'phase_0' ?  'LightCoral' :
           phase == 'phase_1' ?  'SteelBlue' :
           phase == 'phase_2' ? 'Aqua' :
           phase == 'phase_3' ?'Chartreuse' :
           phase == 'phase_4' ?'#00FA9A' :
           phase == 'phase_5' ?'Green' :
                                'Aquamarine';

}

// get colors of legend
function getColor(d,grades) {
    return d > grades[4] ?  '#800026' :
           d > grades[3] ?  '#BD0026' :
           d > grades[2] ?  '#E31A1C' :
           d > grades[1] ?  '#FFEDA0' :
                            '#FFFFFF' ;
}

//return sum of given array
function sum_values(data,column){
    var sum=0.0;
    for(var i=0;i<data.length;i++){
        sum+=parseFloat(data[i][column].replace('.',''));
    }
    return sum
}

//get colors of choropleth
function style(feature) {
    return {
        fillColor: getColor(choropleth_fips[feature.properties.fips],choropleth_fips['grades']),
        weight: 1,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7
    };
}

//set map to show whole world
function view_world(){
  map.flyTo([20.0, 0.0], 3);
  return
}
