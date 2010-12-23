var dialog = '';

$(document).ready(function() {
  
	// Make things happen by populating the language dropdown
	populateLanguageChoosers(); 
  
	// Initialize the dialog that will hold the detailed view
	dialog = $('<div></div>')
		.dialog({
			autoOpen: false,
			title: 'Postvisning', 
			minWidth: 800, 
			modal: true, 
			buttons: [{
        		text: "Lukk",
        		click: function() { $(this).dialog("close"); }
    		}]
		});

});

function populateLanguageChoosers() {

	var lang_url = 'proxy.php?lang2lexvo=1';

	// Dewey languages
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
	
	// Document languages
	             var doclang_sparql = 'PREFIX dct: <http://purl.org/dc/terms/> ';
	doclang_sparql = doclang_sparql + 'PREFIX pode: <http://www.bibpode.no/vocabulary#> ';
	doclang_sparql = doclang_sparql + 'SELECT DISTINCT ?language ?langLabel WHERE { ';
	doclang_sparql = doclang_sparql + '?record dct:source pode:dfb_fagposter . ';
	doclang_sparql = doclang_sparql + '?record dct:language ?language . ';
	doclang_sparql = doclang_sparql + '?language rdfs:label ?langLabel . ';
	doclang_sparql = doclang_sparql + 'FILTER langMatches( lang(?langLabel), "nb" ) ';
	doclang_sparql = doclang_sparql + '} ORDER BY ?langLabel ';
	
	var doclang_url = 'http://bibpode.no/rdfstore/endpoint.php?query=' + escape(doclang_sparql) + '&output=json&jsonp=?';
	var params = { 'output': 'json' };
	
	$.getJSON(doclang_url, params, function(json, status) {
		if (json.results.bindings){
			$.each(json.results.bindings, function(i, n) {
				var item = json.results.bindings[i];
				$('#doc_lang_select').append('<option value="' + item.language.value + '">' + item.langLabel.value + '</option>');
			});
			// Show the language drop-down
			$('#doc_lang_form').show();
		} else {
			alert('Something went wrong...');
		}
	});
	
}

function showTopConcepts() {

	// Clear the list of concepts
	$('.concepts').empty();
	// Clear search results
	$('.resultrow').remove();
	// Clear heading
	$('#deweyheading').hide();
	// Hide results table
	$('#searchresults').hide();
	
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
					var concept = notation2concept(item.notation.value);
					var shortconcept = concept.substring(0,1);
					$('#concepts1').append('<li class="concept1" id="concept' + shortconcept + '" onClick="showNarrower(\'' + item.concept.value + '\', \'concept2\', \'' + concept + '\');"><span class="notation">' + item.notation.value + '</span> <span class="label">' + item.label.value + '</span> <span class="waitingforcount" id="count' + shortconcept + '">' + shortconcept + '</span></li>');
				}
			});
			// Get the counts for the concepts
			get_counts();
		} else {
			alert('Something went wrong...');
		}
	});
	
}

function showNarrower(uri, level, id) {
	
	var elem_id = id;
	if (level == 'concept2') {
		// Clear the list of concepts
		$('#concepts2').empty();
		// Remove background colour
		$('.label').removeClass('chosenconcept');
		elem_id = elem_id.substring(0,1);
	} else if (level == 'concept3') {
		// Remove background colour
		$('#concepts2 .label').removeClass('chosenconcept');
		elem_id = elem_id.substring(0,2);
	}
	$('#concepts3').empty();
	
	// Make sure no results are displayed
	$('.resultrow').remove();
	
	// Hide the whole result-table
	$('#searchresults').hide();
	
	// Hide Dewey heading
	$('#deweyheading').hide();
	
	// Highlight the chosen concept
	$('#concept' + elem_id + ' .label').addClass('chosenconcept');
	
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
				var concept = notation2concept(item.notation.value);
				if (level == 'concept2') {
					var shortconcept = concept.substring(0,2);
					$('#concepts2').append('<li id="concept' + shortconcept + '" class="concept2" onClick="showNarrower(\'' + item.narrower.value + '\', \'concept3\', \'' + concept + '\');"><span class="notation">' + item.notation.value + '</span> <span class="label">' + item.label.value + '</span> <span class="waitingforcount" id="count' + shortconcept + '">' + shortconcept + '</span></li>');
				} else {
					$('#concepts3').append('<li id="concept' + concept + '" class="concept3" onClick="showResults(\'' + concept + '\', \'1\');"><span class="notation">' + item.notation.value + '</span> <span class="label">' + item.label.value + '</span> <span class="waitingforcount" id="count' + concept + '">' + concept + '</span></li>');
				}
			});
			// Get the counts for concepts
			get_counts();
		} else {
			alert('Something went wrong...');
		}
	});
	
}

