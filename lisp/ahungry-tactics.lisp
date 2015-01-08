;; Ahungry Tactics - Free as in Freedom multiplayer tactics/TCG game
;; Copyright (C) 2013 Matthew Carter
;; 
;; This program is free software: you can redistribute it and/or modify
;; it under the terms of the GNU Affero General Public License as published by
;; the Free Software Foundation, either version 3 of the License, or
;; (at your option) any later version.
;; 
;; This program is distributed in the hope that it will be useful,
;; but WITHOUT ANY WARRANTY; without even the implied warranty of
;; MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
;; GNU Affero General Public License for more details.
;; 
;; You should have received a copy of the GNU Affero General Public License
;; along with this program.  If not, see <http://www.gnu.org/licenses/>.

;; Quick and dirty way to allow socket.io javascript to call
;; on different lisp functions and move data around via JSON

(in-package :ahungry-tactics)

;; Set some game parameters
(defparameter *last-regen-time* 0)
(defparameter *last-ai-time* 0)
(defparameter *regen-interval* 6)
(defparameter *ai-interval* 10)
(defparameter *regen-hp* 5)
(defparameter *regen-mp* 5)
(defparameter *max-hand-size* 4)
(defparameter *draw-card-interval* 4)
(defparameter *starter-deck-size* 5)
(defparameter *db-snapshot-interval* 30)
(defparameter *last-db-snapshot-time* 0)
(defparameter *max-move* 6)

;; Start the server
(usocket:socket-server "localhost" 1037 'default-tcp-handler ()
		       :in-new-thread t
		       :reuse-address t
		       :multi-threading t)

