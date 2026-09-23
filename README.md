# 🔐 Web Passwort Manager (Client-Side Encrypted)

Ein minimalistischer, extrem sicherer und komplett clientseitiger Passwort-Manager für den Browser. Diese Anwendung wurde speziell dafür optimiert, als eigenständige Web-App (z. B. über GitHub Pages) geladen und plattformunabhängig auf dem PC oder Smartphone genutzt zu werden.

## ✨ Funktionen
- **Zero-Knowledge-Prinzip:** Alle Krypto-Operationen finden ausschließlich lokal in Ihrem Browser statt. Es gibt kein Backend, keine Datenbank und keine Server-Kommunikation. Ihre Daten verlassen niemals Ihr Gerät.
- **Starke Verschlüsselung:** Nutzt die native **Web Crypto API** des Browsers mit **AES-GCM (256-Bit)**.
- **Sichere Schlüsselableitung:** Das Master-Passwort wird mittels **PBKDF2 mit 600.000 Iterationen** und SHA-256 gehärtet.
- **Echtzeit-Suche:** Schnelles Filtern und Finden von Einträgen direkt beim Tippen.
- **Mobile-Optimiert:** Praktische Kopierfelder und Steuerelemente für eine komfortable Nutzung auf dem Smartphone-Touchscreen.
- **Offline-fähig:** Kann nach dem Laden ohne aktive Internetverbindung verwendet werden.

---

## 🔒 Sicherheits-Architektur (Warum GitHub Public unbedenklich ist)
Dieses Repository ist öffentlich, was bei Krypto-Software der Best Practice entspricht (Open Source). Da die Entschlüsselung ausschließlich im lokalen Speicher Ihres Browsers stattfindet, ist Ihre Privatsphäre absolut geschützt:
1. Der **Quellcode** (`index.html` und `crypto.js`) ist das Werkzeug, das jeder sehen und überprüfen kann.
2. Ihre **Verschlüsselten Daten** (die `.enc`-Datei) verbleiben lokal auf Ihrem Smartphone oder PC und werden **niemals** auf GitHub hochgeladen.
3. Ohne Ihr **Master-Passwort** und die lokale Datei ist der Code für Außenstehende nutzlos.

---

## 🚀 Nutzung

### 1. Tresor erstellen / laden
- Öffnen Sie die gehostete GitHub-Pages-URL in Ihrem Browser.
- Wählen Sie entweder **"Lokal gespeicherten Tresor öffnen"** (falls Sie bereits Daten im Browser-Speicher abgelegt haben) oder laden Sie Ihre zuvor exportierte `.enc`-Datei hoch.

### 2. Entschlüsseln
- Geben Sie Ihr starkes Master-Passwort ein.
- **Wichtig:** Sollten Sie Ihr Master-Passwort vergessen, gibt es *keine* "Passwort zurücksetzen"-Funktion. Ihre Daten sind in diesem Fall unwiederbringlich verloren.

### 3. Daten verwalten & Sichern
- Fügen Sie neue Logins hinzu oder nutzen Sie den eingebauten Passwort-Generator.
- Nutzen Sie nach Änderungen den Button **"Als .enc-Datei exportieren"**, um ein aktuelles, verschlüsseltes Backup Ihrer Passwörter herunterzuladen und beispielsweise in Ihrer privaten Cloud zu sichern.

---

## 🛠️ Technische Details
- **PBKDF2 Iterations:** 600.000
- **Salt-Länge:** 16 Bytes
- **IV-Länge:** 12 Bytes
- **Verschlüsselungs-Algorithmus:** AES-GCM-256

---

## 🤖 Credits & Entwicklung
Der Quellcode dieser Anwendung (einschließlich des Interfaces, der mobilen Optimierungen mit Suchfunktion sowie der Krypto-Fallbacks) wurde vollständig von einer **Künstlichen Intelligenz (KI)** generiert, angepasst und für den Betrieb auf GitHub Pages optimiert.
