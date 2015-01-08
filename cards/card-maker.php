#!/usr/bin/php
<?php
/**
 * Ahungry Tactics - Free as in Freedom multiplayer tactics/TCG game
 * Copyright (C) 2013 Matthew Carter
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

require_once('../ini/tactics.inc.php');

try {
	$r = lazy::q('card');
	foreach($r as $c) {
		$e = lazy::q('effects', ['id' => $c['effect']]);
		card_maker(
			$c['name'], 
			!empty($e) ? $e[0]['name'].': '.$e[0]['body'] : 'A standard move',
			$c['atk'], 
			$c['cost'], 
			$c['min_range'], 
			$c['max_range'],
			$c['phy'],
			$c['mag']
		);
	}
} catch (Exception $e) {
	echo $e->getMessage();
}

function card_maker($name, $desc, $atk, $cost, $min, $max, $phy, $mag) {
	switch(true) {
	case $phy == 1 && $mag == 1:
		$base = 'card_pm.png';
		break;
	case $phy == 1:
		$base = 'card.png';
		break;
	case $mag == 1:
		$base = 'card_magic.png';
		break;
	default:
		$base = 'card_util.png';
		break;
	}

	$base = './base_cards/'.$base;

	$out  = strtolower(preg_replace('/\s/', '', $name));

	switch(true) {
	case $atk < 0:
		$color = 'lime';
		break;
	case $atk == 0:
		$color = 'white';
		break;
	default:
		$color = 'red';
		break;
	}

	//Over 30 chars on a line is too much
	$c = 0;
	$m = explode(' ', $desc);
	$msg[0] = '';
	foreach($m as $_) {
		if(strlen($msg[$c].$_) > 30) {
			$msg[++$c] = $_;
		} else {
			$msg[$c] .= ' '.$_;
		}
	}
	$name = ucwords($name);

	$cmd = <<<EOT
convert {$base} -fill white -pointsize 20 -annotate +5+30 "{$name}" \
EOT;
	$y = 300;
	foreach($msg as $m) {
		$cmd .= "\n\t-fill black -pointsize 16 -annotate +30+{$y} '{$m}' \\";
		$y += 16;
	}
	$atk = abs($atk);
	if($atk != 0) $cmd .= "\n-fill $color -annotate +60+430 '{$atk}' \\";
	$cmd .= <<<EOT

	-fill white -annotate +160+430 "{$cost}" \
	-annotate +250+430 "{$min} to {$max}" \
	./cards/{$out}.png
EOT;
	
	//Now do the image overlay
	if(file_exists('img/'.$out.'.png')) {
		$over = $out;
	} else {
		echo "Missing image file for {$out}\n";
		$over = 'logo';
	}

	$cmd2 = <<<EOT
composite -compose Dst_Over -geometry 300x250+40+40 ./img/{$over}.png ./cards/{$out}.png ./cards/{$out}.png
EOT;
	$cmd3 = <<<EOT
composite -compose Dst_Over -geometry x450+0+0 ./img/marsh.jpg ./cards/{$out}.png ./cards/{$out}.png
EOT;
	shell_exec($cmd);
	shell_exec($cmd2);
	shell_exec($cmd3);
}
