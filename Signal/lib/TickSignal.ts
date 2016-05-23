/// <reference path="../Signal.d.ts" />
import {SKIP,createDependentSignal,setSignalValueAndDispatch} from '../Signal';

function now():number{
	return (performance && performance.now()) || (Date.now());
}

export function TickSignal(s:Signal,duration:number=250):Signal{
	let timer;
	let start:number = 0;
	let delta:number = 0;
	const signal = createDependentSignal(s);
	signal.value = 0;
	signal.depsMet = false;
	const trigger = function(){
		const current = now();
		delta = current - start;
		start = current;
		signal.depsMet = true;
		setSignalValueAndDispatch(signal,delta);
	}
	signal.fn = function(s){
		start = now();
		clearTimeout(timer);
		timer = setTimeout(trigger,duration);
		return SKIP;
	}
	return signal;
}