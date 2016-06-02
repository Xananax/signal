/// <reference path="./Signal.d.ts" />

import {
	addToArray
,	removeFromArray
,	isUndefined
,	setArrayElement
,	getLastArrayIndex
,	setObjectProperty
} from './utils';

import {
	createSignal
,	createDependentSignal
} from './factories';

import {
	CHANGED
,	SKIP
} from './constants';

export const methods = {
	add
,	remove
,	addDependency
,	removeDependency
,	dispose
,	pause
,	skipSame
,	map
,	filter
,	endsOn
,	reduce
,	fork
,	pipe
,	log
,	toString
,	pauseOn
,	unpauseOn
,	toggleOn
}

export function add(s:AnySignal,listener:AnySignalListener|AnySignal,run:boolean=false):AnySignal{
	addToArray(s.listeners,listener);
	if(run && s.depsMet){
		listener(s.value);
	}
	return s;
}

export function remove(s:AnySignal,listener:AnySignalListener|AnySignal):AnySignal{
	removeFromArray(s.listeners,listener);
	return s;
}

export function addDependency(s:AnySignal,dep:AnySignal,trigger?:AnySignalListener|AnySignal|boolean):AnySignal{
	addToArray(s.dependencies,dep);
	addToArray(dep.dependents,s);
	const remove = removeDependency.bind(null,s,dep,trigger);
	s.onDispose.push(remove);
	if(trigger){
		if(trigger===true){
			add(dep,s);			
		}else{
			add(dep,<AnySignalListener>trigger);
		}
	}
	return s;
}

export function removeDependency(s:AnySignal,dep:AnySignal,trigger?:AnySignalListener|AnySignal|boolean):AnySignal{
	removeFromArray(s.dependencies,dep);
	removeFromArray(dep.dependents,s);
	if(trigger){
		if(trigger === true){
			remove(s,dep);
		}else{
			remove(s,<AnySignalListener>trigger);
		}
	}
	return s;
}

export function dispatch(s:AnySignal,value:any):AnySignal{
	s.listeners.length && s.listeners.forEach(function(listener){
		if(!listener){return;}
		listener(value);
	});
	return s;
}

export function dispose(s:AnySignal):void{
	
	s.listeners.length = 1;
	
	s.onDispose.forEach(function(fn){fn()});
	
	s.onDispose.length = 1;
	s.onPause.length = 1;
	s.onUnpause.length = 1;

	const value = s.value;
	s.value = undefined;
	s.isPaused = true;
	s.fn = function(){
		throw new Error(`you're trying to use a disposed stream(${value})`);
	}
}

export function invalidateDependents(s:AnySignal):AnySignal{
	s.dependents.length && s.dependents.forEach(invalidate)
	return s;
}

export function invalidate(s:AnySignal):AnySignal{
	s.depsMet = false;
	invalidateDependents(s);
	return s;
}

export function pause(s:AnySignal,doPause:boolean):AnySignal{
	s.isPaused = doPause;
	if(doPause && s.onPause.length){
		s.onPause.forEach(d=>d());
	}else if(s.onUnpause.length){
		s.onUnpause.forEach(d=>d());
	}
	return s;
}

export function skipSame(s:AnySignal,doSkip:boolean):AnySignal{
	s.skipSimilar = doSkip;
	return s;
}

export function areDepsResolved(s:AnySignal):boolean{
	if(s.dependencies && s.dependencies.length){
		return s.dependencies.every(d=>d.depsMet);
	}
	return true;
}

export function setDepsResolved(s:AnySignal):AnySignal{
	s.depsMet = areDepsResolved(s);
	return s;
}

export function shouldCancel(s:AnySignal,value:any,previousVal:any):boolean{
	return (
		isUndefined(value) ||
		value === SKIP ||
		(s.skipSimilar && value == previousVal)
	);
}

export function shouldSkip(s:AnySignal){
	return (s.isPaused || !areDepsResolved(s));
}

export function getPreviousValue(s:AnySignal,previousVal:any):any{
	if(previousVal == null){return s.value;}
	return previousVal;
}

export function process(s:AnySignal,value:any,previousVal?:any){
	
	if(shouldSkip(s)){return s;}

	previousVal = getPreviousValue(s,previousVal);
	
	value = applyFunctor(s,value,previousVal);
	if(shouldCancel(s,value,previousVal)){return s;}
	
	return applySignalValue(s,value,previousVal);
}