/* Arguments: 
id: the Dewey notation, e.g. 059
*/
function showResults(id, cliked) {

	if (cliked == 1) {
		// Un-highlight previous concept
		$('#concepts3 .label').removeClass('chosenconcept');
		// Highlight the chosen concept
		$('#concept' + id + ' .label').addClass('chosenconcept');
		// Show the chosen Dewey as a heading
		$('#deweyheading').empty().append($('#concept' + id + ' .label').text()).show();
	}
	
	// Make sure no results are displayed
	$('.resultrow').remove();
	
	// Get results
	/* First version, using SELECT
				var search_sparql = 'PREFIX pode: <http://www.bibpode.no/vocabulary#> ';
	search_sparql = search_sparql + 'PREFIX dct: <http://purl.org/dc/terms/>  ';
	search_sparql = search_sparql + 'PREFIX foaf: <http://xmlns.com/foaf/0.1/>  ';
	search_sparql = search_sparql + 'SELECT DISTINCT ?record ?responsibility ?title ?formatlabel ?issued ?langlabel WHERE {  ';
	search_sparql = search_sparql + '?record dct:source pode:dfb_fagposter ;  ';
	search_sparql = search_sparql + 'pode:ddkThird <http://www.bibpode.no/instance/DDK_' + id + '> . ';
	// Restrict by language if one is chosen from the document language pulldown menu
	if ($("#doc_lang_select option:selected").val() != '') {
		search_sparql = search_sparql + '?record dct:language <' + $("#doc_lang_select option:selected").val() + '> . ';	
	}
	search_sparql = search_sparql + 'OPTIONAL { ?record dct:title ?title . } ';
	search_sparql = search_sparql + 'OPTIONAL { ?record pode:responsibility ?responsibility . } ';
	search_sparql = search_sparql + 'OPTIONAL { ?record dct:issued ?issued . } ';
	search_sparql = search_sparql + 'OPTIONAL {  ';
	search_sparql = search_sparql + '  ?record dct:format ?format .  ';
	search_sparql = search_sparql + '  ?format rdfs:label ?formatlabel .  ';
	search_sparql = search_sparql + '} ';
	search_sparql = search_sparql + 'OPTIONAL {  ';
	search_sparql = search_sparql + '  ?record dct:language ?language . ';
	search_sparql = search_sparql + '  ?language rdfs:label ?langlabel .  ';
	search_sparql = search_sparql + '} ';
	search_sparql = search_sparql + 'FILTER langMatches( lang(?langlabel), "nb" )  ';
	search_sparql = search_sparql + '} GROUP BY ?record ORDER BY DESC(?issued) ?record ';
	// NOTE: Not quite sure what GROUP BY does here... Seems like records with multiple languages are only returned once
	// when "GROUP BY ?record" is included? Could it be used for names too? 
	*/
	
	// Second attempt, using DESCRIBE
	            var search_sparql = 'PREFIX bibo: <http://purl.org/ontology/bibo/> ';
	search_sparql = search_sparql + 'PREFIX dct: <http://purl.org/dc/terms/> ';
	search_sparql = search_sparql + 'PREFIX pode: <http://www.bibpode.no/vocabulary#> ';
	search_sparql = search_sparql + 'DESCRIBE ?record ?format ?creator ?language WHERE { ';
	search_sparql = search_sparql + '?record pode:ddkThird <http://www.bibpode.no/instance/DDK_' + id + '> . ';
	search_sparql = search_sparql + '?record dct:format ?format . ';
	search_sparql = search_sparql + 'OPTIONAL { ?record dct:creator ?creator . } ';
	// search_sparql = search_sparql + 'OPTIONAL { ?record bibo:editor ?editor . } ';
	// search_sparql = search_sparql + 'OPTIONAL { <' + c + '> dct:publisher ?publisher . } ';
	// search_sparql = search_sparql + 'OPTIONAL { <' + c + '> pode:publicationPlace ?publicationPlace . } ';
	// search_sparql = search_sparql + 'OPTIONAL { <' + c + '> dct:subject ?subject . } ';
	search_sparql = search_sparql + 'OPTIONAL { ?record dct:language ?language . } ';
	search_sparql = search_sparql + '} ';
	
	var search_url = 'http://bibpode.no/rdfstore/endpoint.php?query=' + escape(search_sparql) + '&output=json&jsonp=?';
	var params = { 'output': 'json' };
	
	// $('#debug').append('<br /><br />' + search_url);

	$.getJSON(search_url, params, function(json, status) {
		if (json){
			// Make sure the results-table is displayed
			$('#searchresults').show();
			var c = 1;
			$.each(json, function(i, n) {
				alert(i + n);
				var item = json[i];
				$('#searchresults').append('<tr onClick="show_details(\'' + "item.record.value" + '\');" class="resultrow" id="resultrow' + i  + '" title="' + "item.record.value" + '"></tr>');
				$('#resultrow' + i).append('<td>' + c + '</td>');
				if (item['http://purl.org/dc/terms/title']) {
					var html = '<td>';
					$.each(item['http://purl.org/dc/terms/title'], function(i, n) {
						if (item['http://purl.org/dc/terms/title'][i].value != " ") {
							html = html + item['http://purl.org/dc/terms/title'][i].value + ' ';
						}
					});
					html = html + '</td>';
					$('#resultrow' + i).append(html);
				} else {
					$('#resultrow' + i).append('<td></td>');
				}
				/*
				if (item.responsibility) {
					$('#resultrow' + i).append('<td>' + item.responsibility.value + '</td>');
				} else {
					$('#resultrow' + i).append('<td></td>');
				} 
				if (item.formatlabel) {
					$('#resultrow' + i).append('<td>' + item.formatlabel.value + '</td>');
				}else {
					$('#resultrow' + i).append('<td></td>');
				}
				if (item.issued) {
					$('#resultrow' + i).append('<td>' + item.issued.value + '</td>');
				}else {
					$('#resultrow' + i).append('<td></td>');
				}
				if (item.langlabel) {
					$('#resultrow' + i).append('<td>' + item.langlabel.value + '</td>');
				}else {
					$('#resultrow' + i).append('<td></td>');
				}
				*/
				c = c + 1;
			});
			$('#searchresults').show();
		} else {
			alert('Something went wrong...');
		}
	});

	
}

