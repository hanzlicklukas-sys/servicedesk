# ServiceDesk Brainstorm

## Leitidee

ServiceDesk soll keine komplizierte Bürosoftware werden. Die App soll Lukas mit möglichst wenigen Eingaben durch einen vollständigen Auftrag führen:

`Anfrage -> Termin -> Durchführung -> Zeit und Material -> Endpreis -> Zahlung`

Die wichtigsten Eigenschaften:

- auf dem Handy schnell bedienbar
- auch für spontane Notizen geeignet
- verständlich ohne Buchhaltungswissen
- lokal zuverlässig, später sicher synchronisierbar
- nützlich für Gartenservice und technische Hilfe
- so einfach, dass die App während eines Kundentermins nicht stört

## Der ideale Ablauf

### 1. Anfrage kommt rein

- Kunde suchen oder neu anlegen
- Anliegen in einem Satz notieren
- Bereich Garten oder Technik auswählen
- Anfrage zunächst ohne Termin und Preis speichern
- Telefonnummer direkt antippbar
- Quelle der Anfrage speichern: Empfehlung, Kleinanzeigen, Flyer, Stammkunde

### 2. Termin planen

- Datum und Uhrzeit später ergänzen
- geschätzte Dauer optional angeben
- Adresse aus Kundendaten übernehmen
- Terminstatus: unbestätigt, bestätigt, unterwegs
- Konfliktwarnung bei überschneidenden Terminen
- Rückruf oder Vor-Ort-Termin unterscheiden

### 3. Vor Ort arbeiten

- Auftrag mit einem Tipp öffnen
- Startzeit erfassen
- kurze Checkliste anzeigen
- Material und Ausgaben notieren
- Bilder vorher/nachher aufnehmen
- spontane Zusatzarbeiten ergänzen
- Kundennotizen direkt sichtbar

### 4. Auftrag abschließen

- Endzeit erfassen
- Dauer automatisch berechnen
- Endpreis eintragen oder berechnen lassen
- Zahlungsart auswählen
- Status auf erledigt setzen
- offene Zahlung oder bezahlt markieren
- nächsten Termin direkt vorschlagen

## Sofort sinnvolle Funktionen

### Aufträge

- Preis beim Erstellen optional lassen
- geschätzter Preis und Endpreis getrennt behandeln
- Auftrag vollständig bearbeiten
- Auftrag löschen mit Sicherheitsabfrage
- Auftrag duplizieren
- Auftrag als wiederkehrend markieren
- Status frei auswählen
- Auftrag ohne festen Termin speichern
- Aufträge nach offen, geplant, erledigt und bezahlt filtern
- Suche nach Kunde, Leistung oder Ort
- alte Aufträge archivieren
- wichtige Aufträge anheften
- Auftrag mit interner Notiz versehen
- Absagegrund speichern
- Auftrag verschieben statt neu erstellen

### Zeiterfassung

- Start- und Stopp-Knopf
- Pause erfassen
- Dauer automatisch berechnen
- Zeit nachträglich korrigieren
- Anfahrtszeit getrennt erfassen
- Arbeitszeit und Fahrzeit im Auftrag anzeigen
- optionaler Stundenlohn je Auftrag
- Endpreis aus Stunden, Anfahrt und Material vorschlagen
- Rundungsoption, beispielsweise auf 15 Minuten

### Preislogik

- Festpreis, Stundenpreis oder Preis später festlegen
- Standard-Stundensatz getrennt für Garten und Technik
- Mindestpreis pro Besuch
- Anfahrtspauschale
- Materialkosten
- Rabatt
- kostenloser Gefallen oder Kulanzauftrag
- Preisvorschlag ohne automatische Übernahme
- Preisverlauf eines Kunden anzeigen
- Warnung, wenn ein erledigter Auftrag noch keinen Preis hat
- Warnung, wenn ein bezahlter Auftrag keinen Preis hat

### Kunden

- Kundendaten bearbeiten
- Kunde löschen
- Kunde archivieren
- vollständige Auftragshistorie
- letzter und nächster Termin
- bisheriger Umsatz
- offene Zahlungen
- bevorzugter Kontaktweg
- beste Erreichbarkeit
- besondere Hinweise, etwa Hörprobleme oder langsame Erklärung
- Zugangshinweise, Parkplatz oder Gartentor
- Notfallkontakt nur wenn wirklich nötig
- Stammkunde markieren
- Favoriten
- Kunden zusammenführen, falls doppelt angelegt
- Suche nach Name, Ort, Telefonnummer und Notiz
- Kunde direkt aus einem Auftrag öffnen

