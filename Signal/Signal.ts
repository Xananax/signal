/// <reference path="./Signal.d.ts" />

export const SKIP = Symbol('SKIP');

export function removeFromArr(arr:Listener[],val:Listener):boolean;
export function removeFromArr(arr:Signal[],val:Signal):boolean;
export function removeFromArr<T>(arr:T[],val:T):boolean{
	const index = arr.indexOf(val);
	if(index < 0){return false;}
	arr.splice(index,1);
	return true;
}

export function isObject(val:any):boolean{
	return (
		(typeof val == 'object') && 
		('constructor' in val) && 
		(val.constructor == undefined || val.constructor == Object)
	);
}

export function isFunction(val:any):boolean{
	return (val && (typeof val == 'function'));
}

export function isPromise(val:any):boolean{
	return (isFunction(val) && ('then' in val) && isFunction(val.then));
}

export function isSignalsObject(val:any){
	if(!isObject(val)){return false;}
	const keys = Object.keys(val);
	if(!keys.length){return false;}
	const key = keys[0];
	return val[key] && val[key].isSignal;
}

export function cancelDependencies(s:Signal){
	s.depsMet = false;
	s.dependents.length && s.dependents.forEach(cancelDependencies);
}

export function mapSignal(s:Signal,fn:Functor){
	return createDependentSignal(s,fn);
}

export function reduceSignal(s:Signal,fn:Functor,initialValue?:any):Signal{
	if(initialValue!=null){
		return createDependentSignal(s,fn,{value:initialValue});	
	}
	return createDependentSignal(s,fn);
}

export function filterSignal(s:Signal,fn:Filter):Signal{
	function filter(val,previousValue){
		const ret = fn(val,previousValue);
		return ret ? val : SKIP;
	}
	return createDependentSignal(s,filter);
}

export function endSignalOn(s:Signal,endSignal:Signal):Signal{
	const dispose = function(){
		s.dispose();
		endSignal.remove(dispose);
	}
	endSignal.add(dispose);
	return s;
}

export function checkDepsMet(s:Signal):boolean{
	if(s.depsMet === true){return true;}
	s.depsMet = !s.dependencies.length || s.dependencies.every(dep=>dep.depsMet);
	return s.depsMet
}

export function createCombinedSignalObject(obj:Signals,fn?:Functor,options?:SignalOptions):Signal{
	const keys = Object.keys(obj);
	const deps = keys.map(k=>obj[k]);
	let value = {};
	const signal = createSignal(value,null,options);
	const removes = [];
	
	keys.forEach(function(k){
		const dependency = obj[k];
		function trigger(val,previousValue){
			if(value[k] == val){
				signal.value = value;
			}
			const changed = k;
			signal.changed = changed;
			value = Object.assign({},value,{[k]:val,changed});
			signal.triggerValue(value);
		}
		addDependency(dependency,signal,trigger);
		value[k] = (dependency.depsMet) ? dependency.value : null;
		const remove = removeDependency.bind(null,dependency,signal,trigger);
		signal.onDispose.push(remove);
	});
	
	signal.depsMet = deps.every(dep=>dep.depsMet);
	
	signal.set = function(key:string,value:any){
		signal.get(key)(value);
	}
	signal.get = function(key:string):Signal{
		if(!(key in obj)){throw new Error(`${key} is not a valid sub signal`);}
		return obj[key];
	}
	
	signal.fn = fn;
	
	if(checkDepsMet(signal)){
		signal(value);
	}
	
	return signal;	
}

export function createCombinedSignal(dependencies:Signal[],fn?:Functor,options?:SignalOptions):Signal{
	
	let value = new Array(dependencies.length).fill(null);
	const signal = createSignal(value,null,options);
	
	dependencies.forEach(function(dependency,i){
		function trigger(val,previousValue){
			if(value[i] != val){
				value = [...value];
				value[i] = val;
			}
			signal.changed = i;
			triggerSignalValue(signal,[...value,signal.changed]);
		}
		addDependency(dependency,signal,trigger);
		value[i] = (dependency.depsMet) ? dependency.value : null;
		const remove = removeDependency.bind(null,dependency,signal,trigger);
		signal.onDispose.push(remove);
	});
	
	signal.depsMet = dependencies.every(dep=>dep.depsMet);
	signal.pause = function(doPause:boolean):Signal{
		if(doPause === signal.isPaused){return signal;}
		if(doPause){
			signal.isPaused = true;
			return signal;
		}
		signal.isPaused = doPause;
		triggerSignalValue(signal,value);
		return signal;
	}
	signal.set = function(index:number,value:any){
		signal.get(index)(value);
	}
	signal.get = function(index:number):Signal{
		if(index >= dependencies.length || index < 0){throw new Error(`${index} is not a valid sub signal`);}
		return dependencies[index];
	}
	signal.fn = fn;
	
	if(checkDepsMet(signal)){
		signal(value);
	}
	
	return signal;
}

export function createDependentSignal(signal:Signal,fn?:Functor,options?:SignalOptions):Signal{
	const value = (options && options.value) ? options.value : (signal.depsMet && signal.value);
	const depSignal = createSignal(value,fn,options);
	addDependency(signal,depSignal,depSignal);
	if(signal.depsMet){
		depSignal.depsMet = true;
		depSignal.value = fn ? fn(value) : value;
	}
	return depSignal;
}

