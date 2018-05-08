/**
* @description this implements a map app that has a list view on the left
* side, so that the user can navigate the chosen venues either with 
* the list view or by using the map itself. The list view is an accordian
* and when expanded displays comments about the venue, based on my
* personal experience. A click in the list view or on a marker on the
* map will initiate an async API call to Foursquare to get more info
* about the venue.
*
* This is part of Udacity Frontend Web Dev Nanodegree
* @author - Brett Schwarz
*/


var map;
var infowindow = "";
var markers = [];

var locstart = {
  lat: 47.609000,
  lng: -122.340000
};

// Foursquare offers Userless and User based authentication. Userless
// just uses the client_id and client_secret, where the User based one
// uses oauth tokens.
// From the Foursquare console, it provides an oauth token. With the
// token, more information is returned, for example, phone number and URL
// The code in the populate infowindow will handle both uses.
// oauth_token: 'YI32YYGZJB4THOPW4M5PUQ2QAKB0NOM2E4QYBDGYUDFYPN32',
var fsBaseUrl = 'https://api.foursquare.com/v2/venues/search';
var foursquare = {
  client_id: 'EEVVE4BBS22Q3EHRZL33XVFZZTR51RZTZDIZXDDRVYPRPR4Y',
  client_secret: '25D03XWWJAVIJNYLJGJX3EH13HUUX3GJPM3WAVB1G30DOOVK',
  limit: '1',
  v: '20180323',
  ll: locstart.lat + ',' + locstart.lng,
  query: ''
};


/**
* @description initializes the map, and is the callback function to the maps request
*/
function initMap() {

  // create a new hybrid map, around coords for Pike Place Market in Seattle, WA
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: locstart.lat, lng: locstart.lng},
    zoom: 18,
    mapTypeId: 'roadmap',
    mapTypeControl: false
  });

  infowindow = new google.maps.InfoWindow();

  // create a marker for each location, and use 
  // red pin as the marker. Red pin image downloaded from
  // http://icon-park.com/icon/location-map-pin-red-sphere-free-vector-datasvg/
  var defaultImage = 'images/red_pin.png';
  var highlightImage = 'images/red_pin_bright.png';
  for (var i = 0; i < locations.length; i++) {

    var marker = new google.maps.Marker({
      position: locations[i].location,
      title: locations[i].title,
      animation: google.maps.Animation.DROP,
      icon: defaultImage,
      id: i
    });

    markers.push(marker);

    // Add listeners to handle user interaction with the marker
    marker.addListener('click', function() {
      animateMarker(this);
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


/**
* @description animates a marker by bouncing it for 2 seconds
* @param {object} marker - the marker on the map
*/
function animateMarker(marker) {
    marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout((function() {
      marker.setAnimation(null);
    }).bind(self), 2000);
};

/**
* @description populates the infowindow when a marker is clicked.
* @param {object} marker - the marker that was clicked on
* @param {object} infowindow - the infowindow that holds the information for the marker
*/
function populateInfoWindow(marker, infowindow) {

  // If current marker, then bail
  if (infowindow.marker == marker) {
    return;
  }

  // Clear the infowindow content
  infowindow.setContent('');
  infowindow.marker = marker;
  // null the marker when window is closed
  infowindow.addListener('closeclick', function() {
    infowindow.marker = null;
  });

  // use the marker title as the search query
  foursquare.query = marker.title;

  $.getJSON( fsBaseUrl, foursquare )
  .done(function( json ) {

    var venue = json.response.venues[0];

    // phone only shows up in response for User auth based requests
    var phone = '';
    if (venue.contact.phone) {
      phone = '<a href="tel:+1' + venue.contact.phone + '">' + venue.contact.formattedPhone + '</a>';
    }

    // url only shows up in response for User auth based requests
    var url = '';
    if (venue.url) {
      url = '<a href=' + venue.url + '">' + venue.url + '</a>';
    }

    infowindow.setContent('<h4>' + venue.name + '</h4>' +
        '<h6>(' + venue.categories.map(function(x) {return x.shortName;}).join(',') + ')</h6>' +
         '<address>' + venue.location.formattedAddress.join('<br>')  + '</address>' + 
         '<br>' + phone + '<br>' + url + 
         '<footer>Powered by <a href="https://developer.foursquare.com">Foursquare</a></footer>'
         );
  })
  .fail(function( jqxhr, textStatus, error ) {
    alert('Something went wrong with the foursquare API, please try again: ' + error);
  });

  infowindow.open(map, marker);

}
/**
* @description renders the markers onto the map
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
* @description sets the state of all the markers
* @param {boolean} flag - The state of the markers to be set (true|false)
*/
function markersSet(flag) {

  for (var i = 0; i < markers.length; i++) {
    markers[i].setVisible(flag);
  }
}

/**
* @description Location class
* @constructor
* @param {object} data - the data object to initialize the class
* @param {number} author - the index of this location in the array of locations
*/
var Location = function(data, index) {
  var self = this;

  this.title = ko.observable(data.title);
  this.location = ko.observable(data.location);
  this.type = ko.observable(data.type);
  this.description = ko.observable(data.description);
  // these are helpers for the HTML construction
  this.index = index;
  this.heading = 'heading' + index;
  this.collapse = 'collapse' + index;

};


/**
* @description view model of the listings
* @constructor
*/
function listViewModel() {
  var self = this; 

  self.locationList = ko.observableArray([]);
  self.searchNeighborhood = ko.observable("");

  for (var i = 0; i < locations.length; i++) {
    var loc = new Location(locations[i], i);
    self.locationList.push( loc );
  }


  /**
  * @description this is a wrapper for the click bind for
  * accordian to pass into the populateInfoWindow
  * @param {object} data - The title of the book
  */
  self.popup = function(data) {
    animateMarker(markers[data.index]);
    populateInfoWindow(markers[data.index], infowindow);
  };

  /**
  * @description computed observable to get the filtered markers
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

}

// different way to call bindings, from here:
// https://robinsr.github.io/blog/post/knockoutjs-best-practices
var listView = { viewModel : new listViewModel() };
ko.applyBindings(listView.viewModel);