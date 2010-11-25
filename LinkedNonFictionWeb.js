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
	$('.concepts').empty();
	// Clear search results
	$('.resultrow').remove();
	
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
					var id = notation2id(item.notation.value);
					$('#concepts1').append('<li class="concept1" id="' + id + '" onClick="showNarrower(\'' + item.concept.value + '\', \'concept2\', \'' + id + '\');"><span class="notation">' + item.notation.value + '</span> <span class="label">' + item.label.value + '</span></li>');
				}
			});
		} else {
			alert('Something went wrong...');
		}
	});
	
}

function showNarrower(uri, level, id) {
	
	if (level == 'concept2') {
		// Clear the list of concepts
		$('#concepts2').empty();
		// Remove background colour
		$('.label').css('background-color', 'white');
	} 
	if (level == 'concept3') {
		// Remove background colour
		$('#concepts2 .label').css('background-color', 'white');
	}
	$('#concepts3').empty();
	
	// Highlight the chosen concept
	$('#' + id + ' .label').css('background-color', 'silver');
	
	// Show "narrower concepts" as seen from the given URI
			 var top_sparql = 'PREFIX skos: <http://www.w3.org/2004/02/skos/core#> \n';
	top_sparql = top_sparql + 'PREFIX dct: <http://purl.org/dc/terms/> \n';
	top_sparql = top_sparql + 'SELECT DISTINCT ?narrower ?notation ?label WHERE { \n';
	top_sparql = top_sparql + '<' + uri + '> skos:narrower ?narrower . \n';
	top_sparql = top_sparql + '?narrower skos:notation ?notation . \n';
	top_sparql = top_sparql + '?narrower skos:prefLabel ?label . \n';
	top_sparql = top_sparql + '?narrower dct:language "' + $("#lang_select option:selected").val() + '" . \n';
	top_sparql = top_sparql + '}';
	
	var top_url = 'http://dewey.info/sparql.php?query=' + escape(top_sparql) + '&jsonp=?';
	var params = { 'output': 'json' };

	$.getJSON(top_url, params, function(json, status) {
		if (json.results.bindings){
			$.each(json.results.bindings, function(i, n) {
				var item = json.results.bindings[i];
				var id = notation2id(item.notation.value);
				if (level == 'concept2') {
					$('#concepts2').append('<li id="' + id + '" class="concept2" onClick="showNarrower(\'' + item.narrower.value + '\', \'concept3\', \'' + id + '\');"><span class="notation">' + item.notation.value + '</span> <span class="label">' + item.label.value + '</span></li>');
				} else {
					$('#concepts3').append('<li id="' + id + '" class="concept3" onClick="showResults(\'' + item.narrower.value + '\', \'' + id + '\');"><span class="notation">' + item.notation.value + '</span> <span class="label">' + item.label.value + '</span></li>');	
				}
			});
		} else {
			alert('Something went wrong...');
		}
	});
	
}

function notation2id(notation) {
	
	// This might be "503" or "[504]", so remove any brackets
	notation = notation.replace("[", "");
	notation = notation.replace("]", "");
	return "concept" + notation;
	
}

function showResults(uri, id) {

	// Un-highlight previous concept
	$('#concepts3 .label').css('background-color', 'white');
	// Highlight the chosen concept
	$('#' + id + ' .label').css('background-color', 'silver');
	
	// Make sure no results are displayed
	$('.resultrow').remove();
	
	// Debug
	// $('#debug').empty().append('DEBUG Treff for ' + uri);
	
	// Turn the uri into something we can use
	var class = uri.substring(24, 27);
	
	// Get results
				var search_sparql = 'PREFIX pode: <http://www.bibpode.no/vocabulary#> ';
	search_sparql = search_sparql + 'PREFIX dct: <http://purl.org/dc/terms/> ';
	search_sparql = search_sparql + 'PREFIX foaf: <http://xmlns.com/foaf/0.1/> ';
	search_sparql = search_sparql + 'SELECT DISTINCT ?post ?name ?title ?format ?issued ?langlabel WHERE { ';
	search_sparql = search_sparql + '?post dct:source pode:dfb_fagposter ; ';
	search_sparql = search_sparql + 'pode:ddkThird <http://www.bibpode.no/instance/DDK_' + class + '> ; ';
	search_sparql = search_sparql + 'dct:title ?title ; ';
	search_sparql = search_sparql + 'dct:format ?format ; ';
	search_sparql = search_sparql + 'dct:issued ?issued ; ';
	search_sparql = search_sparql + 'dct:language ?language ; ';
	search_sparql = search_sparql + 'dct:creator ?creator . ';
	search_sparql = search_sparql + '?creator foaf:name ?name . '; 
	search_sparql = search_sparql + '?language rdfs:label ?langlabel . '; 
	search_sparql = search_sparql + 'FILTER langMatches( datatype(?langlabel), "xsd:stringno" ) ';
	search_sparql = search_sparql + '} ORDER BY DESC(?issued) LIMIT 10 ';
	
	var search_url = 'http://bibpode.no/rdfstore/endpoint.php?query=' + escape(search_sparql) + '&output=json&jsonp=?';
	var params = { 'output': 'json' };
	
	// $('#debug').append('<br /><br />' + search_url);

	$.getJSON(search_url, params, function(json, status) {
		if (json.results.bindings){
			// Make sure the results-table is displayed
			// $('#searchresults').show();
			var c = 1;
			$.each(json.results.bindings, function(i, n) {
				var item = json.results.bindings[i];
				$('#searchresults').append('<tr class="resultrow"><td>' + c + '</td><td>' + item.name.value + '</td><td>' + item.title.value + '</td><td>' + item.format.value + '</td><td>' + item.issued.value + '</td><td>' + item.langlabel.value + '</td></tr>');
				c = c + 1;
			});
			$('#searchresults').show();
		} else {
			alert('Something went wrong...');
		}
	});

	
}