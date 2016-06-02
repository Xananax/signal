/// <reference path="./page.d.ts" />

import {wrap} from './common';

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

export function addResources(){
	addStyle('https://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.4.0/styles/dark.min.css');
	addScript(
		'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.4.0/highlight.min.js'
	,	()=>addScript(
			'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.4.0/languages/javascript.min.js'
		,	()=>hljs.initHighlightingOnLoad()
		)
	);
}