#!/usr/bin/env python3
"""End-to-end HTTP proof for the disabled adapter and Gmail outbox worker."""
import base64, datetime as dt, json, os, pathlib, signal, subprocess, sys, tempfile, threading, time, urllib.error, urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from zoneinfo import ZoneInfo
from typing import cast
ROOT=pathlib.Path(__file__).resolve().parents[2]
BASE=int(os.environ.get("AIOW_ADAPTER_PROOF_PORT","4660")); SECRET="adapter-proof-secret-0123456789abcdef"; WORKER="worker-proof-secret-0123456789abcdef"
LEAD="11111111-1111-4111-8111-111111111111"; LEASE1="22222222-2222-4222-8222-222222222221"; LEASE2="22222222-2222-4222-8222-222222222222"
def exact_pdf(): return b"%PDF-1.4\n%%EOF\n"
def payload():
 return {"configuration":{"segment":"business","serviceRoute":"standard","people":10,"contextSlug":"accountants","smartDesign":{"modules":[]}},"contact":{"name":"Adapter Proof","email":"proof@example.com","phone":"+31 20 123 4567","company":"Proof BV","postcode":"","kvk":"12345678","startDate":"","note":"HTTP adapter proof"},"consent":{"accepted":True,"version":"aiow-quote-v1"},"source":{"route":"/","locale":"nl"},"website":""}
def http(url,method="GET",body=None,headers=None):
 data=None if body is None else (body if isinstance(body,bytes) else json.dumps(body,separators=(",",":")).encode())
 req=urllib.request.Request(url,data=data,method=method,headers=headers or {})
 try:
  with urllib.request.urlopen(req,timeout=25) as r: return r.status,dict(r.headers.items()),r.read()
 except urllib.error.HTTPError as e: return e.code,dict(e.headers.items()),e.read()
def stop(proc):
 if proc and proc.poll() is None:
  os.killpg(proc.pid,signal.SIGTERM)
  try: proc.wait(timeout=8)
  except subprocess.TimeoutExpired: os.killpg(proc.pid,signal.SIGKILL); proc.wait(timeout=3)
def wait(port,proc):
 end=time.time()+35
 while time.time()<end:
  if proc.poll() is not None: raise RuntimeError(f"Next exited {proc.returncode}")
  try:
   if urllib.request.urlopen(f"http://127.0.0.1:{port}/privacy",timeout=1).status==200:return
  except Exception: time.sleep(.15)
 raise RuntimeError("Next not ready")
class State:
 def __init__(self): self.events=[]; self.commit=None; self.mode="success"; self.claimed=set()
