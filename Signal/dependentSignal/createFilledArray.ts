/**
 * Creates an array of size `length` and filled with value `fill`
 * @param  {number} length
 * @param  {any} fill?
 * @returns Array
 */
export function createFilledArray(length:number,fill?:any):Array<any>{
	return (new Array(length).fill(fill))
}