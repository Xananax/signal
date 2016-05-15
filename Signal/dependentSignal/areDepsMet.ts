/// <reference path="../definitions.d.ts" />

function everyObj(obj:any,fn:Function):boolean{
	for(let n in obj){
		const curr = obj[n];
		if(!fn(curr,n)){return false;}
	}
	return true;
}

/**
 * Verifies that an array of dependencies has been resolved
 * A dependency is deemed resolved if one of the following is true:
 * - its `hasValue` property is true
 * - it has no `deps` property, or its `deps` length is 0.
 * - every one of its `deps` array `hasValue` is true.
 * @param  {Signal} depSignal
 * @returns boolean
 */
export function areDepsMet(depSignal:Signal):boolean{
	if(depSignal.hasValue){return true;}
	const {deps} = depSignal;
	if(!deps){return true;}
	if(Array.isArray(deps)){
		 if(!deps.length){return true;}
		 return deps.every(s=>s.hasValue);
	}
	else if(typeof deps == 'object' && deps.constructor == Object || deps.constructor == undefined){
		return everyObj(deps,s=>s.hasValue);
	}
	return false;
}