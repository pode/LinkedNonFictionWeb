<?php

/*

Copyright 2010 ABM-utvikling

This file is part of "Podes LinkedNonFictionWeb".

"Podes LinkedNonFictionWeb" is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

"Podes LinkedNonFictionWeb" is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with "Podes LinkedNonFictionWeb". If not, see <http://www.gnu.org/licenses/&gt;.

*/

if (!empty($_GET['lang2lexvo'])) {
	
	$sparql = 'PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
	PREFIX dct: <http://purl.org/dc/terms/>
	SELECT DISTINCT ?lang WHERE {
	?toplevel skos:hasTopConcept ?concept .
	?concept dct:language ?lang . 
	} ';
	
	$lang_url = 'http://dewey.info/sparql.php?query=' . urlencode($sparql) . '&output=json';
	
	$ch = curl_init($lang_url);
	//return the transfer as a string
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_FAILONERROR, true);
	// Get the contents of the page
	$data = curl_exec($ch);
	// close curl resource to free up system resources
	curl_close($ch);
	
	$data = json_decode($data);
	$out = array();
	
	foreach($data->results->bindings as $item) {
		$code = $item->lang->value;
		$lexvouri = code2lexvo($code);
		$langname = lexvo2name($code, $lexvouri);
		array_push($out, array(
			'code' => $code, 
			'lexvouri' => $lexvouri, 
			'langname' => $langname
		));
	}
	
	echo(json_encode($out));
		
}

/*
lexvo2name() takes two arguments: 
1. a two letter language code
2. a Lexvo URI
Returns: The language name designated by the two letter code, taken from the RDF file indicated by the URI
*/ 

function lexvo2name($code, $lexvouri) {
	
	// We need to massage the URL to get it in a format Lexvo likes
	$url = preg_replace('/\/id\//', '/data/', $lexvouri);
	$url = preg_replace('/lexvo/', 'www.lexvo', $url);
	
	// create curl resource
	$ch = curl_init($url);
	curl_setopt($ch, CURLOPT_HEADER, true);
	//return the transfer as a string
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_HTTPHEADER, array (
	       	"Accept: application/rdf+xml"
  	));
  	curl_setopt($ch, CURLOPT_FAILONERROR, true);
	// Get the contents of the page
	$rdf = curl_exec($ch);
	// close curl resource to free up system resources
	curl_close($ch); 
	
	// dewey.info uses "no" for Norwegian, the two letter code used in Lexvo is "nb" or "nn", so we translate to "nb"
	if ($code == 'no') {
		$code = 'nb';
	}
	
	preg_match('/<rdfs:label rdf:datatype="xsd:string" xml:lang="' . $code . '">(.*)</', $rdf, $match);
	return $match[1];
	
}

/* 
code2lexvo() takes a two letter language code as an argument, and returns a Lexvo URI. 
The mapping is taken from: http://www.lexvo.org/resources/lexvo-iso639-1.tsv
*/

