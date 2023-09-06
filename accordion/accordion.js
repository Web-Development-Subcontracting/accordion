/*
* AUTHOR
* Ben Alexander, Student Worker, 2023
*
* Defines the behavior of the accordion plugin.
*/

var ac = new AbortController();

var styles = "cursor: pointer";
  
(function ($) {

	/* Gets padding bottom + padding top as a float */
	async function getPadding(content, { signal } = {} ) {

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
		
		// Wait for the transition to end or for the signal to be aborted
		return new Promise((resolve, reject) => { 
			const timeoutId = setTimeout(() => {
				if (content.classList.contains("open")) {
					const computedStyleAtEnd = getComputedStyle(content);
					let verticalPadding = getTotalVerticalPadding(computedStyleAtEnd.padding);
					resolve(verticalPadding);
				} else {
					resolve(0);
				}
			}, totalTime);
			// Handle abortion of the promise
			if (signal) {
				signal.addEventListener('abort', () => {
					clearTimeout(timeoutId);
					reject(new DOMException('Aborted', 'AbortError'));
				});
			}
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

	//checks if user clicked during transition
	function checkOverclick(btn, content) {
		if (content.classList.contains("transition-open") && content.classList.contains("transition-closed") ) {
			// handle excessive clicks
			if (btn.classList.contains("collapsible-closed")) {
				content.classList.remove("transition-open");
				content.classList.remove("open");
				content.style.maxHeight = "0"; // Collapse the content
				kids_fullHeight = 0;
				ac.abort();
				ac = new AbortController();
			}
			else if (btn.classList.contains("collapsible-open")) {
				content.classList.remove("transition-closed");
			}

			return true;
		}

		return false;
	}

	/* Defines what happens when the user clicks a collapsible element. */
	function accordionToggle(btn, elem, add=0, closeable=true) {
		var kids_fullHeight;
		var content = elem.querySelector(".collapsible-content");

		if (btn.classList.contains("collapsible-closed") || !closeable) {
			// Swap the classes
			btn.classList.remove("collapsible-closed");
			btn.classList.add("collapsible-open");
			content.classList.add("open");

			kids_fullHeight = 0 + add;
				
			var collapsibles = $(btn).siblings('div:first').children();

			let sentinel = false;
			$(collapsibles).each(function(){
				//The first child of collapsible should be a div with the height of the contents.
				kids_fullHeight += $(this).outerHeight(true);
				sentinel = true;
			});

			if (sentinel) {
				kids_fullHeight += $(btn).outerHeight(true);
				var elemClosestCollapsible = $(elem).parents('.collapsible');
				if (!(elemClosestCollapsible[0] === undefined)) {
					var newBtn = $(elemClosestCollapsible).find(".collapsible-open");
					accordionToggle(newBtn[0], elemClosestCollapsible[0], add=kids_fullHeight, closeable=false);
				}
			}

			content.style.maxHeight = kids_fullHeight+"px";

			async function adjustForNewPadding({ signal } = {}) {
				try {
					addPadding = await getPadding(content, { signal });
					content.style.maxHeight = kids_fullHeight + addPadding + "px";
				} catch(e) {
					if (e.name !== 'AbortError') throw e;
				}
			}
			adjustForNewPadding({signal: ac.signal});

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
			content.classList.remove("open");
			content.style.maxHeight = "0"; // Collapse the content
			kids_fullHeight = 0;

			let transitionEndEventName = getTransitionEndEventName();
			content.addEventListener(transitionEndEventName, onTransitionEnd);
			content.classList.add('transition-closed');
		
			function onTransitionEnd(){
				content.removeEventListener(transitionEndEventName, onTransitionEnd);
				content.classList.remove("transition-closed");
			}
		}
		checkOverclick(btn, content);
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
