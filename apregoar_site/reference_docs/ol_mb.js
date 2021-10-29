var apiKey = 'pk.eyJ1IjoiY3dlbnRsaW5nIiwiYSI6ImNrdThzMW1rNzBkcXEzMnAzdGI3Y3ZqZTgifQ.38rqgim1dk3iU2h8PTQ97g';

olms('map', 'https://api.maptiler.com/maps/basic/style.json?key=' + apiKey).then(function(map) {
  // do anything with the passed `ol.Map` instance here.
});