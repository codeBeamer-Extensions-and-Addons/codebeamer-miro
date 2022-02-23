# Deckt den nicht-automatisierten Teil der Test-Suite für die beschriebene Funktionalität

Funktionalität: Alle Resultate einer Abfrage importieren

    Grundlage: 
        Angenommen ich bin Mitglied im "Toolchains@Temp" Projekt auf Retina-Test
		Und ich habe das Plugin auf das "Toolchains@Temp" Projekt auf Retina-Test konfiguriert und mich authentifiziert
        Und ich habe bin auf einem leeren Miro-Board
		Und ich habe das "Import Items from codeBeamer" Modal geöffnet

    Szenario: Alle Items einer benutzerdefinierten CBQL Abfrage importieren
        Wenn ich den "CBQL Input" Button drücke
        Und ich im Input Feld "tracker.id = 3573 AND teamName = 'Edelweiss' AND item.id in (295102,287121,281268)" eingebe
        Und Enter drücke
        Und ich den "Import All (3)" Button drücke
        Dann werden die drei Items mit Id 295102, 287121, 281268 importiert

    Szenario: Warnung bei Import von mehr als 20 Items
        Wenn ich den "CBQL Input" Button drücke
        Und ich im Input Feld "tracker.id = 3573 AND teamName = 'Edelweiss'" eingebe
        Und Enter drücke
        Und ich den "Import All" Button drücke
        Dann wird eine Warnung angezeigt, die besagt wie viele Items importiert würden
        Und die aufgeführte Anzahl Items entspricht der auf dem "Import All" Button angezeigten.
        #I advise you now click "Cancel"
