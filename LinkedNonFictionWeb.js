$(document).ready(function() {
  populateLanguageChooser(); 
});

function populateLanguageChooser() {

	var lang_url = 'proxy.php?lang2lexvo=1';

	$.getJSON(lang_url, function(json, status) {
		$.each(json, function(i) {
			var item = json[i];
			$('#lang_select').append('<option value="' + item.code + '">' + item.langname + '</option>');
		});
		// Remove the progress indicator
		$('#initial_progress').remove();
		// Show the language drop-down
		$('#lang_form').show();
		// Having showTopConcepts() here triggers the display of concepts after the language drop-down is displayed
		// Whichever language is at the top of the drop-down will be displayed
		showTopConcepts();
	});
	
}

function showTopConcepts() {

	// Clear the list of concepts
	$('#concepts').empty();
	
	// Show "top concepts"
			 var top_sparql = 'PREFIX skos: <http://www.w3.org/2004/02/skos/core#> \n';
	top_sparql = top_sparql + 'PREFIX dct: <http://purl.org/dc/terms/> \n';
	top_sparql = top_sparql + 'SELECT DISTINCT ?concept ?notation ?label WHERE { \n';
	top_sparql = top_sparql + '?toplevel skos:hasTopConcept ?concept . \n';
	top_sparql = top_sparql + '?concept skos:notation ?notation . \n';
	top_sparql = top_sparql + '?concept skos:prefLabel ?label . \n';
	top_sparql = top_sparql + '?concept dct:language "' + $("#lang_select option:selected").val() + '" . \n';
	top_sparql = top_sparql + '}';
	
	var top_url = 'http://dewey.info/sparql.php?query=' + escape(top_sparql) + '&jsonp=?';
	var params = { 'output': 'json' };

	$.getJSON(top_url, params, function(json, status) {
		if (json.results.bindings){
			$.each(json.results.bindings, function(i, n) {
				var item = json.results.bindings[i];
				// For some reason a double set of concepts is returned for English, e.g.
				// http://dewey.info/class/0/2009/08/about.en and http://dewey.info/class/000/2009/07/about.en
				// Here we filter out the ones that contain a 3 digit dewey number, based on the length of the concept URI
				if (item.concept.value.length == 42) {
					$('#concepts').append('<li class="topconcept">' + item.notation.value + ' ' + item.label.value + '</li>');
				}
			});
		} else {
			alert('Something went wrong...');
		}
	});
	
}