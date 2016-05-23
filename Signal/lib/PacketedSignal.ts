/// <reference path="../Signal.d.ts" />
import {SKIP,createSignal} from '../Signal';

export function PacketedSignal<T>(s:Signal<any,T>,duration?:number,bufferSize?:number):Signal<T,T[]>;
export function PacketedSignal(s:Signal<any,any>,duration:number=250,bufferSize:number=1):Signal<any,any[]>{
	
	let timer;
	let buffer = [];
	
	function trigger(){
		buffer = buffer.slice(1,bufferSize+1);
		const val = buffer;
		signal(val);
	}
	
	const signal = createSignal([s],function(s){
		buffer = buffer.concat(s);
		clearTimeout(timer);
		timer = setTimeout(trigger,duration);
		return SKIP;
	})
	signal.value = [];
	
	return signal;
}