interface Functor{
	(arg?:any,previousArg?:any):any;
}

interface TypedFunctor<IN,OUT> extends Functor{
	(arg:IN,previousArg:OUT):OUT;
}

interface Listener extends Functor{
	(arg?:any,previousArg?:any):void;
}

interface TypedListener<IN,OUT> extends TypedFunctor<IN,OUT>{
	(arg:IN,previousArg:OUT):void;
}

interface Filter{
	(arg?:any,previousArg?:any):boolean;
}

interface SignalOptions{
	fn?:Functor;
	value?:any;
	depsMet?:boolean;
	isSignal?:boolean;
	skipSimilar?:boolean;
	dependencies?:Signal[];
	dependents?:Signal[];
	listeners?:Listener[];
}

interface Signal{
	():any
	(arg:any):Signal;
	(arg?:any):any;
	add(fn:Signal|Listener):Signal;
	remove(fn:Signal|Listener):Signal;
	map(fn:Functor):Signal;
	filter(fn:Filter):Signal;
	reduce(fn:Functor,initialValue?:any):Signal;
	endsOn(endSignal:Signal):Signal;
	toString():string;
	triggerValue(val:any):boolean;
	processValue(val:any):any;
	pause(val:boolean):Signal;
	dispatchChange(val:any,previousValue:any):boolean;
	debug():string;
	dispose():void;
	get?:Function;
	set?:Function;
	disposed:boolean;
	isPaused:boolean;
	fn?:Functor;
	changed:string|number;
	value:any;
	depsMet:boolean;
	isSignal:boolean;
	skipSimilar:boolean;
	dependencies:Signal[];
	onDispose:Function[];
	dependents:Signal[];
	listeners:Listener[];
}

interface TypedSignal<IN,OUT> extends Signal{
	():OUT;
	(arg:IN):Signal;
	value:OUT;
}

interface SignalFactory{
	():Signal;
	<IN>(value:IN):TypedSignal<IN,IN>;
	(dependencies:Dependencies,fn:Functor):Signal
	<IN,OUT>(value:IN,fn?:TypedFunctor<IN,any>):TypedSignal<IN,OUT>;
}

interface Signals{
	[name:string]:Signal;
}

type Dependencies = Signals | Signal[]; 