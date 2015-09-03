define([
	'lib/knockout'
], function(
	ko
){
	'use strict';
	var ViewModel = function(){
		var self = this;

		self.textValue = ko.observable();
		self.textValue.subscribe(function(newVal){
			console.log(newVal);
		});
	};
	return ViewModel;
});