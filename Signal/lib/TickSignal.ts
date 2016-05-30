/// <reference path="../Signal.d.ts" />
import {
	SKIP
,	createSignal
,	invalidateDependents
,	depsResolved
,	applySignalValue
} from '../Signal';
import {now} from './utils';

export function TickSignal(every:number=100,nowFn:SignalTimeProvider=now):Signal<number,number>{
	
	const s = createSignal([]);
	s.value = 0;
	s.depsMet = true;
	s.delegate = delegate;
	let timer = null;
	let counter = 0;
	
	function delegate(time:number){
		every = time;
		return SKIP;
	}
	
	function trigger(){
		invalidateDependents(s);
		if(s.isPaused || !depsResolved(s)){return tick(every);}
		applySignalValue(s,counter++,s.value,s.skipSame);
		tick(every);
	}
	function tick(every){
		timer = setTimeout(trigger,every);
	}
	s.onDispose.push(
		()=>clearTimeout(timer)
	);
	tick(every);
	return s;
}