## Übersicht

Die Übersicht sollte nur zeigen, was heute wirklich wichtig ist:

- heutige Termine
- nächster Termin
- offene Aufträge
- Geld diesen Monat
- überfällige Zahlungen
- erledigte Aufträge ohne Endpreis
- unbestätigte Termine
- Rückrufe

Mögliche Schnellaktionen:

- neuer Auftrag
- neuer Kunde
- Rückruf notieren
- spontane Einnahme erfassen
- Termin starten

Nicht auf die Übersicht:

- große Diagramme ohne Handlungswert
- zu viele Kennzahlen
- komplizierte Monatsvergleiche
- dekorative Elemente

## Finanz-Dashboard

### Kennzahlen

- Umsatz diesen Monat
- bezahlter Umsatz
- noch offene Beträge
- Einnahmen nach Garten und Technik
- durchschnittlicher Auftragswert
- Anzahl bezahlter Aufträge
- Materialausgaben
- geschätzter Gewinn
- Umsatz pro Arbeitsstunde
- Vergleich mit Vormonat
- Sparfortschritt fürs USA-Auslandsjahr

### Einnahmen

- Auftrag als bar, Überweisung oder PayPal bezahlt markieren
- Zahlungsdatum speichern
- Teilzahlung ermöglichen
- manuelle Einnahme ohne Auftrag
- Korrektur oder Rückerstattung
- Zahlungsverlauf
- offene Beträge nach Alter sortieren

### Ausgaben

- Material
- Werkzeug
- Fahrtkosten
- Werbung
- Software
- sonstige Ausgaben
- Beleg fotografieren
- Ausgabe einem Auftrag zuordnen
- wiederkehrende Ausgabe
- private Ausgabe klar ausschließen

### Auswertungen

- Monat auswählen
- Umsatztrend als sehr schlichtes Diagramm
- Garten gegen Technik vergleichen
- häufigste Leistungen
- beste Kunden nach Umsatz
- offene Forderungen
- Export als CSV
- einfache Jahresübersicht für Steuerunterlagen

Wichtig: Die App sollte keine steuerliche Beratung vortäuschen. Sie organisiert Daten und Exporte.

## Kalender und Planung

- Tagesansicht
- Wochenansicht
- Monatsansicht
- Auftrag per Ziehen verschieben
- freie Zeitfenster erkennen
- Fahrzeit zwischen Terminen einplanen
- Terminkonflikte anzeigen
- wiederkehrende Gartenpflege
- saisonale Erinnerung für Hecken, Laub und Rasen
- Terminbestätigung per vorbereiteter Nachricht
- Erinnerung am Vorabend
- Erinnerung vor Abfahrt
- Wetterhinweis für Gartenaufträge
- Regen-Ersatztermin
- Route für den Tag öffnen
- Termine nach Aachen und Würselen gruppieren

## Kommunikation

### Nachrichtenvorlagen

- Termin bestätigen
- Termin verschieben
- Verspätung ankündigen
- Auftrag abgeschlossen
- Zahlung freundlich erinnern
- Nachfrage nach Zufriedenheit
- nächsten Gartentermin vorschlagen

Beispiel:

> Hallo Frau Becker, hier ist Lukas. Ich bestätige unseren Termin am Dienstag um 14:30 Uhr. Viele Grüße

Funktionen:

- Vorlage mit Kundennamen und Termin automatisch füllen
- Text kopieren
- WhatsApp öffnen
- SMS öffnen
- E-Mail öffnen
- niemals automatisch senden

## Gartenservice

- Flächen- und Längenangaben
- Heckenhöhe und Heckenlänge
- Entsorgung erforderlich
- eigenes oder Kundengerät
- Wetterabhängigkeit
- Saison
- wiederkehrender Rhythmus
- Vorher-/Nachher-Fotos
- benötigte Werkzeuge
- Materialliste
- Grünabfallmenge
- Zufahrt und Stromanschluss
- geschätzte Dauer aus ähnlichen Aufträgen
- Garten-Checkliste
- Sicherheitsnotizen

Mögliche Leistungsvorlagen:

- Rasen mähen
- Heckenschnitt
- Unkraut entfernen
- Laub entfernen
- Garten aufräumen
- Beetpflege
- kleine Reparatur

