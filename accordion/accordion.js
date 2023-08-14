/*
* AUTHOR
* Ben Alexander, Student Worker, 2023
*
* Defines the behavior of the accordion plugin.
*/

var styles = "cursor: pointer";

/* Gets padding bottom + padding top as a float */
function getPadding(content) {
	function getTotalVerticalPadding(padding) {
		const paddingValues = padding.split(' ').map(value => parseInt(value));
		
		if (paddingValues.length === 4) {
			const [top, right, bottom, left] = paddingValues;
			return top + bottom;
		} else if (paddingValues.length === 3) {
			const [top, horizontal, bottom] = paddingValues;
			return top + bottom;
		} else if (paddingValues.length === 2) {
			const [vertical, horizontal] = paddingValues;
			return vertical;
		} else if (paddingValues.length === 1) {
			return paddingValues[0] * 2;
		} else {
			throw new Error('Invalid padding format');
		}
	}

	const computedStyleAtEndOfTransition = getComputedStyle(content);

	// Get the transition duration and delay
	const transitionDuration = parseFloat(computedStyleAtEndOfTransition.transitionDuration) * 1000;
	const transitionDelay = parseFloat(computedStyleAtEndOfTransition.transitionDelay) * 1000;

	// Calculate the total time for the transition to end
	const totalTime = transitionDuration + transitionDelay;
	
	// Wait for the transition to end
	return new Promise(resolve => { 
		setTimeout(() => {
			const computedStyleAtEnd = getComputedStyle(content);
			let verticalPadding = getTotalVerticalPadding(computedStyleAtEnd.padding);
			resolve(verticalPadding);
		}, totalTime);
	});
}

/* Gets browser specific transition names */
function getTransitionEndEventName() {
	var transitions = {
		"transition"      : "transitionend",
		"OTransition"     : "oTransitionEnd",
		"MozTransition"   : "transitionend",
		"WebkitTransition": "webkitTransitionEnd"
	 }
	let bodyStyle = document.body.style;
	for(let transition in transitions) {
		if(bodyStyle[transition] != undefined) {
			return transitions[transition];
		} 
	}
}

/* Defines what happens when the user clicks a collapsible element. */
function accordionToggle(btn, elem, add=0, closeable=true) {

	if (btn.classList.contains("collapsible-closed") || !closeable) {
	  // Swap the classes
		btn.classList.remove("collapsible-closed");
		btn.classList.add("collapsible-open");
		let content = elem.querySelector(".collapsible-content");
		content.classList.add("open");

		var kids_fullHeight = 0 + add;
              
		// jQuery's outerHeight() function is more accurate than JavaScript's scrollHeight or Height in this case
		// Until this is refactored, temporary call a self executing jQuery function
		(function($) {
			var collapsibles = $(btn).siblings('div:first').children();

			let sentinel = false;
			$(collapsibles).each(function(){
				//The first child of collapsible should be a div with the height of the contents.
				kids_fullHeight += $(this).outerHeight();
				sentinel = true;
			});

			if (sentinel) {
				kids_fullHeight += $(btn).outerHeight();
				var elemClosestCollapsible = $(elem).parents('.collapsible');
				if (!(elemClosestCollapsible[0] === undefined)) {
					var newBtn = $(elemClosestCollapsible).find(".collapsible-open");
					accordionToggle(newBtn[0], elemClosestCollapsible[0], add=kids_fullHeight, closeable=false);
				}
			}
		})(jQuery);

		content.style.maxHeight = kids_fullHeight+"px";

		async function adjustForNewPadding() {
			addPadding = await getPadding(content);
			content.style.maxHeight = kids_fullHeight + addPadding + "px";
		}
		adjustForNewPadding();

		let transitionEndEventName = getTransitionEndEventName();
		content.addEventListener(transitionEndEventName, onTransitionEnd);
		content.classList.add('transition-open');
	  
		function onTransitionEnd(){
			content.removeEventListener(transitionEndEventName, onTransitionEnd);
			content.classList.remove("transition-open");
		}

	} else if (btn.classList.contains("collapsible-open") && closeable) {
		// If the button element is clicked, close the content
		btn.classList.remove("collapsible-open");
		btn.classList.add("collapsible-closed");
		let content = elem.querySelector(".collapsible-content");
		content.classList.remove("open");
		content.style.maxHeight = "0"; // Collapse the content

		let transitionEndEventName = getTransitionEndEventName();
		content.addEventListener(transitionEndEventName, onTransitionEnd);
		content.classList.add('transition-closed');
	
		function onTransitionEnd(){
			content.removeEventListener(transitionEndEventName, onTransitionEnd);
			content.classList.remove("transition-closed");
	  	}
	}
}
  
/* Fade effects */
function fade(element) {
	var op = 1;  // initial opacity
	var timer = setInterval(function () {
		if (op <= 0.1){
			clearInterval(timer);
			element.style.display = 'none';
			children[i].style.position = "absolute";
		}
		element.style.opacity = op;
		element.style.filter = 'alpha(opacity=' + op * 100 + ")";
		op -= op * 0.1;
	}, 10);
}
  
function unfade(element) {
	var op = 0.1;  // initial opacity
	element.style.display = 'block';
	var timer = setInterval(function () {
		if (op >= 1){
			clearInterval(timer);
		}
		element.style.opacity = op;
		element.style.filter = 'alpha(opacity=' + op * 100 + ")";
		op += op * 0.1;
	}, 10);
}
  
(function ($) {
	Drupal.behaviors.accordion = {
		attach: function (context, settings) {
			$(document).ready(function(){
				$('.collapsible').each(function(i, elem){
					let btn = elem.firstElementChild;
					if (btn != null) {
						btn.classList.add("collapsible-closed");
						btn.setAttribute("style", styles);
						btn.addEventListener("click", function(){
							accordionToggle(btn, elem);
						});
					}
				})
			});
		}
	}
})(jQuery);
  