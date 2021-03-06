"use strict";

exports.__esModule = true;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _child_process = require("child_process");

var _child_process2 = _interopRequireDefault(_child_process);

var opus;
try {
	opus = require("node-opus");
} catch (e) {
	// no opus!
}

var AudioEncoder = (function () {
	function AudioEncoder() {
		_classCallCheck(this, AudioEncoder);

		if (opus) {
			this.opus = new opus.OpusEncoder(48000, 2);
		}
		this.choice = false;
		this.sanityCheckPassed = undefined;
	}

	AudioEncoder.prototype.sanityCheck = function sanityCheck() {
		var _opus = this.opus;
		var encodeZeroes = function encodeZeroes() {
			try {
				var zeroes = new Buffer(1920);
				zeroes.fill(0);
				return _opus.encode(zeroes, 1920).readUIntBE(0, 3);
			} catch (err) {
				return false;
			}
		};
		if (this.sanityCheckPassed === undefined) this.sanityCheckPassed = encodeZeroes() === 16056318;
		return this.sanityCheckPassed;
	};

	AudioEncoder.prototype.opusBuffer = function opusBuffer(buffer) {

		return this.opus.encode(buffer, 1920);
	};

	AudioEncoder.prototype.getCommand = function getCommand(force) {

		if (this.choice && force) return choice;

		var choices = ["avconv", "ffmpeg"];

		for (var _iterator = choices, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
			var _ref;

			if (_isArray) {
				if (_i >= _iterator.length) break;
				_ref = _iterator[_i++];
			} else {
				_i = _iterator.next();
				if (_i.done) break;
				_ref = _i.value;
			}

			var choice = _ref;

			var p = _child_process2["default"].spawnSync(choice);
			if (!p.error) {
				this.choice = choice;
				return choice;
			}
		}

		return "help";
	};

	AudioEncoder.prototype.encodeStream = function encodeStream(stream, options) {
		var self = this;
		return new Promise(function (resolve, reject) {
			var enc = _child_process2["default"].spawn(self.getCommand(), ['-loglevel', '0', '-i', '-', '-f', 's16le', '-ar', '48000', '-af', 'volume=' + (options.volume || 0.25), '-ac', 2, 'pipe:1'], { stdio: ['pipe', 'pipe', 'ignore'] });

			stream.pipe(enc.stdin);

			enc.stdout.once("readable", function () {
				resolve({
					proc: enc,
					stream: enc.stdout,
					instream: stream,
					channels: 2
				});
			});

			enc.stdout.on("end", function () {
				reject("end");
			});

			enc.stdout.on("close", function () {
				reject("close");
			});
		});
	};

	AudioEncoder.prototype.encodeFile = function encodeFile(file, options) {
		var self = this;
		return new Promise(function (resolve, reject) {
			var enc = _child_process2["default"].spawn(self.getCommand(), ['-loglevel', '0', '-i', file, '-f', 's16le', '-ar', '48000', '-af', 'volume=' + (options.volume || 0.25), '-ac', 2, 'pipe:1'], { stdio: ['pipe', 'pipe', 'ignore'] });

			enc.stdout.once("readable", function () {
				resolve({
					proc: enc,
					stream: enc.stdout,
					channels: 2
				});
			});

			enc.stdout.on("end", function () {
				reject("end");
			});

			enc.stdout.on("close", function () {
				reject("close");
			});
		});
	};

	AudioEncoder.prototype.encodeArbitraryFFmpeg = function encodeArbitraryFFmpeg(ffmpegOptions) {
		var self = this;
		return new Promise(function (resolve, reject) {
			// add options discord.js needs
			var options = ffmpegOptions.concat(['-loglevel', '0', '-f', 's16le', '-ar', '48000', '-ac', 2, 'pipe:1']);
			var enc = _child_process2["default"].spawn(self.getCommand(), options, { stdio: ['pipe', 'pipe', 'ignore'] });

			enc.stdout.once("readable", function () {
				resolve({
					proc: enc,
					stream: enc.stdout,
					channels: 2
				});
			});

			enc.stdout.on("end", function () {
				reject("end");
			});

			enc.stdout.on("close", function () {
				reject("close");
			});
		});
	};

	return AudioEncoder;
})();

exports["default"] = AudioEncoder;
module.exports = exports["default"];
