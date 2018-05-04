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

  // create a new map, around coords for Pike Place Market in Seattle, WA
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 47.609000, lng: -122.340000},
    zoom: 18,
    mapTypeControl: false
  });
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

}


/**
* @description Represents a book
* @constructor
* @param {string} title - The title of the book
* @param {string} author - The author of the book
*/
var listViewModel = function() {
  var self = this; 

  this.locationList = ko.observableArray([]);

  for (var i = 0; i < locations.length; i++) {
    self.locationList.push( new Location(locations[i], i) );
  };

  this.currentLocation = ko.observable( this.locationList()[0] );

  this.incrementCounter = function() {
    self.currentCat().clickCount(self.currentCat().clickCount() + 1);
  };

  this.setLocation = function(clicked) {
    self.currentLocation(clicked);
  };
};


ko.applyBindings(new listViewModel());