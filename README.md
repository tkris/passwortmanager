# Dateibasierter Tresor mit verschlüsseltem Zwischenstand (Testversion)

Die Startansicht bietet **Tresor öffnen**, **Neuen Tresor erstellen** und bei vorhandenem Zwischenstand **Zwischengespeicherte Arbeit fortsetzen**. Ein neuer Tresor muss als `.enc`-Datei heruntergeladen und sicher aufbewahrt werden. Änderungen werden verschlüsselt im Browser zwischengespeichert; **die ursprüngliche `.enc`-Datei wird nicht automatisch aktualisiert**. Über **Tresor als .enc-Datei speichern** wird eine aktuelle Datei zum Download angeboten. Erst nach eigener Prüfung des Downloads darf der Zwischenstand als exportiert markiert werden.

Der Zwischenstand wird an den kryptografischen Fingerabdruck der ursprünglich geöffneten Datei gebunden. Öffnest du diese Datei erneut, kannst du den Zwischenstand wiederherstellen. Ein Zwischenstand zu einer anderen Datei wird nicht stillschweigend überschrieben. Über **Zwischengespeicherte Arbeit fortsetzen** lässt sich die letzte lokale Arbeit auch ohne erneute Auswahl der ursprünglichen Datei öffnen (Master-Passwort erforderlich). Es gibt derzeit **nur einen** lokalen Zwischenstand gleichzeitig.

Ein früherer Browser-Tresor kann unter **Tresor öffnen → Alten Browser-Tresor für Export öffnen** geöffnet und als `.enc` exportiert werden. Lösche den alten Tresor erst, nachdem du die Datei erfolgreich geöffnet und überprüft hast. Zwei `.enc`-Dateien können im geöffneten Tresor über „Tresore synchronisieren“ manuell verglichen und zusammengeführt werden. Die Quelldateien werden nicht automatisch überschrieben.

**Wichtig:** Der Browser-Zwischenspeicher ersetzt kein Backup. Das Löschen von Browserdaten kann nicht exportierte Änderungen vernichten. Ein angestoßener Download beweist nicht, dass die Datei erfolgreich gespeichert wurde. Vor Nutzung mit echten Zugangsdaten die Datei-Erstellung, Bearbeitung, Wiederherstellung, Importfunktion und den Master-Passwort-Wechsel mit Testdaten prüfen.

---


# 🔐 Web Passwort Manager (Client-Side Encrypted)

Ein minimalistischer, vollständig clientseitiger Passwortmanager für den Browser. Die Anwendung kann als eigenständige Web-App, beispielsweise über GitHub Pages, bereitgestellt und auf dem PC oder Smartphone verwendet werden.

Passwörter werden lokal verschlüsselt gespeichert oder als verschlüsselte `.enc`-Datei exportiert. Ein Backend oder Benutzerkonto ist für die Tresorverwaltung nicht erforderlich.

> **Wichtig:** Dieses Projekt ist ein eigenständiger Passwortmanager und sollte vor der Verwendung mit wichtigen Zugangsdaten sorgfältig getestet werden. Eine unabhängige Sicherheitsprüfung ist nicht dokumentiert.

## ✨ Funktionen

### 🔑 Passwortverwaltung

- **Vereinfachte Startansicht:** Vorhandenen Tresor öffnen oder, falls in diesem Browser noch keiner gespeichert ist, einen neuen erstellen.
- **Neuen Tresor erstellen:** Master-Passwort zweimal identisch eingeben; ein Hinweis erklärt die ausschließlich lokale Speicherung im aktuellen Browser.

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
- Auch bei vielen Einträgen übersichtlich arbeiten: Die Unterschiedsliste ist separat scrollbar, während die Aktionsschaltflächen darunter erreichbar bleiben.
- Den Fortschritt der Entscheidungen sehen und mit **„Nur offene Konflikte“** gezielt noch nicht entschiedene Unterschiede anzeigen.

