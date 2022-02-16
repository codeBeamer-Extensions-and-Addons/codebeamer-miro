# Deckt den nicht-automatisierten Teil der Test-Suite für die beschriebene Funktionalität
# In diesem Fall, dass beim Massen-Import effektiv keine Folder/Information Items importiert werden

@RETINA-1565415
Funktionalität: Items vom Typ "Folder" und "Information" werden nicht importiert

    Grundlage:
        Angenommen ich bin Mitglied im Toolchains Projekt auf Retina
		Und ich habe das Plugin auf das Toolchains Projekt auf Retina konfiguriert und mich authentifiziert
		Und ich habe das "Import Items from codeBeamer" Modal geöffnet

    Szenario: "StoryPoints" als zu importierende Eigenschaft auswählen
        Wenn ich zum CBQL Input wechsle
        Und die Abfrage "tracker.id = 3572 AND item.id in (206424,230864,71802)" eingebe
        Dann zeigt der "Import All" Button die Anzahl Items als 3 an
        Wenn ich den "Import All" Button drücke
        Dann werden 3 Items zum Import angezeigt
        Und es wird nur das Item mit Id 71802 importiert