function notation2concept(notation) {
	
	// This might be "503" or "[504]", so remove any brackets
	notation = notation.replace("[", "");
	notation = notation.replace("]", "");
	return notation;
	
}

function get_counts() {
	
	$('.waitingforcount').each(function(index) {
    	var c = $(this).text();
    	var id = $(this).attr('id');
    	
    	// Determine which level we are looking for
    	var level = 'Third';
		if (c.length == 1) {
			level = 'First';
		}
		if (c.length == 2) {
			level = 'Second';
		}
		
		// Note: COUNT() is part of what ARC calls SPARQL+, not a part of the official SPARQL standard
		// http://arc.semsol.org/docs/v2/sparql+
				   var count_sparql = 'PREFIX pode: <http://www.bibpode.no/vocabulary#> ';
		count_sparql = count_sparql + 'PREFIX dct: <http://purl.org/dc/terms/> ';
		count_sparql = count_sparql + 'SELECT COUNT(?record) AS ?count WHERE { ';
		count_sparql = count_sparql + '?record pode:ddk' + level + ' <http://www.bibpode.no/instance/DDK_' + c + '> . ';
		if ($("#doc_lang_select option:selected").val() != '') {
			count_sparql = count_sparql + '?record dct:language <' + $("#doc_lang_select option:selected").val() + '> . ';
		}
		count_sparql = count_sparql + '} ';
		
		var count_url = 'http://bibpode.no/rdfstore/endpoint.php?query=' + escape(count_sparql) + '&output=json&jsonp=?';
		var params = { 'output': 'json' };
		
		// $('#debug').append('<br /><br />' + search_url);
	
		$.getJSON(count_url, params, function(json, status) {
			if (json.results.bindings[0].count.value){
				$('#' + id).empty().append(' (' + json.results.bindings[0].count.value + ')');
				// Make sure this concept is not counted again
				$('#' + id).removeClass('waitingforcount');
				// Give it the right class
				$('#' + id).addClass('count');
				// $('#debug').append(' ' + json.results.bindings[0].count.value);
				// alert($(this).attr('id') + ' ' + json.results.bindings[0].count.value);
			} else {
				alert('Something went wrong...');
			}
		});
		
    });

}

