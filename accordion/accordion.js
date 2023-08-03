/*
* AUTHOR
* Ben Alexander, Student Worker, 2023
*
* Defines the behavior of the accordion plugin.
*/

var styles = "cursor: pointer";

/* Defines what happens when the user clicks a collabsible element. */
function accordionToggle(btn, elem) { 
	// btn refers to the clickable element, elem refers to 
	//    the content (including the button)
	//    if it is closed unfurl the element
	if (btn.classList.contains("collapsible-closed")) {
	  //swap the classes
	  btn.classList.remove("collapsible-closed");
	  btn.classList.add("collapsible-open");
	  let children = elem.children;
	  //for all children (except the button) unfade
	  for (let i = 1; i < children.length; i++) {
		unfade(children[i]);
		children[i].style.visibility = "visible";
		children[i].style.position = "relative";
	  }
	  
	} else if (btn.classList.contains("collapsible-open")) {
	  // if the button element is clicked, close the content
	  btn.classList.remove("collapsible-open");
	  btn.classList.add("collapsible-closed");
	  let children = elem.children;
	  for (let i = 1; i < children.length; i++) {
		fade(children[i]); //fade will set position back to absolute
		if (children[i].classList.contains("collapsible")) {
		  let _btn = children[i].firstElementChild;
		  if (_btn.classList.contains("collapsible-open")) {
			//uncomment this if you want to close all children
			//accordionToggle(_btn, children[i]);
		  }
		}
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
			  let children = elem.children;
			  for (let i = 1; i < children.length; i++) {
				children[i].style.visibility = "hidden";
				children[i].style.position = "absolute";
			  }
			  btn.addEventListener("click", function(){
				accordionToggle(btn, elem);
			  });
			}
		  })
		});
	  }
	}
  })(jQuery);
  