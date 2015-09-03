define([
	'lib/knockout'
], function(
	ko
){
	'use strict';
	var LikeWidget = function(params){
		var self = this;
		self.clicked = function(){
			console.log('clicked!');
		};
	}

	return LikeWidget;
});