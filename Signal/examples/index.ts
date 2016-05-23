import tetris from './tetris';
import click from './click';
import diamond from './diamond';
import secret_combination from './secret_combination';
import sum from './sum';
import {wrap} from './common'

wrap(secret_combination);
wrap(click);
wrap(diamond);
wrap(sum);
//wrap(tetris);

interface Windows extends Window{
	hljs:{
		initHighlightingOnLoad():void;
	};
}

function addScript(src:string,onLoad?:EventListener){
	const script = document.createElement('script');
	script.addEventListener('load',onLoad);
	script.src = src;
	onLoad && document.head.appendChild(script);	
}

function addStyle(src:string,onLoad?:EventListener){
	const style = document.createElement('link');
	style.href = src;
	style.rel = 'stylesheet';
	document.head.appendChild(style);
	onLoad && style.addEventListener('load',onLoad);
}

addStyle('https://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.4.0/styles/dark.min.css');
addScript(
	'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.4.0/highlight.min.js'
,	()=>addScript(
		'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.4.0/languages/javascript.min.js'
	,	()=>(<Windows>window).hljs.initHighlightingOnLoad()
	)
);