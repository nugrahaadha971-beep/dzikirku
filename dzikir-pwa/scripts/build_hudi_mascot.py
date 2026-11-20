"""
build_hudi_mascot.py: generator maskot "Hudi" (burung hud-hud) bergaya clay 3D.

Skrip Blender mandiri (bpy). Membangun mesh dasar Hudi dari primitif, memberi
material clay yang lembut, lalu merender empat pose PNG transparan ke
public/mascot/ yang dipakai komponen MascotStage:

    hudi-idle.png       -> mood "idle"
    hudi-focus.png      -> mood "focus"
    hudi-celebrate.png  -> mood "milestone"
    hudi-encourage.png  -> mood "freeze"

Pemakaian (Blender 3.6+ / 4.x):

    blender --background --python scripts/build_hudi_mascot.py
    blender -b -P scripts/build_hudi_mascot.py -- --samples 128 --size 1024
    blender -b -P scripts/build_hudi_mascot.py -- --poses idle celebrate
    blender -b -P scripts/build_hudi_mascot.py -- --save-blend hudi.blend --no-render

Argumen setelah "--" diteruskan ke skrip ini, bukan ke Blender.
"""

import argparse
import math
import os
import sys

import bpy

DEFAULT_OUT = os.path.normpath(
    os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "public", "mascot")
)

# Karakter menghadap arah -Y; kamera berada di -Y.
# turn   : putaran badan (derajat, sumbu Z)        lean   : condong ke depan (derajat)
# crest  : kibasan jambul (derajat)               wing   : sayap terangkat (derajat)
# bounce : tinggi lompatan                        eye    : open | happy
# brow   : alis, + = ujung dalam naik (lembut), - = turun (fokus)
POSES = {
    "idle": dict(turn=-28, lean=0, crest=0, wing=0, bounce=0.0, eye="open", brow=0),
    "focus": dict(turn=-18, lean=6, crest=14, wing=0, bounce=0.0, eye="open", brow=-16),
    "celebrate": dict(turn=-22, lean=-4, crest=-14, wing=62, bounce=0.45, eye="happy", brow=0),
    "encourage": dict(turn=-28, lean=3, crest=-8, wing=12, bounce=0.0, eye="open", brow=16),
}

# Palet zamrud & emas (sRGB hex).
PALETTE = {
    "emerald": "#10b981",
    "belly": "#6ee7b7",
    "wing": "#047857",
    "gold": "#fbbf24",
    "beak": "#475569",
    "ink": "#0f172a",
    "white": "#f8fafc",
    "blush": "#fb7185",
}

HEAD_CENTER = (0.0, -0.25, 2.0)
HEAD_RADIUS = 0.72


# --------------------------------------------------------------------------- #
# Utilitas
# --------------------------------------------------------------------------- #
def srgb_to_linear(channel):
    if channel <= 0.04045:
        return channel / 12.92
    return ((channel + 0.055) / 1.055) ** 2.4


def hex_to_linear(hex_color):
    hex_color = hex_color.lstrip("#")
    r, g, b = (int(hex_color[i : i + 2], 16) / 255.0 for i in (0, 2, 4))
    return (srgb_to_linear(r), srgb_to_linear(g), srgb_to_linear(b), 1.0)


def set_input(node, names, value):
    """Mengisi input Principled BSDF; nama input berbeda antara Blender 3.x dan 4.x."""
    for name in names:
        if name in node.inputs:
            node.inputs[name].default_value = value
            return True
    return False


def clear_scene():
    for obj in list(bpy.data.objects):
        bpy.data.objects.remove(obj, do_unlink=True)
    for collection in (bpy.data.meshes, bpy.data.materials, bpy.data.lights, bpy.data.cameras):
        for datablock in list(collection):
            collection.remove(datablock)


