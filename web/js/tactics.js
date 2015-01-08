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

//Vars
//Canvas
var tcan, can, ctx, events;

//Units
var units = [],
units_shadow = [],
xm = 0, ym = 0, cursor, turn_timer_t=1, turn_timer_c=1,
actions = [], lock_actions = false, move_value;

//Timing related
var last_now = 0, TRUE_FPS = 1, TURN_DELAY = 1000;

//Mouse related
var mouse_x = C_WID/2, mouse_y = C_HEI/2;

//Chat related
var chats = [];

//Moving related
var active_aid = null;

//Card related
var cards = [], hand = [], deck = [], deck_shadow = [], hand_size = 0;

//Job related
var jobs = [];

//Animation related
var animation_move_x = [];
var animation_move_y = [];
var pause_animation = -1;

//HUD Related
var kb = [
    'PgUp/Down: [zoom in/out]',
    'Left Click/M: [move to square]',
    'Righ Click/1-4: [ready/play card]',
    'wasd/mouse: [move target square]',
    'arrows: [pan camera]',
    'i (eye): [toggle menu]'
];

//Messages
var alert_message, alert_size;

var game_start_p = call_map_init_p = map_loaded_p = false;
var last_map_index, current_map_index = 0;

//Animations
var flip = 0;

//Backgrounds and some set graphics
var TILE_BACKGROUND   = 'backgrounds/sky.jpg',
SCENIC_BACKGROUND = 'backgrounds/marsh.jpg';

// Our various maps
var maps = [];
maps[0] = { tiles: [ 
    'dgggggggggggwgwgwgwggggggggggggggwgwgdddd0',
    'gddddgggggggwwwwggggggggggddddddddddddgggg',
    'ggggdgggggggwwwwggggggggggdgggggdddddggggg',
    'ggggdddddddddddddddddddddddggggggwwwwggggg',
    'ggggggggggggwwwwgggggggggggggggggwwwwggggg',
    'ggggggggggggwwwwgggggggggggggggggwwwwggggg',
    'ggggggggggggwwwwgggggggggggggggggwwwwggggg',
    'gggggggggggggggggggggggggggggggggwwwwggggg',
    'ggggggggggggwwwwgggggggggggggggggwwwwggggg',
    'ggggggggggggwwwwgggggggggggggggggwwwwggggg',
    'ggggggggggggwwwwgggggggggggggggggwwwwggggg',
    'ggggggggggggwwwwgggggggggggggggggwwwwggggg',
    'ggggggggggggwwwwgggggggggggggggggwwwwggggg',
    'ggggggggggggwwwwgggggggggggggggggwwwwggggg',
    'gggggggggggggggggggggggggggggggggwwwwggggg',
    'ggggggggggggwwwwgggggggggggggggggwwwwggggg',
    'ggggggggggggwwwwgggggggggggggggggwwwwggggg',
    'ggggggggggggwwwwgggggggggggggggggwwwwggggg',
    'ggggggggggggwwwwgggggggggggggggggwwwwggggg',
    'ggggggggggggwwwwgggggggggggggggggwwwwggggg',
    'ggggggggggggwwwwgggggggggggggggggwwwwggggg',
    'gggggggggggggggggggggggggggggggggwwwwggggg',
    'ggggggggggggwwwwgggggggggggggggggwwwwggggg',
    'ggggggggggggwwwwgggggggggggggggggwwwwggggg',
    'ggggggggggggwwwwgggggggggggggggggwwwwggggg',
    'ggggggggggggwwwwgggggggggggggggggwwwwggggg',
    'ggggggggggggwwwwgggggggggggggggggwwwwggggg',
    'ggggggggggggwwwwgggggggggggggggggwwwwggggg',
    'gggggggggggggggggggggggggggggggggwwwwggggg',
    'gggggggggggggwwwgggggggggggggggggggggggggg',
    'gggggggggggggggggggggggggggggggggggggggggg',
    'gggggggggggggggggggggggggggggggggggggggggg',
], zone_index: [ 1 ], bg: 'mad.jpg'}, // First slot corresponds to 0 in map etc.

maps[1] = { tiles: [
    '0wwwwwwwww',
    'wwwwwwwww1'
], zone_index: [ 0, 2 ], bg: 'mad.jpg'},

maps[2] = { tiles: [
    '0wwwwggggg',
    'gwwwwwwggg',
    'gwwwwggggg',
    'gwgwwwwggg',
    'wwgggggggg',
    'gwgggggggg',
    'wwgggggggg',
    'gwgggggggw',
], zone_index: [ 1 ], bg: 'mad.jpg'};

// Sets the tile source
var tiles = [ 'w', 'g' ];
tiles['w'] = new Image();
tiles['g'] = new Image();
tiles['z'] = new Image();
tiles['d'] = new Image();
tiles['w'].src = IMG_RESOURCE_LOCATION + 'backgrounds/water.png';
tiles['g'].src = IMG_RESOURCE_LOCATION + 'backgrounds/grass.png';
tiles['z'].src = IMG_RESOURCE_LOCATION + 'backgrounds/sky.jpg';
tiles['d'].src = IMG_RESOURCE_LOCATION + 'backgrounds/dirt.png';
function set_tile(x, y) {
    tile = tile_lookup(x, y) || tiles['g'];
    return tiles[tile];
}
 
function create_map() {
    ctx.clearRect(0, 0, C_WID*3, C_HEI*3);
    // Turn our text map into a real map then save it for later
    for(a = 0; a < M_WID; a++) { // Draw the tile lookups for everything
	for(b = 0; b < M_HEI; b++) {
	    tmp = set_tile(a, b);
	    if(typeof(tmp) == 'object') {
		ctx.drawImage(tmp, a * reso, b * reso * 2, reso, reso * 2);
	    } else {
		ctx.drawImage(tiles['z'], a * reso, b * reso * 2, reso, reso * 2);
	    }
	}
    }
    map_cache.src = can.toDataURL('image/png');//.replace('image/png', 'image/octet-stream');
    ctx.clearRect(0, 0, C_WID * 3, C_HEI * 3);
}

