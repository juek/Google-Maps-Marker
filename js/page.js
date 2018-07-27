/*
Google Maps Marker - plugin for Typesetter CMS 
Author: a2exfr
http://my-sitelab.com/
Date: 2018-07-27
Version 1.0.8 
*/


$(function(){
  google.maps.event.addDomListener(window, 'load', GoogleMapsSections.init);
});

var GoogleMapsSections = {

  init : function(){
    $('.filetype-GoogleMaps_section').each(function(){
      var $this = $(this);
      var mapa = $this.find('.mapCanvas');
      var map_data = $this.find('.map_data');
      GoogleMapsSections.setmap(mapa[0], map_data, $this);
    });
  },

  setmap : function(mapa, map_data, section){
    var z = parseInt(map_data.find('.zoom').val());
    var styl = map_data.find('.GMStyle').val();
    if( styl != '' ){
      var styl =  JSON.parse(styl);
    } 
    var ico = map_data.find('.CustomIcon').val();
    var dragh = map_data.find('.dragheight').val();
    var map_type_id = map_data.find('.map_type').val();
    switch(map_type_id.toString()) {
      case '0':
        var map_t_id = google.maps.MapTypeId.ROADMAP;
        break;
      case '1':
          var map_t_id = google.maps.MapTypeId.SATELLITE;
        break;
      case '2':
        var map_t_id = google.maps.MapTypeId.HYBRID;
        break;
      case '3':
        var map_t_id = google.maps.MapTypeId.TERRAIN;
        break;
    }

    var isDraggable = $(window).width() > dragh ? true : false;

    var markers = {};

    var map = new google.maps.Map(mapa, {
      center : {
        lat : 0, 
        lng: 0
      },
      zoom : z,
      mapTypeId : map_t_id,
      draggable : isDraggable,
      scrollwheel : false,
      styles : styl
    });

    if( map_data.find('.Bouncemarker').prop('checked') ){
      var ani = google.maps.Animation.BOUNCE;
    }else{
      var ani = null;
    }

    var getLatLng = function(lat, lng){
      return new google.maps.LatLng(lat, lng);
    }; 
    var getMarkerUniqueId = function(lat, lng){
      return lat + '_' + lng;
    };

    var setMarkers = function(){
      var inp = map_data.find("input[name='coords']");
      inp.each(function(){
         var coords = $(this).attr('id');
         var info =$(this).val();
         var res = coords.split("_"); 
         setMarker(res[0], res[1], info);
      });
    };

    var setMarker = function(lat, lng, info){
      var markerId = getMarkerUniqueId(lat, lng); 
      var marker = new google.maps.Marker({
        position : getLatLng(lat, lng),
        map : map,
        animation : ani,
        icon : ico,
        html : info
      });
      setInfoWindow(marker);
      markers[markerId] = marker; 
    };

    var setInfoWindow = function(marker){
      if( marker.html !== '' && marker.html !== 'You can edit the text of this info window. <br>Html markup is also possible' ){
        var infoWnd = new google.maps.InfoWindow({
          content : marker.html
        });
        google.maps.event.addListener(marker, 'click', function() {
          infoWnd.open(marker.getMap(), marker);
        });
      }
    };

    var AutoCenter = function(){
      var bounds = new google.maps.LatLngBounds();
      var count = 0;
      $.each(markers, function(index, marker){
        bounds.extend(marker.position);
        latLng1 = marker.getPosition(); 
        count++;
      });
      if( count > 1 ){
        map.fitBounds(bounds);
      }else{
        if( typeof(latLng1) !== "undefined" ){
          map.setCenter(latLng1);
        }
        map.setZoom(z);
      }
    };

    setMarkers();
    AutoCenter();

    //enable wheelscroll map-zoom on map click
    google.maps.event.addListener(map, 'click', function(event){
      this.setOptions({ 
        scrollwheel : true 
      });
    });


    // fullscreen buttons
    var map_container = $(section).find(".map-container");
    var mp = $(section).find(".mapCanvas");
    var btn_enter = $(section).find("#btn-enter-full-screen");
    var btn_exit = $(section).find("#btn-exit-full-screen");
    
    var googleMapWidth = map_container.css('width');
    var googleMapHeight = map_container.css('height');
    var googleMapWidthR = mp.css('width');
    var googleMapHeightR = mp.css('height');

    btn_enter.on('click', function(){
      map_container.css({
        position : 'fixed',
        top : '0',
        left : '0',
        width : '100%',
        height : '100%',
        backgroundColor : 'white',
        'z-index' : '9999'
      });

      mp.css({
        height : '100%',
        width : '100%'
      });
      
      google.maps.event.trigger(map, 'resize');
      AutoCenter();

      // Gui
      btn_enter.toggle();
      btn_exit.toggle();
      return false;
    });

    btn_exit.on('click', function(){
      map_container.css({
        position : 'relative',
        top : '0',
        width : googleMapWidth,
        height : googleMapHeight,
        backgroundColor : 'transparent',
        'z-index' : '0'
      });
      mp.css({
        width : googleMapWidthR,
        height : googleMapHeightR
      });

      google.maps.event.trigger(map, 'resize');
      AutoCenter();
    
      // Gui
      btn_enter.toggle();
      btn_exit.toggle();
      return false;
    });
  }

};
