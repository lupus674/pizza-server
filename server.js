const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

let bestellungen = [];
let nextId = 1;

// ── PizzaBoard direkt ausliefern ──────────────────────────────────────────────
app.get('/', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>🍕 PizzaBoard</title>
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Syne+Mono&display=swap" rel="stylesheet">
<style>
  :root {
    --bg:#1a0a00;--surface:#261200;--surface2:#311800;--border:#4a2800;
    --accent:#ff6b00;--accent2:#ffbe00;--text:#fff5e6;--muted:#a07050;
    --green:#4caf7d;--red:#ff4444;--radius:10px;
  }
  *{box-sizing:border-box;margin:0;padding:0;}
  body{background:var(--bg);color:var(--text);font-family:'Syne',sans-serif;min-height:100vh;
    background-image:radial-gradient(ellipse at 20% 50%,#2d1000 0%,transparent 60%),radial-gradient(ellipse at 80% 20%,#1a0800 0%,transparent 50%);}
  header{display:flex;align-items:center;justify-content:space-between;padding:0 28px;height:60px;
    background:var(--surface);border-bottom:2px solid var(--accent);position:sticky;top:0;z-index:100;}
  .logo{font-size:20px;font-weight:800;display:flex;align-items:center;gap:10px;}
  .logo-accent{color:var(--accent);}
  .live-indicator{display:flex;align-items:center;gap:8px;font-size:11px;font-family:'Syne Mono',monospace;color:var(--muted);}
  .live-dot{width:8px;height:8px;border-radius:50%;background:var(--green);animation:blink 2s infinite;}
  @keyframes blink{0%,100%{opacity:1}50%{opacity:0.3}}
  .counter{background:var(--accent);color:#000;font-weight:700;font-size:12px;padding:4px 10px;border-radius:20px;}
  .layout{display:flex;height:calc(100vh - 60px);}
  .orders-panel{flex:1;overflow-y:auto;padding:20px;display:flex;flex-direction:column;gap:14px;}
  .orders-panel::-webkit-scrollbar{width:4px;}
  .orders-panel::-webkit-scrollbar-thumb{background:var(--border);border-radius:2px;}
  .section-label{font-size:10px;letter-spacing:2px;text-transform:uppercase;color:var(--muted);
    font-family:'Syne Mono',monospace;display:flex;align-items:center;gap:10px;}
  .section-label::after{content:'';flex:1;height:1px;background:var(--border);}
  .order-card{background:var(--surface);border:1.5px solid var(--border);border-radius:var(--radius);
    overflow:hidden;transition:all 0.2s;animation:slideIn 0.3s ease;}
  @keyframes slideIn{from{opacity:0;transform:translateX(-20px)}to{opacity:1;transform:translateX(0)}}
  .order-card.new-order{border-color:var(--accent);box-shadow:0 0 0 2px rgba(255,107,0,.15),0 4px 20px rgba(255,107,0,.1);}
  .order-card.in-progress{border-color:var(--accent2);}
  .order-card.done{opacity:0.5;border-color:var(--border);}
  .order-header{display:flex;align-items:center;justify-content:space-between;padding:14px 16px;
    border-bottom:1px solid var(--border);background:var(--surface2);}
  .order-name{font-size:22px;font-weight:800;letter-spacing:-0.5px;color:var(--accent2);}
  .order-id{font-family:'Syne Mono',monospace;font-size:11px;color:var(--muted);}
  .order-time{font-family:'Syne Mono',monospace;font-size:12px;color:var(--muted);}
  .status-badge{padding:4px 10px;border-radius:20px;font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;}
  .status-badge.new{background:rgba(255,107,0,.2);color:var(--accent);border:1px solid var(--accent);}
  .status-badge.in-progress{background:rgba(255,190,0,.2);color:var(--accent2);border:1px solid var(--accent2);}
  .status-badge.done{background:rgba(76,175,125,.2);color:var(--green);border:1px solid var(--green);}
  .order-body{padding:14px 16px;}
  .pizza-list{display:flex;flex-direction:column;gap:8px;margin-bottom:12px;}
  .pizza-line{display:flex;align-items:center;gap:10px;font-size:15px;font-weight:600;}
  .pizza-qty{background:var(--accent);color:#000;width:26px;height:26px;border-radius:50%;
    display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800;flex-shrink:0;}
  .order-note{background:var(--surface2);border-left:3px solid var(--accent2);padding:8px 10px;
    font-size:12px;color:var(--muted);border-radius:0 4px 4px 0;margin-top:8px;font-family:'Syne Mono',monospace;}
  .order-actions{display:flex;gap:8px;margin-top:12px;}
  .btn{flex:1;padding:10px 16px;border:none;border-radius:var(--radius);cursor:pointer;
    font-family:'Syne',sans-serif;font-weight:700;font-size:13px;transition:all 0.15s;}
  .btn-start{background:var(--accent2);color:#000;}
  .btn-start:hover{background:#ffd030;transform:translateY(-1px);}
  .btn-done{background:var(--green);color:#000;}
  .btn-done:hover{background:#5cd08d;transform:translateY(-1px);}
  .sidebar{width:280px;border-left:1px solid var(--border);background:var(--surface);display:flex;flex-direction:column;overflow:hidden;}
  .sidebar-section{padding:16px;border-bottom:1px solid var(--border);}
  .sidebar-title{font-size:11px;letter-spacing:2px;text-transform:uppercase;color:var(--muted);font-family:'Syne Mono',monospace;margin-bottom:12px;}
  .stats-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;}
  .stat-box{background:var(--surface2);border:1px solid var(--border);border-radius:6px;padding:10px;text-align:center;}
  .stat-num{font-size:24px;font-weight:800;color:var(--accent);line-height:1;margin-bottom:3px;}
  .stat-lbl{font-size:9px;color:var(--muted);text-transform:uppercase;letter-spacing:1px;}
  input{background:var(--surface2);border:1px solid var(--border);border-radius:6px;padding:8px 10px;
    color:var(--text);font-family:'Syne',sans-serif;font-size:13px;outline:none;width:100%;margin-bottom:8px;}
  input:focus{border-color:var(--accent);}
  .pizza-option{display:flex;align-items:center;justify-content:space-between;background:var(--surface2);
    border:1px solid var(--border);border-radius:6px;padding:8px 12px;margin-bottom:6px;}
  .pizza-option-name{font-weight:600;font-size:13px;}
  .qty-control{display:flex;align-items:center;gap:8px;}
  .qty-btn{width:26px;height:26px;border-radius:50%;border:1px solid var(--border);background:var(--surface);
    color:var(--text);cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center;transition:all 0.1s;}
  .qty-btn:hover{border-color:var(--accent);color:var(--accent);}
  .qty-display{font-family:'Syne Mono',monospace;font-size:16px;font-weight:700;min-width:20px;text-align:center;color:var(--accent2);}
  .btn-full{width:100%;padding:11px;border:none;border-radius:6px;font-family:'Syne',sans-serif;
    font-weight:800;font-size:13px;cursor:pointer;transition:all 0.15s;background:var(--accent);color:#000;}
  .btn-full:hover{background:#ff8c30;transform:translateY(-1px);}
  .btn-full:disabled{opacity:0.4;cursor:not-allowed;transform:none;}
  .webhook-log{flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:6px;}
  .webhook-log::-webkit-scrollbar{width:3px;}
  .webhook-log::-webkit-scrollbar-thumb{background:var(--border);}
  .log-entry{background:var(--surface2);border:1px solid var(--border);border-radius:6px;padding:8px 10px;
    font-family:'Syne Mono',monospace;font-size:10px;line-height:1.5;animation:fadeIn 0.3s ease;border-left:3px solid var(--border);}
  .log-entry.incoming{border-left-color:var(--green);}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  .log-time{color:var(--muted);}
  .log-text{color:var(--text);margin-top:2px;}
  .empty-state{display:flex;flex-direction:column;align-items:center;justify-content:center;
    padding:60px 20px;color:var(--muted);text-align:center;gap:10px;}
  .empty-state .icon{font-size:60px;opacity:0.3;}
  .empty-state h3{font-size:18px;color:var(--text);opacity:0.4;}
  .empty-state p{font-size:12px;max-width:220px;line-height:1.6;}
  .toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%) translateY(80px);
    background:var(--accent);color:#000;font-weight:700;padding:12px 24px;border-radius:30px;
    font-size:13px;z-index:300;opacity:0;transition:all 0.25s;pointer-events:none;white-space:nowrap;}
  .toast.show{transform:translateX(-50%) translateY(0);opacity:1;}
  @keyframes glowPulse{0%,100%{box-shadow:0 0 0 0 rgba(255,107,0,.5)}50%{box-shadow:0 0 20px 6px rgba(255,107,0,.3)}}
  .alert-new{animation:glowPulse 1s ease 3;}
</style>
</head>
<body>
<header>
  <div class="logo">🍕 <span class="logo-accent">Pizza</span>Board</div>
  <div style="display:flex;align-items:center;gap:16px;">
    <div class="live-indicator"><div class="live-dot"></div> LIVE</div>
    <div class="counter" id="activeCounter">0 aktiv</div>
  </div>
</header>
<div class="layout">
  <div class="orders-panel" id="ordersPanel">
    <div class="empty-state">
      <div class="icon">🍕</div>
      <h3>Warte auf Bestellungen...</h3>
      <p>Bestellungen erscheinen hier automatisch sobald jemand anruft.</p>
    </div>
  </div>
  <aside class="sidebar">
    <div class="sidebar-section">
      <div class="sidebar-title">Heute</div>
      <div class="stats-grid">
        <div class="stat-box"><div class="stat-num" id="statTotal">0</div><div class="stat-lbl">Gesamt</div></div>
        <div class="stat-box"><div class="stat-num" id="statOpen" style="color:var(--accent)">0</div><div class="stat-lbl">Offen</div></div>
        <div class="stat-box"><div class="stat-num" id="statMarg" style="color:var(--accent2)">0</div><div class="stat-lbl">Margherita</div></div>
        <div class="stat-box"><div class="stat-num" id="statSal" style="color:var(--accent2)">0</div><div class="stat-lbl">Salame</div></div>
      </div>
    </div>
    <div class="sidebar-section">
      <div class="sidebar-title">Manuelle Bestellung</div>
      <input type="text" id="manualName" placeholder="Vorname Kunde..." maxlength="30">
      <div class="pizza-option">
        <div class="pizza-option-name">🍕 Margherita</div>
        <div class="qty-control">
          <button class="qty-btn" onclick="changeQty('marg',-1)">−</button>
          <div class="qty-display" id="qtyMarg">0</div>
          <button class="qty-btn" onclick="changeQty('marg',1)">+</button>
        </div>
      </div>
      <div class="pizza-option">
        <div class="pizza-option-name">🍕 Salame</div>
        <div class="qty-control">
          <button class="qty-btn" onclick="changeQty('sal',-1)">−</button>
          <div class="qty-display" id="qtySal">0</div>
          <button class="qty-btn" onclick="changeQty('sal',1)">+</button>
        </div>
      </div>
      <button class="btn-full" onclick="addManualOrder()" id="addBtn" disabled>BESTELLUNG AUFGEBEN</button>
    </div>
    <div style="padding:12px 16px 8px;border-bottom:1px solid var(--border);">
      <div class="sidebar-title" style="margin-bottom:0;">Aktivitätslog</div>
    </div>
    <div class="webhook-log" id="activityLog">
      <div class="log-entry"><div class="log-time">System</div><div class="log-text">PizzaBoard gestartet ✓</div></div>
    </div>
  </aside>
</div>
<div class="toast" id="toast"></div>
<script>
  let orders=[], knownIds=new Set(), qtyMarg=0, qtySal=0;

  async function fetchOrders(){
    try{
      const data=await(await fetch('/api/orders')).json();
      const newOnes=data.filter(o=>!knownIds.has(o.id));
      newOnes.forEach(o=>{
        knownIds.add(o.id);
        showToast('🍕 Neue Bestellung: '+o.name+'!');
        addLog('Neue Bestellung: '+o.name,'incoming');
        setTimeout(()=>{const c=document.getElementById('order-'+o.id);if(c)c.classList.add('alert-new');},100);
      });
      orders=data; render();
    }catch(e){}
  }

  async function updateStatus(id,status){
    try{ await fetch('/api/order/'+id+'/status',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({status})}); }catch(e){}
    const o=orders.find(x=>x.id===id); if(o)o.status=status;
    render();
    showToast(status==='done'?'✓ Ausgegeben!':'🍕 In Arbeit');
    addLog('#'+String(id).padStart(3,'0')+' → '+(status==='done'?'Fertig':'In Arbeit'),'incoming');
  }

  function changeQty(type,delta){
    if(type==='marg'){qtyMarg=Math.max(0,qtyMarg+delta);document.getElementById('qtyMarg').textContent=qtyMarg;}
    else{qtySal=Math.max(0,qtySal+delta);document.getElementById('qtySal').textContent=qtySal;}
    checkBtn();
  }
  document.getElementById('manualName').addEventListener('input',checkBtn);
  function checkBtn(){document.getElementById('addBtn').disabled=!(document.getElementById('manualName').value.trim()&&(qtyMarg+qtySal>0));}

  async function addManualOrder(){
    const name=document.getElementById('manualName').value.trim();
    if(!name||qtyMarg+qtySal===0)return;
    await fetch('/api/order',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({vorname:name,margherita:qtyMarg,salame:qtySal})});
    qtyMarg=0;qtySal=0;
    document.getElementById('qtyMarg').textContent='0';
    document.getElementById('qtySal').textContent='0';
    document.getElementById('manualName').value='';
    document.getElementById('addBtn').disabled=true;
    showToast('Bestellung aufgegeben!');
  }

  function render(){
    const panel=document.getElementById('ordersPanel');
    const active=orders.filter(o=>o.status!=='done');
    const done=orders.filter(o=>o.status==='done');
    document.getElementById('activeCounter').textContent=active.length+' aktiv';
    document.getElementById('statTotal').textContent=orders.length;
    document.getElementById('statOpen').textContent=active.length;
    document.getElementById('statMarg').textContent=orders.reduce((s,o)=>s+(o.items?.marg||0),0);
    document.getElementById('statSal').textContent=orders.reduce((s,o)=>s+(o.items?.sal||0),0);
    if(orders.length===0){panel.innerHTML='<div class="empty-state"><div class="icon">🍕</div><h3>Warte auf Bestellungen...</h3><p>Bestellungen erscheinen hier automatisch sobald jemand anruft.</p></div>';return;}
    let html='';
    if(active.length>0){html+='<div class="section-label">Aktive Bestellungen ('+active.length+')</div>';html+=active.map(renderCard).join('');}
    if(done.length>0){html+='<div class="section-label" style="margin-top:12px;">Fertig ('+done.length+')</div>';html+=done.map(renderCard).join('');}
    panel.innerHTML=html;
  }

  function renderCard(o){
    const sc=o.status==='new'?'new-order':o.status==='in-progress'?'in-progress':'done';
    const bt=o.status==='new'?'NEU':o.status==='in-progress'?'IN ARBEIT':'FERTIG';
    const src=o.source==='voice'?'🎙 Voice':'✍️ Manuell';
    let pizzas='';
    if((o.items?.marg||0)>0)pizzas+='<div class="pizza-line"><span class="pizza-qty">'+o.items.marg+'</span>🍕 Margherita</div>';
    if((o.items?.sal||0)>0)pizzas+='<div class="pizza-line"><span class="pizza-qty">'+o.items.sal+'</span>🍕 Salame</div>';
    const actions=o.status==='new'
      ?'<button class="btn btn-start" onclick="updateStatus('+o.id+',\'in-progress\')">IN ARBEIT</button><button class="btn btn-done" onclick="updateStatus('+o.id+',\'done\')">FERTIG ✓</button>'
      :o.status==='in-progress'
      ?'<button class="btn btn-done" onclick="updateStatus('+o.id+',\'done\')">FERTIG AUSGEBEN ✓</button>'
      :'<button class="btn" style="flex:1;background:transparent;border:1px solid var(--border);color:var(--muted);" disabled>Ausgegeben</button>';
    return '<div class="order-card '+sc+'" id="order-'+o.id+'"><div class="order-header"><div><div class="order-name">'+o.name+'</div><div style="display:flex;gap:8px;margin-top:2px;"><div class="order-id">#'+String(o.id).padStart(3,'0')+'</div><div class="order-id">'+src+'</div></div></div><div style="text-align:right;"><span class="status-badge '+o.status+'">'+bt+'</span><div class="order-time" style="margin-top:6px;">'+o.time+'</div></div></div><div class="order-body"><div class="pizza-list">'+pizzas+'</div>'+(o.note?'<div class="order-note">💬 '+o.note+'</div>':'')+'<div class="order-actions">'+actions+'</div></div></div>';
  }

  function addLog(text,type=''){
    const log=document.getElementById('activityLog');
    const t=new Date().toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
    const el=document.createElement('div');
    el.className='log-entry '+type;
    el.innerHTML='<div class="log-time">'+t+'</div><div class="log-text">'+text+'</div>';
    log.prepend(el);
    while(log.children.length>30)log.removeChild(log.lastChild);
  }

  function showToast(msg){
    const t=document.getElementById('toast');
    t.textContent=msg;t.classList.add('show');
    setTimeout(()=>t.classList.remove('show'),2500);
  }

  fetchOrders();
  setInterval(fetchOrders,3000);
</script>
</body>
</html>`);
});

// ── Vapi ruft diese URL auf wenn eine Bestellung reinkommt ───────────────────
app.post('/api/order', (req, res) => {
  console.log('📞 Eingehende Anfrage:', JSON.stringify(req.body, null, 2));

  const args =
    req.body?.message?.toolCallList?.[0]?.function?.arguments ||
    req.body?.tool_call?.function?.arguments ||
    req.body;

  const parsed = typeof args === 'string' ? JSON.parse(args) : args;

  const vorname      = parsed.vorname      || 'Unbekannt';
  const margherita   = Number(parsed.margherita)  || 0;
  const salame       = Number(parsed.salame)       || 0;
  const sonderwunsch = parsed.sonderwunsch || '';

  const bestellung = {
    id: nextId++,
    name: vorname.charAt(0).toUpperCase() + vorname.slice(1).toLowerCase(),
    items: { marg: margherita, sal: salame },
    note: sonderwunsch,
    status: 'new',
    source: 'voice',
    time: new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
    created: Date.now()
  };

  bestellungen.push(bestellung);
  console.log('✅ Bestellung gespeichert:', bestellung);

  res.json({
    result: `Perfekt! Die Bestellung für ${bestellung.name} wurde gespeichert. ${margherita > 0 ? margherita + 'x Margherita' : ''} ${salame > 0 ? salame + 'x Salame' : ''}. Danke und auf Wiederhören!`
  });
});

// ── Alle Bestellungen abrufen ─────────────────────────────────────────────────
app.get('/api/orders', (req, res) => {
  res.json(bestellungen);
});

// ── Status aktualisieren ──────────────────────────────────────────────────────
app.put('/api/order/:id/status', (req, res) => {
  const id = parseInt(req.params.id);
  const { status } = req.body;
  const b = bestellungen.find(x => x.id === id);
  if (b) {
    b.status = status;
    console.log('🍕 #' + id + ' Status → ' + status);
    res.json({ ok: true });
  } else {
    res.status(404).json({ error: 'Bestellung nicht gefunden' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('🍕 Pizza-Server läuft auf Port ' + PORT);
});