function reposition_unit(zp) {
    u = units[cursor.id];
    if(typeof(u) == 'undefined') {
	return;
    }
    // grab the zone lookup for current map index
    var zone_point;
    for(v in maps[current_map_index].zone_index) {
	if(maps[current_map_index].zone_index[v] == zp) {
	    zone_point = v;
	}
    }
    for(y in map_tiles) {
	for(x in map_tiles[y]) {
	    if(zone_point == map_tiles[y][x]) {
		x = x == 0 ? 1 : x - 1;
		x_dist = animation_move_x[u.id] - x * BLOCK;
		y_dist = animation_move_y[u.id] - y * BLOCK * 2;
		ROT_OFFSET_X = x_dist;
		ROT_OFFSET_Y = y_dist;
		units[cursor.id].x = x;
		units[cursor.id].y = y;
		animation_move_x[u.id] = x * BLOCK;
		animation_move_y[u.id] = y * BLOCK * 2;
		cursor.x = x;
		cursor.y = y;
		
		// Send this updated movement to server - update to just do on server
		socket.emit('zone-change', {
		    x: parseInt(x),
		    y: parseInt(y),
		    map_index: current_map_index,
		    unit_id: cursor.id
		});
		return;
	    }
	}
    }
}

var map_tiles, map_cache = new Image(), x_res, y_res, reso;
function map_init(tiles) {
    map_loaded_p = false;
    map_cache.src = null;
    M_WID = tiles[0].length;
    M_HEI = tiles.length;
    x_res = Math.floor(C_WID / M_WID);
    y_res = Math.floor(C_HEI / M_HEI / 2);
    reso = x_res > y_res ? y_res : x_res;
    map_tiles = tiles;
    create_map();
}
    
// Pull out a specific tile saved in our map_tiles var
function tile_lookup(x, y) {
    if(map_tiles && map_tiles[y] && map_tiles[y][x])
	return map_tiles[y][x];//slice(x, x + 1);
}

var ignore_keys = false;

function konsole(msg) {
    DEBUG && console.log(msg);
}

function action(x, y, a) {
    this.x = x;
    this.y = y;
    this.card = a;
}

//initialize
function init() {
    tcan = document.getElementById('tcan');
    if(tcan == null) return;

    $('#loading').show();
    setTimeout(function() {
	$('#loading').html('The server may be down at this time...<a href="/">go home</a>');
    }, 3000);

    can = document.createElement('canvas');
    tcan.appendChild(can);
    can.width = C_WID;
    can.height = C_HEI;
    can.style.background = '#000';

    ctx = can.getContext('2d');

    document.onkeydown = motion;
    document.onkeyup = smotion;
    document.onmousemove = moving;
    $(can).bind('click', function(event) {
	event.preventDefault();
	switch(event.which) {
	case 1:
	    setAction(active_aid ? active_aid : 1);
	    break;
	case 2:
	    reset_cursor_position();
	    break;
	}
    });

    $(can).bind('contextmenu', function(event) {
	event.preventDefault();
	setAction(0);
    });

    socket_start();
}

// shim layer with setTimeout fallback
window.requestAnimFrame = (function(){
    return  window.requestAnimationFrame   ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame    ||
        function( callback ){
            window.setTimeout(callback, 1000 / 60);
        };
})();

function reset_cursor_position() {
    cursor.x = units[cursor.id].x;
    cursor.y = units[cursor.id].y;
}

function init2() {
    $('#loading').fadeOut(300);
    intro();
    setTimeout(function() { 
	draw();
	//optional low FPS mode for debugging
	if(FPS < 5) {
	    TRUE_FPS = FPS;
	    setInterval(function() { draw(); }, 1000);
	} else {
	    window.requestAnimFrame(animator);
	    setInterval(function() { flip = ~flip; }, 500);
	}
    }, 1000);

    // Some game chat 
    $('#chat-box form').submit(function() {
	var chat = $('#chatter').val();
	$('#chatter').val('');
	$('#chatter').blur();
	$('#chat-box').hide();
	socket.emit('request-chat', { chat: chat, unit_id: cursor.id });
	return false;
    });
    $('#chatter').focus(function() {
	ignore_keys = true;
    });
    $('#chatter').blur(function() {
	ignore_keys = false;
    });
}

function animator(now) {
    TRUE_FPS = 1000 / (now - last_now);
    last_now = now;
    window.requestAnimFrame(animator);
    draw();
}

function intro() {
    help_messages = [
	'Controls -> Top right corner',
	'Menu -> Bottom left corner (click the plus)',
	'Mouse over a card to see it larger',
	'Left Click (or use 1 to 4) on a card to make it your active card',
	'Right click to play the card on a red square (or press 1 to 4)',
	'You can gain new cards, level up to different jobs and more!',
	'To chat with players, press ENTER',
	'(Hint: get to the top right corner for next zone - follow the path)',
	'<a href="#" onclick="intro();return false;">Could you repeat that?</a>'
	+ '<a href="#" onclick="$(\'#dialog-area\').slideToggle();return false;">Got it - thanks!</a><br>(use Spacebar to toggle dialog up or down)',
    ];
    dialog(help_messages, true, 'witch');
}
    
var dialog_counter = 0;
function dialog(msg, reset_dc, speaker) {
    if(reset_dc) {
	dialog_counter = 0;
    }
    if(speaker) {
	$('#speaker').attr({'src':IMG_RESOURCE_LOCATION + 'units/' + speaker + '.png'});
    }
    $('#dialog').html(msg[dialog_counter]);

    if(++dialog_counter + 1 > msg.length) return;

    setTimeout(function(c) {
	dialog(msg);
    }, 3000);
}

