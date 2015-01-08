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
?>
<!doctype html>
<html>
<head>
<title>Ahungry Tactics</title>
<meta name="description" value="Ahungry Tactics, an immersing blend of CCG/TCG, Tactics and MMORPGs!">
<meta name="keywords" value="ccg, tcg, tactics, ahungry, mmorpg">
<link href="/third_party/jquery-ui-1.10.0.custom/css/ui-darkness/jquery-ui-1.10.0.custom.min.css" rel="stylesheet" type="text/css" />
<link href="/css/splash.css" rel="stylesheet" type="text/css" />
<!--<link href="/css/splash.less" rel="stylesheet/less" type="text/css" />-->

<!--<script src="/third_party/less-1.3.3.min.js"></script>-->
<script src="/third_party/jquery-1.9.0.min.js"></script>
<script src="/third_party/jquery-ui-1.10.0.custom/js/jquery-ui-1.10.0.custom.min.js"></script>

<script type="text/javascript" src="/js/ui.js"></script>
</head>
<body>
<div id="blurb">
<h1>Ahungry Tactics</h1>
<p>
<a href="/play/">click here to try out the open alpha</a>
</p>
<p>
<a href="https://github.com/ahungry/ahungry-tactics">fork me on github!</a>
</p>
<p>
	Ahungry Tactics is a free to play multiplayer online game, that combines elements
of a few different game types:
</p>
<ul>
<li>
	Collectible/Trading Card Games (CCG/TCG) 
	<span class="little">(think of Magic the Gathering)</span>

</li>
<li>
	Tactics Games 
	<span class="little">(such as Final Fantasy Tactics, Tactics Ogre, Disgaea)</span>
</li>
<li>
	and MMORGPs 
	<span class="little">(ex., EverQuest, Ultima Online, World of Warcraft)</span>
</li>
</ul>
</div>
<div id="home-images">
	<img src="/img/cards/melee.png" class="card">
	<div id="units">
<?php
	foreach(glob('img/units/*png') as $unit) {
		printf('<img src="%s">', $unit);
	}
?>
	</div>
<a href="/img/tactics.png"><img src="/img/tactics.png" style="width:50%;margin:auto;"></a>
</div>
</body>
</html>
