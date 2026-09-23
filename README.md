
# 🔐 Web Passwort Manager (Client-Side Encrypted)

Ein minimalistischer, vollständig clientseitiger Passwortmanager für den Browser. Die Anwendung kann als eigenständige Web-App, beispielsweise über GitHub Pages, bereitgestellt und auf dem PC oder Smartphone verwendet werden.

Passwörter werden lokal verschlüsselt gespeichert oder als verschlüsselte `.enc`-Datei exportiert. Ein Backend oder Benutzerkonto ist für die Tresorverwaltung nicht erforderlich.

> **Wichtig:** Dieses Projekt ist ein eigenständiger Passwortmanager und sollte vor der Verwendung mit wichtigen Zugangsdaten sorgfältig getestet werden. Eine unabhängige Sicherheitsprüfung ist nicht dokumentiert.

## ✨ Funktionen

### 🔑 Passwortverwaltung

- **Verschlüsselter Browser-Tresor:** Einträge lokal im Browser speichern und mit einem Master-Passwort entsperren.
- **Externer Datei-Tresor:** Verschlüsselte `.enc`-Dateien öffnen, bearbeiten und aktualisiert exportieren.
- **Einträge verwalten:** Zugangsdaten hinzufügen, bearbeiten und löschen.
- **Echtzeit-Suche und Sortierung:** Einträge schnell finden und übersichtlich anzeigen.
- **Passwörter anzeigen und kopieren:** Passwörter bei Bedarf einblenden oder in die Zwischenablage kopieren.
- **Passwortgenerator:** Zufällige Passwörter mit einstellbarer Länge und wählbaren Zeichengruppen erzeugen.
- **Passwortstärke-Anzeige:** Eine grobe Einschätzung der Stärke des eingegebenen Passworts.
- **Sichtbarkeit im Eingabeformular:** Neu generierte Passwörter werden sofort angezeigt. Über das Augen-Symbol lassen sie sich jederzeit anzeigen oder verbergen.
- **Optionale Symbole:** Lokal erzeugte Symbole können in der Eintragsansicht ein- oder ausgeschaltet werden.

### 🔄 Tresore synchronisieren

Der Browser-Tresor und ein externer `.enc`-Tresor können miteinander abgeglichen werden.

- Synchronisierung vom geöffneten Browser-Tresor oder Datei-Tresor aus starten.
- Beide Tresore auch dann vergleichen, wenn sie unterschiedliche Master-Passwörter verwenden.
- Einträge in einer **nebeneinander angeordneten Diff-Ansicht** vergleichen.
- Identische Einträge ausblenden und Unterschiede hervorheben.
- Bei Konflikten die Browser-Version, die externe Version oder beide Einträge behalten.
- Passwörter in der Vergleichsansicht zunächst verbergen und bei Bedarf einzeln anzeigen.
- Mit **„Alle von Quelle übernehmen“** mehrere Unterschiede auf einmal auswählen.
- Sammelauswahlen vor dem Speichern für einzelne Einträge anpassen.
- Die geplanten Änderungen vor dem Abschluss überprüfen und bestätigen.

Nach der Auswahl der Einträge kann festgelegt werden, welche Master-Passwörter künftig verwendet werden sollen:

- Master-Passwort des Browser-Tresors für beide Tresore verwenden.
- Master-Passwort des externen Tresors für beide Tresore verwenden.
- Die bisherigen Master-Passwörter beider Tresore getrennt beibehalten.

Bei der letzten Option enthalten beide Tresore die synchronisierten Einträge, werden aber weiterhin jeweils mit ihrem eigenen Master-Passwort geöffnet.

**Hinweis:** Die Anwendung überschreibt die ursprüngliche externe `.enc`-Datei nicht automatisch. Die aktualisierte Datei wird zum Download angeboten und muss anschließend am gewünschten Speicherort abgelegt werden.

### 📥 Tresor importieren

Über **„Tresor importieren“** neben **„+ Neues Passwort“** lassen sich Einträge aus einer externen `.enc`-Datei in den geöffneten Browser-Tresor übernehmen.

- Externe Datei auswählen und mit ihrem Master-Passwort entsperren.
- Zu importierende Einträge in der Diff-Ansicht überprüfen.
- Konflikte einzeln oder über **„Alle von Quelle übernehmen“** bearbeiten.
- Den Import vor dem Speichern bestätigen.