// Line the mouse cursor up with the grid
function moving(e) {
    var x = e.pageX - can.offsetLeft;
    var y = e.pageY - can.offsetTop;
    // This was fun to find (not really)
    cursor.x = Math.round((((y * .5 + x * .5) / X_SCALE) - (ROT_OFFSET_Y * .5 + ROT_OFFSET_X * .5))/BLOCK);
    cursor.y = Math.round((((y * 1.47 - x * .45) / Y_SCALE) - (ROT_OFFSET_Y * 1.47 - ROT_OFFSET_X * .45))/BLOCK/2);
    mouse_x = x;
    mouse_y = y;
}

// Check if a unit is in range of a panel
function inRange(min, max, sx, sy, dx, dy) {
    x = Math.abs(sx - dx);
    y = Math.abs(sy - dy);
    d = x + y;
    if(d > max || d < min) return false;
    return true;
}

// Send in an action to the server
function setAction(aid) {
    var act = cursor.ab[aid];

    if(aid != 0 && active_aid != aid) {
	active_aid = aid;
	$('#active-card .card-area').html(card_html(act)); // show on ui
	return;
    }

    if(typeof(act) == 'undefined') return;

    if(cursor.x > M_WID - 1 || cursor.y > M_HEI - 1 || cursor.x < 0 || cursor.y < 0 
       || !inRange(
	   act.min_range,
	   act.max_range,
	   units[cursor.id].x,
	   units[cursor.id].y,
	   cursor.x,
	   cursor.y)) {
	alert_message = 'Out of range'; 
	// save the failed move in a special area for drawing range
	return; 
    }

    if(lock_actions == true) {
	alert_message = 'Too soon!';
	return;
    }
    lock_actions = true;
    active_aid = null;

    var a = new action(cursor.x, cursor.y, act);

    actions[0] = a;

    socket.emit('set-action', { 
	x: a.x, 
	y: a.y, 
	card_id: parseInt(a.card.id), 
	unit_id: cursor.id,
	card_slot: aid - 1
    });
    socket.emit('request-hand', { unit_id: cursor.id });
    turn_timer_c = 0;
    run_turn_timer();
    $('#active-card .card-area').html('<img src="/img/cards/move.png" class="card">'); // show on ui
    active_aid = 0;
    if(aid != 0) {
	if(cards[a.card.id].atk > -1) {
	    $animate.set_state(cursor.id, 'attack');
	} else {
	    $animate.set_state(cursor.id, 'talk');
	}
	setTimeout(function() { $animate.set_state(cursor.id, 'idle'); }, 3000);
    }
}

function run_turn_timer() {
    turn_timer_t = TURN_DELAY / 50;
    turn_timer_c = 0;
    turn_timer_set();
    setTimeout(function() { 
	alert_message = 'Your turn is up again!';
	lock_actions = false;
    }, TURN_DELAY);
}


function turn_timer_set() {
    turn_timer_c++;
    if(turn_timer_c < turn_timer_t) {
	setTimeout(function() { turn_timer_set(); }, 50);
    }
}

//Big background
var big_background = document.createElement('img');
big_background.src = IMG_RESOURCE_LOCATION + SCENIC_BACKGROUND;

//Background
var tile_background = document.createElement('img');
tile_background.src = IMG_RESOURCE_LOCATION + TILE_BACKGROUND;

// Draw things (pretty important!)
function draw() {
    // approximate resolution to fit all blocks in our pre-emptive draw
    if(pause_animation) return;
    if(!map_cache.src) return;
    if(!map_loaded_p) return;
    if(call_map_init_p == true) {
	call_map_init_p = false;
	map_init(map_tiles);
	reposition_unit(last_map_index);
	big_background.src = IMG_RESOURCE_LOCATION + 'backgrounds/' + maps[current_map_index].bg;
	return;
    }

    ctx.clearRect(0, 0, C_WID, C_HEI);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, C_WID, C_HEI);

    //Big background
    //ctx.drawImage(big_background, 0, 0, C_WID, C_HEI);

    ctx.save();
    ctx.scale(X_SCALE, Y_SCALE);
    ctx.transform(1.5, .5, -.5, .5, ROT_OFFSET_X, ROT_OFFSET_Y);

    //Tile background
    //ctx.drawImage(tile_background, 0, 0, C_WID * BLOCK/reso, C_HEI);
    ctx.drawImage(map_cache, 0, 0, C_WID * (BLOCK/reso), C_HEI * (BLOCK/reso));

    drawRanges();
    drawCursor();
    drawPendingActs(false);
    draw_index_helper();
    ctx.restore();
    drawHUD();
    drawAlert(alert_message);
}

function drawRanges() {
    var x = parseInt(units[cursor.id].x);
    var y = parseInt(units[cursor.id].y);

    //Draw movement range
    if(0 && typeof(cursor) != 'undefined' && typeof(cursor.ab[0]) != 'undefined') {
	drawRange(
	    parseInt(cursor.ab[0].min_range), 
	    parseInt(cursor.ab[0].max_range), 
	    x,
	    y
	);
    }
    // draw active_aid card range
    if(typeof(cursor) != 'undefined' && typeof(cursor.ab[active_aid]) != 'undefined'
      && active_aid != 0) {
	drawRange(
	    parseInt(cursor.ab[active_aid].min_range), 
	    parseInt(cursor.ab[active_aid].max_range), 
	    x,
	    y,
	    '#ff0000'
	);
    } 
}

function drawCursor() {
    var x = parseInt(cursor.x) * BLOCK;
    var y = parseInt(cursor.y) * BLOCK * 2;

    //Panel
    ctx.fillStyle = RGB_CURS;
    ctx.fillRect(x, y, BLOCK, BLOCK*2);
}

