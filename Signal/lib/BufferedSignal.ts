/// <reference path="../Signal.d.ts" />

import {SKIP,addDependency,createSignal,setSignalValueAndDispatch} from '../Signal';


export function BufferedSignal(s:Signal,duration:number=250):Signal{
	let timer;
	let buffer = [];
	const signal = createSignal();
	signal.value = [];
	addDependency(s,signal,signal);
	function trigger(){
		const val = buffer;
		buffer = [];
		setSignalValueAndDispatch(signal,val);
	}
	signal.fn = function(s){
		buffer.push(s);
		clearTimeout(timer);
		timer = setTimeout(trigger,duration);
		return SKIP;
	}
	return signal;
}