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

require_once('../../ini/tactics.inc.php');

if(!empty($_POST))
{
	try 
	{
		if($_POST['png_size'] != strlen($_POST['png']))
		{
			throw new Exception("Image was not uploaded, sorry!");
		}

		//PHP, why must you turn my +'s into spaces in base64?
		$raw = preg_replace('/\s/', '+', $_POST['png']);
		$png = base64_decode(substr($raw, 22));

		//Sanitize our datas
		$s['hp']    = preg_replace('/\D/', '', $_POST['hp']);
		$s['mp']    = preg_replace('/\D/', '', $_POST['mp']);
		$s['atk']   = preg_replace('/\D/', '', $_POST['atk']);
		$s['def']   = preg_replace('/\D/', '', $_POST['def']);
		$s['mag']   = preg_replace('/\D/', '', $_POST['mag']);
		$s['mdef']  = preg_replace('/\D/', '', $_POST['mdef']);
		$s['speed'] = preg_replace('/\D/', '', $_POST['speed']);
		$s['xp']    = preg_replace('/\D/', '', $_POST['xp']);

		foreach($s as $v)
		{
			if(!is_numeric($v)) 
			{
				throw new Exception("Only numbers!");
			}
		}
		$s['name']  = preg_replace('/\W/', '', $_POST['name']);
		$s['spoil'] = $_POST['spoil'];
		$s['img']   = 'uploads/'.$s['name'].'.png';

		foreach($s as $k => $v)
		{
			if(empty($v))
			{
				throw new Exception("All required fields ({$k} missing)!");
			}
		}

		$fn = '../img/uploads/'.$s['name'].'.png';
		if(file_exists($fn))
		{
			throw new Exception("That job already exists!");
		}
		$fh = fopen($fn, 'w+');
		fputs($fh, $png, strlen($png));
		fclose($fh);

		//Now he is on server, make the image transparent
		//$cmd = "convert {$fn} -transparent '#FF00FF' testdudenew.png"
		$cmd = "mogrify -transparent '#FF00FF' {$fn}";
		shell_exec($cmd);
		//$cmd = "convert {$fn} -flop ../img/uploads/".$s['name']."_flop.png";
		//shell_exec($cmd);
		$sql = "INSERT INTO `job` (`name`, `hp`, `mp`, `atk`, `def`, `mag`, `mdef`, `xp`, `img`, `speed`, `spoiler`) 
			VALUES(
				:name, :hp, :mp, :atk, :def, :mag, :mdef, :xp, :img, :speed, :spoil)";
		$stmt = $db->prepare($sql);
		foreach($s as $k => $v) 
		{
			$stmt->bindValue($k, $v);
		}
		$stmt->execute();
		$stmt->closeCursor();
		$json['msg'] = "New job added!";
	} 
	catch(Exception $e) 
	{
		$json['err'] = $e->getMessage();
	}

	echo json_encode($json);
	exit;
}
?>
<!doctype html>
<html>
<head>
	<title>Ahungry dot com - Blocky Paint</title>
	<link href="/third_party/jquery-ui-1.10.0.custom/css/ui-darkness/jquery-ui-1.10.0.custom.min.css" rel="stylesheet" type="text/css" />
	<link href="/third_party/farbtastic/farbtastic.css" rel="stylesheet" type="text/css" />
	<link href="/blocky-paint/blocky-paint.less" rel="stylesheet/less" type="text/css" />
	<script src="/third_party/less-1.3.3.min.js"></script>
	<script src="/third_party/jquery-1.9.0.min.js"></script>
	<script src="/third_party/jquery-ui-1.10.0.custom/js/jquery-ui-1.10.0.custom.min.js"></script>
	<script src="/third_party/farbtastic/farbtastic.js"></script>
	<script src="/blocky-paint/blocky-paint.js"></script>
	<script>
	$(document).ready(function() { 
		$('#colorpicker').farbtastic('#hex-color');
		$('#cursor-slider').slider({
			min: 1,
			max: 10,
			value: 5,
			slide : function(event, ui) {
				$('#bp-cursor-size').val(ui.value);
			}
		});
		$('#alpha-slider').slider({
			min: 1,
			max: 100,
			value: 100,
			orientation: 'vertical',
			slide : function(event, ui) {
				$('#bp-color-A').val(ui.value);
			}
		});
		$('#save').click(function() {
			$('#res').html('Saved image state, ready to submit to server?');
			$('#upload').fadeIn(500);
		});
		$('#cancel_upload, #clear').click(function() {
			$('#upload').fadeOut(500);
			$('#uploading').find('input').each(function() {
				if($(this).attr('type') == 'text')
					$(this).val(1);
			});
			$('#uploading').show();
		});
		$('#uploading').submit(function() {
			data = $(this).serialize();
			//Now attach the PNG data
			data += '&png='+png_save_data+'&png_size='+png_save_data.length;
			$.ajax({
				data: data,
				type: $(this).attr('method'),
				url: $(this).attr('action'),
				success: function(res) {
					json = eval('('+res+')');
					if(json.err)
						alert(json.err);
					else {
						$('#res').html(json.msg);
						$('#uploading').hide();
					}
				}
			});
			return false;
		});
	});
</script>
</head>
<body>
	<canvas id="blocky-paint">NO CANVAS</canvas>
	<div class="bp-options">
		<a href="/cp/">Back to Manage Units</a><br />
		<label>Red: <input type="text" id="bp-color-R" value="0" /></label>
		<label>Green: <input type="text" id="bp-color-G" value="0" /></label>
		<label>Blue: <input type="text" id="bp-color-B" value="0" /></label>
		<label>Alpha: 
			<input type="text" id="bp-color-A" value="100" />
			<div id="alpha-slider"></div>
		</label>
		<form><input type="text" id="hex-color" name="hex-color" value="#000000" /></form>
		<div id="colorpicker"></div>
		<label>Cursor Size: 
			<input type="text" id="bp-cursor-size" value="5" />
			<br />
			<div id="cursor-slider"></div>
		</label>
		<br />
		<label><input type="button" value="save" id="save" /></label>
		<label><input type="button" value="clear" id="clear" /></label>
	</div>
	<div id="upload">
		<div id="res"></div>
			<form id="uploading" name="upload" method="post" action="">
				<label><input class="big_input" type="text" name="name" value="Job Name" /></label>
				<div>
				Level up stats:
				</div>
				<label>HP<input type="text" name="hp" value="1" /></label>
				<label>MP<input type="text" name="mp" value="1" /></label>
				<label>Atk<input type="text" name="atk" value="1" /></label>
				<label>Def<input type="text" name="def" value="1" /></label>
				<label>Mag<input type="text" name="mag" value="1" /></label>
				<label>MDef<input type="text" name="mdef" value="1" /></label>
				<label>Speed<input type="text" name="speed" value="1" /></label>
				<label>XP<input type="text" name="xp" value="1" /></label>
				<label>Spoiler<input type="text" name="spoil" value="Spoiler" /></label>
				<label><input class="big_input" type="submit" value="Create new Job class!" /></label>
				<label><input class="big_input" id="cancel_upload" type="button" value="Cancel" /></label>
			</form>
		</div>
	</div>
</body>
</html>