function code2lexvo($c){
	
	$codes = array();
	$codes['aa'] = 'http://lexvo.org/id/iso639-3/aar';
	$codes['ab'] = 'http://lexvo.org/id/iso639-3/abk';
	$codes['ae'] = 'http://lexvo.org/id/iso639-3/ave';
	$codes['af'] = 'http://lexvo.org/id/iso639-3/afr';
	$codes['ak'] = 'http://lexvo.org/id/iso639-3/aka';
	$codes['am'] = 'http://lexvo.org/id/iso639-3/amh';
	$codes['an'] = 'http://lexvo.org/id/iso639-3/arg';
	$codes['ar'] = 'http://lexvo.org/id/iso639-3/ara';
	$codes['as'] = 'http://lexvo.org/id/iso639-3/asm';
	$codes['av'] = 'http://lexvo.org/id/iso639-3/ava';
	$codes['ay'] = 'http://lexvo.org/id/iso639-3/aym';
	$codes['az'] = 'http://lexvo.org/id/iso639-3/aze';
	$codes['ba'] = 'http://lexvo.org/id/iso639-3/bak';
	$codes['be'] = 'http://lexvo.org/id/iso639-3/bel';
	$codes['bg'] = 'http://lexvo.org/id/iso639-3/bul';
	$codes['bi'] = 'http://lexvo.org/id/iso639-3/bis';
	$codes['bm'] = 'http://lexvo.org/id/iso639-3/bam';
	$codes['bn'] = 'http://lexvo.org/id/iso639-3/ben';
	$codes['bo'] = 'http://lexvo.org/id/iso639-3/bod';
	$codes['br'] = 'http://lexvo.org/id/iso639-3/bre';
	$codes['bs'] = 'http://lexvo.org/id/iso639-3/bos';
	$codes['ca'] = 'http://lexvo.org/id/iso639-3/cat';
	$codes['ce'] = 'http://lexvo.org/id/iso639-3/che';
	$codes['ch'] = 'http://lexvo.org/id/iso639-3/cha';
	$codes['co'] = 'http://lexvo.org/id/iso639-3/cos';
	$codes['cr'] = 'http://lexvo.org/id/iso639-3/cre';
	$codes['cs'] = 'http://lexvo.org/id/iso639-3/ces';
	$codes['cu'] = 'http://lexvo.org/id/iso639-3/chu';
	$codes['cv'] = 'http://lexvo.org/id/iso639-3/chv';
	$codes['cy'] = 'http://lexvo.org/id/iso639-3/cym';
	$codes['da'] = 'http://lexvo.org/id/iso639-3/dan';
	$codes['de'] = 'http://lexvo.org/id/iso639-3/deu';
	$codes['dv'] = 'http://lexvo.org/id/iso639-3/div';
	$codes['dz'] = 'http://lexvo.org/id/iso639-3/dzo';
	$codes['ee'] = 'http://lexvo.org/id/iso639-3/ewe';
	$codes['el'] = 'http://lexvo.org/id/iso639-3/ell';
	$codes['en'] = 'http://lexvo.org/id/iso639-3/eng';
	$codes['eo'] = 'http://lexvo.org/id/iso639-3/epo';
	$codes['es'] = 'http://lexvo.org/id/iso639-3/spa';
	$codes['et'] = 'http://lexvo.org/id/iso639-3/est';
	$codes['eu'] = 'http://lexvo.org/id/iso639-3/eus';
	$codes['fa'] = 'http://lexvo.org/id/iso639-3/fas';
	$codes['ff'] = 'http://lexvo.org/id/iso639-3/ful';
	$codes['fi'] = 'http://lexvo.org/id/iso639-3/fin';
	$codes['fj'] = 'http://lexvo.org/id/iso639-3/fij';
	$codes['fo'] = 'http://lexvo.org/id/iso639-3/fao';
	$codes['fr'] = 'http://lexvo.org/id/iso639-3/fra';
	$codes['fy'] = 'http://lexvo.org/id/iso639-3/fry';
	$codes['ga'] = 'http://lexvo.org/id/iso639-3/gle';
	$codes['gd'] = 'http://lexvo.org/id/iso639-3/gla';
	$codes['gl'] = 'http://lexvo.org/id/iso639-3/glg';
	$codes['gn'] = 'http://lexvo.org/id/iso639-3/grn';
	$codes['gu'] = 'http://lexvo.org/id/iso639-3/guj';
	$codes['gv'] = 'http://lexvo.org/id/iso639-3/glv';
	$codes['ha'] = 'http://lexvo.org/id/iso639-3/hau';
	$codes['he'] = 'http://lexvo.org/id/iso639-3/heb';
	$codes['hi'] = 'http://lexvo.org/id/iso639-3/hin';
	$codes['ho'] = 'http://lexvo.org/id/iso639-3/hmo';
	$codes['hr'] = 'http://lexvo.org/id/iso639-3/hrv';
	$codes['ht'] = 'http://lexvo.org/id/iso639-3/hat';
	$codes['hu'] = 'http://lexvo.org/id/iso639-3/hun';
	$codes['hy'] = 'http://lexvo.org/id/iso639-3/hye';
	$codes['hz'] = 'http://lexvo.org/id/iso639-3/her';
	$codes['ia'] = 'http://lexvo.org/id/iso639-3/ina';
	$codes['id'] = 'http://lexvo.org/id/iso639-3/ind';
	$codes['ie'] = 'http://lexvo.org/id/iso639-3/ile';
	$codes['ig'] = 'http://lexvo.org/id/iso639-3/ibo';
	$codes['ii'] = 'http://lexvo.org/id/iso639-3/iii';
	$codes['ik'] = 'http://lexvo.org/id/iso639-3/ipk';
	$codes['io'] = 'http://lexvo.org/id/iso639-3/ido';
	$codes['is'] = 'http://lexvo.org/id/iso639-3/isl';
	$codes['it'] = 'http://lexvo.org/id/iso639-3/ita';
	$codes['iu'] = 'http://lexvo.org/id/iso639-3/iku';
	$codes['ja'] = 'http://lexvo.org/id/iso639-3/jpn';
	$codes['jv'] = 'http://lexvo.org/id/iso639-3/jav';
	$codes['ka'] = 'http://lexvo.org/id/iso639-3/kat';
	$codes['kg'] = 'http://lexvo.org/id/iso639-3/kon';
	$codes['ki'] = 'http://lexvo.org/id/iso639-3/kik';
	$codes['kj'] = 'http://lexvo.org/id/iso639-3/kua';
	$codes['kk'] = 'http://lexvo.org/id/iso639-3/kaz';
	$codes['kl'] = 'http://lexvo.org/id/iso639-3/kal';
	$codes['km'] = 'http://lexvo.org/id/iso639-3/khm';
	$codes['kn'] = 'http://lexvo.org/id/iso639-3/kan';
	$codes['ko'] = 'http://lexvo.org/id/iso639-3/kor';
	$codes['kr'] = 'http://lexvo.org/id/iso639-3/kau';
	$codes['ks'] = 'http://lexvo.org/id/iso639-3/kas';
	$codes['ku'] = 'http://lexvo.org/id/iso639-3/kur';
	$codes['kv'] = 'http://lexvo.org/id/iso639-3/kom';
	$codes['kw'] = 'http://lexvo.org/id/iso639-3/cor';
	$codes['ky'] = 'http://lexvo.org/id/iso639-3/kir';
	$codes['la'] = 'http://lexvo.org/id/iso639-3/lat';
	$codes['lb'] = 'http://lexvo.org/id/iso639-3/ltz';
	$codes['lg'] = 'http://lexvo.org/id/iso639-3/lug';
	$codes['li'] = 'http://lexvo.org/id/iso639-3/lim';
	$codes['ln'] = 'http://lexvo.org/id/iso639-3/lin';
	$codes['lo'] = 'http://lexvo.org/id/iso639-3/lao';
	$codes['lt'] = 'http://lexvo.org/id/iso639-3/lit';
	$codes['lu'] = 'http://lexvo.org/id/iso639-3/lub';
	$codes['lv'] = 'http://lexvo.org/id/iso639-3/lav';
	$codes['mg'] = 'http://lexvo.org/id/iso639-3/mlg';
	$codes['mh'] = 'http://lexvo.org/id/iso639-3/mah';
	$codes['mi'] = 'http://lexvo.org/id/iso639-3/mri';
	$codes['mk'] = 'http://lexvo.org/id/iso639-3/mkd';
	$codes['ml'] = 'http://lexvo.org/id/iso639-3/mal';
	$codes['mn'] = 'http://lexvo.org/id/iso639-3/mon';
	$codes['mr'] = 'http://lexvo.org/id/iso639-3/mar';
	$codes['ms'] = 'http://lexvo.org/id/iso639-3/msa';
	$codes['mt'] = 'http://lexvo.org/id/iso639-3/mlt';
	$codes['my'] = 'http://lexvo.org/id/iso639-3/mya';
	$codes['na'] = 'http://lexvo.org/id/iso639-3/nau';
	$codes['nb'] = 'http://lexvo.org/id/iso639-3/nob';
	$codes['nd'] = 'http://lexvo.org/id/iso639-3/nde';
	$codes['ne'] = 'http://lexvo.org/id/iso639-3/nep';
	$codes['ng'] = 'http://lexvo.org/id/iso639-3/ndo';
	$codes['nl'] = 'http://lexvo.org/id/iso639-3/nld';
	$codes['nn'] = 'http://lexvo.org/id/iso639-3/nno';
	$codes['no'] = 'http://lexvo.org/id/iso639-3/nor';
	$codes['nr'] = 'http://lexvo.org/id/iso639-3/nbl';
	$codes['nv'] = 'http://lexvo.org/id/iso639-3/nav';
	$codes['ny'] = 'http://lexvo.org/id/iso639-3/nya';
	$codes['oc'] = 'http://lexvo.org/id/iso639-3/oci';
	$codes['oj'] = 'http://lexvo.org/id/iso639-3/oji';
	$codes['om'] = 'http://lexvo.org/id/iso639-3/orm';
	$codes['or'] = 'http://lexvo.org/id/iso639-3/ori';
	$codes['os'] = 'http://lexvo.org/id/iso639-3/oss';
	$codes['pa'] = 'http://lexvo.org/id/iso639-3/pan';
	$codes['pi'] = 'http://lexvo.org/id/iso639-3/pli';
	$codes['pl'] = 'http://lexvo.org/id/iso639-3/pol';
	$codes['ps'] = 'http://lexvo.org/id/iso639-3/pus';
	$codes['pt'] = 'http://lexvo.org/id/iso639-3/por';
	$codes['qu'] = 'http://lexvo.org/id/iso639-3/que';
	$codes['rm'] = 'http://lexvo.org/id/iso639-3/roh';
	$codes['rn'] = 'http://lexvo.org/id/iso639-3/run';
	$codes['ro'] = 'http://lexvo.org/id/iso639-3/ron';
	$codes['ru'] = 'http://lexvo.org/id/iso639-3/rus';
	$codes['rw'] = 'http://lexvo.org/id/iso639-3/kin';
	$codes['sa'] = 'http://lexvo.org/id/iso639-3/san';
	$codes['sc'] = 'http://lexvo.org/id/iso639-3/srd';
	$codes['sd'] = 'http://lexvo.org/id/iso639-3/snd';
	$codes['se'] = 'http://lexvo.org/id/iso639-3/sme';
	$codes['sg'] = 'http://lexvo.org/id/iso639-3/sag';
	$codes['sh'] = 'http://lexvo.org/id/iso639-3/hbs';
	$codes['si'] = 'http://lexvo.org/id/iso639-3/sin';
	$codes['sk'] = 'http://lexvo.org/id/iso639-3/slk';
	$codes['sl'] = 'http://lexvo.org/id/iso639-3/slv';
	$codes['sm'] = 'http://lexvo.org/id/iso639-3/smo';
	$codes['sn'] = 'http://lexvo.org/id/iso639-3/sna';
	$codes['so'] = 'http://lexvo.org/id/iso639-3/som';
	$codes['sq'] = 'http://lexvo.org/id/iso639-3/sqi';
	$codes['sr'] = 'http://lexvo.org/id/iso639-3/srp';
	$codes['ss'] = 'http://lexvo.org/id/iso639-3/ssw';
	$codes['st'] = 'http://lexvo.org/id/iso639-3/sot';
	$codes['su'] = 'http://lexvo.org/id/iso639-3/sun';
	$codes['sv'] = 'http://lexvo.org/id/iso639-3/swe';
	$codes['sw'] = 'http://lexvo.org/id/iso639-3/swa';
	$codes['ta'] = 'http://lexvo.org/id/iso639-3/tam';
	$codes['te'] = 'http://lexvo.org/id/iso639-3/tel';
	$codes['tg'] = 'http://lexvo.org/id/iso639-3/tgk';
	$codes['th'] = 'http://lexvo.org/id/iso639-3/tha';
	$codes['ti'] = 'http://lexvo.org/id/iso639-3/tir';
	$codes['tk'] = 'http://lexvo.org/id/iso639-3/tuk';
	$codes['tl'] = 'http://lexvo.org/id/iso639-3/tgl';
	$codes['tn'] = 'http://lexvo.org/id/iso639-3/tsn';
	$codes['to'] = 'http://lexvo.org/id/iso639-3/ton';
	$codes['tr'] = 'http://lexvo.org/id/iso639-3/tur';
	$codes['ts'] = 'http://lexvo.org/id/iso639-3/tso';
	$codes['tt'] = 'http://lexvo.org/id/iso639-3/tat';
	$codes['tw'] = 'http://lexvo.org/id/iso639-3/twi';
	$codes['ty'] = 'http://lexvo.org/id/iso639-3/tah';
	$codes['ug'] = 'http://lexvo.org/id/iso639-3/uig';
	$codes['uk'] = 'http://lexvo.org/id/iso639-3/ukr';
	$codes['ur'] = 'http://lexvo.org/id/iso639-3/urd';
	$codes['uz'] = 'http://lexvo.org/id/iso639-3/uzb';
	$codes['ve'] = 'http://lexvo.org/id/iso639-3/ven';
	$codes['vi'] = 'http://lexvo.org/id/iso639-3/vie';
	$codes['vo'] = 'http://lexvo.org/id/iso639-3/vol';
	$codes['wa'] = 'http://lexvo.org/id/iso639-3/wln';
	$codes['wo'] = 'http://lexvo.org/id/iso639-3/wol';
	$codes['xh'] = 'http://lexvo.org/id/iso639-3/xho';
	$codes['yi'] = 'http://lexvo.org/id/iso639-3/yid';
	$codes['yo'] = 'http://lexvo.org/id/iso639-3/yor';
	$codes['za'] = 'http://lexvo.org/id/iso639-3/zha';
	$codes['zh'] = 'http://lexvo.org/id/iso639-3/zho';
	$codes['zu'] = 'http://lexvo.org/id/iso639-3/zul';
	
	return $codes[$c];
	
}

?>