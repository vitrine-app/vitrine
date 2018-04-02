interface Array<T> {
	nativeForEach(callbackfn: (value: T, index: number, array: T[]) => void, thisArg?: any): void;
	forEach(elementCallback: (value: T, index: number, array: T[]) => void, endCallback?: () => void, thisArg?: any): void;
}

Array.prototype.nativeForEach = Array.prototype.forEach;

Object.assign(Array.prototype, {
	forEach(elementCallback: (value: any, index: number, array: any[]) => void, endCallback?: () => void, thisArg?: any) {
		if (!this.length) {
			if (endCallback)
				endCallback();
			return;
		}
		let counter: number = 0;
		this.nativeForEach((value: any, index: number, array: any[]) => {
			elementCallback(value, index, array);
			counter++;
			if (counter === array.length && endCallback)
				endCallback();
		}, thisArg);
	}
});
