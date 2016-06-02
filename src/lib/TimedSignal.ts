/// <reference path="../Signal.d.ts" />
import {
	SKIP
,	createSignal
,	areDepsResolved
,	now
,	addDependency
} from '../';


export function TimedSignal(s:Signal<any,any>,duration:number=250,iterations:number=1,nowFn:SignalTimeProvider=now):Signal<any,number>{
	
	let timer;
	let started = false;
	let currentIterations = 0;
	
	function trigger(){
		started = false;
		signal(currentIterations);
		if(currentIterations < iterations){
			currentIterations++;
			startTimer();
		}
	}
	
	function startTimer(){
		if(started){return;}
		clearTimeout(timer);
		timer = setTimeout(
			()=>{
				started = true;
				trigger();
			}
		,	duration
		);
	}
	
	const signal = createSignal();
	
	addDependency(signal,s,function(){
		currentIterations = 0;
		startTimer();
	});
	
	signal.value = 0;
	
	if(areDepsResolved(s)){
		startTimer();
	}
	
	return signal;
}