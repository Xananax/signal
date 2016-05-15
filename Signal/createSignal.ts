/// <reference path="./definitions.d.ts" />

import {dispose} from './utils'
import {addListeners} from './addListeners';
import {removeListener} from './removeListener';
import {processValue} from './processValue';
import {trigger} from './trigger';
import {createDependentSignal} from './dependentSignal/createDependentSignal';

/** 
 * Creates a Signal with no dependencies
 * @param  {Function[]} processors which processors this signal will use.
 * @returns Signal
 */
export function createSignal(processors:SignalFunctor[]=[]):Signal{
	
	const s:Signal = Object.assign(
		function Signal(arg?:any):Signal|any{
			if(arguments.length==0){return s.value;}
			if(s.isPaused){return s;}
			s.fn ? s.fn(s,arg) : s.trigger(arg);
			return s;
		},{
			value:undefined
		,	hasValue:false
		,	skipSimilar:false
		,	isSignal:true
		,	isPaused:false
		,	depsMet:false
		,	processors
		,	listeners:[]
		,	deps:null
		,	onDispose:[]
		,	changed:''
		,	pause:function(doPause:boolean):Signal{
				s.isPaused = doPause;
				return s;
			}
		,	dispose:function():void{
				dispose(s.onDispose,[s.processors,s.listeners]);
				s.deps = null;
			}
		,	fn:null
		,	trigger:function(arg:any):Signal{
				trigger(s,processors,s.listeners,s.skipSimilar,arg,s.value);
				return s;
			}
		,	process:function(arg:any):Signal{
				processValue(s,processors,s.skipSimilar,arg,s.value);
				return s;
			}
		,	valueOf:function(){
				return s.value;
			}
		,	toString:function():string{
				return s.value+''
			}
		,	add:function(listener:SignalValidListenerArgument):Signal{
				addListeners(s.listeners,listener);
				return s;
			}
		,	remove: function(listener: SignalValidListener): Signal {
				removeListener(s.listeners,listener);
				return s;
			}
		,	map:function(listener:SignalFunctor):Signal{
				return createDependentSignal(s,listener);
			}
		,	reduce:function(listener:SignalFunctor){
				return createDependentSignal(s,listener);
			}
		}
	);
	return s;
}