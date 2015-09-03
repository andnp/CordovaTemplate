define([
	'lib/knockout',
	'components/textEditor/textEditorViewModel',
	'text!components/textEditor/textEditor.html'
], function(
	ko,
	viewModel,
	template
){
	'use strict';
	ko.components.register('texteditor', {
	    viewModel: viewModel,
	    template: template
	});
});