## Technische Hilfe

- Gerätetyp
- Hersteller und Modell
- Betriebssystem
- Fehlerbeschreibung
- Zugangsdaten niemals als Klartext speichern
- erledigte Schritte
- installierte Programme
- Backup durchgeführt
- Neustart getestet
- Kunde hat Erklärung verstanden
- Folgeproblem oder Rückruf
- Gerätedaten als Foto
- Wiederherstellungspunkt erstellt
- vorherige Datensicherung bestätigt

Mögliche Checklisten:

- Windows-PC einrichten
- Windows-Upgrade
- Drucker einrichten
- WLAN prüfen
- E-Mail einrichten
- Smartphone übertragen
- Datensicherung
- Fernseher einrichten

## Fotos und Dokumentation

- Bilder einem Auftrag zuordnen
- vorher und nachher unterscheiden
- Belege fotografieren
- Bilder komprimieren
- sensible Bilder kennzeichnen
- Bilder löschen
- keine automatische Cloud-Übertragung ohne Zustimmung
- Auftragszusammenfassung als PDF
- einfache Rechnung oder Quittung erzeugen
- Kundendaten nur so lange speichern wie nötig

## Rechnungen und Quittungen

- Rechnungsnummer automatisch vergeben
- Rechnungsdatum
- Leistungsdatum
- Kunde und Adresse übernehmen
- Positionen aus Auftrag erzeugen
- Arbeitszeit, Material und Anfahrt getrennt
- Bar bezahlt markieren
- PDF erzeugen
- Vorschau vor Erstellung
- Rechnung stornieren statt still überschreiben
- Hinweis auf Kleinunternehmerregelung nur nach korrekter rechtlicher Prüfung

## Handy und Speicherung

### Progressive Web App

- ServiceDesk zum Startbildschirm hinzufügen
- Vollbild ohne Browserleiste
- eigenes App-Icon
- schneller Start
- Offline-Grundfunktion
- späteres Synchronisieren

### Datensicherheit

- automatische lokale Speicherung
- sichtbarer Speicherstatus
- tägliches Backup
- Export als JSON und CSV
- Backup wiederherstellen
- niemals Daten beim Update verlieren
- Datenmigration zwischen App-Versionen
- defekte Datensätze abfangen
- Papierkorb für gelöschte Daten
- optionaler PIN-Schutz
- automatische Sperre

### Geräteübergreifend

Für echten Zugriff von Handy und Computer reicht `localStorage` nicht. Mögliche Stufen:

1. App online stellen, Daten bleiben zunächst pro Gerät getrennt.
2. Manuelles Backup zwischen Geräten.
3. Sichere Anmeldung und zentrale Datenbank.
4. Offline-Modus mit Synchronisation.

Die beste langfristige Lösung wäre eine kleine gehostete Datenbank mit Benutzerkonto, sobald die Grundabläufe stabil sind.

## Such- und Bedienideen

- globale Suche oben
- Tastenkürzel am Computer
- große Trefferflächen auf dem Handy
- schnelle Filterchips sparsam einsetzen
- Rückgängig nach Löschen
- zuletzt geöffnete Kunden
- heutige Aufträge zuerst
- leere Zustände mit klarer Aktion
- keine versteckten Wischgesten als einzige Bedienmöglichkeit
- Bestätigung nur bei riskanten Aktionen
- Formulare automatisch mit bekannten Daten füllen
- Entwürfe erhalten, falls ein Formular geschlossen wird

## Automatisierungsideen

- erledigter Auftrag ohne Preis erscheint automatisch als Aufgabe
- bezahlter Auftrag zählt automatisch zum Monatsumsatz
- wiederkehrender Auftrag erstellt nächsten Termin als Entwurf
- Erinnerung bei offener Zahlung nach festgelegter Zeit
- saisonale Gartenkunden als Vorschlagsliste
- Kundengeburtstage eher nicht speichern, solange kein echter Nutzen besteht
- gleiche Adresse oder Telefonnummer erkennt mögliche Duplikate
- tägliche Zusammenfassung am Morgen
- Wochenrückblick am Sonntag
- Backup-Erinnerung

## Geschäftswachstum

- Quelle jedes Neukunden erfassen
- Empfehlungen zählen
- Flyer-Gebiete vergleichen
- Stammkundenquote
- häufigste Aufträge
- Anfragen, die nicht angenommen wurden
- Gründe für Absagen
- durchschnittlicher Auftragswert
- Auslastung nach Wochentag
- rentable und unrentable Leistungen erkennen
- USA-Sparziel sichtbar machen
- Monatsziel festlegen
- Fortschritt ohne Druck darstellen

