# MQTT wrapper for IP capable weather stations

This is a NodeJS application collecting data from IP capable weather stations (e.g. Froggit WH2600 or AmbientWeather WS1400), supporting data propagation to [wunderground.com](https://www.wunderground.com/), and propagate it via MQTT.

## Basic idea
Some firmware versions (probably mostly the EU versions) allow to set a custom server IP for data propagation. Further can the endpoint type be selected (e.g. PHP, ASP, ...).

This functionalities are utilized to set up a service supporting the same [interface as provided by wunderground](http://rtupdate.wunderground.com/weatherstation/updateweatherstation.php) to collect data inside your LAN.

First setup the firmware in the **weather network** tab:

* Remote server: Customized
* Hostname/Server IP: your IP or hostname (e.g. 192.168.1.142)
* Port: the port (e.g. 3000)
* Server Type: PHP (didn't really test the others)

You can leave station ID and password empty for now as they will be set in the config file later.

If everything is set correctly, you should start receiving GET requests at the endpoint **/weatherstation/updateweatherstation.php** with all the data of your weather station as query parameters.

## MQTT setup

For MQTT to you have to provide the name of your MQTT server, and define topics and their data composition in the **config.js** file. See examples for further details about how to do this.

## REST interface and HTTP polling

Beside using the reporting method supported by the Weather Logger firmware explained above, one can also poll the data provided by the live data tab of the weather station unit. You request the current data at **http://[IP/host name]/weatherstation/livedata**. The response will be JSON formatted and include all data provided from the units live data tab without any conversion.
