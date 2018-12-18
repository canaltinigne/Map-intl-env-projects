//<div id="chartContainer" class="dialog" style="height: 100%; width: 100%;"></div>
let active_subchapter
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

let load_file_num = 7;

var geojsonMarkerOptions = {
    radius: 8,
    fillColor: "#ff7800",
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
};

var MyVar = {
    prop1: 0,
    get _prop1() { return this.prop1; },
    set _prop1(value) { this.prop1 = value; $('.progress-bar').css({'width': this.prop1 + '%'}) }
  };

const start_reading = async function() {
    
    lineplot_data = await d3.csv("data/line_plot.csv");
    MyVar._prop1 += (100/load_file_num);

    case_6_1_fig3_data = await d3.csv("data/acres_payments.csv");
    MyVar._prop1 += (100/load_file_num);

    case_6_1_fig2_data = await d3.csv("data/acres_new.csv");
    MyVar._prop1 += (100/load_file_num);

    choropleth_map_county = await shp("data/county/counties");
    MyVar._prop1 += (100/load_file_num);

    data = await $.getJSON('data/mitigation_bank.json');

    case_7_2_fig1_layer = L.geoJson(data, {
        pointToLayer: function (feature, latlng) {
            label = String(feature.properties.NUMPOINTS)
            return new L.circleMarker(latlng, geojsonMarkerOptions).bindTooltip(label, {permanent: true, opacity: 0.7}).openTooltip();
        }
    });
    
    MyVar._prop1 += (100/load_file_num);

    geojson = await shp("data/forest/forest.offset.projects.updated2017");

    case_7_4_fig1_layer = L.geoJson(geojson, {
        pointToLayer: function (feature, latlng) {
            return new L.marker(latlng, {
                icon: L.divIcon({
                html: '<i class="fa fa-tree" aria-hidden="true" style="color:green"></i>',
                className: 'myDivIcon'
                })
            }).bindPopup('<i>'+String(feature.properties.NAME)+'</i><br>'+String(feature.properties.Area2)+' <strong>hectares.</strong>').on('mouseover', function (e) {
                this.openPopup();
            }).on('mouseout', function (e) {
                this.closePopup();
            });
        }
    })

    MyVar._prop1 += (100/load_file_num);
    
    case_9_1_fig1_data = await d3.csv("data/Water_Funds.csv");    

    MyVar._prop1 += (100/load_file_num);

    setTimeout(function(){$('.progress').trigger('loaded')}, 600); 
}

$( 'body' ).ready(function() {

    $('.progress').bind('loaded',function(){
        $('.progress').hide();
        $('.entry-button').show();
    });
    
    start_reading();
});

function right_menu_figures(chapter, subchapter){
  if (subchapter == '6-1'){
    $('#'+subchapter+'-summary').after('<div id="chart-container" style="height: 300px;"></div>');
    //<div id="chartContainer" class="dialog" style="height: 100%; width: 100%;"></div>
    case_6_1_fig1();
    $('#chart-container').after('<div id="button-div"></div><br><br>');
    $('#button-div').append('<br><button type="button" class="btn btn-light case-6-1-button" id="button-1" onclick="case_6_1_fig2();">Enrollment per county</button>');
    $('#button-div').append('<button type="button" class="btn btn-light case-6-1-button" id="button-2" onclick="case_6_1_fig3();" style="float:right;">Soil rental rate per county</button><br>');
  }
  if (subchapter == '9-1'){
    $('#'+subchapter+'-summary').after('<div id="container-9"></div>');
    $('#container-9').after('<div id="water_marker_control"  style="height: 200px;"></div><br><br>');        
    $('#water_marker_control').css('display','none');
    //<div id="chartContainer" class="dialog" style="height: 100%; width: 100%;"></div>
    }
}


function display_figure(subchapter){
  if (!(subchapter == active_subchapter)){
    clean_layers()
    handle_view(subchapter)
    active_subchapter = subchapter
    switch(subchapter){
      case '6-1':
        if (case_6_1_button_active==1) case_6_1_fig2(scrolled=true)
        else case_6_1_fig3(scrolled=true)

        break
      case '6-3':
        case_6_3_fig1()
        break
      case '7-2':
        //case_7_2_fig1()
        break
      case '7-4':
        //case_7_4_fig1()
        break
    case '9-1':
        console.log("9-1");
        $('#water_marker_control').show();
        case_9_1_fig1(scrolled=true)
        break
    }
  }
}

