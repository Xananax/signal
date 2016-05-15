/// <reference path="../definitions.d.ts" />

import {createSignal} from '../createSignal'
import {setDependentSignalsArray} from './setDependentSignalsArray';
import {setDependentSignalsObject} from './setDependentSignalsObject';
import {setDependentSignal} from './setDependentSignal';
import {areDepsMet} from './areDepsMet';
import {isSignal} from '../utils';
import {createDependentSignal} from './createDependentSignal';

function CombinedSignalEntry(self:CombinedSignal,val?:any){
	checkEntryVal(val,self);
	const[index,arg] = val;
	self.deps[index](arg);
}

function checkEntryVal(val,signal:CombinedSignal){
	if(!val){throw new TypeError(`Cannot send an empty value to a combined signal`);}
	if(!Array.isArray(val)){throw new TypeError(`${val} is not an array`);}
	const index = val[0];
	if(!index){throw new TypeError(`no index provided`);}
	if(typeof index !== 'number'){throw new TypeError(`\`${index}\` is not a number`);}
	const {deps} = signal;
	if(!(index in deps)){throw new TypeError(`argument 0 \`${index}\` does not match any sub signal`)}
	return true;
}

function CombinedSignalObject(deps:SignalDependenciesObject,fn?:SignalFunctor):CombinedSignalObject{
	
	const depSignal = <CombinedSignalObject>(fn ? createSignal([fn]) : createSignal([]));
	
	depSignal.value = setDependentSignalsObject(depSignal,deps);
	
	depSignal.fn = CombinedSignalEntry;
	depSignal.deps = deps;
	depSignal.hasValue = areDepsMet(depSignal);
	
	return depSignal;
}

function CombinedSignalArray(deps:SignalDependenciesArray,fn?:SignalFunctor):CombinedSignalArray{
	
	const depSignal = <CombinedSignalArray>(fn ? createSignal([fn]) : createSignal([]));
	
	depSignal.value = setDependentSignalsArray(depSignal,deps);
	
	depSignal.fn = CombinedSignalEntry;
	depSignal.deps = deps;
	depSignal.hasValue = areDepsMet(depSignal);
	
	return depSignal;
}

export function combine(deps:Signal,fn?:SignalFunctor):Signal;
export function combine(deps:SignalDependenciesArray,fn?:SignalFunctor):CombinedSignalArray;
export function combine(deps:SignalDependenciesObject,fn?:SignalFunctor):CombinedSignalObject;
export function combine(deps:Signal|SignalDependencies,fn?:SignalFunctor):CombinedSignal|Signal{
	if(isSignal(<Signal>deps)){
		return createDependentSignal(<Signal>deps, fn);
	}
	if(Array.isArray(deps)){
		return CombinedSignalArray(deps,fn);
	}
	return CombinedSignalObject(deps,fn);
}