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
 * Javascript blocky-paint.js program for making sprites
 *
 * Nice and simple, but gives everything needed for
 * snap to block style sprite drawing
 */

var png_save_data = null;

(function() {

	var BLOCK_SIZE = 10;
	var BLOCKS = 50;
	var mousedown = 0, x, y, settings, color, cursor_size = 1;

	var components = {

		init : function() {
			canvas = document.getElementById('blocky-paint');
			canvas.style.backgroundColor = '#444';
			canvas.height = BLOCK_SIZE * BLOCKS;
			canvas.width  = BLOCK_SIZE * BLOCKS;

			ctx = canvas.getContext('2d');

			//Add event listeners
			window.addEventListener('mousedown', components.click,  true);
			window.addEventListener('mouseup',   components.click,  true);
			window.addEventListener('mousemove', components.moving, true);

			document.getElementById('hex-color').addEventListener('change', components.hex_to_rgb, true);
			document.getElementById('colorpicker').addEventListener('mousemove', components.hex_to_rgb, true);
			document.getElementById('clear').addEventListener('mousedown', components.clear, true);
			document.getElementById('save').addEventListener('mousedown', components.save, true);

			settings = [
				document.getElementById('bp-color-R'),
				document.getElementById('bp-color-G'),
				document.getElementById('bp-color-B'),
				document.getElementById('bp-color-A'),
				document.getElementById('bp-cursor-size')
			];

			for(i in settings) {
				settings[i].addEventListener('change', components.set_settings, true);
			}

			components.set_settings();
			components.clear();
			setInterval(function() { components.set_settings(); }, 500);
		},

		in_range : function (c, min, max) {
			if(isNaN(c.value) || c.value.length == 0 || c.value < min) {
				c.value = min;
				return min;
			} else if(c.value > max) {
				c.value = max;
				return max;
			} else {
				return c.value;
			}
		},

		hex_to_rgb : function() {
			if(!mousedown) return;
			hex = document.getElementById('hex-color').value;
			for(i = 0; i < 3; i++) {
				ss = hex.substr(1 + i * 2, 2);
				settings[i].value = parseInt(ss, 16);
			}
			components.set_settings();
		},

		set_settings : function() {
			color = 'rgba(';
			for(i = 0; i < 4; i++) {
				v = components.in_range(settings[i], 0, i < 3 ? 255 : 100);
				color += i < 3 ? v : parseFloat(v / 100);
				color +=	i < 3 ? ',' : ')';
			}
			cursor_size = components.in_range(settings[4], 1, 10);
			console.log(color);
		},

		clear : function() {
			ctx.fillStyle = '#FF00FF';
			ctx.fillRect(0, 0, BLOCK_SIZE * BLOCKS, BLOCK_SIZE * BLOCKS);
		},

		draw_block : function(x, y) {
			if(x > BLOCK_SIZE * BLOCKS || y > BLOCK_SIZE * BLOCKS) return;
			console.log('x: ' + x + ' and : ' + BLOCK_SIZE * BLOCKS);
			bx = Math.floor(x / BLOCK_SIZE);
			by = Math.floor(y / BLOCK_SIZE);
			ctx.fillStyle = color;
			ctx.fillRect(
					bx * BLOCK_SIZE, 
					by * BLOCK_SIZE, 
					BLOCK_SIZE * cursor_size, 
					BLOCK_SIZE * cursor_size
				);
		},

		click : function() {
			mousedown = ~mousedown;
			mousedown && components.draw_block(x, y);
		},

		moving: function(e) {
			x = e.pageX - canvas.offsetLeft;
			y = e.pageY - canvas.offsetTop;

			mousedown && components.draw_block(x, y);
		},

		save : function(e) {
			png = canvas.toDataURL('image/png');
			png_save_data = png;
		}

	};

	window.addEventListener('load', components.init, false);

})();