def make_materials():
    materials = {}
    for key, hex_color in PALETTE.items():
        mat = bpy.data.materials.new(f"Clay_{key}")
        mat.use_nodes = True
        bsdf = mat.node_tree.nodes.get("Principled BSDF")
        if bsdf is not None:
            set_input(bsdf, ("Base Color",), hex_to_linear(hex_color))
            set_input(bsdf, ("Roughness",), 0.78)
            set_input(bsdf, ("Specular IOR Level", "Specular"), 0.22)
            set_input(bsdf, ("Subsurface Weight", "Subsurface"), 0.06)
        materials[key] = mat
    return materials


def head_point(azimuth_deg, elevation_deg, offset=0.0):
    """Titik pada permukaan kepala. Azimut 0 = tepat ke depan (-Y), + = ke arah +X."""
    az = math.radians(azimuth_deg)
    el = math.radians(elevation_deg)
    radius = HEAD_RADIUS + offset
    return (
        HEAD_CENTER[0] + radius * math.sin(az) * math.cos(el),
        HEAD_CENTER[1] - radius * math.cos(az) * math.cos(el),
        HEAD_CENTER[2] + radius * math.sin(el),
    )


def axis_direction(rot_x_deg, rot_y_deg):
    """Arah sumbu +Z lokal setelah rotasi Euler XYZ (X lalu Y)."""
    ax = math.radians(rot_x_deg)
    ay = math.radians(rot_y_deg)
    return (math.cos(ax) * math.sin(ay), -math.sin(ax), math.cos(ax) * math.cos(ay))


def add_offset(point, direction, distance):
    return tuple(p + d * distance for p, d in zip(point, direction))


def finish(obj, material, parent, subsurf=0):
    obj.data.materials.append(material)
    for polygon in obj.data.polygons:
        polygon.use_smooth = True
    if subsurf:
        modifier = obj.modifiers.new("Soft", "SUBSURF")
        modifier.levels = subsurf
        modifier.render_levels = subsurf + 1
    obj.parent = parent
    return obj


def sphere(name, location, scale, material, parent, rotation_deg=(0, 0, 0)):
    bpy.ops.mesh.primitive_uv_sphere_add(
        segments=48, ring_count=24, radius=1.0, location=location
    )
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = scale
    obj.rotation_euler = tuple(math.radians(a) for a in rotation_deg)
    return finish(obj, material, parent)


def cone(name, base, rot_x_deg, rot_y_deg, length, radius_base, radius_tip, material, parent):
    """Kerucut dari titik `base` menuju arah rotasi; mengembalikan (objek, ujung)."""
    direction = axis_direction(rot_x_deg, rot_y_deg)
    center = add_offset(base, direction, length / 2.0)
    bpy.ops.mesh.primitive_cone_add(
        vertices=40,
        radius1=radius_base,
        radius2=radius_tip,
        depth=length,
        location=center,
    )
    obj = bpy.context.active_object
    obj.name = name
    obj.rotation_euler = (math.radians(rot_x_deg), math.radians(rot_y_deg), 0.0)
    finish(obj, material, parent, subsurf=1)
    return obj, add_offset(base, direction, length)


def cylinder(name, location, radius, depth, material, parent):
    bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=radius, depth=depth, location=location)
    obj = bpy.context.active_object
    obj.name = name
    return finish(obj, material, parent, subsurf=1)


def empty(name, location, parent, rotation_deg=(0, 0, 0)):
    obj = bpy.data.objects.new(name, None)
    bpy.context.collection.objects.link(obj)
    obj.location = location
    obj.rotation_euler = tuple(math.radians(a) for a in rotation_deg)
    obj.parent = parent
    return obj


