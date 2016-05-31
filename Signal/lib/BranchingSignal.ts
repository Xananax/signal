/// <reference path="../Signal.d.ts" />

import {SKIP,createSignal} from '../Signal';

export function BranchingSignal(val:any,branches:any):Signal<any,any>{
	
	const s = createSignal([]);
	s.value = val;
	s.depsMet = true;
	
	s.add(function(key){
		if(key==null){return;}
		if(key in branches){
			branches[key]();
		}else if('_' in branches){
			branches['_']();
		}
	});
	return s;
} 