function case_6_1_fig1() {
    
    data_points_acres=[];
    data_points_money=[];
    
    for(var i=0;i<lineplot_data.length;i++){
        data_points_acres.push({x: parseInt(lineplot_data[i]['yr'],10) ,y:lineplot_data[i]['Total_Acres']/1000000})
        data_points_money.push({x: parseInt(lineplot_data[i]['yr'],10),y:lineplot_data[i]['Total_Money']/1000000})
    }
    
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
            valueFormatString:"$####"
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
            xValueFormatString: "$####",
            yValueFormatString: "$####",
            dataPoints: data_points_acres
        },
        {
            type: "spline",
            axisYType: "secondary",
            name: "CRP Payments",
            yValueFormatString: "$####",
            xValueFormatString: "$####",
            dataPoints: data_points_money
        }]
    };

    $("#chart-container").CanvasJSChart(options);

};


function case_6_1_fig2(scrolled=false) {
    case_6_1_button_active = '1'
    if(active_subchapter!='6-1') $('#right-menu').stop().animate({scrollTop:$('#right-menu').scrollTop() + $('#right-subchapter-6-1').offset().top - $('#right-menu').position().top+1}, 500, 'swing');
    else {
    if(!scrolled) clean_layers();
    $("#button-1").css('background-color','#39ac73');
    $('#button-div').after('<div id="slider" style="margin: 16px"></div>')
    years=[]
    for (i=2012;i<2017;i++)
        years.push(String(i));
    case_6_1_choropleth_from_csv(case_6_1_fig2_data, years,[0, 0, 1, 5, 10],true);
    }
};

function case_6_1_fig3(scrolled=false) {
    case_6_1_button_active = '2'
    if(active_subchapter!='6-1') $('#right-menu').stop().animate({scrollTop:$('#right-menu').scrollTop() + $('#right-subchapter-6-1').offset().top - $('#right-menu').position().top+1}, 500, 'swing');
    else {
    if(!scrolled) clean_layers();
    $("#button-2").css('background-color','#39ac73');
    case_6_1_choropleth_from_csv(case_6_1_fig3_data, '2016',[0, 0, 20, 40, 80],false);
    }
};

function case_6_1_choropleth_from_csv(data, year_list,grades,percent){

    var prog_bar = {
        prop1: 0,
        get _prop1() { return this.prop1; },
        set _prop1(value) { this.prop1 = value; $('.progress-bar').css({'width': this.prop1 + '%'}) }
      };

    layers=[];
    
    for (year_idx=0;year_idx<year_list.length;year_idx++){
        $('#slider').append('<div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" aria-valuemin="0" aria-valuemax="100"></div>');
        year = year_list[year_idx];
        console.log(year);
        prog_bar._prop1 += (100*year_idx/year_list.length);

        choropleth_fips['grades']=grades;
        
        var sum = sum_values(data,year);
        
        for(var i=0;i< data.length;i++){
            if (percent){
                choropleth_fips[ data[i]['FIPS']]= (parseInt( data[i][year].replace('.',''))/sum)*10000;
            }
            else{
                choropleth_fips[data[i]['FIPS']]= parseInt( data[i][year])/2.4711;
            }
        }
        
        choropleth_map_objs[year] = L.geoJson(choropleth_map_county, {style: style, time: year}).addTo(map);
        layers.push(choropleth_map_objs[year]);
        
    
        //choropleth_map_objs['legend'].addTo(map);
    }
    choropleth_map_objs['legend'] = L.control({position: 'bottomleft'});
    
        choropleth_map_objs['legend'].onAdd = function (map) {
            return legend(grades)
    };

    var layerGroup = L.layerGroup(layers);
    //initiate slider, follow = 1 means, show one feature at a time
    choropleth_map_objs['slider'] = L.control.sliderControl({position: "topleft",layer:layerGroup, follow: 1});
    map.addControl(choropleth_map_objs['slider']);//add slider to map

    var htmlObject = choropleth_map_objs['slider'].getContainer();
    // Get the desired parent node.
    var newpos = document.getElementById('slider');
   
    // Finally append that node to the new parent, recursively searching out and re-parenting nodes.
    function setParent(el, newParent)
    {
       newParent.appendChild(el);
    }
    setParent(htmlObject, newpos);

    choropleth_map_objs['slider'].startSlider();//starting slider    

}


