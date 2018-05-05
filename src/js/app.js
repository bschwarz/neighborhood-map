var map;

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


  // create a marker for each location, and use 
  // red pin as the marker. Red pin image downloaded 
  // from http://icon-park.com/icon/location-map-pin-red-sphere-free-vector-datasvg/
  for (var i = 0; i < locations.length; i++) {

    var marker = new google.maps.Marker({
      position: locations[i].location,
      title: locations[i].title,
      animation: google.maps.Animation.DROP,
      icon: 'images/red_pin2.png',
      id: i
    });

    markers.push(marker);

  }

  showLocations();
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
  this.title = ko.observable(data.title);
  this.location = ko.observable(data.location);
  this.type = ko.observable(data.type);
  this.heading = 'heading' + index;
  this.collapse = 'collapse' + index;
  // this.marker = {};

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
    self.locationList.push( new Location(locations[i], i) );
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
    console.log('XXXX');
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