interface SignalFunctor<IN,OUT>{
	(value:IN,previous?:OUT):OUT;
}

interface AnySignalFunctor extends SignalFunctor<any,any>{}

interface SignalListener<IN>{
	(arg:IN,previousArg?:IN):any;
}
interface AnySignalListener extends SignalListener<any>{}

interface SignalFilter<IN>{
	(arg:IN,previousArg?:IN):boolean;
}

interface AnySignalFilter extends SignalFilter<any>{}

interface Signal<IN,OUT>{
	():OUT
	(arg:IN):Signal<IN,OUT>
	add(listener:(value:OUT,previous:OUT)=>void):Signal<IN,OUT>
	addDependency(s:Signal<any,any>):Signal<IN,OUT>
	pause(doPause:boolean):Signal<IN,OUT>;
	map<O>(fn:(value:OUT,previous)=>O):Signal<O,O>;
	reduce<O>(fn:(value:OUT,previous)=>O,initialValue?:O):Signal<O,O>;
	filter(fn:SignalFilter<OUT>):Signal<OUT,OUT>
	endsOn(endSignal:Signal<any,any>):Signal<IN,OUT>
	skipSimilar(doFilter:boolean):Signal<IN,OUT>
	dispose():void;
	dep(name:string|number):AnySignal
	dep(name:string|number,value:any):AnySignal
	value:OUT;
	delegate?:Signal<IN,OUT>|SignalFunctor<IN,OUT>
	isSignal:boolean;
	depsMet:boolean;
	isPaused:boolean;
	skipSame:boolean;
	onDispose:Function[];
	dependencies:Signal<any,any>[];
	listeners:SignalListener<OUT>[];
	dependents:Signal<any,any>[];
}

interface TypedSignal<T> extends Signal<T,T>{}
interface AnySignal extends TypedSignal<any>{}

interface TypedCombinedSignalArray<T> extends Signal<any[],T>{
	dep(index:number):AnySignal
	dep(index:number,value:any):TypedCombinedSignalArray<T>
}
interface CombinedSignalArray extends TypedCombinedSignalArray<any[]>{}

interface TypedCombinedSignalObject<T> extends Signal<any,T>{
	dep(name:string):AnySignal
	dep(name:string,value:any):TypedCombinedSignalObject<T>
}
interface CombinedSignalObject extends TypedCombinedSignalObject<any>{}

type CombinedSignal = CombinedSignalArray | CombinedSignalObject;
type SomeSignal = AnySignal | CombinedSignalArray | CombinedSignalObject;

interface SignalFactory{
	():AnySignal;
	(dependencies:SignalDependenciesObject):CombinedSignalObject;
	<OUT>(dependencies:SignalDependenciesObject,fn:(value:Object,previous)=>OUT,run?:boolean):TypedCombinedSignalObject<OUT>;
	(dependencies:SignalDependenciesArray):CombinedSignalArray;
	<OUT>(dependencies:SignalDependenciesArray,fn:(value:any[],previous)=>OUT,run?:boolean):TypedCombinedSignalArray<OUT>;
	<IN>(value:IN):TypedSignal<IN>;
	<IN,OUT>(value:IN,fn:(value:IN,previous)=>OUT,run?:boolean):Signal<IN,OUT>;
}

interface SignalTimeProvider{
	():number
}
interface ToggleSignalStatus{
	on:boolean;
	since:number;
	name:string;
}

type SignalDependenciesArray = Signal<any,any>[]

interface SignalDependenciesObject{
	[key:string]:Signal<any,any>
}

interface ToggleSignal extends Signal<boolean,ToggleSignalStatus>{}

interface SignalEventAdder{
	(type:string,listener:(ev:Event)=>any,useCapture?:boolean):any;
}