;; Clean up problemating terpris from input
(defun cleaner (string)
  (string-trim '(#\newline #\return) string))

;; DATA OBJECTS - ideally match to db table struct
;; ACCOUNTS
(game-dataset account id user pass ip banned uid)

;; UNITS
(game-dataset unit id name hp mp atk def active mag mdef
	      owner job_id level xp jp speed x y img map_index)

;; CARDS
(game-dataset card id name min_range max_range
	      atk cost phy mag effect)

;; JOBS
(game-dataset job id name hp mp atk def mag mdef xp img reqs
	      speed spoiler)

;; DECKS
(game-dataset deck unit-id cards)

;; HANDS
(game-dataset hand unit-id cards last-draw-time)

(defun get-matches (dataset key search)
  "Seek out all matching items from what we want"
  (loop for item in dataset when
	(equal search (slot-value item key)) collect item))
  
(defun get-from (dataset key search)
  "Search out a data item by any key we want"
  (when dataset
    (find search dataset
	  :test #'equal
	  :key (lambda (data)
		 (when data
		   (slot-value data key))))))

(defun get-db-accounts()
  "Grab all accounts"
  (setf *accounts* nil)
  (loop for account in (1query "select * from account where banned = 0") do
       (add-account account)) *accounts*)

;; Pull the units from the db into your variable
(defun get-db-units ()
  "Pull all active units out of our tactics db"
  (setf *units* nil)
  (loop for unit in (1query "select unit.*, job.img from unit left join job on unit.job_id = job.id") do
       (add-unit unit)) *units*)

(defun get-db-cards ()
  "Get all the cards out of the db"
  (setf *cards* nil)
  (loop for card in (1query "select * from card") do
       (add-card card)) *cards*)

(defun get-db-jobs ()
  "Get all the jobs out of the db"
  (setf *jobs* nil)
  (loop for job in (1query "select * from job") do
       (add-job job)) *jobs*)

(defun reformat-deck-cards (unit-id)
  "Turn our whitespace separated deck into a real list"
  (let ((deck (get-from *decks* 'unit-id unit-id)))
    (when deck
      (with-slots (cards) deck
	(setf cards
	      (loop for card-id in
		   (all-matches-as-strings "\\d+ |\\d+$" cards)
		 collect (parse-integer card-id)))))))

(defun get-db-decks ()
  "Get all the decks out of the db"
  (setf *decks* nil)
  (loop for deck in (1query "select * from deck") do
       (progn (add-deck deck)
	      (reformat-deck-cards (first deck)))))

(defun draw-card (unit-id)
  "Draw a random card from the unit deck"
  (let ((deck (get-from *decks* 'unit-id unit-id)))
    (when deck
      (let ((size (length (slot-value deck 'cards))))
	(when (> size 0) 
	  (with-slots (cards) deck
	    (nth (random size (make-random-state t)) cards)))))))

(defun draw-card-controller (unit-id &optional draw-timer)
  "Only draw cards for user if they are under limit and timer"
  (let ((hand (get-from *hands* 'unit-id unit-id))
	(time (get-universal-time))
	(draw-timer (or draw-timer *draw-card-interval*)))
    (when (not hand)
      (add-hand (list unit-id (list) 0))
      (setf hand (get-from *hands* 'unit-id unit-id)))
    (with-slots (unit-id cards last-draw-time) hand
      (if (>= (length cards) *max-hand-size*)
      (no-json-response)
      (if (< (- time last-draw-time) draw-timer)
	  (no-json-response)
	  (let ((card-id (draw-card unit-id)))
	    (setf last-draw-time time)
	    (when card-id (push card-id cards))))))))

(defun give-deck (unit-id)
  "Build an initial deck for a unit/user"
  (let ((deck (get-from *decks* 'unit-id unit-id)))
    (when (not deck)
      (add-deck (list unit-id ())) (setf deck (get-from *decks* 'unit-id unit-id)))
    (with-slots (cards) deck
      (let ((needed-cards (- *starter-deck-size* (length cards))))
	(when (> needed-cards 0)
	  (setf cards (append cards (loop for x from 1 to needed-cards
				       for y = (+ 1 (random 5 (make-random-state t)))
				       collect y))))))))

(defun resync ()
  "Simply send out a json response to refresh units"
  (json-response "resync" (units-to-json)
		 "resync" (units-to-json)))

;; Different potential actions
;; Have a unit join the game - prioritize existing over db
(defun join-game (json-input)
  "A unit has joined the game, alert everyone else"
  (let ((unit-id (jsown:val (jsown:parse json-input) "unit_id")))
    (or (get-from *decks* 'unit-id unit-id) (give-deck unit-id))
    (draw-card-controller unit-id 0)
    (resync)))

(defun move (unit-id dx dy)
  "Move unit to x y"
  (let ((unit (get-from *units* 'id unit-id)))
    (with-slots (id x y name) unit
      (setf x dx y dy))
    (resync)))
    ;; Temporarily taking out while I work on a fix for pushing AI out
;;    (json-response "update-unit" (unit-to-json unit)
	;;	   "update-unit" (unit-to-json unit))))

(defun level-up (unit-id)
  "On a level up apply certain bonuses based on job"
  (let* ((unit (get-from *units* 'id unit-id))
	 (job (get-from *jobs* 'id (slot-value unit 'job_id))))
    (with-slots (hp mp atk def mag mdef speed xp level) unit
      (setf
       hp (+ hp (slot-value job 'hp))
       mp (+ mp (slot-value job 'mp))
       atk (+ atk (slot-value job 'atk))
       def (+ def (slot-value job 'def))
       mag (+ mag (slot-value job 'mag))
       mdef (+ mdef (slot-value job 'mdef))
       speed (+ speed (slot-value job 'speed))
       xp 0
       level (incf level)))))

(defun level-up-formula (level xp-required)
  "See if we meet requirement to level"
  (when (<= xp-required 0) (setf xp-required 1))
  (* level xp-required))

(defun do-level-ups ()
  "Run across all units, see who gets a level up"
  (mapcar
   (lambda (unit)
     (with-slots (id job_id level xp name) unit
       (let ((job (get-from *jobs* 'id job_id)))
	 (when job
	   (let ((needed-xp (level-up-formula level (slot-value job 'xp))))
	     (when (>= xp needed-xp)
	       (level-up id)
	       (format t "Level up for ~a~%" name))))))) *units*))

(defun client-error (&optional message)
  "Spit out a client error message to the user"
  (let ((message (or message "Something bad!")))
    (json-response "event-log" message "event-log" message)))

(defun damage-formula (atk def base)
  "Formula for damage calculation"
  (let ((modifier (- atk def)))
    (when (minusp modifier) (setf modifier 0))
    (round (if (plusp base)
	       (+ base modifier)
	       (- base modifier)))))

(defun change-job (unit-id job-id)
  "Change a unit job via unit id and job id"
  (let ((unit (get-from *units* 'id unit-id))
	(job-img (slot-value (get-from *jobs* 'id job-id) 'img)))
    (with-slots (job_id img) unit
      (setf job_id job-id img job-img))))

(defun kill-unit (unit-id killer-id)
  "Delete unit if NPC, if player change to skeleton
This causes big issues if using NPCs when list items suddenly
vanish - just set the unit to skeleton and clean out dead guys
through a separate function"
  (let ((unit (get-from *units* 'id unit-id))
	(lost-card-id (car (slot-value (get-from *decks* 'unit-id unit-id) 'cards))))
    (when lost-card-id (move-card *decks* unit-id killer-id lost-card-id))
    (with-slots (owner x y id level hp) unit
      (when (eq owner 0) (setf x 0 y 0 hp (* *regen-hp* -5)))
      (change-job id 1))))

(defun revive-unit (unit-id)
  "if not NPC, revive player to slime"
  (change-job unit-id 2))

(defun do-damage (unit hit card)
  "Do damage to a unit"
  (let ((damage (slot-value card 'atk))
	(physical (slot-value card 'phy))
	(magical (slot-value card 'mag))
	(atk (slot-value unit 'atk))
	(mag (slot-value unit 'mag))
	(def (slot-value hit 'def))
	(mdef (slot-value hit 'mdef)))
    (with-slots (hp id x y) hit
      (unless (and (eq x 0) (eq y 0))
      (let ((original-hp hp))
	(when (eq physical 1) ;; do physical damage
	  (setf hp (- hp (damage-formula atk def damage))))
	(when (eq magical 1) ;; do magical damage
	  (setf hp (- hp (damage-formula mag mdef damage))))
	(cond ((and (> original-hp 0) (< hp 1)) (kill-unit id (slot-value unit 'id)))
	      ((and (< original-hp 1) (> hp 0)) (revive-unit id))
	      ((< original-hp 0) (setf hp -1))))))))

(defun get-cards-from (object unit-id)
  "Grab all the cards in an object"
  (let ((hand (get-from object 'unit-id unit-id)))
    (when hand
      (let ((cards (slot-value hand 'cards)))
	cards))))

(defun get-card-from (object unit-id card-id)
  "Seek a card out of unit active hand"
  (let ((cards (get-cards-from object unit-id)))
    (when cards
      (let ((card-id-found (find card-id cards)))
	(when card-id-found
	  (get-from *cards* 'id card-id))))))

(defun remove-card-helper (object unit-id card-id &optional card-slot)
  "Create a new hand list object"
  (let ((excluded nil)
	(hand (get-cards-from object unit-id))
	(i 0)
	(new-hand '()))
    (when (find card-id hand)
      (mapcar (lambda (card)
		(if (and
		     (eq card-id card)
		     (not excluded)
		     (>= i (or card-slot 0)))
		    (setf excluded t) ;; Only exclude 1 card
		    (push card new-hand))
		(setf i (incf i))) hand)
      (if excluded (nreverse new-hand)
	  (remove-card-helper object unit-id card-id)))))

(defun remove-card-from (object unit-id card-id &optional card-slot)
  "Remove card from an object such as hand or deck"
  (let ((hand (get-from object 'unit-id unit-id))
	 (new-cards (remove-card-helper object unit-id card-id card-slot)))
    (when new-cards
      (with-slots (cards) hand
	(setf cards new-cards)))))

(defun xp-formula (player-level opponent-level)
  "Standard formula for xp gain"
  (let ((min-xp 1)
	(xp (+ 1 (- opponent-level player-level))))
    (if (> xp min-xp) xp min-xp)))

(defun play-card (unit-id card-id dx dy &optional card-slot)
  "Play card on a location"
  (let* ((unit (get-from *units* 'id unit-id))
	 (card (get-card-from *hands* unit-id card-id)))
    (if (not card) (client-error "You do not have that card, sorry!")
	(let ((hit-units (get-matches
			  (get-matches *units* 'x dx) 'y dy))
	      (mp-remaining (- (slot-value unit 'mp)
			       (slot-value card 'cost))))
	  (if (not (and unit (>= mp-remaining 0)))
	      (client-error "Play card failed (not enough mp)!") ;; no matches
	      (progn
		(with-slots (xp jp mp level) unit
		  (setf mp mp-remaining) ;; set units new mp
		  (mapcar (lambda (hit) ;; do damage on each hit
			    (let ((hit-lvl (slot-value hit 'level))) ;; give xp/jp
			      (setf xp (incf xp (xp-formula level hit-lvl)))
			      (setf jp (incf jp (xp-formula level hit-lvl))))
			    (do-damage unit hit card)) hit-units)) ;; hit units
		(remove-card-from *hands* unit-id card-id card-slot)
		(resync)))))))

(defun zone-change (json-input)
  (let* ((json-input (parse json-input))
	 (unit-id (val json-input "unit_id"))
	 (dx (val json-input "x"))
	 (dy (val json-input "y"))
	 (map-index (val json-input "map_index")))
    (let ((unit (get-from *units* 'id unit-id)))
      (when unit
	(with-slots (x y map_index) unit
	    (setf x dx y dy map_index map-index))))
    (resync)))

(defun set-action (json-input)
  "Parse the input action from the json format"
  (let* ((json-input (jsown:parse json-input))
	 (unit-id (jsown:val json-input "unit_id"))
	 (card-id (jsown:val json-input "card_id"))
	 (card-slot (jsown:val json-input "card_slot"))
	 (x (jsown:val json-input "x"))
	 (y (jsown:val json-input "y")))
    (if (eq card-id 0) (move unit-id x y)
	(play-card unit-id card-id x y card-slot))))

(defun slot-or-not (object slot-name &optional default)
  "Returns a slot value or a default"
  (if (not object) default
      (if (slot-boundp object slot-name)
	  (slot-value object slot-name) default)))

(defun do-unit-regen ()
  "Compare current time with last regen time"
  (let ((time (get-universal-time)))
  (when (> (- time *last-regen-time*) *regen-interval*)
    (setf *last-regen-time* time)
    (mapcar (lambda (unit)
	      (with-slots (hp mp job_id level) unit
		(let* ((job (get-from *jobs* 'id job_id))
		       (job-mp (slot-or-not job 'mp 1))
		       (job-hp (slot-or-not job 'hp 1)))
		  (when (< mp (+ 20 (* job-mp level)))
		    (setf mp (incf mp *regen-mp*)))
		  (when (or (< hp (* job-hp level)) (< hp 10))
		    (setf hp (incf hp *regen-hp*))))))
		*units*))))

(defun add-card-to (object unit-id card-id)
  "Add a card to some place such as a hand or deck"
  (let ((item (get-from object 'unit-id unit-id)))
    (when (get-from *cards* 'id card-id)
      (with-slots (cards) item
	(setf cards (push card-id cards))))))
	
(defun request-cards (json-input)
  (json-response "request-cards" (cards-to-json)
		 "nil" (new-js ("nil" "nil"))))

(defun request-hand (json-input)
  (let ((unit-id (jsown:val (jsown:parse json-input) "unit_id")))
    (draw-card-controller unit-id) ;; see if we can get a new card first
    (let ((hand (get-from *hands* 'unit-id unit-id)))
      (if (not hand) (no-json-response)
	  (json-response "request-hand"
			 (hand-to-json hand)
			 "nil" nil)))))

(defun request-deck (json-input)
  "Send in a json request to receive units deck"
  (let ((unit-id (jsown:val (jsown:parse json-input) "unit_id")))
    (let ((deck (get-from *decks* 'unit-id unit-id)))
      (if (not deck) (no-json-response)
	  (json-response "request-deck"
			 (deck-to-json deck)
			 "nil" nil)))))

(defun change-unit-name (unit-id new-name)
  "Update name of a unit"
  (let ((unit (get-from *units* 'id unit-id)))
    (when unit
      (with-slots (name) unit
	(setf name new-name)))))

(defun chat-command (unit-id command)
  "Attempt to match a command based on /command target"
  (let* ((matches (nth-value 1 (cl-ppcre:scan-to-strings "^\/(.*)\\s(.*)" command)))
	(action (aref matches 0))
	(target (aref matches 1)))
    (cond ((equal action "nick") (change-unit-name unit-id target))))
  (resync))

(defun request-chat (json-input)
  "Send in a json request to receive units chat"
  (let* ((json-input (jsown:parse json-input))
	(unit-id (jsown:val json-input "unit_id"))
	(chat (jsown:val json-input "chat"))
	(chatter (slot-value (get-from *units* 'id unit-id) 'name))
	(msg (format nil "~a said, '~a'" chatter chat)))
    (if (cl-ppcre:scan "^\/" chat) (chat-command unit-id chat)
	(if (and (> (length chat) 0) (not (cl-ppcre:scan "[^A-Za-z0-9? _\\-!.,/'\"+]" chat)))
	(json-response "request-chat" (new-js ("unit_id" unit-id) ("chat" msg))
		   "request-chat" (new-js ("unit_id" unit-id) ("chat" msg)))
	(no-json-response)))))

(defun save-units-to-db ()
  "Write a query of data into the db"
  (dolist (unit *units*)
    (with-slots (id hp mp atk def mag mdef job_id level xp jp speed x y) unit
	(1query (format nil "update unit set hp='~a', mp='~a', atk='~a', def='~a', mag='~a', mdef='~a', job_id='~a', level='~a', xp='~a', jp='~a', speed='~a', x='~a', y='~a' where id=~a" hp mp atk def mag mdef job_id level xp jp speed x y id)))))

(defun do-db-snapshot ()
  "Compare current time with last db time"
  (let ((time (get-universal-time)))
  (when (> (- time *last-db-snapshot-time*) *db-snapshot-interval*)
    (setf *last-db-snapshot-time* time)
    (save-units-to-db))))

(defun get-next-id (dataset)
  "Get the next highest id on a dataset"
  (let ((id 0))
    (loop for item in dataset when (> (slot-value item 'id) id)
       do (setf id (slot-value item 'id)))
    (incf id)))

(defun create-new-unit (account-id &optional name)
  "Creates a new unit to be tied to an account"
  (let ((id (get-next-id *units*))
	(name (or name (concatenate 'string "tester-" (prin1-to-string account-id))))
	(hp 10)
	(mp 10)
	(atk 1)
	(def 1)
	(active 1)
	(mag 1)
	(mdef 1)
	(owner account-id)
	(job_id 3)
	(level 1)
	(xp 0)
	(jp 0)
	(speed 1)
	(x 0)
	(y 0)
	(img "peasant_sheet.png"))
    (add-unit (list id name hp mp atk def active mag mdef owner job_id
		    level xp jp speed x y img)) id))

(defun create-new-account (client-ip)
  "Create a new account for player that is tied to IP address"
  (unless (get-from *accounts* 'ip client-ip)
    (let* ((id (get-next-id *accounts*))
	   (user (concatenate 'string "tester-" (prin1-to-string id)))
	   (pass "tester")
	   (ip client-ip)
	   (banned 0)
	   (uid (create-new-unit id)))
      (give-deck uid)
      (add-account (list id user pass ip banned uid)) id)))

(defun request-signin (json-input)
  "For right now just bind accounts to IP"
  (let* ((client-ip (jsown:val (jsown:parse json-input) "client_ip"))
	 (account (get-from *accounts* 'ip client-ip)))
    (if (not account) (progn (create-new-account client-ip)
			     (request-signin json-input))
	(let ((unit-id (slot-value account 'uid)))
	  (json-response "start-game" (unit-to-json (get-from *units* 'id unit-id))
			 "nil" (new-js ("nil" "nil")))))))

(defun create-npc (job-id &optional npc-name level)
  "Create a non player character (as known by owner 0) and set name, job and level"
  (let ((job (get-from *jobs* 'id job-id))
	(level (or level 0)))
    (if (not job) "Job not found!"
	(let* ((unit-id (create-new-unit 0 npc-name))
	       (unit (get-from *units* 'id unit-id)))
	  (with-slots (name job_id img) unit
	    (when (not npc-name) (setf name (concatenate 'string "npc-" (prin1-to-string unit-id))))
	    (setf ;; set the appropriate job related fields
	     img (slot-value job 'img)
	     job_id job-id))
	  (dotimes (x level) (level-up unit-id)) ;; level up the unit
	  (give-deck unit-id)
	  (dotimes (x *max-hand-size*) (draw-card-controller unit-id 0))
	  unit))))

(defun request-change-job (json-input)
  "Json request to change unit job"
  (let* ((json (jsown:parse json-input))
	 (unit-id (jsown:val json "unit_id"))
	 (job-id (jsown:val json "job_id")))
    (change-job unit-id job-id)
    (resync)))

(defun job-stat-checker (unit comparison stat value)
  "Checks something similar to a bash style check"
  (let ((unit-value (slot-value unit (intern (string-upcase stat) :ahungry-tactics))))
    (when (not (integerp value)) (setf value (parse-integer value)))
    (cond ((equal "gt" comparison) (> unit-value value))
	  ((equal "ge" comparison) (>= unit-value value))
	  ((equal "lt" comparison) (< unit-value value))
	  ((equal "le" comparison) (<= unit-value value))
	  ((equal "eq" comparison) (= unit-value value))
	  ((equal "ne" comparison) (not (= unit-value value)))
	  (t t))))
	
(defun job-eligibility (unit job)
  "Make check on a unit and a job reqs"
  (when (and unit job)
    (let ((requirements (split-sequence:split-sequence #\, (slot-value job 'reqs)))
	  (eligible t))
      (dolist (requirement requirements)
	(let* ((reqs (split-sequence:split-sequence #\: requirement))
	       (stat (first reqs))
	       (scanned (nth-value 1 (cl-ppcre:scan-to-strings "(\\w\\w)(.*)" (second reqs))))
	       (comparison (aref scanned 0))
	       (value (aref scanned 1)))
	  (when (not (job-stat-checker unit comparison stat value))
	    (setf eligible nil))))
    (when eligible t))))

(defun get-eligible-jobs (unit-id)
  "Parse the special reqs format and filter
returned jobs based on eligibilty"
  (let ((unit (get-from *units* 'id unit-id)))
    (loop for job in *jobs* when (job-eligibility unit job)
       collect job)))

(defun request-jobs (json-input)
  "Return a listing of jobs to the user"
  (let* ((json (jsown:parse json-input))
	 (unit-id (jsown:val json "unit_id")))
    (json-response "request-jobs" (mapcar #'job-to-json (get-eligible-jobs unit-id))
		   "nil" (new-js ("nil" "nil")))))

(defun move-card (object unit-id giving-to card-id)
  "Take a card from one location and give to another location"
  (when (and (remove-card-from object unit-id card-id)
	     (> giving-to 0))
    (add-card-to object giving-to card-id)))

(defun request-give-card (json-input)
  "Attempt to send a card from one person to another"
  (let* ((json (jsown:parse json-input))
	 (unit-id (jsown:val json "unit_id"))
	 (card-id (jsown:val json "card_id"))
	 (giving-to (jsown:val json "giving_to")))
    (move-card *decks* unit-id giving-to card-id)
    (json-response "deck-updated" (new-js ("unit_id" unit-id) ("card_name" "bandage"))
		   "deck-updated" (new-js ("unit_id" giving-to) ("card_name" "bandage")))))

(defun in-range (sx sy dx dy max-range &optional min-range)
  "Perform a range check using x/y values" 
  (let ((min-range (or min-range 0))
	(distance-x (abs (- sx dx)))
	(distance-y (abs (- sy dy))))
    (<= min-range (+ distance-x distance-y) max-range)))

(defun ai-movement (sx sy dx dy range)
  "Find the best place to have the unit move given available max range
Offset the panel slightly to avoid huge overlap"
  (let* ((x-offset (random 3 (make-random-state t)))
	 (y-offset (random 3 (make-random-state t)))
	 (dx (if (evenp x-offset) (+ dx x-offset) (- dx x-offset)))
	 (dy (if (evenp y-offset) (+ dy y-offset) (- dy y-offset))))
  (dotimes (x range) 
    (cond ((> sx dx) (decf sx))
	  ((< sx dx) (incf sx))
	  ((> sy dy) (decf sy))
	  ((< sy dy) (incf sy)))) (list sx sy)))

(defun ai-choose-a-card (unit-id target-id)
  "Have the unit pick which card they will use"
  (let* ((unit (get-from *units* 'id unit-id))
	 (target (get-from *units* 'id target-id))
	 (sx (slot-value unit 'x))
	 (sy (slot-value unit 'y))
	 (dx (slot-value target 'x))
	 (dy (slot-value target 'y))
	 (hand (slot-value (get-from *hands* 'unit-id (slot-value unit 'id)) 'cards)))
    (remove nil (loop for card in hand
		   collect (with-slots (min_range max_range atk) (get-from *cards* 'id card)
			     (when (and (in-range sx sy dx dy max_range min_range)
					(> atk 0)) card))))))

(defun ai-choose-target (unit-id)
  "Find the nearest player or enemy to attack - Returns id to attack"
  (let ((unit (get-from *units* 'id unit-id)))
    (with-slots (x y) unit
	(remove 0 (sort ;; Remove owner 0 (npc) from list by default
		   (loop for target in *units* ;; Sort by closest unit
		      collect (list :id (slot-value target 'id)
				    :distance (+ (abs (- x (slot-value target 'x)))
				       (abs (- y (slot-value target 'y))))
				    :x (slot-value target 'x)
				    :y (slot-value target 'y)
				    :owner (slot-value target 'owner)))
		   #'< :key #'cadddr) :key (lambda (list) (getf list :owner))))))

(defun ai-controller ()
  "Run through our NPC's and choose if they should attack or move"
  (mapcar (lambda (npc)
	    (with-slots (id x y hp) npc
	      (when (> hp 0) ;; If the NPC is dead, don't do anything
		(let* ((targets (ai-choose-target id))
		       (target (nth (random (length targets) (make-random-state t)) targets))
		       (in-range-cards (ai-choose-a-card id (getf target :id))))
		  (draw-card-controller id) ;; See if anyone can draw a card
		  (if in-range-cards ;; Play a card or move unit closer
		      (let ((card-pos (random (length in-range-cards) (make-random-state t))))
			(play-card id (nth card-pos in-range-cards)
				   (getf target :x)
				   (getf target :y)))
		      ;;(print "moving issue")))) (get-matches *units* 'owner 0)))
		      (apply #'move (cons id
					  (ai-movement x y
						       (getf target :x)
						       (getf target :y) *max-move*))))))))
	    (get-matches *units* 'owner 0)))

(defun ai-time-check ()
  "Keep the time for AI moves reasonable to avoid insanity"
  (let ((time (get-universal-time)))
  (when (> (- time *last-ai-time*) *ai-interval*)
    (setf *last-ai-time* time)
    (ai-controller))))

;; Choose which function to run by taking in the two inputs
(defun default-tcp-handler (stream) ; null
  (declare (type stream stream))
  (do-level-ups)
  (ai-time-check)
  (do-unit-regen)
  ;;(do-db-snapshot)
  (let* ((action (format nil "ahungry-tactics:~a" (cleaner (read-line stream))))
	 (reply (funcall (read-from-string action) (cleaner (read-line stream)))))
    (format t "sending out: ~a~%" reply)(format stream "~a~%" reply)))

;; Start it up stuff
(defun main ()
  "Fill up our game with db data"
  ;; (get-db-decks)
  (get-db-jobs)
  ;; (get-db-units)
  (get-db-cards))

(defun reset-game ()
  (setf *decks* nil *cards* nil *accounts* nil *units* nil *hands* nil)
  (main))

(main)