function drawPendingActs() {
    for(act in actions) {
	a = actions[act];
	var x = parseInt(a.x) * BLOCK;
	var y = parseInt(a.y) * BLOCK * 2;

	ctx.save();
	ctx.translate(x, y);

	ctx.fillStyle = RGB_MOVE;
	ctx.fillRect(0, 0, BLOCK, BLOCK * 2);

	ctx.font = 'normal '+ (BLOCK) + 'px mono';
	ctx.fillStyle = RGB_TEXT;
	ctx.textAlign = 'center';
	ctx.textBaseline = 'bottom';
	ctx.fillText(a.card.name, 0, 0);

	var card = new Image();
	card.src = IMG_RESOURCE_LOCATION + 'cards/' + a.card.name.replace(/\s/, '') + '.png';
	ctx.drawImage(card, 0, 0, BLOCK, BLOCK * 2);

	ctx.restore();
    }
}

// Alert of any changes to our deck
function deck_diff() {
    if(deck_shadow.length == 0) return;
    if(deck.length == deck_shadow.length && deck[0] == deck_shadow[0]) return;
    if(deck.length < deck_shadow.length) {
	dialog_up('Lost a card!');
    } else {
	dialog_up('Got a card! <img src="/img/cards/'+cards[deck[0]].name.replace(/\s/, '')+'.png" style="height:150px;width:100px;" onmouseover="show_big_card(this)">');
    }
}

/** Run a diff on unit data between updates */
function unit_diff(unit_id) {
    var o = units_shadow[unit_id];
    var n = units[unit_id];

    if(typeof(o) == 'undefined') return;
    var hp, mp, xp, jp, job_id, level, msg;
    hp = n.hp - o.hp;
    mp = n.mp - o.mp;
    xp = n.xp - o.xp;
    jp = n.jp - o.jp;
    level = n.level - o.level;
    msg = '';
    if(hp > 0) msg += n.name + ' gained ' + hp + ' hp\n';
    if(hp < 0) msg += n.name + ' lost ' + Math.abs(hp) + ' hp\n';
    if(mp > 0) msg += n.name + ' gained ' + mp + ' mp\n';
    if(mp < 0) msg += n.name + ' lost ' + Math.abs(mp) + ' mp\n';
    if(xp > 0) msg += n.name + ' gained ' + xp + ' xp\n';
    if(jp > 0) msg += n.name + ' gained ' + jp + ' jp\n';
    if(level > 0) msg += n.name + ' gained ' + level + ' level!\n';
    $('#event-log').prepend(msg);
}

  
function drawRange(min, max, x, y, opt_color) {
    ctx.fillStyle = typeof(opt_color) != 'undefined' ? opt_color : RGB_RANGE;

    for(c = 0; c <= max; c++) {
	mmod = min - c;
	if(mmod < 0) mmod = 0;

	ctx.fillRect(
	    (x + mmod) * BLOCK, 
	    (y - c) * BLOCK * 2, 
	    (max - c + 1 - mmod) * BLOCK, 
	    BLOCK * 2
	);
	ctx.fillRect(
	    (x - mmod + 1) * BLOCK, 
	    (y - c) * BLOCK * 2, 
	    (max - c + 1 - mmod) * -BLOCK, 
	    BLOCK * 2
	);
	ctx.fillRect(
	    (x + mmod) * BLOCK, 
	    (y + c) * BLOCK * 2, 
	    (max - c + 1 - mmod) * BLOCK, 
	    BLOCK * 2
	);
	ctx.fillRect(
	    (x - mmod + 1) * BLOCK, 
	    (y + c) * BLOCK * 2, 
	    (max - c + 1 - mmod) * -BLOCK, 
	    BLOCK * 2
	);
    }
}

function drawHUD() {
    ctx.save();

    ctx.translate(C_WID, 25);
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';

    ctx.font = 'bold '+ HUD_FONT_SIZE*1.3 + 'px mono';
    ctx.fillStyle = 'maroon';

    ctx.fillText('EMAIL matt@ahungry.com WITH FEEDBACK', 0, 0);
    ctx.translate(0, HUD_FONT_SIZE);

    //Show all our set skills
    x = 0;
    for(a in cursor.ab) {
	s = cursor.ab[a];
	if(typeof(s) != 'undefined' && typeof(s.name) != 'undefined') {
	    y = x == 0 ? 'm' : x;
	    msg = y + ': ['+s.name+']';
	    ctx.translate(0, HUD_FONT_SIZE*2.3);
	    ctx.fillText(msg, 0, 0, C_WID/2);
	    x++;
	}
    }

    //Keyboard controls
    for(k in kb) {
	ctx.translate(0, HUD_FONT_SIZE*2.3);
	ctx.fillText(kb[k], 0, 0, C_WID/2)
    }

    ctx.translate(0, HUD_FONT_SIZE*2.3);
    ctx.fillText('FPS: '+Math.round(TRUE_FPS)+'  ', 0,0,C_WID/2);

    //Active events and timings
    ctx.restore();
    ctx.save();

    turn_percent = Math.floor(100 * (turn_timer_c / turn_timer_t));

    ctx.translate(0, C_HEI - 150);
    ctx.fillStyle = 'rgba(0,0,0,.5)';
    ctx.fillRect(0, -10, (C_WID/2) + 30, 30);
    ctx.fillStyle = 'rgba(255,150,0,.8)';
    ctx.fillRect(0, 0, (C_WID/2) * turn_percent/100, 10);
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'left';
    ctx.font = 'normal ' + HUD_FONT_SIZE * 2 + 'px mono';
    ctx.fillText('Turn timer ('+turn_percent+'%/100%)', 0, 10, C_WID, 40);

    //Draw pending actions being done
    /**
    for(act in actions) {
	a = actions[act];

	ctx.save();
	ctx.translate(0, -245);

	var card = new Image();
	card.src = IMG_RESOURCE_LOCATION + 'cards/' + a.card.name.replace(/\s/,'') + '.png';
	ctx.drawImage(card, 0, 0, 150, 225);

	ctx.restore();
    }
    */

    ctx.restore();
}

