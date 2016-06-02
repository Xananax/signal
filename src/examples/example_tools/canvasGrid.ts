import {
	createCanvas
} from './common';

interface Draw{
	(grid:number[][])
	appendTo(to:Node)
}

import {boxBlurCanvasRGB} from './superfastBlur'

export function canvasGrid(width:number,height:number,map:string[]){
	const wrapper = document.createDocumentFragment();
	const lastIndex = map.length - 1;
	width = width * 10;
	height = height * 10;
	const ctx = createCanvas(width,height,wrapper);
	ctx.globalCompositeOperation = "source-over";
	ctx.fillStyle = map[0];
	ctx.fillRect(0,0,width,height);
	ctx.getImageData(0,0,width,height);
	//ctx.globalCompositeOperation = "lighter";
	
	function appendTo(to:Node){
		to.appendChild(wrapper);
	}
	
	const draw = <Draw>function(grid:number[][]){
		ctx.fillStyle = map[0];
		ctx.fillRect(0,0,width,height);
		boxBlurCanvasRGB(ctx,0,0,width,height,2,1);
		grid.forEach(function(row,y){
			row.forEach(function(cell,x){
				if(cell==0){return;}
				const color = map[cell] || map[lastIndex]
				ctx.fillStyle = color;
				ctx.fillRect(x*10,y*10,10,10);
			});
		});
	}
	draw.appendTo = appendTo;

	return draw;
}