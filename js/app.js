//google maps loading
var map;

function initialize() {
        var mapOptions = {
            zoom: 14,
            center: new google.maps.LatLng(12.9242, 77.5191),
            disableDefaultUI: true
        };

        map = new google.maps.Map(document.getElementById('gmap'),
            mapOptions);
        locationsModel.google(!!window.google);
    }
    // location function
function Location(title, lng, lat, venueId) {
    var self = this;
    this.title = title;
    this.lng = lng;
    this.lat = lat;
    this.venueId = venueId;

    // getConetent function retrieves 5 most recent tips from foursquare for the marker location.
    this.getContent = function() {
        var comments = [];
        var venue = 'https://api.foursquare.com/v2/venues/' + self.venueId + '/tips?sort=recent&limit=5&v=20170101&client_id=30QGJHSM3JI0YERYN0QWUWCY3DJS0WY2VX1OBVI10HKAXU13&client_secret=1L1JK0RUOIFPRVVLFXIR2PLXFXIFXO1ZIES2SKQGEWB41RKY';

        $.getJSON(venue,
            function(data) {
                $.each(data.response.tips.items, function(i, tips) {
                    comments.push('<li>' + tips.text + '</li>');
                });

            }).done(function() {

            self.content = '<p><b>' + self.title + '</b></p>' + '<h4>Top 5  Comments</h4>' + '<ol class="tips">' + comments.join('') + '</ol>';
        }).fail(function(jqXHR, textStatus, errorThrown) {
            self.content = '<p><b>Error in retrieving comments!!</b></p>';
            console.log('getJSON request failed! ' + textStatus);
        });
    }();


    this.addMapFunctionality = ko.computed(function() {
        if (locationsModel.google()) {
            self.infowindow = new google.maps.InfoWindow();

            // Assigns a marker icon.
            self.icon = 'http://www.googlemapsmarkers.com/v1/990000/';
            self.marker = new google.maps.Marker({
                position: new google.maps.LatLng(self.lng, self.lat),
                animation: google.maps.Animation.DROP,
                map: map,
                title: self.title,
                icon: self.icon
            });

            // Assigns a click event listener to the marker to open the info window.
            self.addListener = google.maps.event.addListener(self.marker, 'click', function() {
                for (var i = 0; i < locationsModel.locations.length; i++) {
                    locationsModel.locations[i].infowindow.close();
                }
                toglebnce(self.marker);
                map.panTo(self.marker.getPosition());
                self.infowindow.setContent(self.content);
                self.infowindow.open(map, self.marker);
            });
        }
    });
}

function toglebnce(marker) {
    if (marker.getAnimation()) {
        marker.setAnimation(null);
    } else {
        marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function() {
            marker.setAnimation(null);
        }, 1000);
    }
}

// Contains all the locations and search function.
var locationsModel = {};
locationsModel.google = ko.observable(!!window.google); //false
locationsModel.locations = ko.observableArray([
    new Location('1947',12.9260205, 77.5162776,'4c8ceade509e37042e5e3755'),
    new Location('Hot & Cool Corner - Chinese Fast Food',12.9289244, 77.5171494,'4d56548658856dcb0d25566d'),
    new Location('Captain Food Court', 12.9190615, 77.5183429, '52b4215211d2e0e5ef99e09b'),
    new Location('Cafe Coffee Day', 12.9190613, 77.5117768, '4c61410f924b76b0ae8afab9'),
    new Location('Davanagere Benne Dosa',12.9293827, 77.5522664, '50cc10a7e4b0de30557af993'),
    new Location('Kaapi Katte', 12.9164329, 77.5184768, '4f140fece4b0253d4f512942'),
    new Location('Mc Donald',12.9360749, 77.5179070, '4ce7e5ae948f224b02e4ec5d'),
    new Location('Royal Andhra Spice', 12.9057565, 77.5188221, '4de4d44ec65b7a3e21522847'),
    new Location('Pizza Hut', 12.9057559, 77.5035012, '4e7a0e46aeb79f7dabc48535'),
    new Location('Goli Vadapav', 12.9086036, 77.5487509,'51e2b2d9498ed2d91233f6e2')
]);
locationsModel.query = ko.observable('');


// Search function for filtering through the list of locations based on the name of the location.
locationsModel.search = ko.computed(function() {
    var self = this;
    var query = this.query().toLowerCase();

    return ko.utils.arrayFilter(self.locations(), function(location) {
        var matched = location.title.toLowerCase().indexOf(query) != -1;
        if (location.marker) {
            location.marker.setVisible(matched);
        }
        return matched;
    });
}, locationsModel);
// Opens the info window for the location marker.
locationsModel.openInfowindow = function(location) {
    google.maps.event.trigger(location.marker, "click");
};

function googleError() {
    alert("google Error");
}

ko.applyBindings(locationsModel);