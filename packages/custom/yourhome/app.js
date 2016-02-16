'use strict';

/*
 * Defining the Package
 */
var Module = require('meanio').Module;

var Yourhome = new Module('yourhome');

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
Yourhome.register(function(app, auth, database) {

  //We enable routing. By default the Package Object is passed to the routes
  Yourhome.routes(app, auth, database);
  Yourhome.aggregateAsset('css', 'yourhome.css');
  Yourhome.aggregateAsset('css', 'rss.css');
  Yourhome.aggregateAsset('css', 'email.css');
  Yourhome.aggregateAsset('css', 'calendar.css');
  Yourhome.aggregateAsset('css', 'weather.css');
  //Yourhome.aggregateAsset('css', 'yelp.css');
  Yourhome.aggregateAsset('js', 'location.js', {weight: 1});
  
  Yourhome.angularDependencies(['ui.grid', 'ngAnimate', 'ui.bootstrap']);

  /**
    //Uncomment to use. Requires meanio@0.3.7 or above
    // Save settings with callback
    // Use this for saving data from administration pages
    Yourhome.settings({
        'someSetting': 'some value'
    }, function(err, settings) {
        //you now have the settings object
    });

    // Another save settings example this time with no callback
    // This writes over the last settings.
    Yourhome.settings({
        'anotherSettings': 'some value'
    });

    // Get settings. Retrieves latest saved settigns
    Yourhome.settings(function(err, settings) {
        //you now have the settings object
    });
    */

  return Yourhome;
});
