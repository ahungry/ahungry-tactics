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

//Settings for the Tactics game - save sans example. prefix to use in files
//Globals
var
	SOCKET_URL            = 'http://tactics.ahungry.com:1038',
	SHOW_GRID             = false,  //Show unit tile grid or not
	DEBUG                 = true,   //Extra console.log output
	FPS                   = 1,     //Frames per second
	M_WID                 = 80,
	M_HEI                 = M_WID,
	C_WID                 = window.innerWidth * .99,
	C_HEI                 = window.innerHeight * .99,
	//BLOCK                 = (C_WID / M_WID) / 2,
	BLOCK                 = 50,
	UPDATE                = 15,
	ST_OFFSET             = 1,
	MSPEED                = 1,
	ROT_OFFSET_X          = C_WID/2,
	ROT_OFFSET_Y          = 300,
	Y_SCALE               = X_SCALE = .5,
	RGB_TIL1              = 'rgba(0, 0, 0, .2)',
	RGB_TIL2              = 'rgba(255, 255, 255, .2)',
	RGB_SELF              = 'rgba(0, 0, 255, .5)',
	RGB_ENEM              = 'rgba(255, 0, 0, .5)',
	RGB_CURS              = 'rgba(200, 200, 0, 1)',
	RGB_TEXT              = 'rgba(255, 255, 0, 1)',
	RGB_ALERT             = 'rgba(255, 0, 0, 1)',
	RGB_ALERT_BG          = 'rgba(0, 0, 0, .7)',
	RGB_MOVE              = 'rgba(246, 96, 255, .5)',
	RGB_RANGE             = 'rgba(0, 0, 200, .5)',
	RGB_ERR_FLASH         = 'rgba(255, 0, 0, .5)',
	MAX_ACT               = 3,
	HUD_FONT_SIZE         = 10,
	ALERT_FONT_SIZE       = 30,
	POST_TO_LOCATION      = '',     //The listening POST page on the server
	IMG_RESOURCE_LOCATION = '/img/', //Location where images will be served
	MAX_ANIMATED_UNITS    = 50,
	CHAT_DELAY            = 8
;
