/**
 * Created by APQ on 2017-06-09.
 */
var out;
function init () {
	for ( var n = 0; n < data.length; n++) {
		var placing = n + 1;
		out = out +
			+ "<div class='card'>"
			+ "<span>"
			+ placing
			+ "</span>"
			+ "<span id='userName' class='userName'>"
			// data
			+ "</span>"
			+ "<span id='userScore' class='userScore'>"
			// data
			+ "</span>"
			+ "</div>"
	}
	document.getElementById( "display" ).innerHTML = out;
}