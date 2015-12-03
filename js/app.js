// this function takes the question object returned by the StackOverflow request
// and returns new result to be appended to DOM
var showQuestion = function(question) {
	
	// clone our result template code
	var result = $('.templates .question').clone();
	
	// Set the question properties in result
	var questionElem = result.find('.question-text a');
	questionElem.attr('href', question.link);
	questionElem.text(question.title);

	// set the date asked property in result
	var asked = result.find('.asked-date');
	var date = new Date(1000*question.creation_date);
	asked.text(date.toString());

	// set the .viewed for question property in result
	var viewed = result.find('.viewed');
	viewed.text(question.view_count);

	// set some properties related to asker
	var asker = result.find('.asker');
	asker.html('<p>Name: <a target="_blank" '+
		'href=http://stackoverflow.com/users/' + question.owner.user_id + ' >' +
		question.owner.display_name +
		'</a></p>' +
		'<p>Reputation: ' + question.owner.reputation + '</p>'
	);

	return result;
};


var showAnswerer = function(answerer) {
	// console.log(answerer);
	// console.log(answerer.user.link);
	// console.log(answerer.user.display_name);
	// console.log(answerer.post_count);
	// console.log(answerer.user.reputation);
	// clone our result template code
	var result = $('.templates .answerer').clone();
	
	// Set the answer properties in result
	var answererElem = result.find('.answerer-name a');
	answererElem.attr('href', answerer.user.link);
	answererElem.text(answerer.user.display_name);

	// set the answerer post-count
	var postCount = result.find('.answerer-postcount');
	postCount.text(answerer.post_count);

	// set answerer reputation
	var reputation = result.find('.answerer-reputation');
	reputation.text(answerer.user.reputation);

	console.log(result);
	return result;

};

// takes error string and turns it into displayable DOM element
var showError = function(error){
	var errorElem = $('.templates .error').clone();
	var errorText = '<p>' + error + '</p>';
	errorElem.append(errorText);
};

var showSearchResults = function (tag, length) {
	var results = length + ' results for <strong>' + tag;
	return results; // string that will read 30 results for CSS
};

var getUnanswered = function(tags) {
	
	// the parameters we need to pass in our request to StackOverflow's API
	var request = { 
		tagged: tags,
		site: 'stackoverflow',
		order: 'desc',
		sort: 'creation'
	};
	
	var result = $.ajax({
		url: "http://api.stackexchange.com/2.2/questions/unanswered",
		data: request, // these are the parameters from above
		dataType: "jsonp", 
		type: "GET", // get request
	})

	.done(function(result){ 
		// request.tagged = css
		// result.items is an array of 30 items
		// result.items[0] is the first answer
		// result.items [1] is the second answer
		// result.items.length is how many there are (30 for CSS)
		var searchResults = showSearchResults(request.tagged, result.items.length);
		console.log(result);
		$('.search-results').html(searchResults);
		//$.each is a higher order function. It takes an array and a function as an argument.
		//The function is executed once for each item in the array.
		$.each(result.items, function(i, item) {
			var question = showQuestion(item);
			$('.results').append(question);
		});
	})
	
	.fail(function(jqXHR, error){ //this waits for the ajax to return with an error promise object
		var errorElem = showError(error);
		$('.search-results').append(errorElem);
	});
};

var getInspiration = function(tags) {

	// alert('test');
	
	// the parameters we need to pass in our request to StackOverflow's API
	var request = { 
		tag: tags,
		period: 'month'
	};
	
	var result = $.ajax({
		// url: "/2.2/tags/{tag}/top-answerers/all_time?site=stackoverflow",
		url: "http://api.stackexchange.com/2.2/tags/" + request.tag + "/top-answerers/" + request.period + "?site=stackoverflow",
		dataType: "jsonp", //use jsonp to avoid cross origin issues
		type: "GET",
	})
	.done(function(result){ //this waits for the ajax to return with a succesful promise object
		// console.log(result);

		var searchResults = showSearchResults(request.tag, result.items.length);

		$('.search-results').html(searchResults);
		//$.each is a higher order function. It takes an array and a function as an argument.
		//The function is executed once for each item in the array.
		$.each(result.items, function(i, item) {
			// console.log(item);
			var answerer = showAnswerer(item);
			$('.results').append(answerer);
		})
	})

	.fail(function(jqXHR, error, errorThrown) {
		var errorElem = showError(error);
		$('.search-results').append(errorElem);
	});

}

$(document).ready( function() {
	$('.unanswered-getter').submit( function(e){
		e.preventDefault();
		// zero out results if previous search has run
		$('.results').html('');
		// get the value of the tags the user submitted
		var tags = $(this).find("input[name='tags']").val();
		getUnanswered(tags);
	});
});

$(document).ready( function() {
	$('.inspiration-getter').submit( function(e){
		e.preventDefault();
		// zero out results if previous search has run
		$('.results').html('');
		// get the value of the tags the user submitted
		var tags = $(this).find("input[name='top-answerers']").val();
		getInspiration(tags);
	});
});

