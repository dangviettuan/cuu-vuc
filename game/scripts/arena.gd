extends Node2D

const FighterScript = preload("res://scripts/fighter.gd")
var player: Fighter
var enemy: Fighter
var hud: Label

func _ready() -> void:
    _bind_inputs()
    _create_floor()
    player = _spawn_fighter(Vector2(260, 500), true)
    enemy = _spawn_fighter(Vector2(820, 500), false)
    player.target = enemy
    enemy.target = player
    enemy.max_health = 120.0
    enemy.health = 120.0
    enemy.move_speed = 165.0
    enemy.attack_damage = 12.0
    enemy.attack_cooldown = 0.9
    player.died.connect(_on_player_died)
    enemy.died.connect(_on_enemy_died)
    _create_hud()

func _bind_inputs() -> void:
    _action("move_left", [KEY_A, KEY_LEFT])
    _action("move_right", [KEY_D, KEY_RIGHT])
    _action("jump", [KEY_SPACE, KEY_W, KEY_UP])
    _action("attack", [KEY_J])
    _action("dodge", [KEY_K, KEY_SHIFT])
    _action("restart", [KEY_R])

func _action(name: String, keys: Array) -> void:
    if not InputMap.has_action(name):
        InputMap.add_action(name)
    for key in keys:
        var event := InputEventKey.new()
        event.physical_keycode = key
        InputMap.action_add_event(name, event)

func _create_floor() -> void:
    var ground := StaticBody2D.new()
    ground.position = Vector2(576, 530)
    add_child(ground)
    var collider := CollisionShape2D.new()
    var shape := RectangleShape2D.new()
    shape.size = Vector2(1152, 60)
    collider.shape = shape
    ground.add_child(collider)
    var visual := Polygon2D.new()
    visual.polygon = PackedVector2Array([Vector2(-576, 0), Vector2(576, 0), Vector2(576, 118), Vector2(-576, 118)])
    visual.color = Color(0.21, 0.26, 0.25)
    ground.add_child(visual)

func _spawn_fighter(pos: Vector2, controlled: bool) -> Fighter:
    var node := CharacterBody2D.new()
    node.set_script(FighterScript)
    var fighter: Fighter = node as Fighter
    fighter.is_player = controlled
    fighter.position = pos
    add_child(fighter)
    var collider := CollisionShape2D.new()
    var shape := RectangleShape2D.new()
    shape.size = Vector2(34, 52)
    collider.position = Vector2(0, -26)
    collider.shape = shape
    fighter.add_child(collider)
    return fighter

func _create_hud() -> void:
    var layer := CanvasLayer.new()
    add_child(layer)
    hud = Label.new()
    hud.position = Vector2(22, 18)
    hud.add_theme_font_size_override("font_size", 20)
    layer.add_child(hud)

func _process(_delta: float) -> void:
    if Input.is_action_just_pressed("restart"):
        get_tree().reload_current_scene()
        return
    hud.text = "CỬU VỰC  |  COMBAT SANDBOX\nHP: %d/%d   Stamina: %d/%d\nEnemy HP: %d/%d\nA/D: Move   Space: Jump   J: Attack   K/Shift: Dodge   R: Restart" % [
        ceili(player.health), ceili(player.max_health), ceili(player.stamina), ceili(player.max_stamina),
        ceili(enemy.health), ceili(enemy.max_health)
    ]
    if player.dead:
        hud.text += "\nDEFEAT  |  Press R to retry"
    elif enemy.dead:
        hud.text += "\nVICTORY  |  Press R to retry"

func _on_player_died() -> void:
    pass

func _on_enemy_died() -> void:
    pass
