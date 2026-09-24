<a id="deutsch"></a>

# 🔐 Passwort Manager 2.0

**Sprache / Language:** [Deutsch](#deutsch) · [English](#english)

Ein clientseitiger Passwortmanager für PC und Smartphone. Verschlüsselte `.enc`-Dateien sind die eigentlichen Tresore; der Browser hält bei Bedarf einen **verschlüsselten Zwischenstand** bereit. Ein Backend oder Benutzerkonto ist für die Tresorverwaltung nicht erforderlich.

> **Wichtig:** Diese Version ist eine Testversion. Eine unabhängige Sicherheitsprüfung ist nicht dokumentiert. Bitte alle Abläufe zunächst mit Test-Tresoren prüfen.

## 🚀 Erste Schritte

1. Öffne die Anwendung über [GitHub Pages](https://tkris.github.io/passwortmanager/) oder in einer geeigneten lokalen Browserumgebung.
2. Wähle **„Tresor öffnen“**, um eine vorhandene `.enc`-Datei auszuwählen und mit ihrem Master-Passwort zu entsperren, oder **„Neuen Tresor erstellen“**. Bei der Neuanlage gibst du das Master-Passwort zweimal ein und speicherst den neuen Tresor anschließend als `.enc`-Datei.
3. Verwalte deine Einträge, nutze Suche, Sortierung und Passwortgenerator. Speichere nach Änderungen eine **aktuelle `.enc`-Datei** und prüfe, ob sie sich öffnen lässt.

**Datei-Tresor und belegter Zwischenspeicher:** Ist bereits ein anderer Tresor zwischengespeichert, kannst du eine weitere `.enc`-Datei trotzdem öffnen und Einträge bearbeiten. Änderungen an dieser zweiten Datei bleiben nur in der geöffneten Sitzung und müssen **vor dem manuellen Sperren oder Schließen** als `.enc` exportiert werden; der erste Zwischenstand wird nicht überschrieben. Ist der Zwischenspeicher frei, wird beim Sperren eines unveränderten externen Tresors eine verschlüsselte Kopie angelegt, damit du ihn später ohne erneute Dateiauswahl fortsetzen kannst. Bei Änderungen wird wie bisher sofort zwischengespeichert, sofern der Speicher frei ist.

**Ein vorhandener Zwischenstand:** Über **„Zwischengespeicherte Arbeit fortsetzen“** kannst du nach erneutem Öffnen der App weiterarbeiten (Master-Passwort erforderlich). Solange ein Zwischenstand vorhanden ist, bleibt **„Neuen Tresor erstellen“** gesperrt. Beim Speichern wird die `.enc`-Datei ohne anschließende Bestätigungs- oder Sperrfrage zum Download angeboten; der Tresor bleibt geöffnet. Der verschlüsselte Zwischenstand bleibt vorsichtshalber erhalten, bis du ihn auf der Startseite ausdrücklich löschst. Über **„Zwischenspeicher löschen“** auf der Startseite kannst du den verschlüsselten Zwischenstand nach ausdrücklicher Bestätigung auch ohne Export endgültig entfernen. Dabei gehen nicht exportierte Änderungen verloren; bereits gespeicherte `.enc`-Dateien bleiben unverändert. Danach kannst du wieder einen neuen Tresor erstellen. Nur bei einem **neu erstellten, noch nie befüllten Tresor** erscheint **„Tresor verwerfen“**. Nach dem ersten hinzugefügten Eintrag oder beim Öffnen einer bestehenden `.enc`-Datei steht stattdessen **„Tresor schließen ohne Speichern“** zur Verfügung. Nach Bestätigung wird die Sitzung beendet und ausschließlich der zu diesem Tresor gehörende verschlüsselte Zwischenstand gelöscht; nicht exportierte Änderungen gehen verloren. Ein Zwischenstand eines anderen Tresors sowie bereits gespeicherte `.enc`-Dateien bleiben unverändert. **„Tresor sperren“** behält dagegen den vorhandenen Zwischenstand für die spätere Wiederherstellung.

## ✨ Funktionen

- Einträge hinzufügen, bearbeiten, löschen, suchen und sortieren; Passwörter erzeugen, anzeigen und kopieren.
- **„Einträge aus Tresor importieren“:** Einträge aus einer zweiten verschlüsselten `.enc`-Datei übernehmen. Die zweite Datei wird mit ihrem eigenen Master-Passwort geöffnet; Unterschiede können in einer Vergleichsansicht geprüft werden.
- **„Tresore synchronisieren“:** Zwei `.enc`-Dateien manuell vergleichen und Unterschiede beziehungsweise Konflikte gezielt zusammenführen. Das Ergebnis kann als neue `.enc`-Datei heruntergeladen oder in den geöffneten Tresor übernommen und verschlüsselt zwischengespeichert werden. Die Ergebnisdatei verwendet das Master-Passwort des zuerst geöffneten Tresors.
- Tresor manuell oder nach einer einstellbaren Inaktivitätszeit sperren; die Option **„Niemals sperren“** deaktiviert die Zeitsperre. Bei nicht exportierten Änderungen an einem zweiten Datei-Tresor, während ein anderer Tresor den Zwischenspeicher belegt, wird die automatische Sperre vorübergehend deaktiviert und die Zeitauswahl ausgegraut. Ein einzelner rot umrandeter Hinweis oberhalb der Tresor-Aktionsbuttons erklärt das Datenverlustrisiko und die deaktivierte Zeitsperre. Die allgemeinen aufklappbaren Sicherheitshinweise erscheinen nur auf der Start- und Entsperransicht, nicht im geöffneten Tresor. Die vorher gewählte Einstellung bleibt erhalten. **Auch ein gestarteter Export hebt die Sperre nicht auf**, da die Anwendung die erfolgreiche Speicherung der Datei nicht überprüfen kann. Manuelles Sperren und Schließen des Tabs können weiterhin zum Verlust dieser Änderungen führen; ein entsperrter Tresor ist bei unbeaufsichtigtem Gerät ein Sicherheitsrisiko. Master-Passwort ändern.
- Einen früheren Browser-Tresor über **„Tresor öffnen → Alten Browser-Tresor für Export öffnen“** für den Umstieg als `.enc`-Datei exportieren.

## 💾 Speicherung und Wiederherstellung

Änderungen werden **verschlüsselt im Browser zwischengespeichert**, aber die ursprünglich ausgewählte `.enc`-Datei wird **nicht automatisch aktualisiert**. Ein gestarteter Download ist kein Nachweis, dass die Datei tatsächlich gespeichert wurde. Prüfe den Download, bevor du eine ältere Datei ersetzt oder den Zwischenspeicher ausdrücklich löschst.

Der Zwischenstand ist der ursprünglich geöffneten Datei zugeordnet. Beim erneuten Öffnen kann die App eine Wiederherstellung anbieten. Ein Zwischenstand einer anderen Datei wird nicht stillschweigend überschrieben. Die aktuelle Version unterstützt **nur einen lokalen Zwischenstand gleichzeitig**.

Beim Synchronisieren werden **beide Quelldateien nicht automatisch überschrieben**. Wenn beide Speicherorte denselben Stand erhalten sollen, speichere das geprüfte Ergebnis selbst an beiden Orten. Eine automatische Synchronisierung über Netzwerk oder Cloud ist nicht enthalten.

## 🔒 Sicherheit

Die Ver- und Entschlüsselung erfolgt clientseitig mit der Web Crypto API. Die dokumentierten kryptografischen Parameter sind AES-GCM (256 Bit), PBKDF2 mit SHA-256 (600.000 Iterationen), 16 Byte Salt und 12 Byte IV. Eine unabhängige Prüfung der Implementierung ist nicht dokumentiert.

**Der Browser-Zwischenspeicher ist kein Backup.** Das Löschen von Browserdaten kann nicht exportierte Änderungen vernichten. Bewahre aktuelle `.enc`-Dateien an einem sicheren Ort auf und vergiss dein Master-Passwort nicht: Es gibt keine serverseitige Zurücksetzen-Funktion. Ein kompromittiertes Gerät, schädliche Erweiterungen oder manipulierter JavaScript-Code können auch bei clientseitiger Verschlüsselung ein Risiko darstellen.

**Keine echten Zugangsdaten, Master-Passwörter oder persönlichen `.enc`-Dateien in das öffentliche GitHub-Repository hochladen.** Teste Neuanlage, Export, Wiederherstellung, Import, Synchronisierung und Master-Passwort-Wechsel vor der produktiven Nutzung mit Testdaten.

## 🛠️ Projektdateien

| Datei | Aufgabe |
|---|---|
| `index.html` | Oberfläche und Layout |
| `app.js` | Tresorverwaltung, Generator, Import und Synchronisierung |
| `crypto_neu.js` | Clientseitige Verschlüsselung |

Für manche Browserfunktionen ist eine sichere Umgebung wie HTTPS oder `localhost` erforderlich.

## 🤖 Entwicklung

Quellcode und Benutzeroberfläche wurden mit Unterstützung von KI erstellt und schrittweise erweitert. KI-Unterstützung ersetzt keine Codeprüfung oder Sicherheitszertifizierung.

---

<a id="english"></a>

# 🔐 Password Manager 2.0



A client-side password manager for desktop and mobile browsers. Encrypted `.enc` files are the primary vaults; the browser can retain an **encrypted local draft**. No backend or user account is required to manage vaults.

> **Important:** This is a test version. No independent security audit is documented. Test all workflows with sample vaults first.

## 🚀 Getting started

1. Open the app on [GitHub Pages](https://tkris.github.io/passwortmanager/) or in a suitable local browser environment.
2. Select **“Tresor öffnen” (Open vault)** to choose an existing `.enc` file and unlock it with its master password, or **“Neuen Tresor erstellen” (Create new vault)**. When creating a vault, enter the master password twice, then save the new vault as an `.enc` file.
3. Manage entries using search, sorting and the password generator. After making changes, save an **updated `.enc` file** and verify that it can be opened.

**File vaults and an occupied cache:** You can open and edit a second `.enc` file even if another vault occupies the browser cache. Changes to the second file remain only in the open session and must be exported as an `.enc` file **before manually locking or closing**; the first cached vault is never overwritten. If the cache is free, locking an unchanged external vault creates an encrypted copy so you can resume it without selecting the file again. Edits are cached immediately when the cache is available.

**If a local draft exists:** Select **“Zwischengespeicherte Arbeit fortsetzen” (Resume cached work)** to continue after reopening the app (master password required). **Create new vault** is disabled while a draft exists. Saving offers an `.enc` file for download without additional confirmation or lock prompts; the vault stays open. The encrypted draft remains available until you explicitly delete it from the start screen. Use **“Zwischenspeicher löschen” (Delete cached vault)** on the start screen to permanently delete the encrypted draft after explicit confirmation, without exporting it. Unexported changes will be lost, existing `.enc` files remain untouched, and new vault creation becomes available again. **“Tresor verwerfen” (Discard vault)** is available only for a **newly created vault that has never contained an entry**. After the first entry is added, or when an existing `.enc` file is opened, **“Tresor schließen ohne Speichern” (Close vault without saving)** is offered instead. After confirmation, the session ends and only the encrypted draft belonging to this vault is deleted; unexported changes are lost. A draft belonging to another vault and previously saved `.enc` files remain untouched. **“Tresor sperren” (Lock vault)** keeps the existing draft available for later recovery.

## ✨ Features

- Add, edit, delete, search and sort entries; generate, reveal and copy passwords.
- **“Einträge aus Tresor importieren” (Import entries from vault):** Import entries from a second encrypted `.enc` file. Unlock the source file using its own master password and review differences in the comparison view.
- **“Tresore synchronisieren” (Synchronize vaults):** Manually compare two `.enc` files and resolve differences or conflicts. Download the merged result as a new `.enc` file or apply it to the open vault and cache it in encrypted form. The resulting file uses the master password of the vault opened first.
- Lock the vault manually or after a configurable period of inactivity; **“Niemals sperren” (Never lock)** disables timed locking. When a second file vault has unexported changes and another vault occupies the browser cache, automatic locking is temporarily disabled and the time selector is greyed out. A single red-bordered warning above the vault action buttons explains the risk of data loss and why timed locking is disabled. General expandable security information is shown only on the start and unlock screens, not while a vault is open; the previous setting is retained. **Starting an export does not re-enable the timer**, because the app cannot verify that the downloaded file was saved. Manual locking or closing the tab can still lose those changes; leaving the vault unlocked on an unattended device is a security risk. Change the master password.
- For migration, open a legacy browser vault via **“Tresor öffnen → Alten Browser-Tresor für Export öffnen”** and export it as an `.enc` file.

## 💾 Saving and recovery

Changes are **cached in encrypted form in the browser**, but the originally selected `.enc` file is **not updated automatically**. Starting a download does not prove the file was saved successfully. Check the downloaded file before replacing an older copy or explicitly deleting the cached draft.

The local draft is associated with the file originally opened. The app can offer recovery when that file is reopened. A draft belonging to another file is not silently overwritten. The current version supports **only one local draft at a time**.

During synchronization, **neither source file is overwritten automatically**. To keep two storage locations in sync, save the verified merged file to both locations yourself. Automatic network or cloud synchronization is not included.

## 🔒 Security

Encryption and decryption take place client-side using the Web Crypto API. The documented cryptographic parameters are AES-GCM (256-bit), PBKDF2 with SHA-256 (600,000 iterations), a 16-byte salt and a 12-byte IV. No independent audit of the implementation is documented.

**The browser cache is not a backup.** Clearing browser data can destroy changes that have not been exported. Keep current `.enc` files in a safe location and do not forget your master password: there is no server-side password reset. A compromised device, malicious extensions or modified JavaScript can pose risks even with client-side encryption.

**Do not commit real credentials, master passwords or personal `.enc` files to the public GitHub repository.** Test vault creation, export, recovery, import, synchronization and master-password changes with sample data before using the app for important credentials.

## 🛠️ Project files

| File | Purpose |
|---|---|
| `index.html` | Interface and layout |
| `app.js` | Vault management, generator, import and synchronization |
| `crypto_neu.js` | Client-side encryption |

Some browser features require a secure context such as HTTPS or `localhost`.

## 🤖 Development

The source code and interface were created and extended with AI assistance. AI assistance does not replace code review or security certification.


### Zwischenspeicher löschen und Notfallfreigabe

Auf der Startseite verlangt **„Zwischenspeicher löschen“** das Master-Passwort des zwischengespeicherten Tresors und anschließend eine Bestätigung. Im unteren Feld **„Sicherheitshinweise“**, innerhalb von **„Mehr zur Sicherheit“**, befindet sich bei belegtem Zwischenspeicher die separate **„Notfalloption: Zwischenspeicher ohne Passwort freigeben“**. Sie löscht den Zwischenstand erst nach einer ausdrücklichen Warnung vor unwiederbringlichem Datenverlust; ein noch nie als `.enc`-Datei exportierter Tresor kann dadurch vollständig verloren gehen. Die Notfallfreigabe gibt nur den einen Browser-Zwischenspeicher frei und öffnet oder importiert keine Passwörter. Bereits exportierte `.enc`-Dateien bleiben unverändert. Andere Personen mit Zugriff auf das Gerät können Browserdaten auch außerhalb dieser App löschen.

### Delete cached draft and emergency release

On the start screen, **“Zwischenspeicher löschen” (Delete cached draft)** requires the cached vault's master password followed by confirmation. The separate **“Notfalloption: Zwischenspeicher ohne Passwort freigeben” (Emergency release without password)** appears in the lower **“Sicherheitshinweise” (Security information)** panel under **“Mehr zur Sicherheit” (More about security)** only when a cached draft exists. It removes the cached draft only after an explicit warning about irreversible data loss; a vault that has never been exported to an `.enc` file may be lost entirely. Emergency release only frees the single browser cache: it does not unlock or import passwords. Previously exported `.enc` files remain unchanged. Anyone with access to the device can also clear browser data outside this app.

### Hinweis zur Startseite / Start screen notice

Die große rote Meldung zum vorhandenen Zwischenstand entfällt. Beim regulären Löschen wird zuerst das Master-Passwort geprüft; erst nach erfolgreicher Prüfung folgt eine ausdrückliche Bestätigung mit Warnung vor dem möglichen endgültigen Verlust eines noch nicht exportierten Tresors. Die Notfalloption bleibt ausschließlich im aufklappbaren Bereich „Sicherheitshinweise“ sichtbar, solange ein Zwischenstand existiert.

The large red cached-draft notice has been removed from the start screen. Regular deletion verifies the cached vault’s master password first, then requests explicit confirmation with a warning that a vault not yet exported may be lost permanently. The emergency option remains available only in the expandable security information section while a cached draft exists.
