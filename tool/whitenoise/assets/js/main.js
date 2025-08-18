var sndLevel = new Array(); //0..5
var sndStatus = new Array();
var mouseUpStatus = new Array();
var lastClicked = 0;
var dblClickTimer;
var bWEBAUDIO = 0;
var bSUSPENDED = 0;
var VOL = 3;
var nLaunched = 0;
var nTot = 0;
var globalLevel = VOL / 5;
var EQ = "eq0";
var MOTION = "mo0";
var fileExt = ".m4a";
var path = "../assets/audio/";
var levelTimer, disconnectTimer, animationTimer;
var genList = ["aa", "ab", "ac", "ad", "ae", "ba", "bb", "bc", "bd", "be", "ca", "cb", "cc", "cd", "ce", "cf", "cg", "da", "db", "dc", "dd", "ea", "fa", "fb", "ga", "gb", "ha", "ia", "ib", "ic"];
var genDescr = [
	"Brook",
	"Creek",
	"Stream",
	"Close Waterfall",
	"Distant Waterfall",
	"Calm Shore",
	"Shore",
	"Wild Shore",
	"Ocean Waves",
	"Large Waves",
	"Rain Drops",
	"Pouring Rain",
	"Distant Thunder",
	"Closer Thunder",
	"Coastal Wind",
	"Forest Wind",
	"Autumn Breeze",
	"Birds",
	"Frogs",
	"Summer Night",
	"Heat Wave",
	"Bonfire",
	"Coffee House",
	"Cocktail Voices",
	"Meditation Time",
	"Wind Chimes",
	"Fan Noise",
	"Brown Noise",
	"Pink Noise",
	"White Noise",
];

// WEBAUDIO LOADER
var context;
var sourceGain = new Array();
var animationGain = new Array();
var masterGain;
var filter1;
var filter2;
var sound = new Array();
//var  html5Audio = new Array();
var bufferList = new Array();
var bufferLoader = new Array();

function BufferLoader(context, urlList, callback, channel, level) {
	this.context = context;
	this.urlList = urlList;
	this.onload = callback;
	this.level = level;
	this.channel = channel;
	this.bufferSubList = new Array();
	this.loadCount = 0;
}

BufferLoader.prototype.loadBuffer = function (url, index) {
	// Load buffer asynchronously

	var request = new XMLHttpRequest();

	request.open("GET", url, true);
	request.responseType = "arraybuffer";

	var loader = this;

	request.onload = function () {
		// Asynchronously decode the audio file data in request.response
		loader.context.decodeAudioData(request.response, function (buffer) {
			if (!buffer) {
				alert("error decoding file data: " + url);
				return;
			}
			loader.bufferSubList[index] = buffer;
			if (++loader.loadCount == loader.urlList.length) loader.onload(loader.bufferSubList, loader.channel, loader.level);
		});
	};
	request.onerror = async function () {
		path = "../assets/audio/";
		await new Promise(resolve => setTimeout(resolve, 1000));
		loadSoundAndPlay(loader.channel, loader.level);
	};
	request.send();
};

BufferLoader.prototype.load = function (channel) {
	for (var i = 0; i < this.urlList.length; ++i) this.loadBuffer(this.urlList[i], i);
};


function resumeContext() {
	context.resume();
	bSUSPENDED = 0;
}

function webAudioContextCheck() {
	if (context.state == "suspended") {
		bSUSPENDED = 1
	}
}