export function addDependency(signal:Signal,depSignal:Signal,trigger?:Signal|Listener):Signal{
	signal.dependents.push(depSignal);
	depSignal.dependencies.push(signal);
	if(trigger){
		signal.listeners.push(trigger);
	}
	return signal;
}

export function removeDependency(signal:Signal,depSignal:Signal,trigger?:Signal|Listener):Signal{
	removeFromArr(signal.dependents,trigger);
	removeFromArr(depSignal.dependencies,trigger);
	if(trigger){
		removeFromArr(signal.listeners,trigger);
	}
	return signal;
}

export function addListener(signal:Signal,listener:Signal|Listener):Signal{
	const s = listener as Signal;
	if(s.isSignal){
		addDependency(signal,s,s);
	}else{
		signal.listeners.push(listener);
	}
	return signal;
}

export function removeListener(signal:Signal,listener:Signal|Listener):Signal{
	const s = listener as Signal;
	if(s.isSignal){
		removeDependency(signal,s,s);
	}else{
		removeFromArr(signal.listeners,listener);
	}
	return signal;
}

export function triggerSignalValue(s:Signal,val:any):boolean{
	
	if(s.isPaused){return false;}
	
	if(isPromise(val)){
		const p = val as Promise<any>;
		p.then(triggerSignalValue.bind(null,s));
		return false;
	}
	
	s.dependents.forEach(cancelDependencies);

	checkDepsMet(s);
	if(!s.depsMet){return false;}
	
	val = processSignalValue(s,val);
	if(val === SKIP){return false;}
	
	return setSignalValueAndDispatch(s,val);
}

export function setSignalValueAndDispatch(s:Signal,val:any):boolean{
	const previousValue = s.value;
	s.value = val;
	return dispatchSignalChange(s,val,previousValue);
}

export function processSignalValue(s:Signal,val:any):any{
				
	if(s.isPaused){return SKIP;}
	
	const previousValue = s.value;
	if(s.fn){val = s.fn(val,previousValue);}
	if(val === SKIP){return SKIP;}
	
	if(s.skipSimilar && val == previousValue){return SKIP;}
	
	return val;
}

export function dispatchSignalChange(s:Signal,val:any,previousValue:any):boolean{
	if(s.isPaused){return false;}
	s.listeners.forEach(listener=>listener(val,previousValue));
	return true;
}

export function disposeSignal(s:Signal):void{
	if(s.dependents.length){
		throw new Error(`disposing of a signal ${s} that has dependent signals!`);
	}
	s.dependencies.forEach(dep=>dep.remove(s));
	s.listeners.forEach(dep=>s.remove(dep));
	s.onDispose.forEach(s=>s());
	s.isPaused = true;
	s.fn = null;
	s.disposed = true;
}

let ids = 0;

export function createSignal(value?:any,fn?:Functor,options?:SignalOptions):Signal{
	
	const id = (ids++)+'';
	
	const s = Object.assign(
		function Signal(val?:any):any{
			
			if(!arguments.length){return s.value;}
			triggerSignalValue(s,val);
			
			return s;
		}
	,	Object.assign({
			value
		,	fn
		,	depsMet:true
		,	listeners:<Listener[]>[]
		,	dependents:<Signal[]>[]
		,	dependencies:<Signal[]>[]
		,	onDispose:<Function[]>[]
		,	changed:-1
		,	isPaused:false
		,	isSignal:true
		,	skipSimilar:true
		,	disposed:false
		,	pause(doPause:boolean):Signal{
				s.isPaused = doPause;
				return s;
			}
		,	triggerValue(val:any):boolean{
				return triggerSignalValue(s,val);
			}
		,	processValue(val:any):any{
				return processSignalValue(s,val);
			}
		,	dispatchChange(val:any,previousValue:any):boolean{
				return dispatchSignalChange(s,val,previousValue);
			}
		,	add(fn:Signal|Listener):Signal{
				return addListener(s,fn);
			}
		,	remove(fn:Signal|Listener):Signal{
				return removeListener(s,fn);
			}
		,	map(fn:Functor):Signal{
				return mapSignal(s,fn);
			}
		,	reduce(fn:Functor,initialValue?:any):Signal{
				return reduceSignal(s,fn,initialValue);
			}
		,	filter(fn:Filter):Signal{
				return filterSignal(s,fn);
			}
		,	endsOn(endSignal:Signal):Signal{
				return endSignalOn(s,endSignal)
			}
		,	toString():string{
				return `signal(\`${s.value}\`)`;
			}
		,	debug():string{
				const deps = s.dependents.map(dep=>dep.debug()).join(',')
				const listeners = s.listeners.length
				const dependencies = s.dependencies.length;
				return `signal${id}(${s.value}|listeners:${listeners}|dependencies:${dependencies}|dependents:[${deps}])`;
			}
		,	dispose(){
				return disposeSignal(s);
			}
		},options)
	);
	if(arguments.length && value!= null && checkDepsMet(s)){
		s(value);
	}
	return s;
}


function isDependencies(value:any):Function{
	if(value && value.isSignal){
		return createDependentSignal;
	}
	else if(Array.isArray(value) && value.length && value[0].isSignal){
		return createCombinedSignal;
	}
	else if(isSignalsObject(value)){
		return createCombinedSignalObject;
	}
	return null;
}

export const Signal:SignalFactory = function(value?:any,fn?:any):Signal{
	let signal:Signal;
	let factory = isDependencies(value);
	if(factory){
		return factory(value,fn);
	}
	return createSignal(value,fn);
}