/**
 * Sets a value in an array at the specified index.
 * If the value is changed, the array will be copied prior to
 * adding the value. If the value has not changed, then the 
 * array is returned as is.
 * 
 * @param  {any[]} val the array
 * @param  {number} index the index to set at
 * @param  {any} value the value to set
 * @returns Array the same array, or a similar array with the value changed.
 */
export function setArrayValue(val:any[],index:number,value:any):any[]{
	if((index in val) && val[index] == value){return val;}
	val = val.slice();
	val[index] = value;
	return val;	
}