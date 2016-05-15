interface Signal{
	(arg?:any):Signal;
	value:any;
	skipSimilar:boolean;
	isSignal:boolean;
	add(listener: SignalValidListener):Signal
	trigger(arg:any):Signal;
	fn?:Function
	remove(listener: SignalValidListener):Signal
	dispose():void;
	process(arg?:any):Signal;
	pause(doPause:boolean):Signal;
	listeners:SignalValidListener[];
	processors: SignalFunctor[];
	onDispose:Function[];
	isPaused:boolean;
	hasValue:boolean;
	valueOf():any;
	deps:SignalDependenciesArray|SignalDependenciesObject
	changed:string|number;
	map(listener:SignalFunctor):Signal
	reduce(listener:SignalFunctor):Signal
}

interface SignalFunctor{
	(value:any,previousValue?:any):any
}

interface SignalListener{
	(value: any, previousValue?: any): any;
}

type SignalValidListener = SignalListener | Signal;


interface SignalDependenciesArray extends Array<Signal>{
	
}

interface SignalFilter{
	(value:any,previousValue:any):boolean
}

interface SignalDependenciesObject{
	[propName:string]:any;
}

interface CombinedSignalArray extends Signal{
	deps:SignalDependenciesArray;
	value:any[];
	changed:number;
}

interface CombinedSignalObject extends Signal{
	deps:SignalDependenciesObject;
	value:any;
	changed:string;
}

type CombinedSignal = CombinedSignalArray | CombinedSignalObject;

type SignalDependencies = SignalDependenciesArray | SignalDependenciesObject;

type SignalValidListenerArgument = SignalValidListener | SignalValidListener[];