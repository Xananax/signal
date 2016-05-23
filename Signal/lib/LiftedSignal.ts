/// <reference path="../Signal.d.ts" />

import {createCombinedSignal} from '../Signal';

export function LiftedSignal(signals:Signal[],fn:Function):Signal{
	const signal = createCombinedSignal(signals,function(results){
		return fn.apply(null,results);
	});
	return signal;
}