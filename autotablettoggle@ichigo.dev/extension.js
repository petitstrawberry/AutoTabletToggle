//
// extension.js
// AutoTabletToggle
//
// Created by petitstrawberry on 2024/08/26
//

import GObject from 'gi://GObject';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import { Extension, gettext as _ } from 'resource:///org/gnome/shell/extensions/extension.js';
import { QuickToggle, SystemIndicator } from 'resource:///org/gnome/shell/ui/quickSettings.js';
import Gio from 'gi://Gio';

const TabletModeToggle = GObject.registerClass(
    class TabletModeToggle extends QuickToggle {
        _init() {
            super._init({
                title: _('Auto Tablet'),
                iconName: 'input-tablet-symbolic',
                toggleMode: true,
            });
            this._socketPath = "/var/run/tabletmoded.sock";
            this._updateState();

            this.connect('clicked',
                () => this._toggle());
        }

        _updateState() {
            // execute shell command
            let args = ["tabletmode", "status"]
            let command = ['laptopcli'].concat(args);

            try {
                let proc = Gio.Subprocess.new(command, Gio.SubprocessFlags.STDOUT_PIPE);

                proc.communicate_utf8_async(null, null, (proc, res) => {
                    let [, stdout, stderr] = proc.communicate_utf8_finish(res);
                    if (stdout.includes('Auto switch: true')) {
                        this.checked = true;
                    } else {
                        this.checked = false;
                    }
                });
            }
            catch (e) {
                print(e);
            }
    
        }

        _sendCmd(cmd, data) {
            let socketClient = new Gio.SocketClient();
            socketClient.family = Gio.SocketFamily.UNIX;
            let socketConnection = socketClient.connect(Gio.UnixSocketAddress.new(this._socketPath), null);
            let inputStream = new Gio.DataInputStream({ base_stream: socketConnection.input_stream });
            let outputStream = new Gio.DataOutputStream({ base_stream: socketConnection.output_stream });

            outputStream.put_byte(cmd, null);
            outputStream.put_byte(data, null);

            outputStream.flush(null);
            let response = inputStream.read_byte(null);
            return response;
        }

        _toggle() {
            // this._sendCmd(0, mode);

            // execute shell command
            if (this.checked) {
                let args = ["tabletmode", "auto"]
                let command = ['laptopcli'].concat(args);
                try {
                    let proc = Gio.Subprocess.new(command, Gio.SubprocessFlags.STDOUT_PIPE);
                    proc.communicate_utf8_async(null, null, (proc, res) => {
                        let [, stdout, stderr] = proc.communicate_utf8_finish(res);
                        print(stdout);
                    });
                }
                catch (e) {
                    print(e);
                }
            } else {
                let args = ["tabletmode", "no-auto"]
                let command = ['laptopcli'].concat(args);
                try {
                    let proc = Gio.Subprocess.new(command, Gio.SubprocessFlags.STDOUT_PIPE);
                    proc.communicate_utf8_async(null, null, (proc, res) => {
                        let [, stdout, stderr] = proc.communicate_utf8_finish(res);
                        print(stdout);
                    });
                }
                catch (e) {
                    print(e);
                }
            }


        }
    });

const TabletModeIndicator = GObject.registerClass(
    class TabletModeIndicator extends SystemIndicator {
        constructor() {
            super();

            this._indicator = this._addIndicator();
            this._indicator.iconName = 'input-tablet-symbolic';

            const toggle = new TabletModeToggle();
            toggle.bind_property('checked',
                this._indicator, 'visible',
                GObject.BindingFlags.SYNC_CREATE);
            this.quickSettingsItems.push(toggle);
        }
    });

export default class QuickSettingsTabletModeToggleExtension extends Extension {
    enable() {
        this._indicator = new TabletModeIndicator();
        Main.panel.statusArea.quickSettings.addExternalIndicator(this._indicator);
    }

    disable() {
        this._indicator.quickSettingsItems.forEach(item => item.destroy());
        this._indicator.destroy();
    }
}

