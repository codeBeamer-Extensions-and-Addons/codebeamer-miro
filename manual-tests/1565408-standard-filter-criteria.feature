# Deckt den nicht-automatisierten Teil der Test-Suite für die beschriebene Funktionalität
# Veralteter Test

@RETINA-1565408 @deprecated
Funktionalität: Items nach verschiedenen Standard-Eigenschaften suchen- / filtern

	Items sollen, nachdem ein Tracker ausgewählt wurde, auch noch nach Team, Release oder Subject gefiltert werden können.
	
	Grundlage: 
		Angenommen ich bin Mitglied im Toolchains Projekt auf Retina
		Und ich habe das Plugin auf das Toolchains Projekt auf Retina konfiguriert und mich authentifiziert
		Und ich habe das "Import Items from codeBeamer" Modal geöffnet
	
	Szenario: "Retina Features"-Items nach Team "Edelweiss" filtern
		Wenn ich "Retina Features" als Tracker auswähle
		Und ich als sekundäres Kriterium "Edelweiss" als Team auswähle
		Dann erscheinen in der Resultatstabelle nur Retina Features-Items die Team Edelweiss zugewiesen sind
		
	Szenario: "Retina Features"-Items nach Sprint "13.1" filtern
		Wenn ich "Retina Features" als Tracker auswähle
		Und ich als sekundäres Kriterium "13.1" als Release auswähle
		Dann erscheinen in der Resultatstabelle nur Retina Features-Items die Release 13.1 zugewiesen sind
		
	Szenario: "Retina Tasks"-Items nach Subjekt "ATC - Automated Testing of Automated Deployment" filtern
		Wenn ich "Retina Tasks" als Tracker auswähle
		Und ich als sekundäres Kriterium "ATC - Automated Testing of Automated Deployment" als Subjekt auswähle
		Dann erscheinen in der Resultatstabelle nur Retina Features-Items die "ATC - Automated Testing of Automated Deployment" als Subjekt haben
