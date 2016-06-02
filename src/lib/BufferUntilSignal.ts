/// <reference path="../Signal.d.ts" />

import {SKIP,createSignal,addDependency} from '../';


export function BufferedUntilSignal<T>(s:Signal<any,T>,duration?:number):Signal<T,T[]>
export function BufferedUntilSignal(s:Signal<any,any>,duration:number=250):Signal<any,any[]>{
	
	let timer;
	let buffer = [];
	
	function trigger(){
		buffer = buffer.slice(1);
		signal(buffer);
	}
	
	const signal = createSignal();
	
	addDependency(signal,s,function(s:any){
		buffer = [...buffer,s];
		clearTimeout(timer);
		timer = setTimeout(trigger,duration);
		signal(buffer);
	});
	
	signal.value = [];
	
	return signal;
}