const helper  = require('node-red-viseo-helper');
const exec = require('child_process').exec;

// --------------------------------------------------------------------------
//  NODE-RED
// --------------------------------------------------------------------------

module.exports = function(RED) {
    const register = function(config) {
        RED.nodes.createNode(this, config);
        let node = this;
		start(RED, node, config);
        this.on('input', (data)  => { input(node, data, config)  });
		this.on('close', (done)  => { stop(done) });
    }	
    RED.nodes.registerType("win-sysvolume", register, {});
}

const stop  = (done) => { done(); }
const start = (RED, node, config) => { }
const input = (node, data, config) => {
		
	let microphone = config.microphone || 'default_record';
    if (!microphone) return done('Config microphone property is null');
	
	let state = config.state || '1';
	if (!state) return done('Configuration state property is null');
	
	let done  = (err) => {
		if (err) return node.warn('SysVolume Error: '+err);
		node.send(data);
	}

    let path = __dirname+'/bin/nircmd.exe';
    let process = path + ' mutesysvolume ' + state + ' "' + microphone + '"';
	exec(process, function (error, stdout, stderr) {
		if (error || stderr) 
			done(error);
		else 
			done();
	});
   
}