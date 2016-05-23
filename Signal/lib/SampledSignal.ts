/// <reference path="../Signal.d.ts" />

import {SKIP,createSignal} from '../Signal';

export function SampledSignal(s1:Signal<any,any>,s2:Signal<any,any>):Signal<any,any>{
	
	const signal = createSignal([s1],function(results){
		const ret = s2();
		if(ret == null){return SKIP;}
		return ret;
	});
	
	return signal;
}