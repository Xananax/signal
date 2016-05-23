/// <reference path="./definitions.d.ts" />

import {DIR} from './data';

export function random(min:number,max:number,rand:RandomFunc=Math.random):number{
	return (min+(rand()*(max-min)));
}
export function randomChoice(choices:any[],rand:RandomFunc=Math.random):number{
	const max = choices.length-1;
	const index = Math.round(random(0,max,rand));
	return index;
}

export function iteratePieceBlocks(piece:Piece, x:number, y:number,dir:DIR,fn:(x:number,y:number)=>any):void{
	let bit;
	let result;
	let row = 0;
	let col = 0;
	const blocks = piece.blocks[dir];
	for(bit=0x8000;bit>0;bit=bit>>1){
		const posX = x+col;
		const posY = y+row;
		const filled = !!(blocks & bit); 
		filled && fn(posX,posY);
		if(++col === 4){
			col = 0;
			++row;
		}
	}
};

export function renderGrid(grid:Grid,filled:string='#',empty:string=' ',lineReturn:string='\n'):string{
	return grid.map(row=>row.map(cell=>cell?filled:empty).join('')).join(lineReturn);
}

export function getBlock(grid:Grid,x:number,y:number):number{
	if(y < grid.length && y>=0){
		const row = grid[y];
		if(x < row.length && x>= 0){
			return row[x];
		}
	}
	throw new Error(`Grid coordinates [${x},${y}] does not exist`);
}

export function occupied(type:Piece,x:number,y:number,dir:DIR,grid:Grid):boolean{
	let result = false
	const maxX = grid[0].length;
	const maxY = grid.length;
	iteratePieceBlocks(type,x,y,dir,function(x,y){
		if((x < 0) || (x >= maxX) || (y < 0) || (y >= maxY) || getBlock(grid,x,y)){
			result = true;
		}
	});
	return result;
};

export function free(type:Piece,x:number,y:number,dir:DIR,grid:Grid):boolean{
	return !occupied(type,x,y,dir,grid);
}

export function createEmptyGrid(width:number,height:number):Grid{
	const rowProto = createFilledArray(width,0);
	const grid = createFilledArray(height,()=>rowProto.slice());
	return grid;
}

export function increment(amount:number=1,s:Signal):void{
	if(amount==0){return;}
	const v = +s.value;
	s(v+amount);
}

export function getRandomPieceProvider(definitions:Pieces,rand:RandomFunc=Math.random):RandomPieceProvider{
	const {i,j,l,o,s,t,z} = definitions;
	let pieces = [];
	function resetPieces(){
		pieces = [i,i,i,i,j,j,j,j,l,l,l,l,o,o,o,o,s,s,s,s,t,t,t,t,z,z,z,z];
	}
	return function randomPiece(){
		(pieces.length == 0) && resetPieces();
		const index = randomChoice(pieces,rand);
		const type = pieces.splice(index,1)[0];
		return type;
	};
}

export function createFilledArray(size:number,fill:any=undefined):any[]{
	return (typeof fill == 'function') ?
		new Array(size).fill(undefined).map(fill) :
		new Array(size).fill(fill);
}

export function constraint(maxSize:Signal){
	return function(v:number){
		const max = maxSize();
		if(v > max){return max;}
		if(v < 0){return 0;}
		return v;
	}
}