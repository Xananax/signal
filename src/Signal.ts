/// <reference path="./Signal.d.ts" />

import {
	createSignal
,	createDependentSignal
,	createCombinedArraySignal
,	createCombinedObjectSignal
} from './factories';

import {
	isSignal
,	isFunction
,	isSignalObject
,	isSignalArray
} from './utils';


export default function Signal<IN>(val:SignalDependenciesObject<IN>):MultiSignalObject<IN,Dict<IN>>;
export default function Signal<IN,OUT>(val:SignalDependenciesObject<IN>,fn:(a:Dict<IN>,b?)=>OUT):MultiSignalObject<IN,OUT>;
export default function Signal<IN>(val:SignalDependenciesArray<IN>):MultiSignalArray<IN,IN[]>;
export default function Signal<IN,OUT>(val:SignalDependenciesArray<IN>,fn:(a:IN[],b?)=>OUT):MultiSignalArray<IN,OUT>;
export default function Signal<IN>(val:Signal<any,IN>):Signal<IN,IN>;
export default function Signal<IN,OUT>(val:Signal<any,IN>,fn:(a:IN,b?)=>OUT):Signal<IN,OUT>;
export default function Signal<IN,OUT>(fn:(a:IN,b?)=>OUT):Signal<IN,OUT>;
export default function Signal<IN,OUT>(val:IN,fn:(a:IN,b?)=>OUT):Signal<IN,OUT>;
export default function Signal<IN>(val:IN):Signal<IN,IN>;
export default function Signal():Signal<any,any>;
export default function Signal(val?:any,fn?:AnySignalFunctor):AnySignal{
	if(arguments.length === 0){return createSignal();}
	if(isSignalArray(val)){
		return createCombinedArraySignal(val,fn);
	}
	if(isSignalObject(val)){
		return createCombinedObjectSignal(val,fn);
	}
	if(isSignal(val)){
		return createDependentSignal([val],fn);
	}
	if(isFunction(val)){
		const s = createSignal();
		s.fn = val;
		return s;
	}
	if(arguments.length > 0){		
		const s = createSignal();
		s.fn = fn;
		s(val);
		return s;
	}
	return createSignal();
}