Nach der Auswahl der Einträge kann festgelegt werden, welche Master-Passwörter künftig verwendet werden sollen:

- Master-Passwort des Browser-Tresors für beide Tresore verwenden.
- Master-Passwort des externen Tresors für beide Tresore verwenden.
- Die bisherigen Master-Passwörter beider Tresore getrennt beibehalten.

Bei der letzten Option enthalten beide Tresore die synchronisierten Einträge, werden aber weiterhin jeweils mit ihrem eigenen Master-Passwort geöffnet.

**Hinweis:** Die Anwendung überschreibt die ursprüngliche externe `.enc`-Datei nicht automatisch. Die aktualisierte Datei wird zum Download angeboten und muss anschließend am gewünschten Speicherort abgelegt werden.

### 📥 Einträge aus Tresor importieren

Über **„Einträge aus Tresor importieren“** neben **„+ Neues Passwort“** lassen sich Einträge aus einer zweiten verschlüsselten `.enc`-Datei übernehmen – **sowohl in einen geöffneten Browser-Tresor als auch in einen geöffneten externen Datei-Tresor**. Für den Import in einen externen Tresor muss kein Browser-Tresor vorhanden sein.

- Zweite `.enc`-Datei auswählen und mit **ihrem eigenen Master-Passwort** entsperren.
- Fehlende oder abweichende Einträge in der nebeneinander angeordneten Diff-Ansicht prüfen.
- Bei Konflikten einzeln entscheiden oder **„Alle von Quelle übernehmen“** verwenden.
- Die Unterschiedsliste separat scrollen, den Entscheidungsfortschritt verfolgen und bei Bedarf **„Nur offene Konflikte“** anzeigen.
- Den Import vor dem Speichern prüfen und bestätigen.

**Import in den Browser-Tresor:** Die ausgewählten Einträge werden im Browser-Tresor gespeichert. Dessen Master-Passwort bleibt erhalten; die importierte Quelldatei wird nicht verändert.

**Import in einen geöffneten externen Tresor:** Nach dem Vergleich stehen zwei Speicheroptionen zur Wahl:

1. **In neuer Datei speichern:** Die zusammengeführten Einträge als neue verschlüsselte `.enc`-Datei herunterladen. Der aktuell geöffnete Tresor bleibt unverändert.
2. **In geöffneten Tresor übernehmen:** Die Einträge in der aktuellen Tresoransicht übernehmen und den aktualisierten Tresor als `.enc`-Datei herunterladen.

Beide Optionen verwenden das **Master-Passwort des bereits geöffneten Tresors**. Das Master-Passwort der importierten Datei dient nur dazu, diese zu öffnen. **Weder die ursprüngliche externe Datei noch die importierte Quelldatei werden automatisch auf deinem Gerät überschrieben.** Prüfe den Download, bevor du eine ältere Datei ersetzt oder löschst.

### 💾 Sicherung und Schutz vor unbeabsichtigten Änderungen

- Verschlüsselten Tresor als `.enc`-Datei exportieren.
- Vor Änderungen am Browser-Tresor eine Sicherung zum Download anbieten.
- Beim externen Datei-Import eine neue `.enc`-Datei herunterladen; vorhandene Dateien werden nicht automatisch überschrieben.
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
- Ein neu erstellter Tresor wird ausschließlich im aktuell verwendeten Browser lokal gespeichert; er ist nicht automatisch auf anderen Geräten oder in anderen Browsern verfügbar.
- Externe Tresore werden als verschlüsselte `.enc`-Dateien verarbeitet.
- Die Anwendung muss keine unverschlüsselten Zugangsdaten an einen Server senden.

**Clientseitige Verschlüsselung allein garantiert jedoch keine absolute Sicherheit.** Beispielsweise können schädliche Browser-Erweiterungen, ein kompromittiertes Gerät oder manipulierter ausgelieferter JavaScript-Code ein Risiko darstellen. Bei einer über GitHub Pages geladenen Anwendung muss deshalb auch der bereitgestellte Quellcode vertrauenswürdig sein.

