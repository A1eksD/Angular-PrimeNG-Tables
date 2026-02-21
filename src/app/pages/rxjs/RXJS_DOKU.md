# RxJS Dokumentation – payments-rxjs als Beispiel

---

## 1. Was ist RxJS überhaupt?

RxJS steht für **Reactive Extensions for JavaScript**.

Stell dir vor, du hast einen Wasserhahn.
- Du drehst ihn auf → Wasser fließt (Daten kommen rein)
- Du drehst ihn zu → Wasser stoppt (Subscription beendet)
- Du kannst das Wasser filtern, umleiten, transformieren – bevor es bei dir ankommt

RxJS macht genau das mit **Datenströmen** (Observables).

---

## 2. Subject – der "Notstopp-Knopf"

```ts
private destroy$ = new Subject<void>();
```

### Was ist ein Subject?
Ein `Subject` ist gleichzeitig:
- Ein **Observable** (man kann darauf subscriben / zuhören)
- Ein **Observer** (man kann selbst Werte hineinschicken)

Normal bei einem Observable kannst du nur zuhören.
Bei einem Subject kannst du auch selbst "rufen".

### Was bedeutet `<void>`?
`void` bedeutet: "Ich schicke keinen echten Wert – nur ein Signal."
Es ist wie ein Klingelknopf – du drückst ihn, und alle die zuhören wissen: "Es hat geklingelt!"
Der Inhalt des Klingelns interessiert niemanden, nur das Signal selbst.

### Warum heißt es `destroy$`?
Das `$` am Ende ist eine **Konvention** in Angular/RxJS.
Es bedeutet: "Diese Variable ist ein Observable / Subject."
Es ist kein Muss, aber alle Angular-Entwickler machen es so – damit man sofort sieht:
"Ah, das ist ein Datenstrom!"

### Zusammengefasst:
```ts
private destroy$ = new Subject<void>();
// "Ich erstelle einen Notstopp-Knopf.
//  Wenn ich ihn drücke, bekommen es alle mit die zuhören."
```

---

## 3. pipe() – die "Rohrleitung"

```ts
this.api.get('api/payments')
  .pipe(
    takeUntil(this.destroy$)
  )
  .subscribe(...)
```

### Was macht pipe()?
`pipe()` ist eine **Rohrleitung** zwischen dem Observable und dem subscribe.

Ohne pipe:
```
Observable → subscribe (Daten kommen direkt an)
```

Mit pipe:
```
Observable → pipe(operator1, operator2, ...) → subscribe
```

Du kannst in pipe() beliebig viele **Operatoren** hintereinander schalten.
Jeder Operator macht etwas mit den Daten bevor sie bei subscribe ankommen.

### Beispiel mit mehreren Operatoren:
```ts
this.api.get('api/payments')
  .pipe(
    map(data => data.filter(p => p.status === 'paid')), // nur bezahlte filtern
    tap(data => console.log('Gefilterte Daten:', data)), // kurz loggen
    takeUntil(this.destroy$)                             // stopp wenn destroy$ feuert
  )
  .subscribe(data => {
    // hier kommen die gefilterten Daten an
  })
```

### Merksatz:
> pipe() = Küche zwischen Lieferant (Observable) und Kunde (subscribe).
> In der Küche wird das Essen verarbeitet bevor es rausgeht.

---

## 4. takeUntil() – "Hör zu, BIS..."

```ts
.pipe(
  takeUntil(this.destroy$)
)
```

### Was macht takeUntil()?
`takeUntil` ist ein RxJS-Operator der sagt:

> "Leite alle Werte weiter – ABER sobald das angegebene Observable einen Wert bekommt, stopp sofort!"

In unserem Fall:
- Solange `destroy$` still ist → Daten fließen normal durch
- Sobald `destroy$` feuert (`next()` aufgerufen) → Subscription wird automatisch beendet

### Visualisierung:
```
Zeit:        --[data]--[data]--[data]--X(destroy$ feuert)--[data ignoriert]
takeUntil:   --[data]--[data]--[data]--|
subscribe:      ✅        ✅       ✅       ❌ (kommt nie an)
```

### Merksatz:
> takeUntil = "Zeitung lesen BIS ich einschlafe. Wenn ich schlafe, hör auf."

---

## 5. next() und complete() – den Knopf drücken

```ts
ngOnDestroy(): void {
  this.destroy$.next();    // Signal senden: "Stopp!"
  this.destroy$.complete(); // Subject sauber schließen
}
```

### `this.destroy$.next()`
`next()` schickt einen Wert in das Subject.
Da unser Subject `Subject<void>` ist, schicken wir keinen echten Wert – nur das Signal.
Alle `takeUntil(this.destroy$)` hören das und stoppen ihre Subscription.

### `this.destroy$.complete()`
`complete()` sagt: "Dieses Subject ist für immer fertig. Es kommen keine Werte mehr."
Das ist sauberes Aufräumen – damit das Subject selbst auch keinen Memory Leak verursacht.