function drawAlert(msg) {
    if(!msg) return;

    ctx.fillStyle = RGB_ALERT_BG;
    ctx.fillRect(0, 0, C_WID/1.40, ALERT_FONT_SIZE*1.5);

    ctx.save();

    ctx.translate(0, 0 + ALERT_FONT_SIZE);

    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';
    ctx.font = 'normal ' + ALERT_FONT_SIZE/2 + 'px mono';
    ctx.fillStyle = RGB_ALERT;

    ctx.fillText(msg, 0, 0, C_WID);

    ctx.restore();
}

var unit_img = document.createElement('img');
var inanimates = [
    { x: 5,  y: 5,  img: 'tree.png',  owner: -1, scale: 3, map_index: 0},
    { x: 9,  y: 5,  img: 'tree.png',  owner: -1, scale: 2, map_index: 0},
    { x: 20,  y: 3,  img: 'tree.png',  owner: -1, scale: 3, map_index: 0},
    { x: 5,  y: 17,  img: 'tree.png',  owner: -1, scale: 3, map_index: 0},
    { x: 9,  y: 9,  img: 'shrub.png', owner: -1, scale: 2, map_index: 0},
    { x: 13, y: 2,  img: 'tree.png',  owner: -1, scale: 3, map_index: 0},
    { x: 15, y: 9,  img: 'shrub.png', owner: -1, scale: 2, map_index: 0},
    { x: 25, y: 16, img: 'tree.png',  owner: -1, scale: 4, map_index: 0},
    { x: 9,  y: 17, img: 'tree.png',  owner: -1, scale: 2, map_index: 0},
    { x: 5,  y: 27, img: 'tree.png',  owner: -1, scale: 4, map_index: 0},
];

function drawUnits(y_index) {
    var combined = units.concat(inanimates);
    for(unit in combined) {
	u = combined[unit];

	if(parseInt(u.y) != y_index) continue;

	// Fog of war (don't draw units out of our range)
	var x = units[cursor.id].x;
	var y = units[cursor.id].y;
	if(!inRange(0, FOG_OF_WAR * 1.5, x, y, u.x, u.y)) continue;

	// If it isn't negative 1 then we can assume it is a unit
	if(parseInt(u.owner) == -1) {
	    draw_static_inanimate(u);
	} else {
	    draw_static_unit(u);
	}
	ctx.restore();
    }
}