function update_counts() {
	
	// Empty the containers
	$('.count').each(function(index) {
		$(this).empty();
	});
	
	// Fill them with new counts
	$('.count').each(function(index) {
    	var notation = $(this).siblings('.notation').text();
    	var id = $(this).attr('id');
    	var level = 'Third';
    	notation = notation2concept(notation);
    	if ($(this).parent().attr('class') == 'concept1') {
    		notation = notation.substring(0,1);
    		level = 'First';
    	} else if ($(this).parent().attr('class') == 'concept2') {
    		notation = notation.substring(0,2);
    		level = 'Second';
    	} else if ($(this).parent().attr('class') == 'concept3') {
    		notation = notation.substring(0,3);
    	}
   		
		// Note: COUNT() is part of what ARC calls SPARQL+, not a part of the official SPARQL standard
		// http://arc.semsol.org/docs/v2/sparql+
				   var count_sparql = 'PREFIX pode: <http://www.bibpode.no/vocabulary#> ';
		count_sparql = count_sparql + 'PREFIX dct: <http://purl.org/dc/terms/> ';
		count_sparql = count_sparql + 'SELECT COUNT(?record) AS ?count WHERE { ';
		count_sparql = count_sparql + '?record pode:ddk' + level + ' <http://www.bibpode.no/instance/DDK_' + notation + '> . ';
		count_sparql = count_sparql + '?record dct:language <' + $("#doc_lang_select option:selected").val() + '> . } ';
		
		var count_url = 'http://bibpode.no/rdfstore/endpoint.php?query=' + escape(count_sparql) + '&output=json&jsonp=?';
		var params = { 'output': 'json' };
		
		$.getJSON(count_url, params, function(json, status) {
			if (json.results.bindings[0].count.value){
				$('#' + id).text(' (' + json.results.bindings[0].count.value + ')');
			} else {
				alert('Something went wrong...');
			}
		});
		
    });
    // Update the list of results
    showResults($('#concepts3 .chosenconcept').siblings('.notation').text(), '0') 

}

