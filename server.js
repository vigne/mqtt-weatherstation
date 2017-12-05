var cheerio = require('cheerio')
var clone = require('clone')
var convert = require('convert-units')

var express = require('express')
var app = express()


var request = require('request')
var config = require('./config')

var logger = require('winston')
logger.level = config.logger.level || 'debug'
console.log(JSON.stringify({'timestamp': new Date().toISOString(), 'message': 'set logger.level', 'data': {'level': logger.level}}))

var port = config.server.port || 3000

// Gets the weatherdata from the 'Live Weather' tab of the Weather logger
// All data is assumed to be metric and is converted into imperial units
// If one has the live data also reported in imperial units, this method
// must be altered to look similar to the weatherunderground update method.
logger.info(JSON.stringify({'timestamp': new Date().toISOString(), 'message': 'starting live data REST endpoint', 'data': {'endpoint': config.rest.url}}))
app.get(config.rest.url, (req, res, next) => {
  logger.info(JSON.stringify({'timestamp': new Date().toISOString(), 'message': 'http request received', 'data': {'ip': req.connection.remoteAddress}}))

  request(config.rest['url-weatherstation'], (err, resp, body) => {
    if(err) {
      resp.send(JSON.stringify(err))
      resp.end(500)
        logger.error(JSON.stringify({'timestamp': new Date().toISOString(), 'message': 'failed connecting to MQTT server', 'data': {'server': config.rest['url-weatherstation'], 'err': err}}))
    }
    var $ = cheerio.load(body),
         conditions = {}
    $('input[type="text"]').each((index, element) => {
       conditions[element.attribs.name] = element.attribs.value
    }, null);
    res.set('Content-Type', 'application/json')
    res.send(JSON.stringify(conditions))
    res.end(200)
    logger.debug(JSON.stringify({'timestamp': new Date().toISOString(), 'message': 'successfully requested and parsed HTML weather data', 'data': {'conditions': conditions, 'weatherstation': config.rest['url-weatherstation']}}))
  })
});



