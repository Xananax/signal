/**
 * Sets `signal` to be a dependency of `dependentSignal`. This enables the following behaviors:
 * - Everytime `signal` triggers, `dependentSignal` will be triggered.
 * - When `dependentSignal` is `dispose()`-ed, it will remove itself from `signal`'s event listeners
 * 
 * Additionally, a `trigger` argument can be passed to be triggered when `signal` fires off. In this
 * case, the responsibility of triggering `dependentSignal` is up to you.
 * 
 * @param  {Signal} dependentSignal the dependent signal
 * @param  {Signal} signal the parent signal
 * @param  {SignalFunctor} trigger? an optional trigger as a layer between `signal` and `dependentSignal`
 * @return {void}
 */
export function setDependentSignal(dependentSignal:Signal,signal:Signal,trigger?:SignalFunctor):void{
	if(trigger){
		signal.add(trigger);
		const remove = signal.remove.bind(null,trigger);
		dependentSignal.onDispose.push(remove);	
	}else{
		signal.add(dependentSignal);
		const remove = signal.remove.bind(null,dependentSignal);
		dependentSignal.onDispose.push(remove);
	}
}