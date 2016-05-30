/// <reference path="./Signal.d.ts" />

export const SKIP = Symbol('SKIP');
export const CHANGED = Symbol('CHANGED')

function endSignalOn(s:AnySignal,endSignal:AnySignal){
	endSignal.add(function(){
		s.dispose();
	});
	return s;
}

function disposeSignal(s:AnySignal,listeners:AnySignalListener[],dependencies:AnySignal[]){
	listeners.length = 1;
	dependencies.length = 1;
	s.onDispose.length && s.onDispose.forEach(d=>d());
	s.value = undefined;
}

function reduceSignal(s:AnySignal,fn:AnySignalFunctor,initialValue?:any):AnySignal{
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

function mapSignal(s:AnySignal,fn:AnySignalFunctor):AnySignal{
	const depSignal = createSignal([],fn);
	depSignal.addDependency(s);
	s.add(depSignal);
	if(depsResolved(depSignal)){
		depSignal(s.value);
	}
	return depSignal;
}

function filterSignal(s:AnySignal,fn:AnySignalFilter):AnySignal{
	const filter = function(value,previousValue){
		const ret = fn(value,previousValue);
		if(ret == false){return SKIP;}
		return value;
	}
	return mapSignal(s,filter);
}

function addListener(s:AnySignal,listeners:AnySignalListener[],listener:AnySignalListener){ 
	listener && listeners.push(listener);
}

function addDependency(s:AnySignal,dependencies:AnySignal[],depSignal:AnySignal){
	dependencies.push(depSignal);
	depSignal.dependents.push(s);
}

function removeListener(s:AnySignal,listeners:AnySignalListener[],listener:AnySignalListener){
	const index = listeners.indexOf(listener);
	if(index>=0){listeners.splice(index,1);}
}

export function depsResolved(s:AnySignal):boolean{
	const {dependencies,depsMet} = s;
	if(dependencies.length){
		s.depsMet = dependencies.every(d=>d.depsMet);
	}else{
		s.depsMet = true;
	}
	return s.depsMet;
}

export function invalidateDependents(s:AnySignal){
	s.depsMet = false;
	s.dependents.length && s.dependents.forEach(invalidateDependents);
}

export function applySignalValue(s:AnySignal,val:any,previousValue:any,skipSimilar:boolean,fn?:AnySignalFunctor):AnySignal{
	
	const ret = fn ? fn(val,previousValue) : val;
	
	if(ret === SKIP || (skipSimilar && ret == s.value)){return s;}
	
	s.value = ret;
	
	s.listeners.forEach(l=>l(s.value,previousValue));
	
	return s;
}

function getSignalDependency(deps:SignalDependenciesArray,index:number):AnySignal{
	const dep = deps[index];
	if(!dep){throw new Error(`\`${index}\` is not a dependency`)}
	return dep;
}

function setSignalDependency(deps:SignalDependenciesArray,index:number,value:any):void{
	const dep = getSignalDependency(deps,index);
	dep(value);
}

function getOrSetSignalDependency(s:AnySignal,index:number,value?:any){
	if(typeof value !== 'undefined'){
		setSignalDependency(s.dependencies,index,value);
		return s;
	}
	return getSignalDependency(s.dependencies,index);
}

function getSignalNamedDependency(deps:SignalDependenciesObject,name:string):AnySignal{
	const dep = deps[name];
	if(!dep){throw new Error(`\`${name}\` is not a dependency`)}
	return dep;
}

function setSignalNamedDependency(deps:SignalDependenciesObject,name:string,value:any):void{
	const dep = getSignalNamedDependency(deps,name);
	dep(value);
}

function getOrSetSignalNamedDependency(s:AnySignal,deps:SignalDependenciesObject,name:string,value?:any):AnySignal{
	if(typeof value !== 'undefined'){
		setSignalNamedDependency(deps,name,value);
		return s;
	}
	return getSignalNamedDependency(deps,name);	
}

function signalFirstRun(s:AnySignal,val:any,fn?:AnySignalFunctor):AnySignal{
	return applySignalValue(s,val,null,false,fn);
}

export const createSignal = function(dependencies:SignalDependenciesArray,fn?:AnySignalFunctor){
	
	const listeners = [];
	let combinedValue = dependencies.length && dependencies.map(d=>d.value);
	
	function trigger(val?:any){
		
		if(!arguments.length){return s.value;}
		
		if(s.delegate){
			s.delegate(val);
			return s;
		}
		
		invalidateDependents(s);
		
		if(s.isPaused || !depsResolved(s)){return s;}
		
		return applySignalValue(s,val,s.value,s.skipSame,fn);
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
			s.isPaused = doPause;
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
			s.skipSame = doFilter;
			return s;
		}
	,	dep(index:number,value?:any){
			return getOrSetSignalDependency(s,index,value);
		}
	,	isSignal:true
	,	dependencies
	,	listeners
	,	isPaused:false
	,	skipSame:false
	,	delegate:null
	,	dependents:[]
	,	depsMet:false
	,	onDispose:[]
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
		s.value = [...combinedValue,null];
	} 
	
	return s;
}

