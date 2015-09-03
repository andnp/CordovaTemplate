require([
	'lib/knockout',
	'viewModels/viewModel',

	//Components
	'components/textEditor/textEditor'
], function(
	ko,
	viewModel
){
	'use strict';

	var ViewModel = function(){

	};
	ko.applyBindings(ViewModel);
});