## Ideen für mehr Umsatz ohne nervigen Verkauf

- nach Gartenauftrag direkt nächsten Pflegetermin anbieten
- Wartungsrhythmus für Stammkunden
- Technik-Check für ältere Kunden
- Datensicherungs-Check als Zusatzleistung
- Geräteübersicht beim Kunden
- Kombitermin für mehrere kleine Technikprobleme
- Nachbarschaftstermine bündeln
- Empfehlungsnotiz statt kompliziertem Bonusprogramm
- saisonale Erinnerungen
- klare Mindestpauschale für kurze Anfahrten

## Datenschutz und Sicherheit

- keine Passwörter im Klartext
- keine Bankdaten speichern, wenn nicht erforderlich
- minimale Kundendaten
- Backup verschlüsseln, sobald Cloud-Speicherung kommt
- Datenexport und vollständige Löschung
- sensible Notizen kennzeichnen
- Fotos nur mit Einverständnis
- keine automatische Nachricht ohne Bestätigung
- Rollen und Mehrbenutzer erst später

## Funktionen, die vorerst nicht nötig sind

- komplexe Lagerverwaltung
- Mitarbeiterverwaltung
- Lohnabrechnung
- künstliche Intelligenz überall
- Social-Media-Dashboard
- komplizierte CRM-Pipelines
- zehn verschiedene Diagramme
- öffentliche Kundenkonten
- Live-Tracking für Kunden
- Chatbot

## Priorisierte Roadmap

### Phase 1: App im Alltag zuverlässig machen

1. alte und unvollständige Daten robust behandeln
2. Kunden und Aufträge vollständig bearbeiten
3. Löschen mit Papierkorb oder Rückgängig
4. Preis optional und später eintragbar
5. Auftrag ohne Termin erlauben
6. Suche und einfache Filter
7. lokale Backups exportieren und importieren
8. mobile Bedienung gründlich testen

### Phase 2: Auftrag wirklich abwickeln

1. Start- und Endzeit
2. Dauer berechnen
3. Materialkosten
4. Preisart: offen, Festpreis oder Stundenpreis
5. Endpreisvorschlag
6. Zahlungsart und Zahlungsdatum
7. Kundenhistorie
8. wiederkehrende Termine

### Phase 3: Finanzbereich nützlich machen

1. Einnahmen und offene Beträge sauber trennen
2. Ausgaben erfassen
3. Monatsfilter
4. Umsatz pro Bereich
5. CSV-Export
6. Sparziel fürs Auslandsjahr
7. einfache Rechnungs- oder Quittungs-PDFs

### Phase 4: Handy-App und Synchronisation

1. PWA und Startbildschirm
2. App-Icon und Offline-Grundfunktion
3. sichere Anmeldung
4. zentrale Datenbank
5. automatische Backups
6. Synchronisation zwischen Handy und Computer

### Phase 5: Zeit sparen und wachsen

1. Nachrichtenvorlagen
2. Terminbestätigungen
3. saisonale Erinnerungen
4. Tagesroute
5. Nachfragequellen
6. Rentabilitätsübersicht

## Die nächsten fünf konkreten Builds

### Build 1: Stabilität und Bearbeitung

- Kunden bearbeiten und löschen
- Aufträge bearbeiten und löschen
- alte Datumswerte reparieren
- Preis optional
- Auftrag ohne Termin

### Build 2: Auftragsabschluss

- Startzeit
- Endzeit
- Dauer
- Material
- Endpreis
- Zahlungsart

### Build 3: Kundenprofil

- Auftragshistorie
- Umsatz
- offene Beträge
- nächster Termin
- persönliche Hinweise

### Build 4: Backup und Handy

- Datenexport
- Datenimport
- PWA
- Startbildschirm
- Offline-Hinweis

### Build 5: Rechnungen und Nachrichten

- PDF-Quittung
- Rechnung
- Terminbestätigung
- Zahlungserinnerung
- WhatsApp-Übergabe

## Drei mögliche Produktmodi

### Minimal

Nur Kunden, Aufträge, Termine, Preise und Zahlungen. Am schnellsten und wahrscheinlich für den Anfang am besten.

### Praktisch

