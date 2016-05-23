/// <reference path="../Signal.d.ts" />
import {SKIP,createDependentSignal,setSignalValueAndDispatch} from '../Signal';

export function PacketedSignal(s:Signal,duration:number=250,bufferSize:number=1):Signal{
	let timer;
	let buffer = [];
	const signal = createDependentSignal(s);
	signal.value = [];
	const trigger = function(){
		buffer = buffer.slice(1,bufferSize+1);
		const val = buffer;
		setSignalValueAndDispatch(signal,val);
	}
	signal.fn = function(s){
		buffer = buffer.concat(s);
		clearTimeout(timer);
		timer = setTimeout(trigger,duration);
		return SKIP;
	}
	return signal;
}