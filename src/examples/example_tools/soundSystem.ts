/// <reference path="./soundSystem.d.ts" />

import {
	isString
,	isNumber
,	isArray
} from '../../utils';

AudioContext = AudioContext || webkitAudioContext || msAudioContext || mozAudioContext

const scale = {
	a:440
,	A:466.16
,	b:493.88
,	c:261.63
,	C:277.18
,	d:293.66
,	D:311.13
,	e:329.63
,	f:349.23
,	F:369.99
,	g:392
,	G:415.3
};

type Song = [string,number];

interface SoundSystem{
	(name:string|Song,override?:boolean):()=>void;
}

export function isSong(obj):obj is Song{
	return (
		isArray(obj) &&
		obj.length > 1 &&
		isString(obj[0]) &&
		isNumber(obj[1])
	)
}

export function getSongDuration(song:Song){
	return (song[1]*song[0].length);
}

export function soundSystem(songs?:{[key:string]:Song}):SoundSystem{
	
	let stop;
	let playing = false;
	const audio = new AudioContext();
	
	function setNotPlaying(){
		playing = false;
	}
	
	return function sound(which:string|Song,override?:boolean){

		if(playing && !override){return;}
		stop && stop();
		
		playing = true;
		
		const song = isString(which) && songs[which] || isSong(which) && which;
		 
		if(!(song)){throw new TypeError(`\`${which}\` is not a valid song`);}
		
		const duration = getSongDuration(song);
		
		setTimeout(setNotPlaying,duration);
		
		stop = play(audio,song);
		
		return stop;
		
	}
	
}

function createOscillator(audio:AudioContext,freq,time){
	
	var osc = audio.createOscillator();

	osc.frequency.value = freq;
	osc.type = "square";
	osc.connect(audio.destination);
	osc.start(0);

	setTimeout(function(){
		osc.stop(0);
		osc.disconnect(0);
	},time);
}

export function play(audio:AudioContext,song:Song,repeats:number=0){
	
	const [notes,time] = song;
	let position = 0;
	let repeated = 0;
	let interval = setInterval(playSong,time);
	
	function stop(){
		clearInterval(interval);
	}
	
	function playSong(){
		
		var note = notes.charAt(position),
		freq = scale[note];
		
		position += 1;
		
		if(position >= notes.length) {
			if(repeats && repeated < repeats){
				repeated++;
				position = 0;
			}else{
				clearInterval(interval);
			}
		}
		if(freq) {
			createOscillator(audio,freq,time);
		}
	}
	return stop;
}