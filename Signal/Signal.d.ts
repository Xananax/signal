interface SignalFunctor<IN,OUT>{
	(value:IN,previous:OUT):OUT;
}

interface SignalListener<IN>{
	(arg:IN,previousArg:IN):any;
}

interface SignalFilter<IN>{
	(arg:IN,previousArg:IN):boolean;
}

interface Signal<IN,OUT>{
	():OUT
	(arg:IN):Signal<IN,OUT>
	add(listener:(value:IN,previous:OUT)=>void):Signal<IN,OUT>
	addDependency(s:Signal<OUT,any>):Signal<IN,OUT>
	pause(doPause:boolean):Signal<IN,OUT>;
	map<O>(fn:(value:OUT,previous)=>O):Signal<O,O>;
	reduce<O>(fn:(value:OUT,previous)=>O,initialValue?:O):Signal<O,O>;
	filter(fn:SignalFilter<OUT>):Signal<OUT,OUT>
	endsOn(endSignal:Signal<any,any>):Signal<IN,OUT>
	skipSimilar(doFilter:boolean):Signal<IN,OUT>
	dispose():void;
	value:OUT;
	delegate?:Signal<IN,OUT>
	isSignal:boolean;
	depsMet:boolean;
	dependencies:Signal<any,any>[];
	dependents:Signal<any,any>[];
}

interface SignalFactory{
	():Signal<any,any>;
	<IN>(value:IN):Signal<IN,IN>;
	(dependencies:Signal<any,any>[]):Signal<any[],any>;
	<OUT>(dependencies:Signal<any,any>[],fn:(value:any[],previous)=>OUT,run?:boolean):Signal<any[],OUT>;
	<IN,OUT>(value:IN,fn:(value:IN,previous)=>OUT,run?:boolean):Signal<IN,OUT>;
}