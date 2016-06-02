/// <reference path="../../Signal.d.ts" />
/// <reference path="./common.d.ts" />


export function createButton(label:string,listener:EventListener):HTMLButtonElement{
	const btn = document.createElement('button');
	btn.addEventListener('click',listener);
	btn.innerHTML = label;
	return btn;
}

export function createCanvas(width:number,height:number,appendTo:Node=document.body):CanvasRenderingContext2D{
	const canvas = document.createElement('canvas');
	canvas.width = width;
	canvas.height = height;
	appendTo.appendChild(canvas);
	const context = canvas.getContext('2d');
	return context;
}

export function createInputsTestChamber(label:string,signals:SignalsForInputs,appendTo:HTMLElement=document.body):(str:string)=>void{
	return createTestChamber(label,function(container:HTMLElement){
			for(let name in signals){
				const signal = signals[name];
				const type = (typeof signal.value);
				container.appendChild(createInput(name,type,signal));	
			}		
	},appendTo);
}

export function createTestChamber(label:string,process?:(container:HTMLElement)=>void,appendTo:HTMLElement=document.body):(str:string)=>void{
	const container = document.createElement('div');
	const title = document.createElement('h2');
	title.innerHTML = label;
	container.appendChild(title);
	if(process){
		process(container);
	}
	const text = document.createElement('pre');
	text.style.fontFamily = 'monospace';
	text.className = 'display';
	container.appendChild(text);
	appendTo.appendChild(container);
	return function(str){
		text.innerHTML = str;	
	}
}

export function wrap(fn:Function){
	const code = document.createElement('code');
	code.innerText = (fn+'')
		.replace(/^function.*?\{/,'')
		.replace(/\}$/,'')
		.replace(/\(0,.*?\.(.*?)\)/g,'$1')
		.replace(/var mountAt.*?\n/,'')
		.replace(/var text[\s\S]*?mountAt\);?/gi,'')
		.replace(/^\s+$/gm,'')
		.replace(/^\t+\s\s\s\s/gm,'');
	code.className='language-javascript';
	const pre = document.createElement('pre');
	pre.appendChild(code);
	pre.style.display = 'none';
	pre.className='language-javascript code';
	const showSource = document.createElement('a');
	showSource.href='#';
	showSource.onclick = function(evt){
		evt.preventDefault();
		pre.style.display = (pre.style.display == 'none') ? 'block' : 'none';
		return false; 
	}
	showSource.innerText = 'show source';
	const wrapper = document.createElement('div');
	fn(wrapper);
	wrapper.appendChild(showSource);
	wrapper.appendChild(pre);
	wrapper.appendChild(document.createElement('hr'));
	wrapper.className = 'example_wrapper';
	document.body.appendChild(wrapper);
}

export function createInput(name:string,type:string,signal:Signal<any,any>):HTMLDivElement{
	const input = document.createElement('input');
	input.type = type;
	input.id = name;
	input.value = signal()+'';
	input.addEventListener('keyup',createEventListener(signal,type),false);
	type == 'number' && input.addEventListener('click',createEventListener(signal,type),false);
	const label = document.createElement('label');
	label.htmlFor = name;
	label.innerText = name;
	const container = document.createElement('div');
	container.appendChild(label);
	container.appendChild(input);
	return container;
}

function createEventListener(s:Signal<any,any>,type:string){
	return function listener(evt:Event){
		const target = evt.target as HTMLInputElement;
		if(type == 'number'){			
			const value = parseFloat(target.value);
			s(value);
		}else{
			const value = target.value;
			s(value);
		}
	}
}

export function createTextElement(str:string,tag:string='p'):HTMLElement{
	const elem = document.createElement(tag);
	elem.innerHTML = str;
	return elem;
}