export function applyFunctor(s:AnySignal,value:any,previousVal?:any):any{
	if(!s.fn){return value;}
	previousVal = getPreviousValue(s,previousVal);
	value = s.fn(value,previousVal);
	return value;
}

export function applySignalValue(s:AnySignal,value:any,previousVal?:any):AnySignal{
	previousVal = getPreviousValue(s,previousVal);
	invalidateDependents(s);
	s.value = value;
	s.depsMet = true;
	dispatch(s,value);
	return s;
}

export function map(s:AnySignal,fn:AnySignalFunctor,startValue:any=null):AnySignal{
	const dep = createDependentSignal([s],fn);
	if(s.depsMet){
		dep(s.value,startValue);
	}
	return dep;
}

export function reduce(s:AnySignal,fn:AnySignalFunctor,startValue:any=null):AnySignal{
	return map(s,fn,startValue);
}

export function fork(s:AnySignal){
	const dep = createDependentSignal([s]);
	return dep;
}

export function filter(s:AnySignal,fn:AnySignalFilter):AnySignal{
	function functor(arg1,arg2){
		const ret = fn(arg1,arg2);
		if(!ret){return;}
		return arg1;
	}
	return map(s,functor);
}

export function endsOn(s:AnySignal,endSignal:AnySignal):AnySignal{
	add(endSignal,s.dispose);
	return s;
}

export function pauseOn(s:AnySignal,pauseSignal:AnySignal):AnySignal{
	add(pauseSignal,s.pause.bind(null,true));
	return s;
}

export function unpauseOn(s:AnySignal,pauseSignal:AnySignal):AnySignal{
	add(pauseSignal,s.pause.bind(null,false));
	return s;
}

export function toggleOn(s:AnySignal,pauseSignal:AnySignal,unpauseSignal:AnySignal):AnySignal{
	pauseOn(s,pauseSignal);
	unpauseOn(s,unpauseSignal);
	return s;
}

export function pipe(s:AnySignal,dep:AnySignal,fn?:AnySignalFunctor):AnySignal{
	
	const functor = (!fn)?null:(arg1)=>dep(fn(arg1));
	
	addDependency(s,dep,functor);
	
	return s;
}

export function setCombinedArrayChangedProperty(s:AnyMultiSignalArray,arr:any[],index:number){
	const lastIndex = getLastArrayIndex(arr);
	
	if(arr[lastIndex] !== index){
		arr[lastIndex] = index;
		s.changed = index;
	}
}

export function getCombinedArrayValue(arr:any[],index:number){
	const lastIndex = getLastArrayIndex(arr);
	if(lastIndex == index){return;}
	if(index < 0 || index >= arr.length){
		throw new Error(`index \`${index}\` is out of bounds`)
	}
	return arr[index];
}

export function updateCombinedArrayValue(s:AnyMultiSignalArray,combinedValue:any[],index:number,value:any):any[]{
	const previousValue = combinedValue;
	const updatedValue = setArrayElement(combinedValue,index,value);
	setCombinedArrayChangedProperty(s,updatedValue,index);
	return updatedValue;
}

export function setCombinedObjectChangedProperty(s:AnyMultiSignalObject,obj:any,name:string){
	if(obj[CHANGED] == name){return obj;}
	obj[CHANGED] = name;
	s.changed = name;
}

export function getCombinedObjectValue(obj:any,name:string){
	if(!(name in obj)){
		throw new Error(`name \`${name}\` is not a property`)
	}
	return obj[name];
}

export function updateCombinedObjectValue(s:AnyMultiSignalObject,combinedValue:any,name:string,value:any):any[]{
	const previousValue = combinedValue;
	const updatedValue = setObjectProperty(combinedValue,name,value);
	setCombinedObjectChangedProperty(s,updatedValue,name);
	return updatedValue;
}

function logSignal(name,value){
	console && console.log && console.log(name,value);
}

export function log(s:AnySignal,name:string=''):AnySignal{
	add(s,logSignal.bind(null,name));
	return s;
}

export function toString(s:AnySignal){
	if(s.dependencies.length){
		return `s(${s.value} | [${s.dependencies.join(',')}])`
	}
	return `s(${s.value})`;
}