logger.info(JSON.stringify({'timestamp': new Date().toISOString(), 'message': 'starting weather update service', 'data': {'endpoint': '/weatherstation/updateweatherstation.php'}}))
app.get('/weatherstation/updateweatherstation.php', (req, res, next) => {
  var values = req.query

  res.send("success\n")
  res.end(200)


  conditions = {
    // imperial units
    'tempf': ((parseFloat(values.tempf) > -1000) ? parseFloat(values.tempf) : null),
    'dewptf': ((parseFloat(values.dewptf) > -1000) ? parseFloat(values.dewptf) : null),
    'windchillf': ((parseFloat(values.windchillf) > -1000) ? parseFloat(values.windchillf) : null),
    'windspeedmph': ((parseFloat(values.windspeedmph) > -1000) ? parseFloat(values.windspeedmph) : null),
    'windgustmph': ((parseFloat(values.windgustmph) > -1000) ? parseFloat(values.windgustmph) : null),
    'rainin':  ((parseFloat(values.rainin) > -1000) ? parseFloat(values.rainin) : null),
    'dailyrainin': parseFloat(values.dailyrainin),
    'weeklyrainin': parseFloat(values.weeklyrainin),
    'monthlyrainin': parseFloat(values.monthlyrainin),
    'yearlyrainin': parseFloat(values.yearlyrainin),
    'indoortempf': ((parseFloat(values.indoortempf) > -1000) ? parseFloat(values.indoortempf) : null),
    'baromin': ((parseFloat(values.baromin) > -1000) ? parseFloat(values.baromin) : null),

    // metric units
    'tempc': ((parseFloat(values.tempf) > -1000) ? +convert(values.tempf).from('F').to('C').toFixed(2) : null),
    'dewptc': ((parseFloat(values.dewptf) > -1000) ? +convert(values.dewptf).from('F').to('C').toFixed(2) : null),
    'windchillc': ((parseFloat(values.windchillf) > -1000) ? +convert(values.windchillf).from('F').to('C').toFixed(2) : null),
    'windspeedkph': ((parseFloat(values.windspeedmph) > -1000) ? +convert(values.windspeedmph).from('m/h').to('km/h').toFixed(2) : null),
    'windgustkph':((parseFloat(values.windgustmph) > -1000) ?  +convert(values.windgustmph).from('m/h').to('km/h').toFixed(2) : null),
    'rainmm': +convert(values.rainin).from('in').to('mm').toFixed(2),
    'dailyrainmm': +convert(values.dailyrainin).from('in').to('mm').toFixed(2),
    'weeklyrainmm': +convert(values.weeklyrainin).from('in').to('mm').toFixed(2),
    'monthlyrainmm': +convert(values.monthlyrainin).from('in').to('mm').toFixed(2),
    'yearlyrainmm': +convert(values.yearlyrainin).from('in').to('mm').toFixed(2),
    'indoortempc': ((parseFloat(values.indoortempf) > -1000) ? +convert(values.indoortempf).from('F').to('C').toFixed(2) : null),
    'baromhpa': ((parseFloat(values.baromin) > -1000) ? +parseFloat(values.baromin * 33.86388666666671).toFixed(2) : null),


    'humidity': ((parseFloat(values.humidity) > -1000) ? parseFloat(values.humidity) : null),
    'indoorhumidity': ((parseFloat(values.indoorhumidity) > -1000) ? parseFloat(values.indoorhumidity) : null),
    'winddir': ((parseFloat(values.winddir) > -1000) ? parseFloat(values.winddir) : null),
    'solarradiation': ((parseFloat(values.solarradiation) > -1000) ? parseFloat(values.solarradiation) : null),
    'UV': ((parseFloat(values.UV) > -1000) ? parseFloat(values.UV) : null),

    'lowbatt': parseInt(values.lowbatt),
    'dateutc': values.dateutc,
    'softwaretype': values.softwaretype
  }

  mqttclient.publish('sensors/ids/' + config.server['sensor-network-id'] + '/updated', JSON.stringify({'timestamp': new Date().toISOString(), 'epoch': parseInt(new Date() / 1000)}), {'retain': true})
  logger.debug(JSON.stringify({'timestamp': new Date().toISOString(), 'message': 'received weather data update from weather unit', 'data': {'raw': req.query, 'conditions': conditions, 'station': req.connection.remoteAddress}}))

  for(var topic of config.mqtt.topics) {
    var payload = {}

    for(var sensor of topic.sensors)
      payload[sensor] = conditions[sensor]

    logger.debug(JSON.stringify({'timestamp': new Date().toISOString(), 'message': 'publish MQTT topic', 'data': {'topic': topic.name, 'payload': payload}}))
    mqttclient.publish(topic.name, JSON.stringify(payload), {'retain': topic.retain})
  }

  if (config.wunderground.publish)
    request({ url: 'http://rtupdate.wunderground.com/weatherstation/updateweatherstation.php',
              qs: {
                'ID': config.wunderground.stationid,
                'PASSWORD': config.wunderground.password,
                'tempf': isNaN(conditions.tempf) ? undefined : conditions.tempf,
                'humidity': isNaN(conditions.humidity) ? undefined : conditions.humidity,
                'dewptf': isNaN(conditions.dewptf) ? undefined : conditions.dewptf,
                'windchillf': isNaN(conditions.windchillf) ? undefined : conditions.windchillf,
                'winddir': isNaN(conditions.winddir) ? undefined : conditions.winddir,
                'windspeedmph': isNaN(conditions.windspeedmph) ? undefined : conditions.windspeedmph,
                'windgustmph': isNaN(conditions.windgustmph) ? undefined : conditions.windgustmph,
                'rainin': isNaN(conditions.rainin) ? undefined : conditions.rainin,
                'dailyrainin': isNaN(conditions.dailyrainin) ? undefined : conditions.dailyrainin,
                'weeklyrainin': isNaN(conditions.weeklyrainin) ? undefined : conditions.weeklyrainin,
                'monthlyrainin': isNaN(conditions.monthlyrainin) ? undefined : conditions.monthlyrainin,
                'yearlyrainin': isNaN(conditions.yearlyrainin) ? undefined : conditions.yearlyrainin,
                'solarradiation': isNaN(conditions.solarradiation) ? undefined : conditions.solarradiation,
                'UV': isNaN(conditions.UV) ? undefined : conditions.UV,
                'baromin': isNaN(conditions.baromin) ? undefined : conditions.baromin,
                'dateutc': conditions.dateutc || undefined,
                'action': 'updateraw',
                'realtime': 1,
                'rtfreq': 5
              }
            }, (err, resp, body) => {
              if (!resp || err)
                logger.error(JSON.stringify({'timestamp': new Date().toISOString(), 'message': 'failed publishing to wunderground', 'data': {'resp': resp.body || 'empty response', 'err': err || 'empty error object' }}))
              else if(!resp.body || resp.body.trim() !== "success")
                logger.error(JSON.stringify({'timestamp': new Date().toISOString(), 'message': 'failed publishing to wunderground', 'data': {'resp': resp.body || 'empty response', 'status': resp.statusCode || 'no status code provided' }}))
              else
                logger.debug(JSON.stringify({'timestamp': new Date().toISOString(), 'message': 'successsfully published to wundergound', 'data': {'resp': resp.body || 'empty response', 'status': resp.statusCode || 'no status code provided' }}))
            })
})

var mqttclient = undefined
try {
  mqttclient = require('mqtt').connect(config.mqtt.server.host, {
    'will': {
      'topic': 'sensors/ids/' + config.server['sensor-network-id'],
      'payload': JSON.stringify({
        'wrapper-online': false,
        'categories': config.categories
      }),
      'retain': true
    }
  })

  logger.info(JSON.stringify({'timestamp': new Date().toISOString(), 'message': 'connection to MQTT server established', 'data': {'server': config.mqtt.url}}))
  mqttclient.publish('sensors/ids/' + config.server['sensor-network-id'], JSON.
    stringify({
      'wrapper-online': true,
      'started-at': new Date().toISOString,
      'host': config.server.host,
      'port': config.server.port,
      'resources': [
        {'livedata': 'http://' + config.server.host + ':' + config.server.port + '/' + config.rest.url},
        {'topics': config.mqtt.topics}
      ],
      'categories': config.categories
    }),
    {'retain': true})
} catch(err) {
  logger.error(JSON.stringify({'timestamp': new Date().toISOString(), 'message': 'failed connecting to MQTT server', 'data': {'server': config.mqtt.url, 'err': err}}))
}

logger.info('server running on port %s', port)
app.listen(port, '0.0.0.0')