function draw_static_unit(u) {
    ///if(u.map_index != current_map_index) return;
    color = (cursor.id == u.id) ? RGB_SELF : RGB_ENEM;

    var x = parseInt(u.x) * BLOCK; 
    var y = parseInt(u.y) * BLOCK * 2;

    // move increment needs velocity (distance/time) divided by fps
    x_move_increment = (BLOCK * 4) / TRUE_FPS;
    y_move_increment = x_move_increment;

    var x_to_go = Math.abs(x - animation_move_x[u.id]);
    if(x_to_go < x_move_increment) 
	x_move_increment = x_to_go;

    var y_to_go = Math.abs(y - animation_move_y[u.id]);
    if(y_to_go < y_move_increment) 
	y_move_increment = y_to_go;

    if(x_to_go > 0 || y_to_go > 0) {
	$animate.set_state(u.id, 'walk');
    } else if(u.id == cursor.id) {
	// Look up via the tile grid if our slot is a number
	var tile_type = tile_lookup(parseInt(u.x), parseInt(u.y))
	var new_zone_check = parseInt(tile_type);
	if(new_zone_check != NaN) {
	    new_map_index = maps[current_map_index].zone_index[new_zone_check];
	    if(typeof(maps[new_map_index]) != 'undefined') {
		last_map_index = current_map_index;
		current_map_index = new_map_index;
		call_map_init_p = true;
		map_tiles = maps[new_map_index].tiles;
	    }
	}
	if(tile_type == 'w') {
	    //dialog(['WATER!'], true);
	}
    }

    if(x < animation_move_x[u.id]
       || (x == animation_move_x[u.id] && y > animation_move_y[u.id])) {
	$animate.flip(u.id, 0);
    } else {
	$animate.flip(u.id, 1);
    }

    switch(true)
    {
    case (animation_move_x[u.id] < x):
	animation_move_x[u.id] += x_move_increment;
	if(u.id == cursor.id) {
	    ROT_OFFSET_X -= x_move_increment/1;
	    ROT_OFFSET_Y -= x_move_increment/2;
	}
	break;
    case (animation_move_x[u.id] > x):
	animation_move_x[u.id] -= x_move_increment;
	if(u.id == cursor.id) {
	    ROT_OFFSET_X += x_move_increment/1;
	    ROT_OFFSET_Y += x_move_increment/2;
	}
	break;
    case (animation_move_x[u.id] == x):
	break;
    default:
	animation_move_x[u.id] = 0;
	break;
    }
    switch(true)
    {
    case (animation_move_y[u.id] < y):
	animation_move_y[u.id] += y_move_increment;
	if(u.id == cursor.id) {
	    ROT_OFFSET_Y -= y_move_increment/2;
	    ROT_OFFSET_X += y_move_increment/2;
	}
	break;
    case (animation_move_y[u.id] > y):
	animation_move_y[u.id] -= y_move_increment;
	if(u.id == cursor.id) {
	    ROT_OFFSET_Y += y_move_increment/2;
	    ROT_OFFSET_X -= y_move_increment/2;
	}
	break;
    case (animation_move_y[u.id] == y):
	break;
    default:
	animation_move_y[u.id] = 0;
	break;
    }

    //Snap the temporary move position to valid grid sizes
    x = parseInt(animation_move_x[u.id]);
    y = parseInt(animation_move_y[u.id]);

    //Panel
    ctx.fillStyle = color;
    ctx.fillRect(x, y, BLOCK, BLOCK*2);

    ctx.save();

    //Draw fog of war
    if(cursor.id == u.id) {
	ctx.beginPath();
	ctx.fillStyle = '#000';
	ctx.moveTo(0,0);
	ctx.lineTo(0,M_HEI * BLOCK * 2);
	ctx.lineTo(M_WID * BLOCK,M_HEI*BLOCK*2);
	ctx.lineTo(M_WID*BLOCK,0);
    }

    //Image
    ctx.save();
    ctx.translate(x, y); // Translate to their location

    //Draw fog of war
    if(cursor.id == u.id) {
	fow = FOG_OF_WAR * BLOCK * 2;
	ctx.rect(-fow/2,-fow,fow,fow*2);
	//ctx.arc(0, 0, 300, 200, Math.PI * 2, true);
	ctx.fill();
    }

    ctx.restore();
    if(cursor.id == u.id) {
	ctx.beginPath();
	ctx.fillStyle = 'rgba(0,0,0,.4)';
	ctx.moveTo(0,0);
	ctx.lineTo(0,M_HEI * BLOCK * 2);
	ctx.lineTo(M_WID * BLOCK,M_HEI*BLOCK*2);
	ctx.lineTo(M_WID*BLOCK,0);
    }
    ctx.translate(x, y); // Translate to their location
    if(cursor.id == u.id) {
	fow = FOG_OF_WAR * BLOCK;
	ctx.rect(-fow/2,-fow,fow,fow*2);
	//ctx.arc(0, 0, 300, 200, Math.PI * 2, true);
	ctx.fill();
    }

    //Image

    ctx.transform(1.5, -1.5, 1.67, 5, 0, 0); // Transform back to upright non iso

    unit_img = document.createElement('img');
    var dx = -BLOCK/2.5,
    dy = -BLOCK/1.9,
    dw = BLOCK*.9,
    dh = BLOCK*.9;

    unit_img.src = IMG_RESOURCE_LOCATION + 'units/' + u.img;

    if(typeof($animate) != 'undefined') {
	var guy = $animate.get_unit(u.id);
	if(typeof(guy) == 'undefined' || guy == null) { // fall back to base image vs sheet
	    unit_img.src = unit_img.src.replace(/_sheet/, '');
	}
    }
    if(/_sheet/.test(unit_img.src)) { // Do the sprite sheet if we have it
	if(guy.flip == true) ctx.scale(-1, 1);
	ctx.drawImage(unit_img, guy.sx, guy.sy, guy.sw, guy.sh, dx, dy, dw, dh);
	if(guy.flip == true) ctx.scale(-1, 1);
    } else { // Otherwise show the static image with our flipping motion
	flip && ctx.scale(-1, 1);
	ctx.drawImage(unit_img, dx, dy, dw, dh);
	flip && ctx.scale(-1, 1);
    }

    ctx.font = 'bold '+ (BLOCK/8) + 'px monospace';
    ctx.fillStyle = RGB_TEXT;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(u.name+'('+u.hp+'hp/'+u.mp+'mp)', BLOCK/5.5, BLOCK/2.85);

    // Draw the last stat change 
    if(typeof(units_shadow[u.id]) != 'undefined') {
	ctx.font = 'bold ' + (BLOCK / 6) + 'px sans';
	hp = u.hp - units_shadow[u.id].hp;
	xp = u.xp - units_shadow[u.id].xp;
	level = u.level - units_shadow[u.id].level;
	if(hp < 0) {
	    ctx.fillStyle = 'red';
	    ctx.fillText(hp + 'hp', - BLOCK / 3, - BLOCK / 1.5);
	    $animate.set_state(u.id, 'hurt', 1000);
	}
	if(hp > 0) {
	    ctx.fillStyle = 'lime';
	    ctx.fillText('+' + hp + 'hp', - BLOCK / 3, - BLOCK / 1.5);
	    $animate.set_state(u.id, 'cheer', 1000);
	}
	if(xp > 0) {
	    ctx.fillStyle = 'yellow';
	    ctx.fillText('+' + xp + 'xp', BLOCK / 4, - BLOCK / 1.5);
	    $animate.set_state(u.id, 'attack');
	}
	if(level > 0) {
	    ctx.fillStyle = 'orange';
	    ctx.fillText('LEVEL UP! (' + u.level + ')', 0, - BLOCK);
	    $animate.set_state(u.id, 'cheer', 1000);
	}
    }

    // show unit chat text
    if(typeof(chats) != 'undefined' 
       && typeof(chats[u.id]) != 'undefined'
       && chats[u.id] != null) 
    {
	var text = chats[u.id].replace(/.*'(.*)'.*/, '$1');
	if(text.length > 0) {
	    var chat_font = 8;
	    ctx.font = 'italic '+chat_font+'px sans-serif';
	    ctx.fillStyle = 'rgba(0,0,0,.3)';
	    ctx.fillRect(BLOCK/2,-chat_font - 2,150,chat_font + 2);
	    ctx.textAlign = 'left';
	    ctx.fillStyle = '#fff';
	    ctx.fillText(text, BLOCK/2,0,150,chat_font);
	}
    }
}

function draw_static_inanimate(u) {
    // This is an inanimate object so do not animate it
    var x = parseInt(u.x) * BLOCK; 
    var y = parseInt(u.y) * BLOCK * 2;

    ctx.save();

    //Image
    ctx.translate(x, y);
    ctx.transform(1.5, -1.5, 1.67, 5, 0, 0);

    unit_img = document.createElement('img');

    //Very ghetto animation right now
    unit_img.src = IMG_RESOURCE_LOCATION + 'units/' + u.img;
    ctx.drawImage(
	unit_img,
	BLOCK / -2.5,
	BLOCK / -1.9 * u.scale,
	BLOCK * .9 * u.scale,
	BLOCK * .9 * u.scale);
}

