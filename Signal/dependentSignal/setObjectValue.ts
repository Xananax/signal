/**
 * Sets a value on an object on a specified key.
 * If the value exists and is the same, the object is returned unmodified.
 * If the value has changed, the object is copied and the selected key modified.
 * 
 * @param  {any} val the object
 * @param  {string} key the key to operate on
 * @param  {any} value the new value
 * @returns any the unmodified object, or a copy with the relevant property changed
 */
export function setObjectValue(val:any,key:string,value:any):any{
	if((key in val) && val[key] == value){return val;}
	return Object.assign({},val,{[key]:value});
}