function init() {
	// Checking browser compatibility

	var a = document.createElement("audio");
	if (!!(a.canPlayType && a.canPlayType('audio/ogg; codecs="vorbis"').replace(/no/, ""))) {
		fileExt = ".ogv";
	}

	if (typeof webkitAudioContext !== "undefined") bWEBAUDIO = 1;
	if (typeof AudioContext !== "undefined") bWEBAUDIO = 1;

	if (bWEBAUDIO) {
		if (typeof AudioContext !== "undefined") context = new AudioContext();
		else context = new webkitAudioContext();

		filter1 = context.createBiquadFilter();
		filter1.type = "lowshelf";
		filter1.frequency.value = 20000;
		filter1.gain.value = 0;
		filter1.connect(context.destination);
		filter2 = context.createBiquadFilter();
		filter2.type = "lowshelf";
		filter2.frequency.value = 20000;
		filter2.gain.value = 0;
		filter2.connect(filter1);
		masterGain = context.createGain();
		masterGain.gain.setValueAtTime(Math.pow(globalLevel, 2), context.currentTime);
		masterGain.connect(filter2);
		for (var i = 0; i < genList.length; i++) {
			animationGain[genList[i]] = context.createGain();
			animationGain[genList[i]].gain.setValueAtTime(1, context.currentTime);
			animationGain[genList[i]].connect(masterGain);
		}
		//禁用右键
		document.oncontextmenu = function () { return false; };
	} else
		alert(
			"Noises.Online relies on the Web Audio API which is missing here, on your browser. To enjoy Noises.Online, please use a recent version of Chrome, Edge, Safari or Firefox (basically everything but Internet Explorer)."
		);

	// OK - build UI

	generateUI();
	buildPresetUI();
	$(".pTn").powerTip({ placement: "n" });
	setTimeout(function () {
		$("#postit").css("opacity", 1);
	}, 1000);
}

function generateUI() {
	var strTmp, strIconSet, curr;
	strIconSet = "";

	for (var i = 0; i < genList.length; i++) {
		curr = genList[i];
		var touchEvents = " ontouchstart='iconTouchStart(this.id)' ontouchend='iconTouchEnd(this.id)' ";
		var mouseEvents = " onmousedown='iconMouseDown(this.id)' onmouseup='iconMouseUp(this.id)' ";

		strTmp =
			"<img id='" +
			curr +
			"' src='../assets/img/" +
			curr +
			"n.png' class='iconImg pTn " +
			curr +
			"' " + mouseEvents + touchEvents +
			" onmouseover='msg(\"[Click] to load\")' alt='" +
			genDescr[i] +
			"' title='" +
			genDescr[i] +
			"'>";
		strIconSet += strTmp;
	}

	$("#iconSet").html(strIconSet);
}

