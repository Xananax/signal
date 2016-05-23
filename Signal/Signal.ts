/// <reference path="./Signal.d.ts" />

export const SKIP = {};

function endSignalOn(s:Signal<any,any>,endSignal:Signal<any,any>){
	endSignal.add(function(){
		s.dispose();
	});
	return s;
}

function disposeSignal(s:Signal<any,any>,listeners:SignalListener<any>[],dependencies:Signal<any,any>[]){
	listeners.length = 1;
	dependencies.length = 1;
	s.value = undefined;
}

function reduceSignal(s:Signal<any,any>,fn:SignalFunctor<any,any>,initialValue?:any):Signal<any,any>{
	const depSignal = createSignal([],fn);
	depSignal.addDependency(s);
	s.add(depSignal);
	if(typeof initialValue !== 'undefined'){
		depSignal.value = initialValue;
	}
	if(depsResolved(depSignal)){
		depSignal(s.value);
	}
	return depSignal;
}

function mapSignal(s:Signal<any,any>,fn:SignalFunctor<any,any>):Signal<any,any>{
	const depSignal = createSignal([],fn);
	depSignal.addDependency(s);
	s.add(depSignal);
	if(depsResolved(depSignal)){
		depSignal(s.value);
	}
	return depSignal;
}

function filterSignal(s:Signal<any,any>,fn:SignalFilter<any>):Signal<any,any>{
	const filter = function(value,previousValue){
		const ret = fn(value,previousValue);
		if(ret == false){return SKIP;}
		return value;
	}
	return mapSignal(s,filter);
}

function addListener(s:Signal<any,any>,listeners:SignalListener<any>[],listener:SignalListener<any>){ 
	listener && listeners.push(listener);
}

function addDependency(s:Signal<any,any>,dependencies:Signal<any,any>[],depSignal:Signal<any,any>){
	dependencies.push(depSignal);
	depSignal.dependents.push(s);
}

function removeListener(s:Signal<any,any>,listeners:SignalListener<any>[],listener:SignalListener<any>){
	const index = listeners.indexOf(listener);
	if(index>=0){listeners.splice(index,1);}
}

function depsResolved(s:Signal<any,any>):boolean{
	const {dependencies,depsMet} = s;
	if(dependencies.length){
		s.depsMet = dependencies.every(d=>d.depsMet);
	}else{
		s.depsMet = true;
	}
	return s.depsMet;
}

function invalidateDependents(s:Signal<any,any>){
	s.depsMet = false;
	s.dependents.length && s.dependents.forEach(invalidateDependents);
}

export const createSignal = function(dependencies:Signal<any,any>[],fn?:SignalFunctor<any,any>){
	const listeners = [];
	let combinedValue = dependencies.length && dependencies.map(d=>d.value);
	let paused = false;
	let skipSimilar = false;
	function trigger(val?:any){
		
		if(!arguments.length){return s.value;}
		
		if(s.delegate){
			s.delegate(val);
			return s;
		}
		
		invalidateDependents(s);
		
		if(paused || !depsResolved(s)){return s;}
		
		const ret = fn ? fn(val,s.value) : val;
		
		if(ret === SKIP || (skipSimilar && ret == s.value)){return s;}
		
		const previousValue = s.value;
		s.value = ret;
		
		listeners.forEach(l=>l(s.value,previousValue));
		
		return s;
	}
	const s:Signal<any,any> = Object.assign(
		trigger,{
		add(listener:SignalListener<any>):Signal<any,any>{
			addListener(s,listeners,listener);
			return s;
		}
	,	addDependency(depSignal:Signal<any,any>):Signal<any,any>{
			addDependency(s,dependencies,depSignal);
			return s;
		}
	,	map(fn:SignalFunctor<any,any>):Signal<any,any>{
			return mapSignal(s,fn);
		}
	,	reduce(fn:SignalFunctor<any,any>,initialValue?:any):Signal<any,any>{
			return reduceSignal(s,fn,initialValue)
		}
	,	filter(fn:SignalFilter<any>):Signal<any,any>{
			return filterSignal(s,fn);
		}
	,	pause(doPause:boolean):Signal<any,any>{
			paused = doPause;
			return s;
		}
	,	endsOn(endSignal:Signal<any,any>):Signal<any,any>{
			return endSignalOn(s,endSignal);
		}
	,	dispose(){
			disposeSignal(s,listeners,dependencies);
		}
	,	toString():string{
			return `signal(\`${s.value}\`)`;
		}
	,	skipSimilar(doFilter:boolean):Signal<any,any>{
			skipSimilar = doFilter;
			return s;
		}
	,	isSignal:true
	,	dependencies
	,	delegate:null
	,	dependents:[]
	,	depsMet:false
	,	value:undefined
	})
	
	dependencies.length && dependencies.forEach(function(dep,i){
		dep.add(function(val){
			if(combinedValue[i] == val){return;}
			combinedValue = [...combinedValue];
			combinedValue[i] = val;
			const changed = [...combinedValue,i];
			trigger(changed);
		});
	});
	
	if(dependencies.length && depsResolved(s)){
		s.depsMet = true;
		s.value = combinedValue;
	} 
	
	return s;
}

export const Signal:SignalFactory = function(value?:any,fn?:SignalFunctor<any,any>,run:boolean=true){
	if(Array.isArray(value) && typeof value[0] != 'undefined' && value[0].isSignal){
		const s = createSignal(value,fn);
		if(depsResolved(s) && fn){
			s(s.value);
		}
		return s;
	}
	const s = createSignal([],fn);
	if(run && typeof value != 'undefined'){
		s(value);
	}
	return s;
}