function show_details(c) {
	
	// Get the data
	/* First attempt
			    var detail_sparql = 'PREFIX pode: <http://www.bibpode.no/vocabulary#> ';
	detail_sparql = detail_sparql + 'PREFIX bibo: <http://purl.org/ontology/bibo/> ';
	detail_sparql = detail_sparql + 'PREFIX dct: <http://purl.org/dc/terms/> ';
	detail_sparql = detail_sparql + 'PREFIX foaf: <http://xmlns.com/foaf/0.1/> ';
	detail_sparql = detail_sparql + 'PREFIX geo: <http://www.geonames.org/ontology#> ';
	detail_sparql = detail_sparql + 'SELECT DISTINCT * WHERE { ';
	detail_sparql = detail_sparql + '<' + c + '> dct:title ?title . ';
	detail_sparql = detail_sparql + 'OPTIONAL { <' + c + '> bibo:isbn ?isbn . } ';
	detail_sparql = detail_sparql + 'OPTIONAL { <' + c + '> bibo:isbn13 ?isbn13 . } ';
	detail_sparql = detail_sparql + 'OPTIONAL { <' + c + '> pode:location ?location . } ';
	detail_sparql = detail_sparql + 'OPTIONAL { <' + c + '> pode:responsibility ?responsibility . } ';
	detail_sparql = detail_sparql + 'OPTIONAL { <' + c + '> dct:issued ?issued . } ';
	detail_sparql = detail_sparql + 'OPTIONAL { <' + c + '> dct:description ?description . } ';
	detail_sparql = detail_sparql + 'OPTIONAL { <' + c + '> pode:physicalDescription ?physicalDescription . } ';
	detail_sparql = detail_sparql + 'OPTIONAL { <' + c + '> dct:publisher ?publisher . ?publisher foaf:name ?publishername . } ';
	// Multiple values
	// Cf: DESCRIBE <http://www.bibpode.no/instance/Oslo>
	// detail_sparql = detail_sparql + 'OPTIONAL { <' + c + '> pode:publicationPlace ?publicationPlace . ?publicationPlace geo:name ?publicationPlaceName . } ';
	detail_sparql = detail_sparql + '} ';
	*/
	
	            var detail_sparql = 'PREFIX bibo: <http://purl.org/ontology/bibo/> ';
	detail_sparql = detail_sparql + 'PREFIX dct: <http://purl.org/dc/terms/> ';
	detail_sparql = detail_sparql + 'PREFIX pode: <http://www.bibpode.no/vocabulary#> ';
	detail_sparql = detail_sparql + 'DESCRIBE <' + c + '> ?format ?creator ?editor ?publisher ?publicationPlace ?subject ?language WHERE { ';
	detail_sparql = detail_sparql + '<' + c + '> dct:format ?format . ';
	detail_sparql = detail_sparql + 'OPTIONAL { <' + c + '> dct:creator ?creator . } ';
	detail_sparql = detail_sparql + 'OPTIONAL { <' + c + '> bibo:editor ?editor . } ';
	detail_sparql = detail_sparql + 'OPTIONAL { <' + c + '> dct:publisher ?publisher . } ';
	detail_sparql = detail_sparql + 'OPTIONAL { <' + c + '> pode:publicationPlace ?publicationPlace . } ';
	detail_sparql = detail_sparql + 'OPTIONAL { <' + c + '> dct:subject ?subject . } ';
	detail_sparql = detail_sparql + 'OPTIONAL { <' + c + '> dct:language ?language . } ';
	detail_sparql = detail_sparql + '} ';

	var detail_url = 'http://bibpode.no/rdfstore/endpoint.php?query=' + escape(detail_sparql) + '&output=json&jsonp=?';
	var params = { 'output': 'json' };
	var html = '';
		
	$.getJSON(detail_url, params, function(json, status) {
		if (json){
			html = '';
			// Show the Dewey breadcrumbs 
			html = html + '<p>';
			var ccount = 0;
			$('.chosenconcept').each(function(index) {
				html = html + $(this).text();
				if (ccount < 2) {
					html = html + " > ";
				}
				ccount = ccount + 1;
			});
 			html = html + '</p>';
			// Build the detail display
			if (json[c]['http://purl.org/dc/terms/title']) {
				html = html + '<h2>';
				$.each(json[c]['http://purl.org/dc/terms/title'], function(i, n) {
					if (json[c]['http://purl.org/dc/terms/title'][i].value != " ") {
						html = html + json[c]['http://purl.org/dc/terms/title'][i].value + ' ';
					}
				});
				html = html + '</h2>';
			}
			if (json[c]['http://www.bibpode.no/vocabulary#subtitle']) {
				html = html + '<p class="subtitle">Undertittel: ' + json[c]['http://www.bibpode.no/vocabulary#subtitle'][0].value + '</p>';
			}
			// Insert a cover, if we have an ISBN
			if (json[c]['http://purl.org/ontology/bibo/isbn']) {
				html = html + '<div id="cover"><img src="image.php?isbn=' + json[c]['http://purl.org/ontology/bibo/isbn'][0].value + '" title="Cover" alt="Cover" id="coverimage" /></div>';
			} else if (json[c]['http://purl.org/ontology/bibo/isbn13']) {
				html = html + '<div id="cover"><img src="image.php?isbn=' + json[c]['http://purl.org/ontology/bibo/isbn13'][0].value + '" title="Cover" alt="Cover" id="coverimage" /></div>';
			}
			html = html + '<table>';
			// Creators
			if (json[c]['http://purl.org/dc/terms/creator']) {
				html = html + '<tr><td>Forfatter(e):</td><td>';
				$.each(json[c]['http://purl.org/dc/terms/creator'], function(i, n) {
					var uri_from_record = json[c]['http://purl.org/dc/terms/creator'][i].value;
					html = html + json[uri_from_record]['http://xmlns.com/foaf/0.1/name'][0].value + '; ';
				});
				html = html + '</td></tr>';
			}
			// Editors
			if (json[c]['http://purl.org/ontology/bibo/editor']) {
				html = html + '<tr><td>Redaktør(er):</td><td>';
				$.each(json[c]['http://purl.org/ontology/bibo/editor'], function(i, n) {
					var uri_from_record = json[c]['http://purl.org/ontology/bibo/editor'][i].value;
					html = html + json[uri_from_record]['http://xmlns.com/foaf/0.1/name'][0].value + '; ';
				});
				html = html + '</td></tr>';
			}
			// "Responsibility"
			// if (json[c]['http://www.bibpode.no/vocabulary#responsibility']) {
			// 	html = html + '<tr><td valign="top">Ansvar:</td><td>' + json[c]['http://www.bibpode.no/vocabulary#responsibility'][0].value + '</td></tr>';
			// }
			// Language
			if (json[c]['http://purl.org/dc/terms/language']) {
				html = html + '<tr><td>Språk:</td><td>';
				$.each(json[c]['http://purl.org/dc/terms/language'], function(i, n) {
					var uri_from_record = json[c]['http://purl.org/dc/terms/language'][i].value;
					// Loop through all the labels for the language, looking for Norwegian bokmål
					$.each(json[uri_from_record]['http://www.w3.org/2000/01/rdf-schema#label'], function(i, n) {
						if (json[uri_from_record]['http://www.w3.org/2000/01/rdf-schema#label'][i].lang == 'nb') {
							html = html + json[uri_from_record]['http://www.w3.org/2000/01/rdf-schema#label'][i].value + '; ';
						}
					});
				});
				html = html + '</td></tr>';
			}
			// Publication place
			if (json[c]['http://www.bibpode.no/vocabulary#publicationPlace']) {
				html = html + '<tr><td>Publiseringssted:</td><td>';
				var uri_from_record = json[c]['http://www.bibpode.no/vocabulary#publicationPlace'][0].value;
				html = html + json[uri_from_record]['http://www.geonames.org/ontology#name'][0].value;
				html = html + '</td></tr>';
			}
			// Publisher
			if (json[c]['http://purl.org/dc/terms/publisher']) {
				html = html + '<tr><td>Utgiver:</td><td>';
				var uri_from_record = json[c]['http://purl.org/dc/terms/publisher'][0].value;
				html = html + json[uri_from_record]['http://xmlns.com/foaf/0.1/name'][0].value;
				html = html + '</td></tr>';
			}
			// Issued (year)
			if (json[c]['http://purl.org/dc/terms/issued']) {
				html = html + '<tr><td>Utgivelsesår: </td><td>' + json[c]['http://purl.org/dc/terms/issued'][0].value + '</td></tr>';
			}
			// Physical description
			if (json[c]['http://www.bibpode.no/vocabulary#physicalDescription']) {
				html = html + '<tr><td>Fysisk beskrivelse:</td><td>';
				$.each(json[c]['http://www.bibpode.no/vocabulary#physicalDescription'], function(i, n) {
					html = html + json[c]['http://www.bibpode.no/vocabulary#physicalDescription'][i].value + '; ';
				});
				html = html + '</td></tr>';
			}
			// Subjects
			if (json[c]['http://purl.org/dc/terms/subject']) {
				html = html + '<tr><td>Emne(r):</td><td>';
				$.each(json[c]['http://purl.org/dc/terms/subject'], function(i, n) {
					var uri_from_record = json[c]['http://purl.org/dc/terms/subject'][i].value;
					html = html + json[uri_from_record]['http://www.w3.org/2004/02/skos/core#prefLabel'][0].value + '; ';
				});
				html = html + '</td></tr>';
			}
			// ISBN
			if (json[c]['http://purl.org/ontology/bibo/isbn']) {
				html = html + '<tr><td>ISBN: </td><td>' + json[c]['http://purl.org/ontology/bibo/isbn'][0].value + '</td></tr>';
			}
			// ISBN13
			if (json[c]['http://purl.org/ontology/bibo/isbn13']) {
				html = html + '<tr><td>ISBN13:</td><td>' + json[c]['http://purl.org/ontology/bibo/isbn13'][0].value + '</td></tr>';
			}
			// Location
			if (json[c]['http://www.bibpode.no/vocabulary#location']) {
				html = html + '<tr><td>Hylleplass:</td><td>' + json[c]['http://www.bibpode.no/vocabulary#location'][0].value + '</td></tr>';
			}
			html = html + '</table>';
			// Description
			if (json[c]['http://purl.org/dc/terms/description']) {
				html = html + '<h3>Beskrivelse</h3>'
				$.each(json[c]['http://purl.org/dc/terms/description'], function(i, n) {
					html = html + '<p>' + json[c]['http://purl.org/dc/terms/description'][i].value + '</p>';
				});
			}
			// URI
			html = html + '<p>URI: ' + json[c]['http://purl.org/ontology/bibo/uri'][0].value + '</p>';
			// Dsiplay the data
			dialog.html(html).dialog('open');
		} else {
			alert('Something went wrong...');
		}
	});
	
}