function case_6_3_fig1() {
    var lg;
      var imageUrl = './data/sonuc.png';

      case_6_3_fig1_legend = L.control({position: 'bottomleft'});

      case_6_3_fig1_legend.onAdd = function (map) {
          var div = L.DomUtil.create('div', 'info legend bg-color');
          categories = ['0 or no data','0 - 5%','5 - 10%','> 10%','Clearing areas'];
          colors = ['#ffffff', '#EBB57D', '#CF6042', '#980001', '#386507']
          lgnd = ["<strong>Legend</strong>"];

          for (var i = 0; i < categories.length; i++) {
              div.innerHTML +=  lgnd.push('<i class="circle border" style="background:' + colors[i] + '"></i> ' + (categories[i]));
          }

          div.innerHTML = lgnd.join('<br>');
          return div;
          };

      case_6_3_fig1_legend.addTo(map);

      imageBounds = [[-22.046289062500017, 33.80013281250005], [-34.885742187500006, 15.747558593750045]];
      case_6_3_fig1_layer = L.imageOverlay(imageUrl, imageBounds).addTo(map);


};

function case_7_2_fig1() {
    case_no = 7.2;
    fig_no = 1;
    clean_layers();
    wasActive = is_active_fig[[case_no,fig_no]];
    handle_collapse([case_no,fig_no],'fig');

    if(!wasActive) {
        case_7_2_fig1_layer.addTo(map);
    }
};

function case_7_4_fig1() {
    case_no = 7.4;
    fig_no = 1;
    clean_layers();
    wasActive = is_active_fig[[case_no,fig_no]];
    handle_collapse([case_no,fig_no],'fig');

    if(!wasActive){
        case_7_4_fig1_layer.addTo(map);
    }
};


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

function case_9_1_fig1(scrolled=false) {
    data=case_9_1_fig1_data;
    case_6_1_button_active = '1'
    if(active_subchapter!='9-1') $('#right-menu').stop().animate({scrollTop:$('#right-menu').scrollTop() + $('#right-subchapter-9-1').offset().top - $('#right-menu').position().top+1}, 500, 'swing');
    else {
        if(!scrolled) clean_layers();
    }
    
    map.setView([20.0, 45.0], 2.4);    
    case_no = 9.1;
    fig_no = 1;
    wasActive=false;
    //console.log("9.1 clicked", waterfund_bool)
    if(!wasActive){
            waterfund_markers['phase_'] = [];
            waterfund_markers['phase_0'] = [];
            waterfund_markers['phase_1'] = [];
            waterfund_markers['phase_2'] = [];
            waterfund_markers['phase_3'] = [];
            waterfund_markers['phase_4'] = [];
            waterfund_markers['phase_5'] = [];
            for(var i=0;i< data.length;i++){
                //console.log("Water fund",i," :",data[i]);
                console.log(get_marker_color('phase_'+data[i]['Phase_Code']));
                
                var marker = L.marker([data[i]['Latitude'],data[i]['Longitude']], {
                    icon: L.divIcon({
                      html: '<i class="fa fa-tint fa-lg" aria-hidden="true" style="color:'+get_marker_color('phase_'+data[i]['Phase_Code'])+'"></i>',
                      className: 'myDivIcon'
                    })}
                );
                //waterfund_objs[i];//.addTo(map);
                if (data[i]['Phase']==('Operation'||'Maturity')){
                    marker.bindPopup("<b>Phase:</b>" +data[i]['Phase']+"<br>"+"<b>City:</b>"+data[i]['City']
                    +"<br>"+"<b>Country:</b>"+data[i]['Country']+"<br>"+"<b>State:</b>"+data[i]['State']+"<br>"+"<b>State:</b>"+data[i]['State']
                    +"<br>"+"<b>Operational since:</b>"+data[i]['Operational']).on('mouseover', function (e) {
                        this.openPopup();
                    }).on('mouseout', function (e) {
                        this.closePopup();
                    });
                }
                else{
                    marker.bindPopup("<b>Phase:</b>"+data[i]['Phase']+"<br>"+"<b>City:</b>"+data[i]['City']
                    +"<br>"+"<b>Country:</b>"+data[i]['Country']+"<br>"+"<b>State:</b>"+data[i]['State']+"<br>","<b>State:</b>"+data[i]['State']).on('mouseover', function (e) {
                        this.openPopup();
                    }).on('mouseout', function (e) {
                        this.closePopup();
                    });;
                }
                waterfund_markers['phase_'+data[i]['Phase_Code']].push(marker);
                //waterfund_objs[i]=marker
            }
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
            waterfund_objs['con_layers']=L.control.layers(null,overlayMaps,{collapsed:false, position: 'topleft'}).addTo(map);
            $('.leaflet-control-layers-selector:checked')
            
            var htmlObject = waterfund_objs['con_layers'].getContainer();
            // Get the desired parent node.
            var newpos = document.getElementById('water_marker_control');
           
            // Finally append that node to the new parent, recursively searching out and re-parenting nodes.
            function setParent(el, newParent)
            {
               newParent.appendChild(el);
            }
            setParent(htmlObject, newpos);
        
        waterfund_bool=true;
    }
}


