/// <reference path="../Signal.d.ts" />
import {SKIP,createSignal,depsResolved} from '../Signal';
import {now} from './utils';


export function TimedSignal(s:Signal<any,any>,duration:number=250,iterations:number=1,nowFn:SignalTimeProvider=now):Signal<any,number>{
	
	let timer;
	let currentIterations = 0;
	
	function trigger(){
		signal(currentIterations);
		if(currentIterations < iterations){
			currentIterations++;
			startTimer();
		}
	}
	
	function startTimer(){
		clearTimeout(timer);
		timer = setTimeout(trigger,duration);
	}
	
	const signal = createSignal([]);
	signal.addDependency(s);
	
	s.add(function(){
		currentIterations = 0;
		startTimer();
	});
	
	signal.value = 0;
	if(depsResolved(s)){
		startTimer();
	}
	
	return signal;
}