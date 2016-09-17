/**
 * Morse.js
 *
 * A JavaScript Morse Code sound generator
 *
 * Copyright (c) 2015 Bogdan Cismariu
 * Licensed under the GNU GPL 
 */

function Morse() {
	/**
	 * the speed we use
	 * @type {Number}
	 */
	this.wpm = 20;
	this.speed = 1000 * 60 / (this.wpm * 50); 



	/**
	 * sound frequency
	 * @type {Number}
	 */
	this.frequency = 700;

	/**
	 * message length in milliseconds
	 * @type {Number}
	 */
	this.length = 0;

	/**
	 * used for resetting the generator
	 * @type {Array}
	 */
	this.timeouts = [];

	/**
	 * morse code
	 * courtesy of Matt Thompson https://github.com/mattt/Morse.js
	 * @type {Object}
	 */
	this.code = {
      "a": "._",    "b": "_...",  "c": "_._.",  "d": "_..",
      "e": ".",     "f": ".._.",  "g": "__.",   "h": "....",
      "i": "..",    "j": ".___",  "k": "_._",   "l": "._..",
      "m": "__",    "n": "_.",    "o": "___",   "p": ".__.",
      "q": "__._",  "r": "._.",   "s": "...",   "t": "_",
      "u": ".._",   "v": "..._",  "w": ".__",   "x": "_.._",
      "y": "_.__",  "z": "__..",  " ": " ",

      "1": ".____", "2": "..___", "3": "...__", "4": "...._", "5": ".....",
      "6": "_....", "7": "__...", "8": "___..", "9": "____.", "0": "_____",
      
      /*
       * Note: Some operators prefer "!" as "___." and others as "_._.__"
       * ARRL message format has most punctuation spelled out, as many symbols'
       * encodings conflict with procedural signals (e.g. "=" and "BT").
       */
      ".": "._._._", ",": "__..__", "?": "..__..",  "'": ".____.",
      "/": "_.._.",  "(": "_.__.",  ")": "_.__._",  "&": "._...",
      ":": "___...", ";": "_._._.", "=": "_..._",   "+": "._._.",
      "-": "_...._", "_": "..__._", "\"": "._.._.", "$": "..._.._",
      "!": "_._.__", "@": ".__._."		
	};

	// generator
	this.generatorContext  = new AudioContext();
	this.generatorOscillator = this.generatorContext.createOscillator();
	this.generatorAmp = this.generatorContext.createGain();

	this.generatorOscillator.frequency.value = this.frequency;
	this.generatorAmp.gain.value = 0;

	this.generatorOscillator.connect(this.generatorAmp);
	this.generatorAmp.connect(this.generatorContext.destination);

	this.generatorOscillator.start(0);
	this.startGenerator = function() {
		this.generatorAmp.gain.value = 0.7;
	};

	this.stopGenerator = function() {
		this.generatorAmp.gain.value = 0;
	};

	/**
	 * plays a dot
	 * @return
	 */
	this.playDot = function () {
		var that = this;
		this.timeouts.push(setTimeout(function () {
								that.startGenerator();
							}, that.length + that.speed));
		this.length += this.speed;
		this.timeouts.push(setTimeout(function () {
								that.stopGenerator();
							}, that.length + that.speed));
		this.length += this.speed;
	};

	/**
	 * it plays an element (dot, line, element separator, word separator)
	 * @param  {Char} element 
	 * @return 
	 */
	this.playElement = function (element) {
		switch (element) {
			case '.':
				this.playDot();
				break;
			case '_':
				this.playLine();
				break;
			default:
				break;
		}
	}

	/**
	 * plays a dot
	 * @return
	 */
	this.playLine = function () {
		var that = this;
		this.timeouts.push(setTimeout(function () {
								that.startGenerator();
							}, that.length + that.speed));
		this.length += this.speed;
		this.timeouts.push(setTimeout(function () {
								that.stopGenerator();
							}, that.length + 3 * that.speed));
		this.length += 3 * this.speed;
	};

	/**
	 * plays a dot
	 * @return
	 */
	this.playLetterGap = function () {
		var that = this;
		this.length += 2 * this.speed;
	};

	/**
	 * it plays a given letter
	 * @param  {Char} letter 
	 * @return 
	 */
	this.playLetter = function (letter) {
		if (letter.length != 1) {
			console.log('Expecting only a letter: ' + letter);
			return;
		}
		letter = letter.toLowerCase();
		if (typeof(this.code[letter]) == 'undefined') {
			console.log('Letter not in dictionary: ' + letter);
			return;
		}
		var elements = this.code[letter].split('');
		for (var i in elements) {
			this.playElement(elements[i]);
		}
//		console.log(elements);
	};

	/**
	 * plays a text
	 * @param  {string} text 
	 * @return {}      
	 */
	this.play = function (text) {
		this.reset();
		var letters = String(text).split('');
//		console.log(letters);
		for (var i in letters) {
			this.playLetter(letters[i]);
			this.playLetterGap();
		}
		var that = this;
		this.timeouts.push(setTimeout(function () {
								that.reset();
							}, this.length));
	};

	/**
	 * stops the generator;
	 * @return
	 */
	this.stop = function () {
		for (var i in this.timeouts) {
			clearTimeout(this.timeouts[i]);
		}
		this.timeouts = [];
		this.length = 0;
		this.stopGenerator();
	};

	/**
	 * reset the generator;
	 */
	this.reset = function () {
		this.stop();
	};
}