export function issignalDependenciesObject(deps:any):boolean{
	if(typeof deps !== 'object'){return false;}
	for(let n in deps){
		if(!Object.prototype.hasOwnProperty.call(deps,n)){continue;}
		if(!deps[n]){return false;}
		if(deps[n].isSignal){return true;}
		return false;
	}
}

export function isSignalDependenciesArray(deps:any):boolean{
	return (Array.isArray(deps) && typeof deps[0] != 'undefined' && deps[0].isSignal);
}

export function changeObjectProp(obj:Object,propertyName:string,value:any):Object{
	if(propertyName in obj && obj[propertyName] == value){return obj;}
	return Object.assign({},obj,{[propertyName]:value,[CHANGED]:propertyName});
}

export function createCombinedSignal(deps:SignalDependenciesObject,fn?:SignalFunctor<Object,any>):CombinedSignalObject{
	const keys = Object.keys(deps);
	const last = keys.length;
	const dependencies = keys.map(key=>deps[key]);
	let combinedValue = {[CHANGED]:null};
	keys.forEach((k,i)=>combinedValue[k] = dependencies[i].value);

	function handler(values){
		const changedIndex = values[last];
		const changedName = keys[changedIndex];
		const changedValue = values[changedIndex];
		const val = changeObjectProp(combinedValue,changedName,changedValue);
		const ret = fn && fn(val,combinedValue) || val;
		if(ret === SKIP){return SKIP;}
		combinedValue = ret;
		return ret;
	}
	const s = <CombinedSignalObject>createSignal(dependencies,handler);
	
	s.dep = function(name:string,value?:any){
		return getOrSetSignalNamedDependency(s,deps,name,value);
	}
	
	if(depsResolved(s)){
		s.value = Object.assign({},combinedValue,{__changed:null});
	}
	return s;
	
}

export function Signal():AnySignal;
export function Signal(dependencies:SignalDependenciesObject):CombinedSignalObject;
export function Signal<OUT>(dependencies:SignalDependenciesObject,fn:(value:any,previous)=>OUT,run?:boolean):TypedCombinedSignalObject<OUT>;
export function Signal(dependencies:SignalDependenciesArray):CombinedSignalArray;
export function Signal<OUT>(dependencies:SignalDependenciesArray,fn:(value:any[],previous)=>OUT,run?:boolean):TypedCombinedSignalArray<OUT>;
export function Signal<IN>(value:IN):TypedSignal<IN>;
export function Signal<IN,OUT>(value:IN,fn:(value:IN,previous)=>OUT,run?:boolean):Signal<IN,OUT>;
export function Signal(value?:any,fn?:AnySignalFunctor,run:boolean=true){
	if(isSignalDependenciesArray(value)){
		const s = createSignal(value,fn);
		if(depsResolved(s) && fn && run){
			return signalFirstRun(s,s.value,fn);
		}
		return s;
	}
	if(issignalDependenciesObject(value)){
		const s = createCombinedSignal(value,fn);
		if(depsResolved(s) && fn && run){
			return signalFirstRun(s,s.value,fn);
		}
		return s;
	}
	const s = createSignal([],fn);
	if(run && typeof value != 'undefined'){
		signalFirstRun(s,value,fn);
		s.depsMet = true;
	}
	return s;
}