function handle_view(subchapter){

  //At title
  if(subchapter=='0') view_world();
  else{
  //User clicked on active subchapter: reset
    lat = case_location_view[subchapter].split(',')[0];
    long = case_location_view[subchapter].split(',')[1];
    zoom = case_location_view[subchapter].split(',')[2]
    map.setView([lat, long],zoom);
  }
}

function clean_layers(){

  //case_6_1_fig2 and case_6_1_fig3
    //remove choropleth
  if(active_subchapter=='6-1'){
    $('#button-1').css('background-color', 'rgba(255, 255, 255, 0.8)');
    $('#button-2').css('background-color', 'rgba(255, 255, 255, 0.8)');
    map.removeControl(choropleth_map_objs['legend']);
    map.removeControl(choropleth_map_objs['slider']);
    Object.keys(choropleth_map_objs).forEach(function(key) {
        map.removeLayer(choropleth_map_objs[key]);
    });
  }

  //case_6_3_fig1
  else if(active_subchapter=='6-3'){
    map.removeLayer(case_6_3_fig1_layer);
    map.removeControl(case_6_3_fig1_legend);
  }
    /*
  //case_7_2_fig1
  else if(is_active_fig[[7.2,1]]){
    map.removeLayer(case_7_2_fig1_layer);
  }
  //case_7_4_fig1
  else if(is_active_fig[[7.4,1]]){
    map.removeLayer(case_7_4_fig1_layer);
  }
  //case_8_1_fig1
  else if(is_active_fig[[8.1,1]]){
    map.removeLayer(case_8_1_fig1_layer1);
    map.removeLayer(case_8_1_fig1_layer2);
    map.removeLayer(case_8_1_fig1_layer3);
    map.removeControl(case_8_1_fig1_legend);
  }
  */
  //case_9_1_fig1
  else if(active_subchapter=='9-1'){
    waterfund_markers=[]
    //remove objs
    Object.keys(waterfund_objs).forEach(function(key) {
        if(key=='con_layers'){
            waterfund_objs[key].remove(map)
        }
        else{
          waterfund_objs[key].clearLayers();
        }
    });
    Object.keys(waterfund_markers).forEach(function(key) {
        map.removeLayer(waterfund_markers[key]);
    });
    $("#water_marker_control").css('display','none');
  }

}

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

function getColor(d,grades) {
    return d > grades[4] ?  '#800026' :
           d > grades[3] ?  '#BD0026' :
           d > grades[2] ?  '#E31A1C' :
           d > grades[1] ?  '#FFEDA0' :
                            '#FFFFFF' ;
}

function sum_values(data,column){
    var sum=0.0;
    for(var i=0;i<data.length;i++){
        sum+=parseFloat(data[i][column].replace('.',''));
    }
    return sum
}

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

function view_world(){
  map.setView([20.0, 0.0], 3);
  return
}
