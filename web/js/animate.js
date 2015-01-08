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

/**
 * Run a function on an object to adjust its new positions and use
 * a sequence to pick which area on the sprite sheet to draw
 */
//animate(guy, {y: [0]}, anim_speed);
//ctx.drawImage(guy.img, guy.sx, guy.sy, guy.sw, guy.sh, dx, dy, dw, dh);
var $animate = {
    
    units: [],
    default_time: 1000,

    // Different animations
    get_sequence: function(which) {
	switch(which) {
	case 'attack':
	    return { x: [0,1,2,2,2,1,0], y: [1] };
	case 'walk':
	    return { x: [0,1,2,1,0,4,3,4], y: [4] };
	case 'hurt':
	    return { x: [0,1], y: [0] };
	case 'talk':
	    return { x: [0], y: [0,2,0,2] };
	case 'cheer':
	    return { x: [0,0,2], y: [2,0,0] };
	default:
	    return { x: [0], y:[2] };
	}
    },

    add_unit: function(unit_id) {
	if(typeof($animate.get_unit(unit_id)) == 'undefined'
	   || $animate.get_unit(unit_id) == null) {
	    $animate.units[unit_id] = {
		x_frame: 0,
		y_frame: 0,
		sx:      0,
		sy:      0,
		state:   'idle',
		flip:    0,
	    };
	    $animate.sprite_picker(unit_id, 0, 2);
	    $animate.animate(unit_id);
	}
    },

    get_unit: function(unit_id) {
	return $animate.units[unit_id];
    },

    set_state: function(unit_id, state, delay) {
	if(delay > 0) {
	    setTimeout(function() {
		if(state != $animate.units[unit_id].state) {
		    $animate.units[unit_id].x_frame = 0;
		    $animate.units[unit_id].y_frame = 0;
		}
		$animate.units[unit_id].state = state;
	    }, delay);
	} else {
	    if(state != $animate.units[unit_id].state) {
		$animate.units[unit_id].x_frame = 0;
		$animate.units[unit_id].y_frame = 0;
	    }
	    $animate.units[unit_id].state = state;
	}
    },

    flip: function(unit_id, flip) { //0 is no, 1 is yes
	$animate.units[unit_id].flip = flip;
    },

    animate: function(unit_id, speed) {
	var unit        = $animate.get_unit(unit_id);
	var sequence    = $animate.get_sequence(unit.state);
	var speed       = speed || $animate.default_time;
	var timeout     = 0;
	var timeout_inc = parseInt(speed / sequence.x.length);
	var x_frames    = sequence.x.length;
	var y_frames    = sequence.y.length;
	var x_index     = unit.x_frame || 0;
	var y_index     = unit.y_frame || 0;
	var x_seq       = sequence.x[x_index];
	var y_seq       = sequence.y[y_index];

	$animate.sprite_picker(unit_id, x_seq, y_seq);

	$animate.units[unit_id].x_frame++;
	$animate.units[unit_id].y_frame++;

	if(unit.x_frame >= x_frames) {
	    $animate.units[unit_id].x_frame = 0;
	}
	if(unit.y_frame >= y_frames) {
	    $animate.units[unit_id].y_frame = 0;
	}
	setTimeout(function() { $animate.animate(unit_id, speed); }, timeout_inc);
    },

    sprite_picker: function(unit_id, xs, ys, x, y) {
	var x = !x ? 50 : x;
	var y = !y ? 50 : y;

	$animate.units[unit_id].sx = x * xs;
	$animate.units[unit_id].sy = y * ys;
	$animate.units[unit_id].sw = x;
	$animate.units[unit_id].sh = y;
    }
};