function draw_index_helper() {
    // Draw x and y objects in proper index
    var maxx = 0, maxy = 0, max = 0;
    for(unit in units) {
	u = units[unit];
	if(parseInt(u.x) > maxx) maxx = parseInt(u.x);
	if(parseInt(u.y) > maxy) maxy = parseInt(u.y);
    }
    max = maxx > maxy ? maxx : maxy;
    for(var i = 0; i <= max; i++) {
	drawUnits(i);
    }
}

function moveCursor(dir) {
    switch(dir) {
    case 'left':
	cursor.x--;
	cursor.x < 0 && (cursor.x = M_WID - 1);
	break;
    case 'right':
	cursor.x++;
	cursor.x >= M_WID && (cursor.x = 0);
	break;
    case 'up':
	cursor.y--;
	cursor.y < 0 && (cursor.y = M_HEI - 1);
	break;
    case 'down':
	cursor.y++;
	cursor.y >= M_HEI && (cursor.y = 0);
	break;
    default:
	break;
    }
}

function dialog_up(msg) {
    $('#dialog-area').show();
    $('#dialog').html(msg);
    setTimeout(function() {
	$('#dialog-area').slideToggle();
    }, 3000);
}

function dialog_down() {
    $('#dialog-area').hide();
}

$('#dialog-area').click(function() { $(this).hide(); });

function moveMap(dir) {
    switch(dir) {
    case 'left':
	ROT_OFFSET_X+=100;
	break;
    case 'right':
	ROT_OFFSET_X-=100;
	break;
    case 'up':
	ROT_OFFSET_Y+=100;
	break;
    case 'down':
	ROT_OFFSET_Y-=100;
	break;
    default:
	break;
    }
}

function zoom(dir) {
    switch(dir) {
    case 'in':
	X_SCALE*=1.5;
	Y_SCALE*=1.5;
	break;
    case 'out':
	X_SCALE/=1.5;
	Y_SCALE/=1.5;
	break;
    default:
	break;
    }
}

function motion(e) {
    if(ignore_keys === true) return;
    var key = (window.event) ? event.keyCode : e.keyCode;
    switch(key) {   
    case 82: //r key
	reset_cursor_position();
	break;
    case 13: //enter key
	$('#chat-box').show();
	setTimeout(function() { $('#chatter').focus(); }, 100);
	break;
    case 32: //spacebar
	$('#dialog-area').slideToggle();
	break;
    case 33: //Page up
	zoom('in');
	break;
    case 34: //Page down
	zoom('out');
	break;
    case 37: //Left
	moveMap('left');
	break;
    case 38: //Up
	moveMap('up');
	break;
    case 39: //Right
	moveMap('right');
	break;
    case 40: //Down
	moveMap('down');
	break;
    case 49: //1
	setAction(1);
	break;
    case 50: //2
	setAction(2);
	break;
    case 51: //3
	setAction(3);
	break;
    case 52: //4
	setAction(4);
	break;
    case 53: //5
	setAction(5);
	break;
    case 65: //a
	moveCursor('left');
	break;
    case 68: //d
	moveCursor('right');
	break;
    case 72: //h
	moveCursor('left');
	break;
    case 76: //l
	moveCursor('right');
	break;
    case 74: //j
	moveCursor('down');
	break;
    case 75: //k
	moveCursor('up');
	break;
    case 77: //m
	setAction(0); //move command
	break;
    case 83: //s
	moveCursor('down');
	break;
    case 85: //u
	//undo();
	break;
    case 87: //w
	moveCursor('up');
	break;
    case 73: //i
	pause_animation = ~pause_animation;
	menu_roller();
	break;
    default:
	break;
    }   
}

function smotion(e) {
    if(ignore_keys === true) return;
    var key = (window.event) ? event.keyCode : e.keyCode;
    switch(key) {   
    case 72: 
	xm = 0;
	break;
    case 74: 
	ym = 0;
	break;
    case 75: 
	ym = 0;
	break;
    case 76: 
	xm = 0;
	break;
    default:
	break;
    }   
}

function ajaxRequest(data, success, destination) {
    var httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = function() {
	if(httpRequest.readyState === 4) {
	    if(httpRequest.status === 200) {
		success(httpRequest.responseText);
	    }
	} else {
	    //konsole('RS: '+httpRequest.readyState);
	}
    }
    httpRequest.open('POST', 
		     !destination ? POST_TO_LOCATION : destination);
    httpRequest.setRequestHeader(
	'Content-type', 
	'application/x-www-form-urlencoded');
    httpRequest.send(data);
}

function card_html(card, hand_slot) {
    if(typeof(card) == 'undefined') return;
    return '<img src="/img/cards/'+card.name.replace(/\s/, '')+'.png" alt="'+card.id+'" class="card" onmouseover="show_big_card(this);" onclick="setAction('+hand_slot+');">';
}

function job_html(job) {
    if(typeof(job) == 'undefined') return;
    var html = '<img src="/img/units/'+
	job.name.replace(/\s/, '')+
	'.png" class="job" onclick="change_job('+job.id+')">';
    return html;
}

function change_job(job_id) {
    socket.emit('request-change-job', { unit_id: cursor.id, job_id: job_id });
}

function update_main_menu() {
    u = units[cursor.id];
    $('#unit-lvl b').html(u.level);
    $('#unit-hp b').html(u.hp);
    $('#unit-mp b').html(u.mp);
    $('#unit-atk b').html(u.atk);
    $('#unit-def b').html(u.def);
    $('#unit-mag b').html(u.mag);
    $('#unit-mdef b').html(u.mdef);
    $('#unit-speed b').html(u.speed);
    $('#unit-xp b').html(u.xp);
    $('#unit-jp b').html(u.jp);
    $('#unit-name').html(u.name);
    $('.unit-portrait').attr({'src':'/img/units/'+u.img.replace(/_sheet/, '')});
}

