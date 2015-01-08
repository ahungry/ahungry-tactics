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

#Game settings
define('UPDATE_INTERVAL', 15);
define('SMALLEST_MAP', 19);
define('HP_REGEN', 1);
define('MP_REGEN', 5);
define('MAX_ACTIONS', 3);
define('DEFAULT_MOVE_RANGE', 3);
define('SIMULATE_AI', 1);

#Directory related
define('CLASSDIR', __DIR__.'/../classes/');

#Autoload classes as they are called
spl_autoload_register(function ($class) {
	require_once CLASSDIR.$class.'.class.php';
});

#Time zone
date_default_timezone_set('EST');

#PDO setup
#Define exception so PDO doesn't give our infos
function exception_handler($e) {
	die('Fatal exception');
}

set_exception_handler('exception_handler');

/** @var object $db Database connection - private! */
require_once('db_connection.inc.php');
//It should look like this however
//$db = new PDO('mysql:host=localhost;dbname=tactics', 'username', 'Password');
$db->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
