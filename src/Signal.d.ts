interface SignalFunctor<IN,OUT>{
	(value:IN,previousValue?:OUT):OUT;	
}

interface AnySignalFunctor extends SignalFunctor<any,any>{}

interface SignalListener<T>{
	(value:T):any;
}

interface SignalFilter<IN> extends SignalFunctor<IN,boolean>{}

interface AnySignalFilter extends SignalFilter<any>{}

type SignalValidListener = AnySignalListener | AnySignal;

interface AnySignalListener extends SignalListener<any>{}

interface Signal<IN,OUT>{
	():OUT;
	(arg:IN):this;
	(arg1:IN,arg2?:any):this;
	value:OUT;
	listeners:SignalListener<OUT>[];
	fn:SignalFunctor<IN,OUT>;
	depsMet:boolean;
	isPaused:boolean;
	skipSimilar:boolean;
	onDispose:Function[];
	onPause:Function[];
	onUnpause:Function[];
	dependencies:SignalDependenciesArray<any>;
	dependents:SignalDependenciesArray<any>;
	add(listener:SignalValidListener,run?:boolean):this;
	remove(listener:SignalValidListener):this;
	addDependency(dep:AnySignal,trigger?:SignalValidListener|boolean):this;
	removeDependency(dep:AnySignal,trigger?:SignalValidListener|boolean):this;
	dispose():void;
	pause(doPause:boolean):this;
	skipSame(doSkip:boolean):this;
	map<T>(fn:(a:OUT,b?)=>T):Signal<IN,T>;
	reduce<T>(fn:(a:OUT,b?)=>T,startValue?:T):Signal<IN,T>;
	filter(fn:SignalFilter<OUT>):Signal<boolean,OUT>
	fork():Signal<OUT,OUT>;
	pipe<T>(dep:Signal<T,any>,fn?:(a:OUT,b?)=>T):this;
	endsOn(endSignal:AnySignal):this;
	pauseOn(pauseSignal:AnySignal):this;
	unpauseOn(pauseSignal:AnySignal):this;
	toggleOn(pauseSignal:AnySignal,unpauseSignal:AnySignal):this;
	log():this;
}

interface Dict<T>{
	[key:string]:T;
}

interface IndependentSignal<T> extends Signal<T,T>{}
interface AnySignal extends Signal<any,any>{}

interface MultiSignalArray<IN,OUT> extends Signal<IN[],OUT>{
	deps:IN[];
	changed:number;
}

interface AnyMultiSignalArray extends MultiSignalArray<any,any>{}

interface MultiSignalObject<IN,OUT> extends Signal<Dict<IN>,OUT>{
	deps:SignalDependenciesObject<IN>;
	changed:string;
}

interface AnyMultiSignalObject extends MultiSignalObject<any,any>{}

interface SignalDependenciesArray<T> extends Array<Signal<any,T>>{}

interface SignalDependenciesObject<T> extends Dict<Signal<any,T>>{}

interface SignalTimeProvider{
	():number;
}

interface ToggleSignalValue{
	on:boolean;
	since:number;
	name:string;
}

interface ToggleSignal extends Signal<boolean,ToggleSignalValue>{}

interface TickSignal extends Signal<number,number>{
	delay():number
	delay(time:number):TickSignal
}