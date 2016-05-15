import {addListeners} from './addListeners';
import {combine} from './combine';
import {createSignal} from './createSignal';
import {processValue} from './processValue';
import {removeListener} from './removeListener';
import {Signal} from './Signal';
import {trigger} from './trigger';
import {isSignal,processFunctionArray,dispose} from './utils';

describe('Signal',()=>{
	describe('standalone functions',()=>{
		describe('addChildSignal',()=>{
			it('',()=>{});
		});
		describe('addListeners',()=>{
			it('',()=>{});
		});
		describe('combine',()=>{
			it('',()=>{});
		});
		describe('createSignal',()=>{
			it('',()=>{});
		});
		describe('processValue',()=>{
			it('',()=>{});
		});
		describe('removeListener',()=>{
			it('',()=>{});
		});
		describe('trigger',()=>{
			it('',()=>{});
		});
		describe('isSignal',()=>{
			it('',()=>{});
		});
		describe('processFunctionArray',()=>{
			it('',()=>{});
		});
		describe('dispose',()=>{
			it('',()=>{});
		});
	});
	describe('Signal Constructor',()=>{
		describe('Signal()',()=>{
			it('',()=>{
				
			});
		});
		describe('Signal(value)',()=>{
			it('',()=>{
				
			});
		});
		describe('Signal({name:Signal}|[Signal])',()=>{
			it('',()=>{
				
			});
		});
	});
	describe('Signal instance',()=>{
		describe('signal()',()=>{
			it('',()=>{});
		});
		describe('signal.value:any',()=>{
			it('',()=>{});
		});
		describe('signal.isSignal:boolean',()=>{
			it('',()=>{});
		});
		describe('signal.add(listener)',()=>{
			it('',()=>{});
		});
		describe('signal.remove(listener)',()=>{
			it('',()=>{});
		});
		describe('signal.skipSimilar=boolean',()=>{
			it('',()=>{});
		});
		describe('signal.process(arg:any)',()=>{
			it('',()=>{});
		});
		describe('signal.trigger(arg:any)',()=>{
			it('',()=>{});
		});
		describe('signal.hasValue:boolean',()=>{
			it('',()=>{});
		});
		describe('signal.fn',()=>{
			it('',()=>{});
		});
		describe('signal.dispose()',()=>{
			it('',()=>{});
		});
		describe('signal.changed:number|string',()=>{
			it('',()=>{});
		});
		describe('signal.map((a,b)=>c)',()=>{
			it('',()=>{});
		});
		describe('signal.reduce((a,b)=>c)',()=>{
			it('',()=>{});
		});
	});
})