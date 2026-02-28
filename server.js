const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

let bestellungen = [];
let nextId = 1;

// ── Vapi ruft diese URL auf wenn eine Bestellung reinkommt ──
app.post('/api/order', (req, res) => {
  console.log('📞 Eingehende Anfrage:', JSON.stringify(req.body, null, 2));

  // Vapi schickt Tool-Argumente in verschiedenen Formaten – alle abfangen
  const args =
    req.body?.message?.toolCallList?.[0]?.function?.arguments ||
    req.body?.tool_call?.function?.arguments ||
    req.body;

  // Falls arguments ein String ist (Vapi schickt manchmal JSON-String)
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

  bestellungen.unshift(bestellung);
  console.log('✅ Bestellung gespeichert:', bestellung);

  // Antwort an Vapi – der Agent spricht das dann aus
  res.json({
    result: `Perfekt! Die Bestellung für ${bestellung.name} wurde gespeichert. ${margherita > 0 ? margherita + 'x Margherita' : ''} ${salame > 0 ? salame + 'x Salame' : ''}. Danke und tschüss!`
  });
});

// ── PizzaBoard lädt Bestellungen von hier (alle 3 Sek.) ──
app.get('/api/orders', (req, res) => {
  res.json(bestellungen);
});

// ── Status aktualisieren: In Arbeit / Fertig ──
app.put('/api/order/:id/status', (req, res) => {
  const id     = parseInt(req.params.id);
  const { status } = req.body;
  const b = bestellungen.find(x => x.id === id);
  if (b) {
    b.status = status;
    console.log(`🍕 #${id} Status → ${status}`);
    res.json({ ok: true });
  } else {
    res.status(404).json({ error: 'Bestellung nicht gefunden' });
  }
});

// ── Health Check für Railway ──
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    bestellungen: bestellungen.length,
    message: '🍕 Pizza-Server läuft!'
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🍕 Pizza-Server läuft auf Port ${PORT}`);
});