### Reihenfolge ist wichtig!
```ts
// ✅ Richtig:
this.destroy$.next();     // erst Signal senden
this.destroy$.complete(); // dann schließen

// ❌ Falsch:
this.destroy$.complete(); // Subject ist zu → next() hat keine Wirkung mehr!
this.destroy$.next();
```

---

## 6. Der komplette Ablauf – Schritt für Schritt

```ts
// SCHRITT 1: Notstopp-Knopf erstellen (beim Laden der Klasse)
private destroy$ = new Subject<void>();

// SCHRITT 2: Observable starten mit Sicherheitsnetz
ngOnInit(): void {
  this.api.get('api/payments')
    .pipe(
      takeUntil(this.destroy$)  // Sicherheitsnetz einbauen
    )
    .subscribe((data) => {
      // Daten verarbeiten
    });
}

// SCHRITT 3: Wenn Komponente stirbt → Knopf drücken
ngOnDestroy(): void {
  this.destroy$.next();     // Signal: "Alle Subscriptions stopp!"
  this.destroy$.complete(); // Subject sauber schließen
}
```

### Timeline:
```
Komponente öffnet sich
    ↓
ngOnInit() → Observable startet, takeUntil wartet auf destroy$
    ↓
[Daten kommen vom Server] → subscribe() verarbeitet sie ✅
    ↓
[Nutzer wechselt Seite] → Angular ruft ngOnDestroy() auf
    ↓
destroy$.next() → takeUntil bemerkt es → Subscription stoppt 🛑
    ↓
destroy$.complete() → Subject selbst wird geschlossen 🔒
```

---

## 7. Warum Subject<void> und nicht einfach Subject?

```ts
// Mit Typ:
new Subject<void>()   // Wir schicken void = nichts = nur ein Signal
new Subject<string>() // Wir könnten einen String schicken
new Subject<number>() // Wir könnten eine Zahl schicken

// Ohne Typ:
new Subject()         // TypeScript weiß nicht was reinkommt (unknown)
```

`void` ist hier bewusst gewählt – wir wollen gar keine Daten schicken.
Nur den "Klingelknopf" drücken. Der Typ `void` macht das explizit und klar.

---

## 8. Vorteil gegenüber manuellem unsubscribe

### Alt (manuell, eine Subscription):
```ts
private sub1: Subscription | null = null;
private sub2: Subscription | null = null;
private sub3: Subscription | null = null;

ngOnInit() {
  this.sub1 = obs1.subscribe(...)
  this.sub2 = obs2.subscribe(...)
  this.sub3 = obs3.subscribe(...)
}

ngOnDestroy() {
  this.sub1?.unsubscribe(); // vergiss ich vielleicht!
  this.sub2?.unsubscribe(); // vergiss ich vielleicht!
  this.sub3?.unsubscribe(); // vergiss ich vielleicht!
}
```

### Neu (takeUntil, beliebig viele Subscriptions):
```ts
private destroy$ = new Subject<void>();

ngOnInit() {
  obs1.pipe(takeUntil(this.destroy$)).subscribe(...)
  obs2.pipe(takeUntil(this.destroy$)).subscribe(...)
  obs3.pipe(takeUntil(this.destroy$)).subscribe(...)
}

ngOnDestroy() {
  this.destroy$.next();     // EINE Zeile → alle 3 Subscriptions stoppen ✅
  this.destroy$.complete();
}
```

**Je mehr Subscriptions du hast, desto größer der Vorteil!**

---

## 9. Kurzreferenz – alle Begriffe auf einen Blick

| Begriff | Was es ist | Einfach erklärt |
|---|---|---|
| `Observable` | Datenstrom | Wasserhahn – Daten fließen |
| `Subject` | Observable + Observer | Klingelknopf – du kannst selbst klingeln |
| `Subject<void>` | Subject ohne Datenwert | Nur das Signal zählt, nicht der Inhalt |
| `destroy$` | Name (Konvention) | `$` = "das ist ein Observable/Subject" |
| `.pipe()` | Rohrleitung | Verarbeitung zwischen Observable und subscribe |
| `takeUntil(x)` | Operator in pipe() | "Hör zu BIS x einen Wert bekommt" |
| `.next()` | Wert in Subject senden | Klingelknopf drücken |
| `.complete()` | Subject schließen | Klingelknopf für immer ausschalten |
| `ngOnDestroy` | Lifecycle Hook | Wird aufgerufen wenn Komponente stirbt |

---

## 10. GET / PUT / DELETE – mit und ohne RxJS (returns als Beispiel)

Hier siehst du denselben API-Call einmal **ohne RxJS** (manuelles unsubscribe)
und einmal **mit RxJS** (takeUntil) – anhand der Returns-Component.

---

### 10.1 GET – Daten laden

**Ohne RxJS** (`returns.component.ts`):
```ts
private returnsSub: Subscription | null = null;

ngOnInit(): void {
  // Subscription manuell speichern
  this.returnsSub = this.api
    .get<...[]>('api/returns')
    .subscribe((data) => {
      this.nodes = data as TreeNode[];
      this.loading.set(false);
    });
}

ngOnDestroy(): void {
  // Manuell kündigen
  this.returnsSub?.unsubscribe();
}
```