class Server(ThreadingHTTPServer): state:State
class Handler(BaseHTTPRequestHandler):
 def reply(self,status,obj):
  raw=json.dumps(obj,separators=(",",":")).encode(); self.send_response(status); self.send_header("content-type","application/json"); self.send_header("content-length",str(len(raw))); self.end_headers(); self.wfile.write(raw)
 def body(self): return json.loads(self.rfile.read(int(self.headers.get("content-length","0"))) or b"{}")
 def do_POST(self):
  s=cast(Server,self.server).state
  if self.path=="/token":
   raw=self.rfile.read(int(self.headers.get("content-length","0"))); assert b"grant_type=" in raw and b"assertion=" in raw
   s.events.append({"type":"token"}); self.reply(200,{"access_token":"mock-access-token","token_type":"Bearer"}); return
  data=self.body()
  if self.path=="/control": s.mode=data["mode"]; s.claimed.discard(s.mode); self.reply(200,{"ok":True}); return
  if self.path=="/gmail":
   raw=base64.urlsafe_b64decode(data["raw"]+"="*((4-len(data["raw"])%4)%4)).decode("utf8","replace"); recipient=next((line[4:] for line in raw.split("\r\n") if line.startswith("To: ")),""); attachment="Content-Disposition: attachment" in raw
   s.events.append({"type":"gmail","to":recipient,"attachment":attachment})
   if recipient=="transient@example.com": self.reply(503,{"error":"temporary"})
   elif recipient=="permanent@example.com": self.reply(400,{"error":"permanent"})
   elif recipient=="ambiguous@example.com": self.connection.shutdown(2); self.connection.close()
   else: self.reply(200,{"id":f"gmail_{len(s.events)}"})
   return
  prefix="/rest/v1/rpc/"
  if not self.path.startswith(prefix): self.reply(404,{"error":"not found"}); return
  rpc=self.path[len(prefix):]; s.events.append({"type":"rpc","name":rpc})
  year=dt.datetime.now(ZoneInfo("Europe/Amsterdam")).year
  if rpc=="aiow_quote_prepare_v1": self.reply(200,{"accepted":True,"quoteNumber":f"AIOW-{year}-0001","leadId":LEAD,"receivedAt":data["p_received_at"]}); return
  if rpc=="aiow_quote_commit_v1": s.commit=data; self.reply(200,{"accepted":True}); return
  if rpc=="aiow_quote_claim_outbox_v1":
   if s.mode in s.claimed: self.reply(200,[]); return
   s.claimed.add(s.mode); pdf=base64.b64encode(exact_pdf()).decode(); sha=__import__('hashlib').sha256(exact_pdf()).hexdigest()
   def job(i,to,lease): return {"id":str(i),"kind":"customer_quote","payload":{"from":"offerte@aiow.ai","to":to,"subject":"Proof","text":"Proof","html":"<p>Proof</p>"},"attempts":1,"leaseToken":lease,"attachmentFilename":f"AIOW-{year}-0001.pdf","attachmentMimeType":"application/pdf","attachmentBase64":pdf,"attachmentSha256":sha}
   if s.mode=="failures": jobs=[job(3,"transient@example.com",LEASE1),job(4,"permanent@example.com",LEASE2),job(5,"ambiguous@example.com","22222222-2222-4222-8222-222222222225"),job(6,"finalize@example.com","22222222-2222-4222-8222-222222222226")]
   else:
    c=(s.commit or {}).get("p_customer_mail",{"from":"offerte@aiow.ai","to":"proof@example.com","subject":"Proof","text":"Proof","html":"<p>Proof</p>"}); i=(s.commit or {}).get("p_internal_mail",{"from":"offerte@aiow.ai","to":"offerte@aiow.ai","subject":"Lead","text":"Lead","html":"<p>Lead</p>"})
    jobs=[{"id":"1","kind":"customer_quote","payload":c,"attempts":1,"leaseToken":LEASE1,"attachmentFilename":f"AIOW-{year}-0001.pdf","attachmentMimeType":"application/pdf","attachmentBase64":pdf,"attachmentSha256":sha},{"id":"2","kind":"internal_lead","payload":i,"attempts":1,"leaseToken":LEASE2,"attachmentFilename":None,"attachmentMimeType":None,"attachmentBase64":None,"attachmentSha256":None}]
   self.reply(200,jobs); return
  if rpc=="aiow_quote_outbox_sent_v1" and str(data.get("p_outbox_id"))=="6": self.reply(503,{"code":"DB_UNAVAILABLE"}); return
  if rpc in ("aiow_quote_outbox_sent_v1","aiow_quote_outbox_retry_v1","aiow_quote_outbox_dead_v1","aiow_quote_outbox_review_v1"):
   self.reply(200,{"accepted":True,"state":"retry"} if rpc.endswith("retry_v1") else {"accepted":True}); return
  self.reply(404,{"code":"RPC_MISSING"})
 def log_message(self, format, *args): pass
def start_next(port,env,out):
 proc=subprocess.Popen(["bun","x","next","start","-p",str(port)],cwd=ROOT,env=env,stdout=out,stderr=subprocess.STDOUT,start_new_session=True); wait(port,proc); return proc
