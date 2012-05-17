const Lang = imports.lang;
const Applet = imports.ui.applet;
const GLib = imports.gi.GLib;
const Util = imports.misc.util;
const Gettext = imports.gettext.domain('cinnamon-applets');
const _ = Gettext.gettext;
const Mainloop = imports.mainloop;

function MyApplet(orientation) {
    this._init(orientation);
}

MyApplet.prototype = {
    __proto__: Applet.TextApplet.prototype,

    _init: function(orientation) {
        Applet.TextApplet.prototype._init.call(this, orientation);

        try {
            this.set_applet_label("Tito");
            this.set_applet_tooltip(_("Current discharging rate of the battery"));
            this._updateMenu();
        }
        catch (e) {
            global.logError(e);
        }
     },

    on_applet_clicked: function(event) {
        //GLib.spawn_command_line_async('xkill');
    },

    _updateMenu: function() {
	this.set_applet_label(this.getDischarge());
        Mainloop.timeout_add_seconds(1, Lang.bind(this, this._updateMenu));
    },

    getDischarge: function() {
        content = GLib.file_get_contents("/proc/acpi/battery/BAT0/state").toString();
        Rstate = new RegExp("charging state:[^a-zA-Z]+([a-zA-Z]+)", "gi");
        state = Rstate.exec(content)[1].toString();
        if(state=="charging") {
            text = _("Charging");
        } else if(state=="charged") {
            text = _("Charged");
        } else {
            Ramps = new RegExp("present rate:[^a-zA-Z0-9_]+([0-9]+)", "gi");
            Rvolts = new RegExp("present voltage:[^a-zA-Z0-9_]+([0-9]+)", "gi");
        	amps = parseFloat(Ramps.exec(content)[1].toString());
            volts = parseFloat(Rvolts.exec(content)[1].toString());
        	text = (amps*volts/1000000).toFixed(1).toString() + " W";
    	}
        return text;
    }
};

function main(metadata, orientation) {
    let myApplet = new MyApplet(orientation);
    return myApplet;
}
