var map;
var infowindow = "";
// Create a new blank array for all the listing markers.
var markers = [];

// This global polygon variable is to ensure only ONE polygon is rendered.
var polygon = null;


/**
* @description Represents a book
* @param {string} title - The title of the book
* @param {string} author - The author of the book
*/
function initMap() {

  // create a new hybrid map, around coords for Pike Place Market in Seattle, WA
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 47.609000, lng: -122.340000},
    zoom: 18,
    mapTypeId: 'roadmap',
    mapTypeControl: false
  });

  infowindow = new google.maps.InfoWindow();

  // create a marker for each location, and use 
  // red pin as the marker. Red pin image downloaded 
  // from http://icon-park.com/icon/location-map-pin-red-sphere-free-vector-datasvg/
  var defaultImage = 'images/red_pin.png';
  var highlightImage = 'images/red_pin_bright.png'
  for (var i = 0; i < locations.length; i++) {

    var marker = new google.maps.Marker({
      position: locations[i].location,
      title: locations[i].title,
      animation: google.maps.Animation.DROP,
      icon: defaultImage,
      id: i
    });

    markers.push(marker);

    marker.addListener('click', function() {
      populateInfoWindow(this, infowindow);
    });
    marker.addListener('mouseover', function() {
      this.setIcon(highlightImage);
    });
    marker.addListener('mouseout', function() {
      this.setIcon(defaultImage);
    });

  }



  showLocations();
}

// This function populates the infowindow when the marker is clicked. We'll only allow
// one infowindow which will open at the marker that is clicked, and populate based
// on that markers position.
function populateInfoWindow(marker, infowindow) {

  // If not current marker, then bail
  if (infowindow.marker == marker) {
    return
  }

  // Clear the infowindow content
  infowindow.setContent('');
  infowindow.marker = marker;
  // Make sure the marker property is cleared if the infowindow is closed.
  infowindow.addListener('closeclick', function() {
    infowindow.marker = null;
  });
  var streetViewService = new google.maps.StreetViewService();
  var radius = 50;
  // In case the status is OK, which means the pano was found, compute the
  // position of the streetview image, then calculate the heading, then get a
  // panorama from that and set the options
  function getStreetView(data, status) {
    if (status == google.maps.StreetViewStatus.OK) {
      var nearStreetViewLocation = data.location.latLng;
      var heading = google.maps.geometry.spherical.computeHeading(
        nearStreetViewLocation, marker.position);
        infowindow.setContent('<div>' + marker.title + '</div><div id="pano"></div>');
        var panoramaOptions = {
          position: nearStreetViewLocation,
          pov: {
            heading: heading,
            pitch: 30
          }
        };
      var panorama = new google.maps.StreetViewPanorama(
        document.getElementById('pano'), panoramaOptions);
    } else {
      infowindow.setContent('<div>' + marker.title + '</div>' +
        '<div>No Street View Found</div>');
    }
  }
  // Use streetview service to get the closest streetview image within
  // 50 meters of the markers position
  streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
  // Open the infowindow on the correct marker.
  infowindow.open(map, marker);

}
/**
* @description Represents a book
* @param {string} title - The title of the book
* @param {string} author - The author of the book
*/
function showLocations() {
  var bounds = new google.maps.LatLngBounds();
  // Extend the boundaries of the map for each marker and display the marker
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
    bounds.extend(markers[i].position);
  }
  map.fitBounds(bounds);
}

/**
* @description Represents a book
* @param {string} title - The title of the book
* @param {string} author - The author of the book
*/
function markersSet(flag) {

  for (var i = 0; i < markers.length; i++) {
    markers[i].setVisible(flag);
  }
}

/**
* @description Represents a book
* @constructor
* @param {string} title - The title of the book
* @param {string} author - The author of the book
*/
var Location = function(data, index) {
  var self = this;

  this.title = ko.observable(data.title);
  this.location = ko.observable(data.location);
  this.type = ko.observable(data.type);
  this.description = ko.observable(data.description);
  this.heading = 'heading' + index;
  this.collapse = 'collapse' + index;
  // this.marker = {};

  $(document).ready(function(){
    $('#' + self.collapse).on('shown.bs.collapse', function(){
        populateInfoWindow(markers[index], infowindow);
    });
  });
}


/**
* @description Represents a book
* @constructor
* @param {string} title - The title of the book
* @param {string} author - The author of the book
*/
function listViewModel() {
  var self = this; 

  self.locationList = ko.observableArray([]);
  self.searchNeighborhood = ko.observable("");

  for (var i = 0; i < locations.length; i++) {
    var loc = new Location(locations[i], i);
    self.locationList.push( loc );
  };


  /**
  * @description Represents a book
  * @param {string} title - The title of the book
  * @param {string} author - The author of the book
  *
  * Adapted from howto on KO utils here:
  * http://www.knockmeout.net/2011/04/utility-functions-in-knockoutjs.html
  */
  self.locationListFiltered = ko.computed(function() {
    markersSet(false);
    if (!self.searchNeighborhood()) {
      markersSet(true);
      return self.locationList();
    }

    var filteredSet = [];
    var i = 0;
    ko.utils.arrayForEach(self.locationList(), function(loc) {

      if(loc.title().search(new RegExp(self.searchNeighborhood(), "i")) === 0) {
        filteredSet.push(loc);
        markers[i].setVisible(true);
      }

      i++;

    });

    return filteredSet;

  }, this);

  // this.currentLocation = ko.observable( this.locationList()[0] );

};

// different way to call bindings, from here:
// https://robinsr.github.io/blog/post/knockoutjs-best-practices
var listView = { viewModel : new listViewModel() }
ko.applyBindings(listView.viewModel);