/// <reference path="./Signal.d.ts" />

import {
	addDependency
,	removeDependency
,	methods
,	process
,	applyFunctor
,	applySignalValue
,	updateCombinedArrayValue
,	getCombinedArrayValue
,	getCombinedObjectValue
,	updateCombinedObjectValue
,	setDepsResolved
} from './methods';

import {
	setArrayElement
,	getLastArrayIndex
,	isNumber
,	isString
} from './utils';

import {
	CHANGED
} from './constants';


const methodsNames = Object.keys(methods);

export function createSignal(fn?:AnySignalFunctor):Signal<any,any>{
	
	function stream(arg1:any,arg2?:any){
		const {length} = arguments;
		if(!length){return s.value;}
		if(length === 1){process(s,arg1);}
		else if(length > 1){process(s,arg1,arg2);}
		return s;
	}
	
	const s = createSignalProperties(stream);
	s.fn = fn;
	
	return s;
}

export function createSignalProperties(stream:Function,additional?:any):AnySignal{
	const streamMethods = {};
	methodsNames.forEach(function(name){
		streamMethods[name] = methods[name].bind(null,stream);
	});
	return Object.assign(
		stream
	,	{
		value:undefined
	,	listeners:[]
	,	fn:undefined
	,	depsMet:false
	,	isPaused:false
	,	skipSimilar:false
	,	onDispose:[]
	,	onPause:[]
	,	onUnpause:[]
	,	dependencies:[]
	,	dependents:[]
	}
	,	streamMethods
	,	additional
	);
}

export function createDependentSignal(dependencies:AnySignal[],fn?:AnySignalFunctor){
	const s = createSignal();
	dependencies.forEach((dep)=>addDependency(s,dep,s));
	s.fn = fn;
	setDepsResolved(s);
	return s;
}

export function createCombinedArraySignal(dependencies:AnySignal[],fn?:AnySignalFunctor):AnyMultiSignalArray{
	
	function stream(index:number|any[],value:any){ 
		const {length} = arguments;		
		if(!length){
			return s.value;
		}
		if(isNumber(index)){
			if(length < 2){
				return getCombinedArrayValue(combinedValue,index);
			}			
			combinedValue = updateCombinedArrayValue(s,combinedValue,index,value);
		}
		else if(Array.isArray(index)){
			combinedValue = index.slice();
		}
		return process(s,combinedValue);
	}
	
	const s = <AnyMultiSignalArray>createSignalProperties(stream);
	s.deps = dependencies;
	s.fn = fn;
	setDepsResolved(s);
	
	let combinedValue = dependencies.map(function(dep,i){
		const trigger = stream.bind(null,i);
		addDependency(s,dep,trigger);
		return dep.value;
	});
	
	combinedValue.push(undefined);
	
	if(s.depsMet){
		s(combinedValue);
	}
	
	return s;
}

export function createCombinedObjectSignal(dependencies:SignalDependenciesObject<any>,fn?:AnySignalFunctor):AnyMultiSignalObject{
	
	let combinedValue = {
		[CHANGED]:undefined
	}
	
	function stream(name:any,value:any){
		const {length} = arguments;		
		if(!length){return s.value;}
		if(isString(name)){
			if(length < 2){
				return getCombinedObjectValue(combinedValue,name);
			}				
			combinedValue = updateCombinedObjectValue(s,combinedValue,name,value);
		}
		else{
			combinedValue = name;
		}
		return process(s,combinedValue);
	}
	
	const s = <AnyMultiSignalObject>createSignalProperties(stream);
	s.deps = dependencies;
	s.fn = fn;
	setDepsResolved(s);
	
	Object.keys(dependencies).map(function(name){
		const dep = dependencies[name];
		const trigger = stream.bind(null,name);
		addDependency(s,dep,trigger);
		combinedValue[name] = dep.value;
	});
	
	if(s.depsMet){s(combinedValue);}
	
	return s;
}