Beim Import wird **nur der Browser-Tresor aktualisiert**. Sein bisheriges Master-Passwort bleibt erhalten; die importierte Datei wird nicht verändert.

### 💾 Sicherung und Schutz vor unbeabsichtigten Änderungen

- Verschlüsselten Tresor als `.enc`-Datei exportieren.
- Vor Änderungen am Browser-Tresor eine Sicherung zum Download anbieten.
- Optional **„Backup überspringen“** auswählen.
- Beim Überspringen des Backups einen Warnhinweis und eine zusätzliche Bestätigung anzeigen.
- Änderungen erst nach der abschließenden Bestätigung übernehmen.
- Den Tresor manuell oder nach einer einstellbaren Zeit ohne Benutzeraktivität automatisch sperren.
- Das Master-Passwort eines Tresors ändern.

> **Empfehlung:** Bewahre regelmäßig eine aktuelle `.enc`-Sicherung an einem sicheren, vom Browser unabhängigen Ort auf. Die Option „Backup überspringen“ ist vor allem dann sinnvoll, wenn bereits eine überprüfte Sicherung vorhanden ist.

### 📱 Nutzung auf verschiedenen Geräten

- Browserbasierte Oberfläche für PC und Smartphone.
- Touchscreen-taugliche Bedienelemente.
- Keine Installation einer Desktop-Anwendung erforderlich.
- Nach dem Laden grundsätzlich ohne laufende Serververbindung nutzbar, solange die benötigten Dateien verfügbar sind.

**Wichtig:** Die Tresore werden nicht automatisch zwischen Geräten oder Cloud-Speichern synchronisiert. Für die Übertragung auf ein anderes Gerät muss eine verschlüsselte `.enc`-Datei selbst übertragen und dort geöffnet oder importiert werden.

---

## 🔒 Sicherheitsarchitektur

### Lokale Verschlüsselung

Die Anwendung verwendet die **Web Crypto API** des Browsers. Die Ver- und Entschlüsselung der Tresordaten erfolgt clientseitig.

Die vorgesehenen kryptografischen Parameter sind:

| Komponente | Verfahren bzw. Länge |
|---|---|
| Verschlüsselung | AES-GCM mit 256-Bit-Schlüssel |
| Schlüsselableitung | PBKDF2 mit SHA-256 |
| PBKDF2-Iterationen | 600.000 |
| Salt | 16 Bytes |
| IV | 12 Bytes |

Die konkreten Parameter und die Verarbeitung der verschlüsselten Daten sollten bei Änderungen an der Kryptografie-Implementierung erneut geprüft werden.

### Was bedeutet „clientseitig“?

- Die Anwendung benötigt kein Backend, das deine Passwörter verwaltet.
- Die Entschlüsselung findet im Browser statt.
- Der Browser-Tresor wird lokal gespeichert.
- Externe Tresore werden als verschlüsselte `.enc`-Dateien verarbeitet.
- Die Anwendung muss keine unverschlüsselten Zugangsdaten an einen Server senden.

**Clientseitige Verschlüsselung allein garantiert jedoch keine absolute Sicherheit.** Beispielsweise können schädliche Browser-Erweiterungen, ein kompromittiertes Gerät oder manipulierter ausgelieferter JavaScript-Code ein Risiko darstellen. Bei einer über GitHub Pages geladenen Anwendung muss deshalb auch der bereitgestellte Quellcode vertrauenswürdig sein.

### Öffentliches GitHub-Repository

Der Quellcode kann öffentlich bereitgestellt und überprüft werden. **Master-Passwörter, echte Zugangsdaten und persönliche `.enc`-Dateien gehören dagegen nicht ins Repository.**

Achte vor jedem Commit darauf, dass keine persönlichen Tresordateien, Testzugänge mit echten Passwörtern oder andere vertrauliche Daten mit hochgeladen werden.

---

## 🚀 Nutzung

### 1. Anwendung öffnen

Öffne die bereitgestellte GitHub-Pages-URL oder starte die Anwendung in einer geeigneten lokalen Browserumgebung.