# --------------------------------------------------------------------------- #
# Model Hudi
# --------------------------------------------------------------------------- #
def build_hudi(pose):
    mats = make_materials()
    rig = empty("Hudi", (0, 0, pose["bounce"]), None, (pose["lean"], 0, pose["turn"]))

    # Badan & perut
    sphere("Body", (0, 0.15, 0.95), (0.95, 0.9, 1.05), mats["emerald"], rig)
    sphere("Belly", (0, -0.3, 0.8), (0.7, 0.55, 0.8), mats["belly"], rig)

    # Kepala
    sphere(
        "Head",
        HEAD_CENTER,
        (HEAD_RADIUS, HEAD_RADIUS, HEAD_RADIUS),
        mats["emerald"],
        rig,
    )
    for side in (-1, 1):
        sphere(
            f"Blush_{side}",
            head_point(side * 52, -8, -0.03),
            (0.14, 0.06, 0.1),
            mats["blush"],
            rig,
        )

    # Paruh: kerucut panjang sedikit menunduk.
    cone(
        "Beak",
        head_point(0, -6, -0.12),
        rot_x_deg=102,
        rot_y_deg=0,
        length=1.25,
        radius_base=0.2,
        radius_tip=0.03,
        material=mats["beak"],
        parent=rig,
    )

    # Jambul: kipas lima bulu bertip hitam.
    lengths = (0.85, 1.0, 1.1, 1.0, 0.8)
    for index, base_angle in enumerate((-55, -30, -8, 12, 32)):
        rot_x = base_angle + pose["crest"]
        rot_y = (index - 2) * 9
        _, tip = cone(
            f"Crest_{index}",
            head_point(0, 68, -0.1),
            rot_x_deg=rot_x,
            rot_y_deg=rot_y,
            length=lengths[index],
            radius_base=0.13,
            radius_tip=0.035,
            material=mats["gold"],
            parent=rig,
        )
        sphere(f"CrestTip_{index}", tip, (0.075, 0.075, 0.075), mats["ink"], rig)

    # Mata & alis
    for side in (-1, 1):
        eye_az = side * 31
        if pose["eye"] == "happy":
            # Mata tertawa "^": dua goresan miring.
            for tilt in (28, -28):
                sphere(
                    f"EyeHappy_{side}_{tilt}",
                    head_point(eye_az, 12, 0.0),
                    (0.1, 0.05, 0.035),
                    mats["ink"],
                    rig,
                    rotation_deg=(0, side * tilt, 0),
                )
        else:
            sphere(f"EyeWhite_{side}", head_point(eye_az, 12, -0.02), (0.17, 0.12, 0.2),
                   mats["white"], rig)
            sphere(f"EyePupil_{side}", head_point(eye_az, 12, 0.07), (0.095, 0.06, 0.11),
                   mats["ink"], rig)
            sphere(f"EyeGlint_{side}", head_point(eye_az + side * 4, 17, 0.11),
                   (0.03, 0.02, 0.03), mats["white"], rig)

        if pose["brow"]:
            sphere(
                f"Brow_{side}",
                head_point(side * 34, 31, 0.0),
                (0.21, 0.05, 0.04),
                mats["ink"],
                rig,
                rotation_deg=(0, side * pose["brow"], 0),
            )

    # Sayap: pivot di bahu supaya mudah diangkat saat perayaan.
    for side in (-1, 1):
        pivot = empty(f"WingPivot_{side}", (side * 0.85, 0.2, 1.65), rig, (0, side * pose["wing"], 0))
        sphere(f"Wing_{side}", (side * 0.08, 0.1, -0.65), (0.22, 0.6, 0.85), mats["wing"], pivot)
        for band, z in enumerate((-0.35, -0.65, -0.95)):
            sphere(
                f"WingBand_{side}_{band}",
                (side * 0.285, 0.1, z),
                (0.05, 0.5, 0.075),
                mats["gold"],
                pivot,
            )

    # Ekor
    cone(
        "Tail",
        (0, 0.85, 0.55),
        rot_x_deg=-110,
        rot_y_deg=0,
        length=1.0,
        radius_base=0.38,
        radius_tip=0.1,
        material=mats["wing"],
        parent=rig,
    )

    # Kaki
    for side in (-1, 1):
        cylinder(f"Leg_{side}", (side * 0.3, -0.1, -0.12), 0.07, 0.35, mats["beak"], rig)
        sphere(f"Foot_{side}", (side * 0.3, -0.22, -0.3), (0.16, 0.24, 0.06), mats["beak"], rig)

    return rig


