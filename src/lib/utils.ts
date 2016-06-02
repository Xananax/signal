export function shouldTriggerToggleSignal(index:number,ons:boolean[],s:ToggleSignal,bool:boolean):void{
	if(index < 0 ){return;}
	if(ons[index] == bool){return;}
	ons[index] = bool;
	if(bool == false){
		let {length} = ons;
		while(length>=0){
			const currIndex = --length;
			if(currIndex == index){continue;}
			if(ons[currIndex]){return;}
		}
	}
	s(bool);
}