**Mit RxJS** (`returns-rxjs.component.ts`):
```ts
private destroy$ = new Subject<void>();

ngOnInit(): void {
  this.api
    .get<...[]>('api/returns')
    .pipe(
      takeUntil(this.destroy$)  // ← automatisch stoppen wenn Komponente stirbt
    )
    .subscribe((data) => {
      this.nodes = data as TreeNode[];
      this.loading.set(false);
    });
}

ngOnDestroy(): void {
  this.destroy$.next();     // ein Signal → alle Subscriptions stoppen
  this.destroy$.complete();
}
```

**Unterschied:** Bei RxJS brauchst du keine `returnsSub`-Variable.
Egal wie viele `get()` Calls du hast – ein einziges `destroy$.next()` stoppt alle.

---

### 10.2 PUT – Eintrag bearbeiten (Edit)

Der Nutzer klickt auf den ✏️ Stift-Button → Dialog öffnet sich → Nutzer ändert Felder → klickt "Save (PUT)".

**Ohne RxJS** (`returns.component.ts`):
```ts
saveEdit(): void {
  const id = this.editRow['id'];

  // Subscription wieder manuell speichern und verwalten
  this.returnsSub = this.api
    .put(`api/returns/${id}`, this.editRow)
    .subscribe(() => {
      // Lokal in nodes aktualisieren
      this.nodes = this.nodes.map(node => {
        if (node.data['id'] === id) return { ...node, data: { ...this.editRow } };
        return node;
      });
      this.editDialogVisible = false;
    });
}
```

**Mit RxJS** (`returns-rxjs.component.ts`):
```ts
saveEdit(): void {
  const id = this.editRow['id'];

  this.api
    .put(`api/returns/${id}`, this.editRow)
    .pipe(
      takeUntil(this.destroy$)  // ← auch PUT absichern!
    )
    .subscribe(() => {
      this.nodes = this.nodes.map(node => {
        if (node.data['id'] === id) return { ...node, data: { ...this.editRow } };
        return node;
      });
      this.editDialogVisible = false;
    });
}
```

**Warum auch PUT/DELETE absichern?**
Stell dir vor, der Nutzer klickt "Save" und wechselt sofort die Seite.
Ohne `takeUntil` würde die Antwort vom Server trotzdem ankommen und versuchen,
die bereits zerstörte Komponente zu aktualisieren → Fehler oder Memory Leak!

---

### 10.3 DELETE – Eintrag löschen

Der Nutzer klickt auf den 🗑️ Mülleimer-Button → Zeile wird gelöscht.

**Ohne RxJS** (`returns.component.ts`):
```ts
onDelete(rowData: Record<string, unknown>): void {
  const id = rowData['id'];

  this.returnsSub = this.api
    .delete(`api/returns/${id}`)
    .subscribe(() => {
      // Lokal aus nodes entfernen
      this.nodes = this.nodes.filter(node => node.data['id'] !== id);
    });
}
```

**Mit RxJS** (`returns-rxjs.component.ts`):
```ts
onDelete(rowData: Record<string, unknown>): void {
  const id = rowData['id'];

  this.api
    .delete(`api/returns/${id}`)
    .pipe(
      takeUntil(this.destroy$)  // ← auch DELETE absichern!
    )
    .subscribe(() => {
      this.nodes = this.nodes.filter(node => node.data['id'] !== id);
    });
}
```

---

### 10.4 Gesamtvergleich – Alle drei Methoden auf einen Blick

| Methode | HTTP-Verb | Was passiert | Lokal danach |
|---|---|---|---|
| Laden | `GET` | Daten vom Server holen | `this.nodes = data` |
| Bearbeiten | `PUT` | Bestehenden Eintrag überschreiben | `nodes.map(...)` – Zeile ersetzen |
| Löschen | `DELETE` | Eintrag auf dem Server entfernen | `nodes.filter(...)` – Zeile rausfiltern |

```
GET    → Daten holen      → nodes befüllen
PUT    → Daten schicken   → nodes.map()    (eine Zeile ersetzen)
DELETE → ID schicken      → nodes.filter() (eine Zeile rausfiltern)
```

---

### 10.5 Warum `takeUntil` bei ALLEN Methoden wichtig ist

```ts
// ❌ Gefährlich – kein takeUntil beim PUT:
this.api.put('api/returns/5', data).subscribe(() => {
  this.nodes = [...]; // Was wenn die Komponente schon weg ist?? → FEHLER
});

// ✅ Sicher – mit takeUntil:
this.api.put('api/returns/5', data)
  .pipe(takeUntil(this.destroy$))
  .subscribe(() => {
    this.nodes = [...]; // Wird automatisch ignoriert wenn Komponente weg ist ✅
  });
```

**Faustregel:**
> Jedes `.subscribe()` in einer Angular-Komponente sollte ein `.pipe(takeUntil(this.destroy$))` haben – egal ob GET, PUT oder DELETE.
