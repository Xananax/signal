/// <reference path="../definitions.d.ts" />

/**
 * Sets a signal to end when another signal emits. 
 * When `endSignal` emits any value, `signal` will `dispose()` itself.
 * @param  {Signal} signal the main signal
 * @param  {Signal} endSignal the signal that notifies an end.
 */
export function endsOn(signal:Signal,endSignal:Signal){
	function trigger(value,previousValue){
		signal.dispose();
	}
	endSignal.add(signal);
	const remove = endSignal.remove.bind(null,endSignal);
	signal.onDispose.push(remove);
}