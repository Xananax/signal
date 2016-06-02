/// <reference path="../Signal.d.ts" />

import {
	SKIP
,	createSignal
,	invalidateDependents
,	areDepsResolved
,	applySignalValue
,	now
} from '../';

export function TickSignal(every:number=100,nowFn:SignalTimeProvider=now):TickSignal{
	
	const s = <TickSignal>createSignal();
	s.value = 0;
	s.depsMet = true;
	s.delay = delay;

	let started = false;
	let timer = null;
	let counter = 0;
	
	function delay():number;
	function delay(time:number):TickSignal;
	function delay(time?:number):number|TickSignal{
		if(arguments.length){
			if(!time){throw new Error(`${time} is not a valid time`);}
			every = time;
			return s;
		}
		return every;
	}
	
	function trigger(){
		s(counter++);
		start();
	}
	function start(){
		if(started){return;}
		started = true;
		timer = setTimeout(
			()=>{
				started = false;
				trigger();
			}
		,	every
		);
	}
	function stop(){
		clearTimeout(timer);
	}
	s.onPause.push(stop);
	s.onUnpause.push(start);
	s.onDispose.push(stop);
	
	start();
	
	return s;
}