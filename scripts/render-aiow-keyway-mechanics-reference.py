#!/usr/bin/env python3
"""Blender mechanics reference for AIOW AI Key true insertion.
Creates an exact 3D key/slot relationship: blade passes through a machined keyway,
front plate/lip occludes the blade, contact shadows prove the key is inside.
"""
import bpy, math
from mathutils import Vector
from pathlib import Path

OUT = Path('/Users/handsomebastard/projects/aiow-website/public/aiow/story-v416/proofs/aiow-keyway-mechanics-reference.png')

bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete()

scene = bpy.context.scene
scene.render.engine = 'CYCLES'
scene.cycles.samples = 96
scene.render.resolution_x = 1536
scene.render.resolution_y = 1024
scene.view_settings.view_transform = 'Filmic'
scene.view_settings.look = 'Medium High Contrast'
scene.view_settings.exposure = -0.25
scene.view_settings.gamma = 1

# Materials

def mat(name, color, metallic=0, roughness=0.35, emission=None):
    m=bpy.data.materials.new(name); m.use_nodes=True
    bsdf=m.node_tree.nodes.get('Principled BSDF')
    if bsdf:
        bsdf.inputs['Base Color'].default_value=color
        bsdf.inputs['Metallic'].default_value=metallic
        bsdf.inputs['Roughness'].default_value=roughness
        if emission:
            bsdf.inputs['Emission Color'].default_value=emission[0]
            bsdf.inputs['Emission Strength'].default_value=emission[1]
    return m

gold=mat('brushed champagne gold',(0.82,0.60,0.30,1),1,0.22)
titanium=mat('dark titanium',(0.055,0.052,0.05,1),1,0.28)
black=mat('black internal keyway',(0.002,0.0015,0.001,1),0,0.72)
blue=mat('muted blue light channel',(0.18,0.36,0.65,1),0,0.18,((0.18,0.36,0.75,1),0.45))
warm=mat('warm seam hairline',(1.0,0.78,0.40,1),0,0.2,((1.0,0.62,0.24,1),0.8))

# Helpers

def cube(name, loc, scale, material):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    o=bpy.context.object; o.name=name; o.dimensions=scale; bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if material: o.data.materials.append(material)
    bevel=o.modifiers.new('small bevel','BEVEL'); bevel.width=0.025; bevel.segments=3
    o.modifiers.new('weighted normals','WEIGHTED_NORMAL')
    return o

def cyl(name, loc, radius, depth, material, vertices=96, rot=(0,0,0)):
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices, radius=radius, depth=depth, location=loc, rotation=rot)
    o=bpy.context.object; o.name=name
    if material: o.data.materials.append(material)
    bevel=o.modifiers.new('soft bevel','BEVEL'); bevel.width=0.018; bevel.segments=3
    o.modifiers.new('weighted normals','WEIGHTED_NORMAL')
    return o

# Coordinate: key inserts along X axis into lock at x=0, key head outside at x=2.35.
# Lock body and front plate
lock_body = cube('deep lock body / dark tunnel', (-0.55,0,0), (1.7,1.65,0.62), black)
front_plate = cube('front metal plate with machined lip', (0.18,0,0), (0.20,1.75,0.72), titanium)
bezel = cyl('round champagne lock bezel', (0.31,0,0), 0.72, 0.08, gold, rot=(0,math.pi/2,0))

# Key blade exact profile pieces pass through the front lip into the dark tunnel.
# Visible rear part outside + inserted part inside are continuous objects.
blade_main = cube('AIOW key blade - continuous inserted spine', (0.95,0,0.0), (2.35,0.15,0.105), gold)
blade_top_rail = cube('AIOW key blade top rail matched by keyway', (0.72,0.095,0.072), (1.75,0.06,0.046), titanium)
blade_lower_tooth = cube('AIOW key blade lower tooth inside slot', (0.62,-0.125,-0.085), (0.55,0.12,0.075), gold)
blade_upper_step = cube('AIOW key blade upper step inside slot', (0.18,0.17,0.07), (0.42,0.10,0.065), gold)
blue_line = cube('subtle blue inset on exposed shaft', (1.42,0,0.071), (0.78,0.035,0.012), blue)

# Occluding lip masks: placed in front of blade around keyway opening to prove blade is inside.
lip_top = cube('upper keyway lip occluding blade', (0.42,0,0.165), (0.26,0.70,0.115), titanium)
lip_bottom = cube('lower keyway lip occluding blade', (0.42,0,-0.165), (0.26,0.70,0.115), titanium)
lip_left = cube('left tight keyway wall', (0.42,-0.245,0), (0.26,0.08,0.22), titanium)
lip_right = cube('right tight keyway wall', (0.42,0.245,0), (0.26,0.08,0.22), titanium)
# black inner visible slots around blade
inner_shadow_top = cube('black tunnel visible above blade', (0.455,0,0.105), (0.02,0.55,0.035), black)
inner_shadow_bottom = cube('black tunnel visible below blade', (0.455,0,-0.105), (0.02,0.55,0.035), black)
seam_reflect = cube('tiny warm seam reflection only', (0.465,0,0.092), (0.012,0.50,0.008), warm)

# Key head outside lock
head = cyl('round AIOW key head outside slot', (2.12,0,0), 0.38, 0.105, gold, rot=(0,math.pi/2,0))
head_hole = cyl('dark hole through key head visual', (2.13,0.005,0.01), 0.145, 0.12, black, rot=(0,math.pi/2,0))
engrave = cube('subtle AIOW engraving plate', (2.075,-0.012,0.18), (0.01,0.22,0.035), titanium)

# Add a desk plane
bpy.ops.mesh.primitive_plane_add(size=7, location=(0.7,0,-0.42))
plane=bpy.context.object; plane.name='dark warm desk plane'; plane.data.materials.append(mat('dark warm desk',(0.055,0.037,0.025,1),0,0.48))

# Lighting
bpy.ops.object.light_add(type='AREA', location=(1.8,-2.2,2.7)); l=bpy.context.object; l.name='large warm softbox'; l.data.energy=520; l.data.size=4
bpy.ops.object.light_add(type='POINT', location=(-0.7,1.2,0.8)); p=bpy.context.object; p.name='tiny seam bounce'; p.data.energy=45; p.data.color=(1.0,0.72,0.38)

# Camera
bpy.ops.object.camera_add(location=(3.25,-2.05,1.05), rotation=(math.radians(68),0,math.radians(58)))
cam=bpy.context.object; scene.camera=cam
cam.data.lens=72
cam.data.dof.use_dof=True
cam.data.dof.focus_object=front_plate
cam.data.dof.aperture_fstop=5.6

# Annotation markers small, non-public? Avoid text. Add tiny arrows as geometry showing hidden blade in tunnel
# Render
OUT.parent.mkdir(parents=True, exist_ok=True)
scene.render.filepath=str(OUT)
bpy.ops.render.render(write_still=True)
print(OUT)