Wähle anschließend, ob du den **Browser-Tresor** oder einen **externen Datei-Tresor** öffnen möchtest.

### 2. Tresor entsperren

Gib das zugehörige Master-Passwort ein. Bei einer externen Datei wählst du zunächst die `.enc`-Datei aus.

> **Master-Passwort nicht vergessen:** Es gibt keine serverseitige Passwort-zurücksetzen-Funktion. Ohne das passende Master-Passwort kann ein verschlüsselter Tresor in der Regel nicht wiederhergestellt werden.

### 3. Passwörter verwalten

Füge Einträge hinzu, bearbeite bestehende Zugangsdaten oder erstelle mit dem Passwortgenerator ein neues Passwort.

Das Augen-Symbol im Eingabeformular steuert, ob das Passwort sichtbar ist. Ein neu generiertes Passwort wird zunächst angezeigt.

### 4. Tresor importieren

Öffne deinen Browser-Tresor und klicke neben **„+ Neues Passwort“** auf **„Tresor importieren“**.

Wähle die externe `.enc`-Datei aus, entsperre sie und überprüfe die Unterschiede in der Diff-Ansicht. Bestätige anschließend die Einträge, die in den Browser-Tresor übernommen werden sollen.

### 5. Tresore synchronisieren

Klicke auf **„Tresore synchronisieren“** und entsperre bei Bedarf den zweiten Tresor.

Vergleiche die Einträge in der Diff-Ansicht und entscheide bei Konflikten, welche Version übernommen werden soll. Wähle danach aus, ob beide Tresore künftig dasselbe Master-Passwort oder weiterhin unterschiedliche Master-Passwörter verwenden sollen.

Prüfe die Zusammenfassung vor dem Abschluss. Lade die aktualisierte `.enc`-Datei herunter und bewahre sie am gewünschten Speicherort auf.

### 6. Daten sichern

Nutze **„Als .enc-Datei exportieren“**, um eine aktuelle verschlüsselte Sicherung herunterzuladen.

Bei Änderungen an einem externen Datei-Tresor ist der Export besonders wichtig: **Die ursprünglich ausgewählte Datei wird nicht automatisch aktualisiert.**

---

## 🛠️ Technische Details

Die Anwendung besteht aus folgenden Dateien:

| Datei | Aufgabe |
|---|---|
| `index.html` | Benutzeroberfläche und Layout |
| `app.js` | Tresorverwaltung, Passwortgenerator, Import, Synchronisierung und Bedienlogik |
| `crypto_neu.js` | Clientseitige Ver- und Entschlüsselung |

Die Anwendung verwendet browserseitige APIs, darunter die **Web Crypto API** und den lokalen Browserspeicher.

Für Funktionen wie den Zugriff auf die Zwischenablage kann eine sichere Browserumgebung erforderlich sein, beispielsweise **HTTPS** oder **localhost**.

---

## ⚠️ Hinweise

- Teste Import, Synchronisierung und Master-Passwort-Wechsel zunächst mit **Test-Tresoren**.
- Prüfe nach dem Export, ob sich die heruntergeladene `.enc`-Datei mit dem erwarteten Master-Passwort wieder öffnen lässt.
- Behalte vor größeren Änderungen nach Möglichkeit eine separate Sicherung.
- Das Löschen des Browser-Tresors oder das Entfernen von Browserdaten kann lokal gespeicherte Einträge unzugänglich machen, wenn keine aktuelle externe Sicherung vorhanden ist.
- Die Passwortstärke-Anzeige ist eine grobe Orientierung und ersetzt keine umfassende Sicherheitsprüfung.
- Die Synchronisierung erfolgt **manuell** über die Anwendung, nicht automatisch im Hintergrund.

---

## 🤖 Credits & Entwicklung

Der Quellcode und die Benutzeroberfläche dieses Projekts wurden mit Unterstützung einer **Künstlichen Intelligenz (KI)** erstellt und schrittweise erweitert. Dazu gehören unter anderem die Passwortverwaltung, die mobile Bedienung, der Passwortgenerator sowie die Import- und Synchronisierungsfunktionen.

KI-generierter Code sollte vor dem produktiven Einsatz geprüft und getestet werden. Die Verwendung von KI bei der Entwicklung stellt keine unabhängige Sicherheitszertifizierung dar.