# --------------------------------------------------------------------------- #
# Kamera, cahaya, render
# --------------------------------------------------------------------------- #
def aim_at(obj, target):
    constraint = obj.constraints.new("TRACK_TO")
    constraint.target = target
    constraint.track_axis = "TRACK_NEGATIVE_Z"
    constraint.up_axis = "UP_Y"


def add_light(name, location, energy, size, color, target):
    data = bpy.data.lights.new(name, "AREA")
    data.energy = energy
    data.size = size
    data.color = color
    obj = bpy.data.objects.new(name, data)
    bpy.context.collection.objects.link(obj)
    obj.location = location
    aim_at(obj, target)
    return obj


def setup_scene(size, samples, engine):
    scene = bpy.context.scene
    focus = bpy.data.objects.new("FocusTarget", None)
    bpy.context.collection.objects.link(focus)
    focus.location = (0, 0, 1.75)

    camera_data = bpy.data.cameras.new("HudiCam")
    camera_data.lens = 70
    camera = bpy.data.objects.new("HudiCam", camera_data)
    bpy.context.collection.objects.link(camera)
    camera.location = (0, -10.5, 1.9)
    aim_at(camera, focus)
    scene.camera = camera

    add_light("Key", (4.5, -6.0, 6.5), 900, 5.0, (1.0, 0.95, 0.88), focus)
    add_light("Fill", (-5.5, -5.0, 2.5), 280, 6.0, (0.85, 0.92, 1.0), focus)
    add_light("Rim", (0.0, 6.5, 5.5), 320, 4.0, (1.0, 1.0, 1.0), focus)

    world = scene.world or bpy.data.worlds.new("World")
    scene.world = world
    world.use_nodes = True
    background = world.node_tree.nodes.get("Background")
    if background is not None:
        background.inputs["Color"].default_value = (0.8, 0.86, 0.95, 1.0)
        background.inputs["Strength"].default_value = 0.35

    render = scene.render
    available = {item.identifier for item in render.bl_rna.properties["engine"].enum_items}
    candidates = (engine,) if engine else ("CYCLES", "BLENDER_EEVEE_NEXT", "BLENDER_EEVEE")
    for candidate in candidates:
        if candidate in available:
            render.engine = candidate
            break

    if render.engine == "CYCLES":
        scene.cycles.samples = samples
        scene.cycles.device = "CPU"
        try:
            scene.cycles.use_denoising = True
        except Exception:  # denoiser tidak tersedia di build ini
            pass

    render.resolution_x = size
    render.resolution_y = size
    render.resolution_percentage = 100
    render.film_transparent = True
    render.image_settings.file_format = "PNG"
    render.image_settings.color_mode = "RGBA"
    try:
        scene.view_settings.view_transform = "Standard"
    except TypeError:
        pass


def parse_args():
    argv = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
    parser = argparse.ArgumentParser(description="Render maskot Hudi (gaya clay 3D).")
    parser.add_argument("--out", default=DEFAULT_OUT, help="folder keluaran PNG")
    parser.add_argument("--size", type=int, default=768, help="sisi gambar persegi (px)")
    parser.add_argument("--samples", type=int, default=64, help="sampel Cycles")
    parser.add_argument("--engine", default=None, help="CYCLES, BLENDER_EEVEE_NEXT, ...")
    parser.add_argument("--poses", nargs="+", choices=sorted(POSES), default=sorted(POSES))
    parser.add_argument("--no-render", action="store_true", help="hanya bangun mesh")
    parser.add_argument("--save-blend", default=None, help="simpan pose pertama ke .blend")
    return parser.parse_args(argv)


def main():
    args = parse_args()
    os.makedirs(args.out, exist_ok=True)

    for index, name in enumerate(args.poses):
        clear_scene()
        build_hudi(POSES[name])
        setup_scene(args.size, args.samples, args.engine)

        if index == 0 and args.save_blend:
            bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(args.save_blend))

        if args.no_render:
            continue

        path = os.path.join(args.out, f"hudi-{name}.png")
        bpy.context.scene.render.filepath = path
        bpy.ops.render.render(write_still=True)
        print(f"[hudi] tersimpan: {path}")


if __name__ == "__main__":
    main()
