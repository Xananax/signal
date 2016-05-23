/// <reference path="../Signal.d.ts" />

import {SKIP,createSignal} from '../Signal';


export function BufferedSignal<T>(s:Signal<any,T>,duration?:number):Signal<T,T[]>
export function BufferedSignal(s:Signal<any,any>,duration:number=250):Signal<any,any[]>{
	let timer;
	let buffer = [];
	function trigger(){
		const val = buffer;
		buffer = [];
		signal(val);
	}
	const signal = createSignal([]);
	signal.addDependency(s);
	s.add(function(s:any){
		buffer.push(s);
		clearTimeout(timer);
		timer = setTimeout(trigger,duration);
	});
	
	signal.value = [];
	
	return signal;
}