#!/usr/bin/env python3
"""Clean remaining visible Oryzo/coaster copy without touching tags/asset URLs."""
from pathlib import Path
import re
p=Path('public/oryzo-reference/index.html')
s=p.read_text()
parts=re.split(r'(<[^>]+>)', s)
word_repls=[
 ('Lusion','AIOW'), ('lusion.co','aiow.com'), ('Oryzo','AIOW'), ('oryzo','Debbie'),
 ('coaster','workflow'), ('Coaster','Workflow'), ('cork','context'), ('Cork','Context'),
 ('mug','agent'), ('Mug','Agent'), ('mugs','agents'), ('Mugs','Agents'),
 ('coffee','AI'), ('Coffee','AI'), ('table','stack'), ('Table','Stack'), ('tables','systems'), ('Tables','Systems'),
 ('Adobe','AI'), ('Illustrator','Workflow'),
]
phrase_repls={
 'Designed\nby AIOW,\nthe award-winning\ndesign studio.':'Designed\nby AIOW,\nwith Debbie as\nthe operating layer.',
 "The world's most\nunnecessarily\nsophisticated context workflow.":'The AI Key that turns scattered tools\ninto one trusted operating system.',
 'isn’t just\na workflow.':'isn’t just\na website.',
 'AIOW isn’t just a\nworkflow. It’s the result\nof unprecedented AI*\nbreakthroughs.':'AIOW isn’t just a\nlanding page. It’s the start\nof an AI operating\nworkflow.',
 'We said high five.\nIt heard six.':'You give the signal.\nThe system clicks.',
 "So portable,\nit's wearable":'So modular,\nit scales',
 'Warning\nThis stunt was performed by professionals.\nDo not attempt this at home.':'Signal\nHuman approval stays in the loop.\nNo black-box autopilot.',
 'Hey\nDebbie\n, can you put on a bikini?':'Hey\nDebbie\n, route this to the right agent.',
 'AI SLOP IDEAS\nFOR THIS\nWINTER':'AI WORKFLOWS\nFOR REAL\nOPERATIONS',
 'We Are So\nCooked!':'We Are So\nBack.',
 "AIOW is taking everyone's jobs...\nand replacing them with AI!":'Debbie is taking scattered AI tasks...\nand turning them into operating flow.',
 'An open-weight model designed to be\nlightweight and easy to carry.':'A visible operating layer designed to be\nmodular, inspectable, and trusted.',
 'With a precision-engineered lift (exactly one workflow thick), AIOW doesn’t just hold your agent - it elevates it. Literally. Above every boring surface you’ve ever known.':'With a visible AI Key, AIOW does not just trigger an agent — it seats intent, turns control, and unlocks work in the right layer.',
 'Smart flip\nencryption':'Smart key\nauthorization',
 'Write a message. Flip. Instantly secure - until\nsomeone flips it back. Genius.':'Give intent. Seat the key. Actions unlock only when the proof layer says yes.',
 'Grip-locked Antislip\ntechnology':'Key-locked approval\ntechnology',
 'Micro-textured context so grippy your drink files\na restraining order against gravity. Spills?\nConsider them politely discouraged.':'Human gates and audit trails so clear your agents stop drifting. Chaos? Politely discouraged.',
 'Pure context sourced sustainably.\nCompletely vegan - no cows were harmed,\nbut it might be full of "bull"sh*t.':'Built for durable AI operations.\nNo mystery automations, no hidden handoffs,\nno theatre.',
 'Average\nage of first\nharvest':'Average\ntime to first\nworkflow',
 'Harvesting\ninterval':'Review\ninterval',
 'Power draw\nwhile in use':'Control lost\nwhile in use',
 'Runs on the edge\nRefuses the cloud':'Runs with proof\nRefuses the chaos',
 'On-device.':'On-chain ready.',
 '24/7 UPTIME. No power required.':'24/7 context. No guesswork required.',
 'No More OOM on any consumer GPUs':'No more chaos across your AI tools',
 'Perfect By Design':'Proof By Design',
 'Test conditions: hard surface':'Test conditions: real operations',
 'Damage: The Floor ;)':'Damage: The Bottleneck ;)',
 'Supporting backward compatibility since the 5th millennium BCE':'Supporting human judgment since before the cloud',
 'Choose you own':'Choose your layer',
 'The original. Refined until it feels inevitable. Lifts just enough, grips just right, and quietly disappears into your day like it was never there.':'The entry key. One visible workflow, one accountable handoff, one clean unlock.',
 'A little more presence. Double the context, double the confidence - without losing the plot.':'The team layer. More context, better routing, and calmer multi-agent execution.',
 'Maximum stack for maximum unnecessary satisfaction. A bold little pedestal for your agent and a quiet flex for the whole desk.':'The operating layer. Maximum proof, maximum orchestration, and a visible system for serious AI work.',
 'Single layer lift':'Single workflow unlock',
 'Double stack lift':'Multi-agent routing',
 'Triple stack lift':'Full ops layer',
 'Natural context insulation':'Context-backed execution',
 'More mass, more steadiness':'More proof, more confidence',
 'Extra insulation by design':'Governance by design',
 'Stable grip on everyday surfaces':'Stable control across tools',
 'Designed to be stardout':'Designed to stand out',
 'Deployable on RTX 3090, on device':'Deployable across your stack',
 'Custom reviews [ 364 ]':'Operator signals [ 364 ]',
 'This is the\nbest workflow\nthat I\'ve\never used. I can\'t go to the space\nwithout it':'This is the\nfirst AI system\nthat actually\nfeels controllable.',
 'NASA astronaut wannabe':'Ops lead',
 'Old-school Pirate':'Workflow owner',
 'AI influencer, Ex-Web3 influencer':'AI operator',
 'Minimalist':'Product lead',
 'Flat Earth believer':'Skeptical founder',
 'WE CAUGHT YOUR ATTENTION WITH A VISIBLE AI KEY.':'WE CAUGHT YOUR ATTENTION WITH A VISIBLE AI KEY.',
}
for i,part in enumerate(parts):
    if not part.startswith('<'):
        t=part
        for old,new in word_repls:
            t=t.replace(old,new)
        for old,new in phrase_repls.items():
            t=t.replace(old,new)
        parts[i]=t
p.write_text(''.join(parts))
print('cleaned visible text')
