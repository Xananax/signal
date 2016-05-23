/// <reference path="../Signal.d.ts" />

import {SKIP,createDependentSignal} from '../Signal';

export function SampledSignal(s1:Signal,s2:Signal):Signal{
	const signal = createDependentSignal(s1,function(results){
		const ret = s1();
		if(ret == null){return SKIP;}
		return ret;
	});
	return signal;
}