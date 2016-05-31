declare var webkitAudioContext: {new():AudioContext;}
declare var msAudioContext: {new():AudioContext;}
declare var mozAudioContext: {new():AudioContext;}

AudioContext = AudioContext || webkitAudioContext || msAudioContext || mozAudioContext

const audio = new AudioContext();

let position = 0;
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
const start = ["gfefgg-fff-gbb-gfefggggffgfe---",250];
const pickup = ['FbFbAF',100];
const death = ['fbeGa',300];
const walk1 = ['f----',100];
const walk2 = ['e----',100];

let previousWalk = 0;
let stop;
let playing = false;
function setNotPlaying(){playing = false;}

export function sound(which){

	if(playing){return;}
	playing = true;
	
	switch(which){
		case 'start':
			setTimeout(setNotPlaying,start[1]);
			stop = play(start);break;
		case 'pick':
			setTimeout(setNotPlaying,pickup[1]);
			stop = play(pickup);break;
		case 'death':
			setTimeout(setNotPlaying,death[1]);
			stop = play(death);break;
		case 'walk':
			setTimeout(setNotPlaying,walk1[1]);
			if(!previousWalk){
				previousWalk = 1;
				stop = play(walk1);
			}else{
				previousWalk = 0;
				stop = play(walk2);
			}
			break;
		default:break;
	}
} 
 
window['play'] = function(str,n=250){
	play([str,n]);
}

function createOscillator(freq,time){
	
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

export function play(s,repeats:number=0){
	const [song,time] = s;
	let position = 0;
	let repeated = 0;
	let interval = setInterval(playSong,time);
	
	function stop(){
		clearInterval(interval);
	}
	
	function playSong(){
		
		var note = song.charAt(position),
		freq = scale[note];
		
		position += 1;
		
		if(position >= song.length) {
			if(repeats && repeated < repeats){
				repeated++;
				position = 0;
			}else{
				clearInterval(interval);
			}
		}
		if(freq) {
			createOscillator(freq,time);
		}
	}
	return stop;
}