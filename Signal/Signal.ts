/// <reference path="./definitions.d.ts" />

import {
	createSignal
} from './createSignal';
import {
	combine
} from './dependentSignal/combine';
import {
	isSignal
} from './utils';

function assumedSignalDependency(val?:any):boolean{
	if(!val){return false;}
	if(isSignal(val)){
		return true;
	}
	if(Array.isArray(val) && val.length && isSignal(val[0])){
		return true;
	}
	if(typeof val == 'object' && 'constructor' in val && (val.constructor == undefined || val.constructor == Object)){
		for(let n in val){
			if(Object.hasOwnProperty.call(val,n)){
				if(isSignal(val[n])){
					return true;
				}
				break;
			}
		}
		return false;
	}
}

export function Signal(val?:SignalDependenciesArray):CombinedSignalArray;
export function Signal(val?:SignalDependenciesObject):CombinedSignalObject;
export function Signal(val?:any):Signal;
export function Signal(val?:any):Signal{
	const {length} = arguments;
	if(length && assumedSignalDependency(val)){
		return combine(val);
	}
	const s = createSignal();
	if(length){s(val);}
	return s;
}