function isTouchDevice() {
	return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

function iconSetColor() {
	var name;
	var color = "#65adbd";
	for (var i = 0; i < genList.length; i++) {
		name = genList[i];
		if (!name.substr(0, 1).localeCompare("a")) color = "#4590a1";
		if (!name.substr(0, 1).localeCompare("b")) color = "#069";
		if (!name.substr(0, 1).localeCompare("c")) color = "#69B";
		if (!name.substr(0, 2).localeCompare("cc")) color = "#999";
		if (!name.substr(0, 2).localeCompare("cd")) color = "#999";
		if (!name.substr(0, 2).localeCompare("ce")) color = "#963";
		if (!name.substr(0, 2).localeCompare("cf")) color = "#963";
		if (!name.substr(0, 2).localeCompare("cg")) color = "#963";
		if (!name.substr(0, 1).localeCompare("d")) color = "#396";
		if (!name.substr(0, 1).localeCompare("e")) color = "#c00";
		if (!name.substr(0, 1).localeCompare("f")) color = "#639";
		if (!name.substr(0, 1).localeCompare("g")) color = "#693";
		if (!name.substr(0, 1).localeCompare("h")) color = "#399";
		if (!name.substr(0, 2).localeCompare("ic")) color = "#aaa";
		if (!name.substr(0, 2).localeCompare("ia")) color = "#630";
		if (!name.substr(0, 2).localeCompare("ib")) color = "#936";
		$("." + name).css("background", color);
		$("." + name).css("border-color", color);
	}
	$(".iconImg").css("opacity", 0.3);
}

function iconMouseDown(name) {
	decreaseLevel(name);
	levelTimer = setTimeout(function () {
		iconMute(name);
	}, 1000);
}

function iconMouseUp(name) {
	clearTimeout(levelTimer);
}

function iconTouchStart(name) {
	decreaseLevel(name);
	levelTimer = setTimeout(function () {
		iconMute(name);
	}, 1000);
}

function iconTouchEnd(name) {
	clearTimeout(levelTimer);
}

function decreaseLevel(name) {
	if (typeof sndLevel[name] === "undefined" || sndStatus[name] == 0) sndLevel[name] = 5;
	else if (--sndLevel[name] == -1) sndLevel[name] = 5;
	updateSoundLevel(name);
}

function volUp() {
	if (++VOL == 6) VOL = 5;
	globalLevel = VOL / 5;
	masterGain.gain.cancelScheduledValues(context.currentTime);
	masterGain.gain.setValueAtTime(masterGain.gain.value, context.currentTime);
	masterGain.gain.linearRampToValueAtTime(Math.pow(globalLevel, 2), context.currentTime + 0.2);
	$("#levelBars").attr("src", "../assets/img/level" + VOL + ".png");
}

function volDown() {
	if (--VOL == -1) VOL = 0;
	globalLevel = VOL / 5;
	masterGain.gain.cancelScheduledValues(context.currentTime);
	masterGain.gain.setValueAtTime(masterGain.gain.value, context.currentTime);
	masterGain.gain.linearRampToValueAtTime(Math.pow(globalLevel, 2), context.currentTime + 0.2);
	$("#levelBars").attr("src", "../assets/img/level" + VOL + ".png");
}

function iconMute(name) {
	sndLevel[name] = 0;
	updateSoundLevel(name);
}

function disconnect(name) {
	sound[name].stop();
	sound[name].disconnect();
	sndStatus[name] = -1;
}

function updateSoundLevel(name) {
	clearTimeout(disconnectTimer);

	if (typeof sndStatus[name] == "undefined") {
		$("#" + name).attr("src", "../assets/img/loading.gif");
		msg("Now Loading...");
		sndStatus[name] = 0;
		loadSoundAndPlay(name, sndLevel[name]);
	} else {
		if (sndStatus[name] !== 0) {
			var duration = 0.3;
			if (sndLevel[name] == 0) {
				document.getElementById(name).src = "../assets/img/" + name + "n.png";
				document.getElementById(name).onload = function () {
					document.getElementById(name).style.opacity = 0.3;
				};
				disconnectTimer = setTimeout(function () {
					disconnect(name);
				}, duration * 1100);
			}
			if (sndLevel[name] == 5) {
				document.getElementById(name).src = "../assets/img/" + name + ".png";
				document.getElementById(name).onload = function () {
					document.getElementById(name).style.opacity = 1;
				};
				duration = 1;
				if (sndStatus[name] == -1) {
					// needs to be restarted
					sound[name] = context.createBufferSource();
					sound[name].buffer = bufferList[name][0];
					sound[name].connect(sourceGain[name]);
					sound[name].loop = 1;
					sound[name].start(0, 0);
				}
			}
			sourceGain[name].gain.cancelScheduledValues(context.currentTime);
			sourceGain[name].gain.setValueAtTime(sourceGain[name].gain.value, context.currentTime);
			sourceGain[name].gain.linearRampToValueAtTime(Math.pow(sndLevel[name], 2) / 25, context.currentTime + duration);
			document.getElementById(name).style.opacity = 0.5 + 0.1 * sndLevel[name];
		}
	}
}

function loadSoundAndPlay(name, level) {
	bufferLoader[name] = new BufferLoader(context, [path + name + fileExt], finishedLoading, name, level);
	bufferLoader[name].load(name);
}

function finishedLoading(bf, name, level) {
	// bf given by  loader.onload(loader.bufferSubList,loader.level);

	// Suspended Policy by Mobile Browsers and Chrome!
	webAudioContextCheck();

	bufferList[name] = bf;
	sourceGain[name] = context.createGain();
	sourceGain[name].connect(animationGain[name]);
	sourceGain[name].gain.value = 0;

	sound[name] = context.createBufferSource();
	sound[name].buffer = bufferList[name][0];
	sound[name].connect(sourceGain[name]);
	sound[name].loop = 1;
	var randomStartTime = Math.floor(sound[name].buffer.length / sound[name].buffer.sampleRate) * Math.random();
	sound[name].start(0, randomStartTime);

	sndStatus[name] = 1;

	document.getElementById(name).src = "../assets/img/" + name + ".png";
	if (!bSUSPENDED)
		document.getElementById(name).onload = function () {
			msg("Now playing...");
		};
	document.getElementById(name).onload = function () {
		$("#" + name).mouseover(function () {
			msg("[Click] to change level &bull; Hold [Click] to Mute");
		});
	};
	fadeIn(name, level, 1);

	count();
}

function count() {
	nLaunched++;
	if (nLaunched == nTot) {
	}
}

function fadeIn(name, level, duration) {
	sourceGain[name].gain.setValueAtTime(0, context.currentTime); // linearRampToValueAtTime needs a time ref
	sourceGain[name].gain.linearRampToValueAtTime(Math.pow(level, 2) / 25, context.currentTime + duration);
	document.getElementById(name).style.opacity = 0.5 + 0.1 * sndLevel[name];
}

function eq(preset) {
	EQ = preset;
	switch (preset) {
		case "eq0":
			filter1.type = "lowshelf";
			filter1.frequency.value = 20000;
			filter1.gain.value = 0;
			filter2.type = "lowshelf";
			filter2.frequency.value = 20000;
			filter2.gain.value = 0;
			break;
		case "eq1":
			filter1.type = "lowpass";
			filter1.frequency.value = 1000;
			filter1.Q.value = 0.1;
			filter2.type = "lowshelf";
			filter2.frequency.value = 20000;
			filter2.gain.value = 0;
			break;
		case "eq2":
			filter1.type = "highshelf";
			filter1.frequency.value = 5000;
			filter1.gain.value = -6;
			filter2.type = "lowshelf";
			filter2.frequency.value = 20000;
			filter2.gain.value = 0;
			break;
		case "eq3":
			filter1.type = "highpass";
			filter1.frequency.value = 1000;
			filter1.Q.value = 0.1;
			filter2.type = "lowshelf";
			filter2.frequency.value = 20000;
			filter2.gain.value = 0;
			break;
		case "eq4":
			filter1.type = "lowshelf";
			filter1.frequency.value = 12000;
			filter1.gain.value = -3;
			filter2.type = "peaking";
			filter2.frequency.value = 16000;
			filter2.gain.value = 6;
			filter2.Q.value = 1;
			break;
		case "eq5":
			filter2.type = "highshelf";
			filter2.frequency.value = 120;
			filter2.gain.value = -3;
			filter1.type = "peaking";
			filter1.frequency.value = 60;
			filter1.gain.value = 6;
			filter1.Q.value = 1;
			break;
		case "eq6":
			filter1.type = "highpass";
			filter1.frequency.value = 300;
			filter1.Q.value = 0.1;
			filter2.type = "lowpass";
			filter2.frequency.value = 3400;
			filter2.Q.value = 0.1;
			break;
		case "eq7":
			filter2.type = "peaking";
			filter2.frequency.value = 1500;
			filter2.gain.value = -6;
			filter2.Q.value = 0.1;
			filter1.type = "lowshelf";
			filter1.frequency.value = 20000;
			filter1.gain.value = 0;
			break;
	}
	for (var i = 0; i <= 7; i++) {
		if (preset.localeCompare("eq" + i) !== 0) {
			$("#eq" + i).css("opacity", 0.2);
			$("#eq" + i).hover(
				function () {
					$(this).css("opacity", 1);
				},
				function () {
					$(this).css("opacity", 0.2);
				}
			);
		}
	}
	$("#" + preset).css("opacity", 1);
	$("#" + preset).hover(
		function () {
			$(this).css("opacity", 1);
		},
		function () {
			$(this).css("opacity", 1);
		}
	);
}

function motion(preset) {
	MOTION = preset;
	var st, sp;
	switch (preset) {
		case "mo0":
			st = 0;
			sp = 1;
			break;
		case "mo1":
			st = 0.2;
			sp = 3;
			break;
		case "mo2":
			st = 0.5;
			sp = 10;
			break;
		case "mo3":
			st = 0.6;
			sp = 20;
			break;
		case "mo4":
			st = 0.7;
			sp = 30;
			break;
		case "mo5":
			st = 0.9;
			sp = 60;
			break;
		case "mo6":
			st = 1;
			sp = 120;
			break;
	}
	for (var i = 0; i < genList.length; i++) {
		name = genList[i];
		if (sndLevel[name] > 0) {
			animationGain[name].gain.cancelScheduledValues(context.currentTime);
			animationGain[name].gain.setValueAtTime(animationGain[name].gain.value, context.currentTime);
			animationGain[name].gain.linearRampToValueAtTime(1, context.currentTime + 0.5);
		}
	}
	for (var i = 0; i <= 6; i++) {
		if (preset.localeCompare("mo" + i) !== 0) {
			$("#mo" + i).css("opacity", 0.2);
			$("#mo" + i).hover(
				function () {
					$(this).css("opacity", 1);
				},
				function () {
					$(this).css("opacity", 0.2);
				}
			);
		}
	}
	$("#" + preset).css("opacity", 1);
	$("#" + preset).hover(
		function () {
			$(this).css("opacity", 1);
		},
		function () {
			$(this).css("opacity", 1);
		}
	);
	clearTimeout(animationTimer);
	animationTimer = setTimeout(function () {
		animate(st, sp);
	}, 600);
}

function animate(strength, speed) {
	if (strength == 0) return;
	for (var i = 0; i < genList.length; i++) {
		name = genList[i];
		if (sndLevel[name] > 0) {
			var tmpLevel = 1 - strength * Math.random();
			animationGain[name].gain.cancelScheduledValues(context.currentTime);
			animationGain[name].gain.setValueAtTime(animationGain[name].gain.value, context.currentTime);
			animationGain[name].gain.linearRampToValueAtTime(Math.pow(tmpLevel, 2), context.currentTime + speed);
		}
	}
	animationTimer = setTimeout(function () {
		animate(strength, speed);
	}, speed * 1000);
}

function genToStr() {
	var out = "";
	var name;
	for (var i = 0; i < genList.length; i++) {
		name = genList[i];
		if (sndLevel[name] > 0) out += name + sndLevel[name];
	}
	return out;
}

function msg(msg) {
	$("#msg").html(msg);
}

function buildPresetUI() {
	var found = 0;
	var ui = "<table class='presets'>";

	for (var k = 0; k < localStorage.length; k++) {
		if (localStorage.key(k).indexOf("prset_") !== -1) {
			found = 1;
			var settings = JSON.parse(localStorage.getItem(localStorage.key(k)));
			var genstr = settings.GENSTR;
			var name = settings.NAME;
			var icons = "";
			var curr, lvl, opac;
			for (var i = 0; i <= genstr.length / 3 - 1; i++) {
				curr = genstr.substring(i * 3, i * 3 + 2);
				lvl = genstr.substring(i * 3 + 2, i * 3 + 3);
				opac = 0.1 + 0.13 * lvl;
				icons += "<img src='../assets/img/" + curr + ".png' class='miniImg " + curr + " ' style='opacity: " + opac + ";'>";
			}
			ui +=
				"<tr><td>" +
				icons +
				"</td><td>" +
				name +
				"</td><td><img src='../assets/img/play.png' class='ctrlImg pTn' onclick='loadPreset(\"" +
				localStorage.key(k) +
				"\");' alt='Play' title='Play'><img src='../assets/img/delete.png' class='ctrlImg pTn' onclick='removePreset(\"" +
				localStorage.key(k) +
				"\");' alt='Delete' title='Delete'></td></tr>";
		}
	}

	ui += "</table>";

	if (found == 1) $("#presetUI").html(ui);
	else $("#presetUI").html("");

	iconSetColor();
}

function loadPreset(name) {
	var settings = JSON.parse(localStorage.getItem(name));
	if (settings) {
		var genstr = settings.GENSTR;
		var level = settings.VOL;
		var m = settings.MOTION;
		var e = settings.EQ;
		loadSet(genstr);
		eq(e);
		motion(m);
	}
}

function loadSet(genstr) {
	// mute all
	for (var i = 0; i < genList.length; i++) {
		name = genList[i];
		if (sndLevel[name] > 0) iconMute(name);
	}
	// enable
	var curr, lvl;
	for (var i = 0; i <= genstr.length / 3 - 1; i++) {
		curr = genstr.substring(i * 3, i * 3 + 2);
		lvl = genstr.substring(i * 3 + 2, i * 3 + 3);
		sndLevel[curr] = lvl;
		updateSoundLevel(curr);
		nTot++;
	}
}

// html5 Local Storage

function removePreset(k) {
	if (confirm("Deleting this entry from your preset list. Are you sure?")) {
		localStorage.removeItem(k);
		buildPresetUI();
	}
}

function addPreset(name) {
	if (name == "") alert("Give your settings a name first.");
	else savePreset(HtmlEncode(name));
}

function savePreset(name) {
	var storageName;
	var d = new Date();
	storageName = "prset_" + d.getTime();
	localStorage.setItem(
		storageName,
		JSON.stringify({
			NAME: name,
			GENSTR: genToStr(),
			VOL: VOL,
			EQ: EQ,
			MOTION: MOTION,
		})
	);
	buildPresetUI();
}

function HtmlEncode(s) {
	var el = document.createElement("div");
	el.innerText = el.textContent = s;
	s = el.innerHTML;
	return s;
}
