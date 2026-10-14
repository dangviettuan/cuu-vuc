extends CharacterBody2D
class_name Fighter

signal health_changed(current: float, maximum: float)
signal stamina_changed(current: float, maximum: float)
signal died

@export var max_health := 100.0
@export var max_stamina := 100.0
@export var move_speed := 240.0
@export var jump_speed := -410.0
@export var gravity := 1100.0
@export var attack_damage := 20.0
@export var attack_range := 68.0
@export var attack_cooldown := 0.42
@export var dodge_cost := 30.0
@export var dodge_speed := 520.0
@export var dodge_duration := 0.18
@export var is_player := false

var health := 100.0
var stamina := 100.0
var facing := 1.0
var attack_timer := 0.0
var dodge_timer := 0.0
var invulnerable_timer := 0.0
var dead := false
var target: Fighter
var arena_bounds := Vector2(45.0, 1107.0)
var floor_y := 530.0

func _ready() -> void:
    health = max_health
    stamina = max_stamina
    health_changed.emit(health, max_health)
    stamina_changed.emit(stamina, max_stamina)

func _physics_process(delta: float) -> void:
    if dead:
        return
    attack_timer = maxf(0.0, attack_timer - delta)
    dodge_timer = maxf(0.0, dodge_timer - delta)
    invulnerable_timer = maxf(0.0, invulnerable_timer - delta)
    stamina = minf(max_stamina, stamina + 24.0 * delta)
    stamina_changed.emit(stamina, max_stamina)
    if not is_on_floor():
        velocity.y += gravity * delta
    if is_player:
        _player_input()
    else:
        _enemy_input()
    move_and_slide()
    global_position.x = clampf(global_position.x, arena_bounds.x, arena_bounds.y)
    queue_redraw()

func _player_input() -> void:
    if dodge_timer > 0.0:
        velocity.x = facing * dodge_speed
        return
    var axis := Input.get_axis("move_left", "move_right")
    if axis != 0.0:
        facing = signf(axis)
    velocity.x = axis * move_speed
    if Input.is_action_just_pressed("jump") and is_on_floor():
        velocity.y = jump_speed
    if Input.is_action_just_pressed("dodge") and stamina >= dodge_cost:
        stamina -= dodge_cost
        dodge_timer = dodge_duration
        invulnerable_timer = dodge_duration
    if Input.is_action_just_pressed("attack"):
        attack()

func _enemy_input() -> void:
    if not is_instance_valid(target) or target.dead:
        velocity.x = 0.0
        return
    var distance := target.global_position.x - global_position.x
    facing = 1.0 if distance >= 0.0 else -1.0
    if absf(distance) > attack_range * 0.8:
        velocity.x = facing * move_speed * 0.52
    else:
        velocity.x = 0.0
        attack()

func attack() -> void:
    if dead or attack_timer > 0.0 or dodge_timer > 0.0:
        return
    attack_timer = attack_cooldown
    if is_instance_valid(target) and not target.dead:
        var dx := target.global_position.x - global_position.x
        if absf(dx) <= attack_range and dx * facing >= -4.0 and absf(target.global_position.y - global_position.y) < 65.0:
            target.take_damage(attack_damage)

func take_damage(amount: float) -> void:
    if dead or invulnerable_timer > 0.0:
        return
    health = maxf(0.0, health - amount)
    invulnerable_timer = 0.18
    health_changed.emit(health, max_health)
    if health <= 0.0:
        dead = true
        velocity = Vector2.ZERO
        died.emit()
    queue_redraw()

func _draw() -> void:
    var color := Color(0.25, 0.78, 0.74) if is_player else Color(0.89, 0.38, 0.32)
    if dead:
        color = Color(0.32, 0.32, 0.36)
    elif invulnerable_timer > 0.0:
        color = Color(1.0, 0.93, 0.65)
    draw_rect(Rect2(-17, -52, 34, 52), color)
    draw_circle(Vector2(0, -65), 15, color)
    draw_line(Vector2(facing * 10, -32), Vector2(facing * 34, -30), Color(0.9, 0.9, 0.95), 5.0)
    if attack_timer > attack_cooldown - 0.13:
        draw_arc(Vector2(0, -32), attack_range, -0.75 if facing > 0 else 2.4, 0.75 if facing > 0 else 3.9, 20, Color(1, 0.83, 0.4, 0.8), 4.0)
