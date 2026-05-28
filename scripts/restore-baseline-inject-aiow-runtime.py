#!/usr/bin/env python3
from pathlib import Path
import shutil
src=Path('public/oryzo-reference-baseline/index.html')
p=Path('public/oryzo-reference/index.html')
shutil.copyfile(src,p)
s=p.read_text()
script = r'''<script id="aiow-copy-runtime-patch">
(() => {
  const map = [
    [/\bORYZO AI\b/g, 'AIOW AI Key'], [/\bORYZO-1\b/g, 'AI KEY-1'], [/\bOryzo-1\b/g, 'AI Key-1'], [/\bORYZO\b/g, 'AIOW'], [/\bOryzo\b/g, 'AIOW'], [/\boryzo\b/g, 'Debbie'],
    [/Made for mugs\. Built for tables\./g, 'Built for agents. Made for work.'],
    [/Designed to lift, insulate, and grip in all the right ways\. AIOW makes the simplest moment feel considered\./g, 'Designed to unlock, route, and verify AI work in all the right places. AIOW makes every agent action feel intentional.'],
    [/\bLusion\b/g, 'AIOW'], [/the award-winning\s+design studio\./gi, 'with Debbie as the operating layer.'],
    [/The world's most\s+unnecessarily\s+sophisticated cork coaster\./gi, 'The AI Key turns scattered tools into one trusted operating system.'],
    [/isn’t just\s+a coaster\./gi, 'isn’t just a website.'], [/coaster/gi, 'workflow'], [/cork/gi, 'context'], [/mugs/gi, 'agents'], [/mug/gi, 'agent'], [/coffee/gi, 'AI'],
    [/Powered by AI/g, 'Powered by Debbie'], [/Adobe/g, 'AI'], [/Illustrator/g, 'Workflow'],
    [/Try to hover hand/g, 'Turn the key'], [/AI fills in the gaps\./g, 'Debbie routes the work.'], [/We said high five\.\s*It heard six\./g, 'You give the signal. The system clicks.'],
    [/So portable,\s+it's wearable/gi, 'So modular, it scales'], [/Warning/g, 'Signal'], [/This stunt was performed by professionals\./g, 'Human approval stays in the loop.'], [/Do not attempt this at home\./g, 'No black-box autopilot.'],
    [/Hey\s+Debbie\s+, can you put on a bikini\?/gi, 'Hey Debbie, route this to the right agent.'], [/AI SLOP IDEAS/g, 'AI WORKFLOWS'], [/FOR THIS/g, 'FOR REAL'], [/WINTER/g, 'OPERATIONS'], [/We Are So\s+Cooked!/g, 'We Are So Back.'],
    [/taking everyone’s jobs|taking everyone's jobs/g, 'turning scattered AI tasks'], [/and replacing them with AI!/g, 'into operating flow.'],
    [/An open-weight model designed to be\s+lightweight and easy to carry\./gi, 'A visible operating layer designed to be modular, inspectable, and trusted.'],
    [/Rise above mediocrity/g, 'Unlock better execution'], [/Elevate your AI experience/g, 'Unlock your AI workflow'], [/Thermodynamic stability/g, 'Operational stability'], [/Now 37\.9% More Circular/g, 'Now 37.9% More Aligned'],
    [/Perfectly Round, Seriously/g, 'Perfectly Routed, Seriously'], [/Constant lift via geometry/g, 'Constant flow via routing'], [/THERMAL DIFFUSION MODEL \(TDM\)/g, 'TRUSTED DELEGATION MODEL (TDM)'], [/Circularity \(circle = 1\.0\)/g, 'Alignment (signal = 1.0)'], [/RoPE: Roundness Optimization & Perimeter Engineering/g, 'RoPE: Routing, Ownership and Proof Engineering'],
    [/Secure communications simplified/g, 'Secure execution simplified'], [/Smart flip/g, 'Smart key'], [/encryption/g, 'authorization'], [/Encode Message/g, 'Lock Action'], [/Decode Message/g, 'Unlock Action'],
    [/Precision Grip, Zero Drama/g, 'Precise Control, Zero Drama'], [/Grip-locked Antislip/g, 'Key-locked approval'], [/Friction coefficient/g, 'Trust coefficient'],
    [/100% Plant-based/gi, '100% Human-led'], [/Vegan-friendly/gi, 'Agent-friendly'], [/sustainability/gi, 'governance'],
    [/People all around the world love AIOW/g, 'Teams around the system trust Debbie'], [/Rating & Reviews/g, 'Signals & Proof'],
    [/Runs on the edge/g, 'Runs with proof'], [/Refuses the cloud/g, 'Refuses the chaos'], [/ON-DEVICE\./gi, 'ON-CHAIN READY.'], [/Always On/g, 'Always Routed'], [/24\/7 UPTIME\. NO POWER REQUIRED\./gi, '24/7 CONTEXT. NO GUESSWORK REQUIRED.'], [/Runs on RTX 3090/g, 'Runs on your stack'], [/NO MORE OOM ON ANY CONSUMER GPUS/gi, 'NO MORE CHAOS ACROSS YOUR AI TOOLS'], [/PERFECT BY DESIGN/gi, 'PROOF BY DESIGN'], [/Drop-Tested/g, 'Stress-Tested'], [/TEST CONDITIONS: HARD SURFACE/gi, 'TEST CONDITIONS: REAL OPERATIONS'], [/DAMAGE: THE FLOOR ;\)/gi, 'DAMAGE: THE BOTTLENECK ;)'], [/Legacy Support/g, 'Human Support'], [/SUPPORTING BACKWARD COMPATIBILITY SINCE THE 5TH MILLENNIUM BCE/gi, 'SUPPORTING HUMAN JUDGMENT SINCE BEFORE THE CLOUD'],
    [/CHOOSE YOU OWN/gi, 'CHOOSE YOUR LAYER'],
    [/One workflow\. One job\. Done beautifully\./g, 'One key. One workflow. Done visibly.'], [/Twice the context\. Twice the commitment\. Still effortless\./g, 'More routing. More context. Still calm.'], [/Three layers of confidence\. For people who like their AI slightly above it all\./g, 'Maximum proof. Maximum orchestration. For teams that need AI to actually operate.'],
    [/OUR SOTA OPEN WEIGHT MODEL/g, 'OUR VISIBLE OPERATING MODEL'], [/Paper/g, 'Blueprint'], [/MODEL \(\.OBJ\)/g, 'KEY MAP'], [/Code coming soon/g, 'Agents coming online'], [/Abstract/g, 'Operating thesis'],
    [/WE CAUGHT YOUR ATTENTION WITH A NON-EXISTENT PRODUCT\./g, 'WE CAUGHT YOUR ATTENTION WITH A VISIBLE AI KEY.'], [/IF WE CAN SELL A WORKFLOW, IMAGINE WHAT WE CAN DO FOR YOUR BRAND\./g, 'IF WE CAN MAKE AI FEEL THIS TANGIBLE, IMAGINE WHAT WE CAN DO FOR YOUR OPERATIONS.'], [/lusion\.co/g, 'aiow.com'], [/WITH LOVE/g, 'WITH DEBBIE'], [/SHARE WITH FRIENDS/g, 'SHARE WITH BUILDERS'], [/IF YOU LIKE IT/g, 'IF YOU GET IT'], [/SUBSCRIBE TO AIOW'S NEWSLETTER:/g, 'SUBSCRIBE TO AIOW UPDATES:'], [/business@aiow\.co/g, 'business@aiow.com'], [/hello@aiow\.co/g, 'hello@aiow.com']
  ];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const p = node.parentElement;
      if (!p || ['SCRIPT','STYLE','NOSCRIPT'].includes(p.tagName)) return NodeFilter.FILTER_REJECT;
      return node.nodeValue.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
    }
  });
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  for (const n of nodes) {
    let v = n.nodeValue;
    for (const [rx, repl] of map) v = v.replace(rx, repl);
    n.nodeValue = v;
  }
  document.title = 'AIOW AI Key';
})();
</script>'''
s=s.replace('</body>', script+'</body>')
p.write_text(s)
print('restored baseline and injected runtime-only patch')
