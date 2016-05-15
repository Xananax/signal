/// <reference path="./definitions.d.ts" />

import {processValue} from './processValue';
import {processFunctionArray} from './utils';

export function trigger(s:Signal,processors:SignalFunctor[],listeners:SignalValidListener[],skipSimilar:boolean,arg:any,previousArg:any):void{
	if(processValue(s,processors,skipSimilar,arg,previousArg)){
		processFunctionArray(listeners,false,s.value,previousArg);
	}
}