### Öffentliches GitHub-Repository

Der Quellcode kann öffentlich bereitgestellt und überprüft werden. **Master-Passwörter, echte Zugangsdaten und persönliche `.enc`-Dateien gehören dagegen nicht ins Repository.**

Achte vor jedem Commit darauf, dass keine persönlichen Tresordateien, Testzugänge mit echten Passwörtern oder andere vertrauliche Daten mit hochgeladen werden.

---

## 🚀 Nutzung

### 1. Anwendung öffnen

Öffne den Passwortmanager direkt über **[https://tkris.github.io/passwortmanager/](https://tkris.github.io/passwortmanager/)** oder starte die Anwendung in einer geeigneten lokalen Browserumgebung.

Auf der Startseite stehen **„Tresor öffnen“** und – sofern in diesem Browser noch kein lokaler Tresor vorhanden ist – **„Neuen Tresor erstellen“** zur Verfügung.

Über **„Tresor öffnen“** kannst du einen bereits in diesem Browser gespeicherten Tresor entsperren oder eine vorhandene verschlüsselte `.enc`-Datei auswählen. Die Unterscheidung zwischen lokaler Speicherung und Datei bleibt bestehen; nur die Startansicht ist vereinfacht.

### 2. Tresor erstellen oder öffnen

**Neuen Tresor erstellen:** Wenn noch kein lokaler Tresor in diesem Browser vorhanden ist, wähle **„Neuen Tresor erstellen“**. Lies den Hinweis zur lokalen Speicherung und gib dein Master-Passwort **zweimal identisch** ein. Erst dann kannst du den Tresor anlegen. Der neue Tresor wird ausschließlich in diesem Browser gespeichert und erscheint nicht automatisch auf anderen Geräten oder in anderen Browsern. Wenn bereits ein lokaler Tresor vorhanden ist, wird die Schaltfläche zur Neuanlage ausgeblendet, damit dieser nicht versehentlich überschrieben wird.

**Vorhandenen Tresor öffnen:** Wähle **„Tresor öffnen“** und anschließend den lokal gespeicherten Tresor oder eine externe `.enc`-Datei. Gib zum Entsperren das zugehörige Master-Passwort **einmal** ein. Bei einer externen Datei wählst du diese zuvor aus.

> **Master-Passwort nicht vergessen:** Es gibt keine serverseitige Passwort-zurücksetzen-Funktion. Ohne das passende Master-Passwort kann ein verschlüsselter Tresor in der Regel nicht wiederhergestellt werden.

### 3. Passwörter verwalten

Füge Einträge hinzu, bearbeite bestehende Zugangsdaten oder erstelle mit dem Passwortgenerator ein neues Passwort.

Das Augen-Symbol im Eingabeformular steuert, ob das Passwort sichtbar ist. Ein neu generiertes Passwort wird zunächst angezeigt.

### 4. Einträge aus Tresor importieren

Öffne deinen **Browser-Tresor oder externen Datei-Tresor** und klicke neben **„+ Neues Passwort“** auf **„Einträge aus Tresor importieren“**. Wähle eine zweite `.enc`-Datei aus und entsperre sie mit ihrem Master-Passwort. Ein Browser-Tresor ist nicht erforderlich, wenn du bereits einen externen Tresor geöffnet hast.

Vergleiche die Unterschiede in der Diff-Ansicht. Bei langen Listen kannst du innerhalb der Eintragsliste scrollen, während die Schaltflächen darunter erreichbar bleiben. Die Fortschrittsanzeige und der Filter **„Nur offene Konflikte“** helfen dir, noch ausstehende Entscheidungen zu finden.

Beim **Browser-Tresor** bestätigst du die Einträge, die übernommen werden sollen. Beim **externen Tresor** wählst du anschließend zwischen **„In neuer Datei speichern“** und **„In geöffneten Tresor übernehmen“**. Lade die erzeugte `.enc`-Datei herunter und prüfe, ob sie sich mit dem Master-Passwort des zuvor geöffneten Tresors entsperren lässt.

### 5. Tresore synchronisieren

Klicke auf **„Tresore synchronisieren“** und entsperre bei Bedarf den zweiten Tresor.

Vergleiche die Einträge in der separat scrollbaren Diff-Ansicht, nutze bei Bedarf den Filter **„Nur offene Konflikte“** und entscheide bei Konflikten, welche Version übernommen werden soll. Wähle danach aus, ob beide Tresore künftig dasselbe Master-Passwort oder weiterhin unterschiedliche Master-Passwörter verwenden sollen.

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
- Prüfe bei einem externen Import beide Speicheroptionen mit Testdateien, bevor du eine bisherige Tresordatei ersetzt.
- Prüfe nach dem Export, ob sich die heruntergeladene `.enc`-Datei mit dem erwarteten Master-Passwort wieder öffnen lässt.
- Behalte vor größeren Änderungen nach Möglichkeit eine separate Sicherung.
- Das Löschen des lokal gespeicherten Tresors oder das Entfernen von Browserdaten kann die dort gespeicherten Einträge unzugänglich machen, wenn keine aktuelle externe Sicherung vorhanden ist.
- Die Passwortstärke-Anzeige ist eine grobe Orientierung und ersetzt keine umfassende Sicherheitsprüfung.
- Die Synchronisierung erfolgt **manuell** über die Anwendung, nicht automatisch im Hintergrund.

---

## 🤖 Credits & Entwicklung

Der Quellcode und die Benutzeroberfläche dieses Projekts wurden mit Unterstützung einer **Künstlichen Intelligenz (KI)** erstellt und schrittweise erweitert. Dazu gehören unter anderem die Passwortverwaltung, die mobile Bedienung, der Passwortgenerator sowie die Import- und Synchronisierungsfunktionen.

KI-generierter Code sollte vor dem produktiven Einsatz geprüft und getestet werden. Die Verwendung von KI bei der Entwicklung stellt keine unabhängige Sicherheitszertifizierung dar.


### Neuen Tresor bei vorhandenem Zwischenstand erstellen

Solange ein verschlüsselter Zwischenstand im Browser vorhanden ist, ist „Neuen Tresor erstellen“ deaktiviert. Setze zuerst die zwischengespeicherte Arbeit fort, speichere die aktuelle `.enc`-Datei und bestätige, dass du sie tatsächlich gespeichert und geprüft hast. Erst nach dieser Bestätigung wird der Zwischenstand entfernt und die Neuanlage wieder freigegeben. Ein bloß gestarteter Download genügt nicht.

### Zwischengespeicherten Tresor verwerfen

Im geöffneten Datei-Tresor erscheint bei vorhandenem Zwischenstand die Schaltfläche **„🗑️ Tresor verwerfen“**. Nach ausdrücklicher Bestätigung wird der verschlüsselte Zwischenstand aus diesem Browser gelöscht und der Tresor gesperrt. **Alle noch nicht als `.enc`-Datei exportierten Änderungen gehen dabei verloren.** Bereits gespeicherte `.enc`-Dateien werden nicht gelöscht oder verändert. Danach kann ein neuer Tresor erstellt werden.


### Passwort Manager 2.0: Zwei `.enc`-Dateien abgleichen

Öffne die erste Datei, wähle im Menü **Tresore synchronisieren**, wähle die zweite `.enc`-Datei und gib deren Master-Passwort ein. Entscheide die Unterschiede in der Vergleichsansicht. Das Ergebnis kann als neue `.enc`-Datei heruntergeladen oder in den geöffneten Tresor übernommen und dort verschlüsselt zwischengespeichert werden. **Beide ursprünglichen Dateien bleiben unverändert.** Um beide Speicherorte auf denselben Stand zu bringen, ersetze sie nach Prüfung selbst durch die heruntergeladene zusammengeführte Datei. Die Datei verwendet das Master-Passwort des zuerst geöffneten Tresors.
