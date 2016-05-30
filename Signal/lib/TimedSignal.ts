/// <reference path="../Signal.d.ts" />
import {SKIP,createSignal} from '../Signal';
import {now} from './utils';


export function TimedSignal(s:Signal<any,any>,duration:number=250,nowFn:SignalTimeProvider=now):Signal<any,number>{
	
	let timer;
	let start:number = 0;
	let delta:number = 0;
	
	function trigger(){
		const current = nowFn();
		delta = current - start;
		start = current;
		signal(delta);
	}
	
	const signal = createSignal([]);
	signal.addDependency(s);
	s.add(function(s){
		start = now();
		clearTimeout(timer);
		timer = setTimeout(trigger,duration);
	})
	signal.value = 0;
	
	return signal;
}