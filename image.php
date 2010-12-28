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

$isbn = $_GET['isbn'];
$compact_isbn = str_replace('-', '', $isbn); 

// Sjekk om Bokkilden har noe
$imgurl = bokkilden($isbn);

// Dersom ikke $imgurl er satt nå bruker vi openlibrary som "siste utvei"
if (!$imgurl) {
	// Dersom openlibrary ikke har et cover for ISBNet vi ser etter sender de tilbake et lite, gjennomsiktig bilde. 
	$imgurl = "http://covers.openlibrary.org/b/isbn/{$compact_isbn}-M.jpg";
}

// Send en "redirect" til den URLen vi har funnet. 
header("Location: $imgurl");

/* FUNCTIONS */

function bokkilden($isbn) {
	
	// http://www.bokkilden.no/SamboWeb/partneradmin.do
	$xml = simplexml_load_file("http://partner.bokkilden.no/SamboWeb/partner.do?rom=MP&format=XML&uttrekk=2&pid=0&ept=3&xslId=117&antall=3&frisok_omraade=3&frisok_tekst={$isbn}&frisok_sortering=0");
	if ($xml->Produkt->BildeURL) {
		return $xml->Produkt->BildeURL;
	} else {
		return false;
	}
	
}

?>