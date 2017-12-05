module.exports = {
  'logger': {'level': 'info'},
  'server': {
    'host': 'localhost',
    'port': 3000,
    'sensor-network-id': 'WH2601'
  },
  'rest': {
    'url': '/weatherstation/livedata',
    'url-weatherstation': 'http://weatherstation/livedata.htm',
  },
  'mqtt': {
    'server': {'host': 'wsx://mqtt'},
    'topics': [
      {'name': 'sensors/outdoor/weatherstation',
        'sensors': [
          'tempc', 'dewptc', 'windchillc', 'windspeedkph', 'windgustkph', 'rainmm', 'dailyrainmm', 'weeklyrainmm', 'monthlyrainmm', 'yearlyrainmm', 'indoortempc', 'baromhpa',
          'humidity', 'indoorhumidity', 'winddir', 'solarradiation', 'UV',
          'lowbatt', 'dateutc', 'softwaretype'
        ], 'options': {'retain': false}},
      {'name': 'sensors/outdoor/wind', 'sensors': [
        'windspeedkph', 'windgustkph', 'winddir', 'baromhpa'
      ], 'options': {'retain': false}},
      {'name': 'sensors/outdoor/rain', 'sensors': [
        'rainmm', 'dailyrainmm', 'weeklyrainmm', 'monthlyrainmm', 'yearlyrainmm'
      ], 'options': {'retain': false}},
      {'name': 'sensors/outdoor/temperature', 'sensors': [
        'tempc', 'dewptc', 'windchillc', 'humidity'
      ], 'options': {'retain': false}},
      {'name': 'sensors/garage/temperature', 'sensors': [
        'indoortempc', 'indoorhumidity'
      ], 'options': {'retain': false}},
      {'name': 'sensors/weatherstation/status', 'sensors': [
        'lowbatt', 'dateutc', 'softwaretype'
      ], 'options': {'retain': false}},
    ]
  },
  'categories': ['garden', 'weather', 'sensors'],
  'wunderground' : {
    'publish': false,
    'stationid': 'ID',
    'password': 'PWD'
  }
}

/*

Imperial system
---------------
'tempf', 'dewptf', 'windchillf', 'windspeedmph', 'windgustmph', 'rainin', 'dailyrainin', 'weeklyrainin', 'monthlyrainin', 'yearlyrainin', 'indoortempf', 'baromin'

Metric system
-------------
'tempc', 'dewptc', 'windchillc', 'windspeedkph', 'windgustkph', 'rainmm', 'dailyrainmm', 'weeklyrainmm', 'monthlyrainmm', 'yearlyrainmm', 'indoortempc', 'baromhpa',

Both systems
------------
'humidity', 'indoorhumidity', 'winddir', 'solarradiation', 'UV',

Station status
--------------
'lowbatt', 'dateutc', 'softwaretype'

*/
