"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var cpoc = require("child_process");

var opus;
try {
	opus = require("node-opus");
} catch (e) {
	// no opus!
}
var VoicePacket = require("./VoicePacket.js");

var AudioEncoder = (function () {
	function AudioEncoder() {
		_classCallCheck(this, AudioEncoder);

		if (opus) {
			this.opus = new opus.OpusEncoder(48000, 1);
		}
	}

	AudioEncoder.prototype.opusBuffer = function opusBuffer(buffer) {

		return this.opus.encode(buffer, 1920);
	};

	AudioEncoder.prototype.encodeStream = function encodeStream(stream) {
		var callback = arguments.length <= 1 || arguments[1] === undefined ? function (err, buffer) {} : arguments[1];

		var self = this;
		return new Promise(function (resolve, reject) {
			var enc = cpoc.spawn("ffmpeg", ["-f", "s16le", "-ar", "48000", "-ac", "1", // this can be 2 but there's no point, discord makes it mono on playback, wasted bandwidth.
			"-af", "volume=1", "pipe:1", "-i", "-"]);

			stream.pipe(enc.stdin);

			enc.stdout.once("readable", function () {
				callback(null, {
					proc: enc,
					stream: enc.stdout,
					instream: stream
				});
				resolve({
					proc: enc,
					stream: enc.stdout,
					instream: stream
				});
			});

			enc.stdout.on("end", function () {
				callback("end");
				reject("end");
			});

			enc.stdout.on("close", function () {
				callback("close");
				reject("close");
			});
		});
	};

	AudioEncoder.prototype.encodeFile = function encodeFile(file) {
		var callback = arguments.length <= 1 || arguments[1] === undefined ? function (err, buffer) {} : arguments[1];

		var self = this;
		return new Promise(function (resolve, reject) {
			var enc = cpoc.spawn("ffmpeg", ["-f", "s16le", "-ar", "48000", "-ac", "1", // this can be 2 but there's no point, discord makes it mono on playback, wasted bandwidth.
			"-af", "volume=1", "pipe:1", "-i", file]);

			enc.stdout.once("readable", function () {
				callback(null, {
					proc: enc,
					stream: enc.stdout
				});
				resolve({
					proc: enc,
					stream: enc.stdout
				});
			});

			enc.stdout.on("end", function () {
				callback("end");
				reject("end");
			});

			enc.stdout.on("close", function () {
				callback("close");
				reject("close");
			});
		});
	};

	return AudioEncoder;
})();

module.exports = AudioEncoder;