Zusätzlich Zeiterfassung, Material, wiederkehrende Termine, Kundenhistorie, Backups und Nachrichten.

### Komplett

Zusätzlich Synchronisation, Rechnungen, Ausgaben, Fotos, Routen, Auswertungen und Automatisierungen.

Empfehlung: Mit `Praktisch` als Ziel arbeiten, aber jeden Ausbau wie `Minimal` gestalten.

## Erfolgskriterien

ServiceDesk ist erfolgreich, wenn:

- ein neuer Auftrag in unter 30 Sekunden angelegt ist
- ein Auftrag vor Ort in unter 10 Sekunden gestartet werden kann
- Endpreis und Zahlung in unter 20 Sekunden erfasst sind
- kein alter Datensatz die App zum Absturz bringen kann
- Daten auf dem Handy nicht verloren gehen
- Lukas jederzeit weiß, wer als Nächstes dran ist
- offene Zahlungen nicht vergessen werden
- die App weniger Arbeit erzeugt, als sie spart

## Ideen außerhalb der App

### Vertrauen bei älteren Kunden

- kleine gedruckte Visitenkarte mit Telefonnummer
- nach dem Termin kurz schriftlich festhalten, was gemacht wurde
- verständliche Preise ohne überraschende Zusatzposten
- vor Änderungen an Geräten immer erklären, was passiert
- bei Technikproblemen eine einfache Kurzanleitung hinterlassen
- feste Erreichbarkeitszeiten nennen
- sichtbar machen, dass Lukas persönlicher Ansprechpartner bleibt

### Lokale Kundengewinnung

- Flyer bei passenden lokalen Geschäften
- Empfehlungen durch bestehende Kunden
- Kooperation mit Nachbarschaftshilfen
- Kontakte zu Seniorentreffs
- lokale Kleinanzeigen
- Google-Unternehmensprofil
- einfache Website mit Telefonnummer und Leistungen
- QR-Code zur Kontaktaufnahme
- getrennte Texte für Gartenservice und Technikhilfe
- Nachbarschaftstermine am selben Tag bündeln

### Angebotsideen

- Technik-Grundcheck zuhause
- Smartphone-Aufräumtermin
- Drucker-und-WLAN-Paket
- neuer-PC-Komplettstart
- Datensicherungs-Paket
- saisonaler Gartencheck
- Frühjahrs-Aufräumen
- Herbst-Laubservice
- regelmäßige Rasenpflege
- kleine monatliche Techniksprechstunde für Stammkunden

### Persönliche Arbeitsorganisation

- feste Tage für Garten und Technik
- Puffer zwischen Terminen
- keine zu engen Termine bei unbekannten Problemen
- Mindestpreis transparent kommunizieren
- Anfahrt nach Gebiet bündeln
- Werkzeug- und Materialcheck am Vorabend
- Wochenziel statt täglichem Umsatzdruck
- Zeit fürs Auslandsjahr und Schule bewusst schützen

## Harte Priorisierung

### Muss

- App darf durch alte Daten niemals abstürzen
- Auftrag und Kunde bearbeiten
- Auftrag und Kunde sicher löschen
- Preis später eintragen
- Zahlung erfassen
- Daten sichern und wiederherstellen
- Handybedienung

### Sollte

- Zeiterfassung
- Kundenhistorie
- Suche und Filter
- wiederkehrende Termine
- Materialkosten
- offene Zahlungen
- Monatsfilter

### Könnte

- Nachrichtenvorlagen
- Fotos
- PDF-Quittungen
- Wetterhinweise
- Routenplanung
- Sparziel
- einfache Statistiken

### Später

- Benutzerkonto
- Cloud-Synchronisation
- automatische Backups
- Rechnungsnummern
- komplexere Auswertungen
- mehrere Benutzer

## Mein stärkster Produktvorschlag

Die nächste Version sollte sich auf einen einzigen perfekten Vorgang konzentrieren:

1. Lukas bekommt eine Anfrage.
2. Er legt Kunde und Auftrag ohne Preis an.
3. Er plant den Termin.
4. Vor Ort startet er die Zeit.
5. Danach trägt er Material und Endpreis ein.
6. Der Auftrag wird erledigt oder bezahlt.
7. ServiceDesk schlägt bei passenden Gartenkunden den nächsten Termin vor.

Wenn dieser Ablauf schnell und stabil funktioniert, ist ServiceDesk bereits ein echtes Arbeitswerkzeug. Alles andere kann darauf aufbauen.
