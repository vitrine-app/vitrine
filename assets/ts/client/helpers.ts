export function beforeCss(selector, styling) {
	let rawStyling = '';
	Object.keys(styling).forEach(function(key) {
		rawStyling += key + ': ' + styling[key] + ';';
	});

	$('head').append('<style>' + selector + ':before{' + rawStyling + '}</style>');
}

export function alphabeticSort(nodeA, nodeB) {
	return nodeA.name > nodeB.name;
}
