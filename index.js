/*** CortanaHome Z-Way HA module *******************************************

 Version: 0.1.0 beta
 -----------------------------------------------------------------------------
 Author: Marcel Kermer <marcelkermer89@gmail.com>
 Description: CortanaHome - provide deviceData for CortanaHome W10 UWP Application

 ******************************************************************************/

function CortanaHome (id, controller) {
    // Call superconstructor first (AutomationModule)
    CortanaHome.super_.call(this, id, controller);


    this.blackListDeviceType = ["text", "battery", "switchRGBW", "camera", "sensorBinary", "sensorMultilevel", "meter"];
    this.blackListProbeType = ["switchColor_soft_white", "switchColor_cold_white", "switchColor_rgb"];
}

inherits(CortanaHome, AutomationModule);

_module = CortanaHome;

CortanaHome.prototype.init = function(config) {
    var self = this;

    CortanaHome.super_.prototype.init.call(this, config);

    this.defineHandlers();
    this.externalAPIAllow();
    global["CortanaHomeAPI"] = this.CortanaHomeAPI;
};

CortanaHome.prototype.stop = function() {
    var self = this;

    delete global["CortanaHomeAPI"];

    CortanaHome.super_.prototype.stop.call(this);
};

CortanaHome.prototype.buildAppliances = function() {
    var self = this,
        devices = self.controller.devices,
        locations = self.controller.locations;

    var xml_output = '<?xml version="1.0" encoding="utf-8" ?><VoiceCommands xmlns="http://schemas.microsoft.com/voicecommands/1.2"><CommandSet xml:lang="de-DE" Name="CustomCommands">';

    //probetype, devicetype, id, title, probetitle, location
    devices.forEach(function(device){

        var vdev = self.controller.devices.get(device.id);
        var locationId = vdev.get("location");
            var location = _.find(locations, function(location) {
               return location.id === locationId;
            });



        switch(vdev.get('deviceType'))
        {
            case 'switchBinary':

                    xml_output = xml_output + '<Command Name="' + vdev.get('metrics:title') +' on">';
                    xml_output = xml_output + '<Example>' + vdev.get('metrics:title') +'</Example>';
                    xml_output = xml_output + '<id>'+ vdev.get('id') +'</id>';
                    xml_output = xml_output + ' <deviceType>'+ vdev.get('deviceType') +'</deviceType>';
                    xml_output = xml_output + ' <probeType>'+ vdev.get('probeType') +'</probeType>';
                    xml_output = xml_output + '<ListenFor> Switch ' + vdev.get('metrics:title') +' on</ListenFor>';
                    xml_output = xml_output + '<ListenFor> Switch ' + vdev.get('metrics:title') +' in ' +location.title+ ' on</ListenFor>';
                    xml_output = xml_output + '<Feedback> ' + vdev.get('metrics:title') +' is on</Feedback>';
                    xml_output = xml_output + ' <Navigate/>';
                    xml_output = xml_output + '</Command>';

                    xml_output = xml_output + '<Command Name="' + vdev.get('metrics:title') +' off">';
                    xml_output = xml_output + '<Example>' + vdev.get('metrics:title') +'</Example>';
                    xml_output = xml_output + '<id>'+ vdev.get('id') +'</id>';
                    xml_output = xml_output + ' <deviceType>'+ vdev.get('deviceType') +'</deviceType>';
                    xml_output = xml_output + ' <probeType>'+ vdev.get('probeType') +'</probeType>';
                    xml_output = xml_output + '<ListenFor> Switch ' + vdev.get('metrics:title') +' off</ListenFor>';
                    xml_output = xml_output + '<ListenFor> Switch ' + vdev.get('metrics:title') +' in ' +location.title+ ' off</ListenFor>';
                    xml_output = xml_output + '<Feedback> ' + vdev.get('metrics:title') +' is off</Feedback>';
                    xml_output = xml_output + ' <Navigate/>';
                    xml_output = xml_output + '</Command>';
                break;
            case 'switchMultilevel':

                        xml_output = xml_output + ' <Command Name="' + vdev.get('metrics:title') +' on">';
                        xml_output = xml_output + '<Example>' + vdev.get('metrics:title') +'</Example>';
                        xml_output = xml_output + '<id>'+ vdev.get('id') +'</id>';
                        xml_output = xml_output + ' <deviceType>'+ vdev.get('deviceType') +'</deviceType>';
                        xml_output = xml_output + '<probeType>'+ vdev.get('probeType') +'</probeType>';

                        for(var i = 0; i<=100 ;i++)
                        {
                        if(locationId != 0) {
                            xml_output = xml_output + '<ListenFor> Set value of ' + vdev.get('metrics:title') + ' to ' + i + '</ListenFor><ListenFor> Set value of ' + vdev.get('metrics:title') + ' in ' + location.title + ' to ' + i + '</ListenFor>'
                        }
                        else
                        {
                            xml_output = xml_output + '<ListenFor> Set value of ' + vdev.get('metrics:title') + ' to ' + i + '</ListenFor>';
                        }
                        }
                        xml_output = xml_output + '<Feedback> ' + vdev.get('metrics:title') +' is set</Feedback>';
                        xml_output = xml_output + '<Navigate/>';
                        xml_output = xml_output + '</Command>';
            break;
            default:
            //nothing ToDo
            break;
        }

    });

    xml_output = xml_output + '</CommandSet></VoiceCommands>';


    return xml_output;
};

// --------------- Public HTTP API -------------------


CortanaHome.prototype.externalAPIAllow = function (name) {
    var _name = !!name ? ("CortanaHome." + name) : "CortanaHomeAPI";

    ws.allowExternalAccess(_name, this.controller.auth.ROLE.ADMIN);
    ws.allowExternalAccess(_name + ".callActions", this.controller.auth.ROLE.ADMIN);
};

CortanaHome.prototype.externalAPIRevoke = function (name) {
    var _name = !!name ? ("CortanaHome." + name) : "CortanaHomeAPI";

    ws.revokeExternalAccess(_name);
    ws.revokeExternalAccess(_name + ".callActions");
};

CortanaHome.prototype.defineHandlers = function () {
    var self = this;

    this.CortanaHomeAPI = function () {
        return {status: 400, body: "Bad CortanaHomeAPI request "};
    };

    this.CortanaHomeAPI.callActions = function (url, request) {

        return self.buildAppliances();
    };
};