function give_card_to_player(card_id) {
    player_html = '';
    player_html += 'give to a player &raquo;<br>';
    for(unit in units) {
	u = units[unit];
	player_html += '<a class="player" href="#" onclick="giving_card('+
	    card_id+', '+u.id+');return false;"><img src="/img/units/'+u.img.replace(/_sheet/,'')+'">'+u.name+'</a>';
    }
    player_html += card_html(cards[card_id]);
    player_html += '<a class="player" href="#" onclick="giving_card('+card_id+', 0);return false;">delete this card</a>';
    $('#player-list').html(player_html);
    gctop = mouse_y;
    $('#player-list').fadeIn(300);
    if(mouse_y + $('#player-list').height() > C_HEI) gctop = C_HEI - $('#player-list').height();
    $('#player-list').css({'top':gctop+'px','left':mouse_x+'px','max-height':'100%'});
    if($('#player-list').height() > C_HEI * .9) {
	$('#player-list').css({'overflow-y':'scroll'});
    }
}

function giving_card(card_id, giving_to) {
    socket.emit('request-give-card', { unit_id: cursor.id, card_id: card_id, giving_to: giving_to });
}

var socket;
function socket_start() {

    //Start it up
    socket = io.connect(SOCKET_URL);
    socket.emit('request-signin', {});

    socket.on('start-game', function(data) {
	move_value = {
	    id: 0, atk:0, phy: 0, mag: 0, effect: 0,
	    min_range: 0,
	    max_range: MAX_MOVE,
	    cost: 0, name: 'move'
	};
	cursor = new Object();
	cursor.x = data.x;
	cursor.y = data.y;
	cursor.id = data.id;
	cursor.ab = [];
	cursor.ab[0] = move_value;
	socket.emit('join-game', { unit_id: cursor.id });
	socket.emit('request-cards', { unit_id: cursor.id });
	socket.emit('request-jobs', { unit_id: cursor.id });
	if(game_start_p === false) {
	    map_cache.onload = (function() { map_loaded_p = true});
	    current_map_index = data.map_index;
	    big_background.src = IMG_RESOURCE_LOCATION + 'backgrounds/' + maps[current_map_index].bg;
	    map_init(maps[current_map_index].tiles);
	    init2();
	    game_start_p = true;
	}
    });

    socket.on('request-cards', function(data) {
	for(c in data) {
	    if(data[c] !== null) {
		cards[data[c].id] = data[c];
	    }
	}
	socket.emit('request-hand', { unit_id: cursor.id });
	socket.emit('request-deck', { unit_id: cursor.id });
    });

    socket.on('request-hand', function(data) {
	hand = data.cards;
	var hand_string = '';
	hand_size = 0;
	cursor.ab = [];
	cursor.ab[0] = move_value;
	for(card in hand) {
	    c = cards[hand[card]];
	    // Put the cards in their real hand
	    cursor.ab[++hand_size] = c;
	}
	for(card = (hand_size - 1); card >= 0; card--) {
	    c = cards[hand[card]];
	    hand_string += card_html(c, card + 1);
	}
	$('#hand').html(hand_string);
    });

    socket.on('request-deck', function(data) {
	deck_shadow = deck;
	deck = data.cards;
	var deck_string = '';
	deck_size = 0;
	for(card in deck) {
	    c = cards[deck[card]];
	    deck_string += card_html(c);
	}
	$('#deck-info').html(deck_string);
	$('#deck-info .card').bind('contextmenu', function(event) {
	    event.preventDefault();
	    give_card_to_player($(this).attr('alt'));
	    return false;
	});
	deck_diff();
    });

    socket.on('request-jobs', function(data) {
	jobs = [];
	var job_string = '';
	for(job in data) {
	    if(data[job] !== null) {
		jobs[data[job].id] = data[job];
		job_string += job_html(data[job]);
	    }
	}
	$('#job-area').html(job_string);
    });

    socket.on('resync', function (data) {
	socket.emit('request-hand', { unit_id: cursor.id });
	socket.emit('request-jobs', { unit_id: cursor.id });
	socket.emit('request-deck', { unit_id: cursor.id });
	units_shadow = units.slice(); // Make a copy of array
	units = [];
	for(u in data) {
	    if(data[u] !== null) {
		if(!(data[u].owner == 0 && data[u].hp < 1)) {
		    units[data[u].id] = data[u];
		    unit_diff(data[u].id);
		    $animate.add_unit(data[u].id);
		}
	    }
	}
	update_main_menu();
    });

    socket.on('draw-card', function (data) {
	console.log(data);
    });

    //Check event log updates
    socket.on('event-log', function (data) {
	alert_message = data;
	$('#event-log').html(data.el + "\n" + $('#event-log').html());
    });

    //Handle errors
    socket.on('fatal-error', function (data) {
	alert('FATAL ERROR:'+data.err);
	window.location = '';
    });

    //Unit updates and events
    socket.on('update-unit', function (data) {
	units_shadow = units.slice();
	units[data.id] = data;
    });

    socket.on('request-chat', function (data) {
	chats[data.unit_id] = data.chat;
	//setTimeout(function() { chats[data.unit_id] = null }, CHAT_DELAY * 1000);
	$('#chat-log').prepend(data.chat+'<br>');
    });

    socket.on('deck-updated', function (data) {
	if(data.unit_id == cursor.id) {
	    socket.emit('request-deck', { unit_id: cursor.id });
	    dialog_up('New card! <img src="/img/cards/'+data.card_name.replace(/\s/, '')+'.png" style="height:300px;width:200px;" onmouseover="show_big_card(this);"> obtained!');
	}
    });

}

window.onload=setTimeout(function() { init(); }, 500);