def main():
 if not (ROOT/".next/BUILD_ID").exists(): raise SystemExit("Run bun run build first")
 tmp=pathlib.Path(tempfile.mkdtemp(prefix="aiow-adapter-http-")); disabled_out=(tmp/"disabled.log").open("w+"); configured_out=(tmp/"configured.log").open("w+"); mock_out=(tmp/"mock.log").open("w+"); disabled=configured=mock=None
 try:
  env=os.environ.copy()
  for key in list(env):
   if key.startswith("AIOW_QUOTE_") or key.startswith("AIOW_SUPABASE_") or key.startswith("AIOW_GOOGLE_") or key in ("CRON_SECRET",): env.pop(key,None)
  disabled=start_next(BASE,env,disabled_out)
  status,_,_=http(f"http://127.0.0.1:{BASE}/api/internal/quote-adapter","POST",{}, {"content-type":"application/json"}); assert status==503
  status,_,_=http(f"http://127.0.0.1:{BASE}/api/internal/quote-outbox/run","POST",{}, {"authorization":f"Bearer {WORKER}"}); assert status==503
  status,_,_=http(f"http://127.0.0.1:{BASE}/api/quote","POST",payload(),{"content-type":"application/json","idempotency-key":"adapter-disabled-0001"}); assert status==503
  stop(disabled); disabled=None
  state=State(); mock=Server(("127.0.0.1",BASE+100),Handler); mock.state=state; thread=threading.Thread(target=mock.serve_forever,daemon=True); thread.start()
  keyfile=tmp/"key.pem"; subprocess.run(["openssl","genpkey","-algorithm","RSA","-pkeyopt","rsa_keygen_bits:2048","-out",str(keyfile)],check=True,stdout=mock_out,stderr=mock_out)
  env.update({"AIOW_QUOTE_WEBHOOK_URL":f"http://127.0.0.1:{BASE+1}/api/internal/quote-adapter","AIOW_QUOTE_WEBHOOK_SECRET":SECRET,"AIOW_QUOTE_ADAPTER_TEST_MODE":"1","AIOW_SUPABASE_URL":f"http://127.0.0.1:{BASE+100}","AIOW_SUPABASE_SERVICE_ROLE_KEY":"s"*40,"AIOW_QUOTE_WORKER_SECRET":WORKER,"AIOW_GOOGLE_SERVICE_ACCOUNT_EMAIL":"proof-service@example.iam.gserviceaccount.com","AIOW_GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY":keyfile.read_text(),"AIOW_GOOGLE_DELEGATED_SUBJECT":"offerte@aiow.ai","AIOW_QUOTE_PROVIDER_TEST_MODE":"1","AIOW_GOOGLE_TOKEN_URL":f"http://127.0.0.1:{BASE+100}/token","AIOW_GMAIL_SEND_URL":f"http://127.0.0.1:{BASE+100}/gmail"})
  configured=start_next(BASE+1,env,configured_out)
  wrong_headers={"content-type":"application/json","x-aiow-request-id":"wrong-signature-request","idempotency-key":"i"*20,"x-aiow-webhook-timestamp":str(int(time.time())),"x-aiow-webhook-signature":"0"*64}
  assert http(f"http://127.0.0.1:{BASE+1}/api/internal/quote-adapter","POST",{},wrong_headers)[0]==401
  status,headers,pdf=http(f"http://127.0.0.1:{BASE+1}/api/quote","POST",payload(),{"content-type":"application/json","idempotency-key":"adapter-public-proof-0001","x-vercel-ip-country":"NL"}); quote_header=next((value for key,value in headers.items() if key.lower()=="x-aiow-quote-number"),None); assert status==200 and pdf.startswith(b"%PDF-") and quote_header, (status,headers,pdf[:1000],state.events)
  rpc_names=[e["name"] for e in state.events if e["type"]=="rpc"]; assert rpc_names[:2]==["aiow_quote_prepare_v1","aiow_quote_commit_v1"]
  status,_,body=http(f"http://127.0.0.1:{BASE+1}/api/internal/quote-outbox/run","POST",{}, {"authorization":f"Bearer {WORKER}","content-type":"application/json"}); result=json.loads(body); assert status==200 and result["claimed"]==2 and result["sent"]==2
  gmail=[e for e in state.events if e["type"]=="gmail"]; assert any(e["to"]=="proof@example.com" and e["attachment"] for e in gmail) and any(e["to"]=="offerte@aiow.ai" and not e["attachment"] for e in gmail)
  http(f"http://127.0.0.1:{BASE+100}/control","POST",{"mode":"failures"},{"content-type":"application/json"})
  status,_,body=http(f"http://127.0.0.1:{BASE+1}/api/internal/quote-outbox/run","POST",{}, {"authorization":f"Bearer {WORKER}","content-type":"application/json"}); result=json.loads(body); assert status==200 and result["claimed"]==4 and result["retried"]==1 and result["dead"]==1 and result["review"]==2
  final=[e["name"] for e in state.events if e["type"]=="rpc"]; assert "aiow_quote_outbox_retry_v1" in final and "aiow_quote_outbox_dead_v1" in final and final.count("aiow_quote_outbox_sent_v1")==3 and final.count("aiow_quote_outbox_review_v1")==2
  assert http(f"http://127.0.0.1:{BASE+1}/api/internal/quote-outbox/run","POST",{}, {"authorization":"Bearer wrong-worker-secret-0123456789","content-type":"application/json"})[0]==401
  print("QUOTE_ADAPTER_HTTP_PROOF_PASS disabled=503 hmac-wrong=401 self-prepare-commit=PDF worker-auth=401 customer-attachment=sent internal-no-attachment=sent transient=retry permanent=dead send-network=review provider-accepted-db-finalize=review")
 finally:
  stop(disabled); stop(configured)
  if mock: mock.shutdown(); mock.server_close()
  disabled_out.close(); configured_out.close(); mock_out.close()
  __import__('shutil').rmtree(tmp,ignore_errors=True)
if __name__=="__main__": main()
