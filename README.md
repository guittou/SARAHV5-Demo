Petite démo Sarah V5
====================

![GitHub Logo](/logo/flow.png)

Cette démonstration est un test du Garbage sans règles de grammaires XML. Le buffer est envoyé à Google Speech API.




## Installation

Ce mode d'installation est un mode "facile" afin de la simplifier, normalement il faut utiliser npm. Procédez comme suit:

- Dézippez le fichier `SARAHV5-Demo-Master.zip` dans un répertoire temporaire
- Copiez le répertoire "win-sysvolume" dans le répertoire SARAHV5\viseo-bot-framework\node_modules\node-red-contrib-viseo-sarah
- Ouvrez le fichier SARAHV5\viseo-bot-framework\node_modules\node-red-contrib-viseo-sarah\package.json
- Dans la section 
```text
"node-red": {
    "nodes": {
      "win-speak": "win-speak/node-speak.js",
      "win-listen-config": "win-listen/node-listen-config.js",
      "win-sarah": "win-listen/node-sarah.js"
    }
  },
```
- Ajoutez la ligne "win-sysvolume": "win-sysvolume/node-sysvolume.js", comme suit:
```text
"node-red": {
    "nodes": {
      "win-sysvolume": "win-sysvolume/node-sysvolume.js",
      "win-speak": "win-speak/node-speak.js",
      "win-listen-config": "win-listen/node-listen-config.js",
      "win-sarah": "win-listen/node-sarah.js"
    }
  },
```

- Pour n'avoir que le mot déclencheur, supprimez les fichiers XML de grammaires de test fournis avec l'application.
	- Allez dans le répertoire SARAHV5\viseo-bot-project\data\grammar
	- Déplacez les fichiers "meteo.xml" et "time.xml" dans un répertoire temporaire (par exemple sur votre bureau).
- Ouvrez le fichier SARAHV5\viseo-bot-project\data\grammar\wildcard.xml (le seul qui reste) et changez "wesh gros" par "SARAH"


## Correction de la brique Google API
Une petite erreur s'est glissée dans le javascript de la fonction qui fait planter le flow si rien n'est retourné de L'API Google.

Pour la corriger (avant que l'équipe de développement Node-Red ne le fasse), procédez comme suit:

- Copiez le fichier google-speech\google-speech-text.js dans le répertoire SARAHV5\viseo-bot-framework\node_modules\node-red-contrib-viseo-google-speech

**Note**: Vous pouvez sauvegarder la précedente version du fichier avant de la remplacer.


## Création du flow démo

- Brique switch
	- Fait pour éliminer les faux positifs:
		- Property: msg.payload.text
		- !=  SARAH
- Brique SysVolume
	- Coupe le son du microphone le temps de l'exécution de l'action afin d'éviter des actions en parallèle
		- state: 1
		- microphone: default_record
- Brique Google API
	- Envoi le buffer à Google API pour récupérer le text
		- Configurer votre Google API Key dans crédentials
		- Input: msg.payload.buffer
		- Output: msg.payload
- brique switch
	- test si la transcription est correcte
		- Property: msg.payload.transcript
		- Ajoutez test 1 pour tester si la transcription n'est pas correcte
			- is null
		- Ajoutez test 2 pour tester si la transcription est correcte
			- otherwize
- Brique Fonction "transcrition error"
	- La transcription Google est nulle (cablée à la brique speak mais le message peut vite devenir agaçant donc vous pouvez très bien cabler le test 1 de la brique switch sur la brique SysVolume directement)
		- Fonction:
			- msg.payload = "Je n'ai pas compris";
			- return msg;
- Brique ToLowerCase
	- Pas vraiment utile mais sert à mettre le texte en minuscule pour le switch
	- Fonction:
		- msg.payload.transcript = msg.payload.transcript.toLowerCase();
		- return msg;
- Brique Switch sur la sentence pour exécuter une action
	- Property: msg.payload.transcript
	- Ajoutez test 1 pour une phrase "SARAH dis bonjour":
		- matches regex
		-  bonjour    
		- (bonjour avec un blanc devant -> " bonjour")
	- Ajoutez test 2 pour une phrase "SARAH quelle heure est-il":
		- matches regex
		-  heure    
		- (heure avec un blanc devant -> " heure")	
	- Ajoutez test 3 pour une phrase "SARAH quel jour on est":
		- matches regex
		-  jour    
		- (jour avec un blanc devant -> " jour")		
	- Ajoutez test 4 pour les autres phrases "SARAH n'importe quoi":
		- otherwize
- Brique Fonction "Hello"
	- Fonction:
		- msg.payload = "OK oui bonjour";
		- return msg;
- Brique Fonction "L'heure"
	- Fonction:
		- var date = new Date();
		- msg.payload = "il est " + date.getHours() +":"+date.getMinutes();
		- return msg;
- Brique Fonction "Le jour"
	- Fonction:
		- var date = new Date();
		- var tblDays=new Array("Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi");
		- var tblMonths=new Array("Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet",  "Aout", "Septembre", "Octobre", "Novembre", "Décembre");
		- msg.payload = "nous sommes le " + tblDays[date.getDay()] + " " + date.getDate() + " " + tblMonths[date.getMonth()];
		- return msg;
- Brique Fonction "Other"
	- Fonction:
		- msg.payload = "Je n'ai rien pour " + msg.payload.transcript;
		- return msg;
- Brique Speak
	- Vocalise la phrase
- Brique SysVolume
	- Remet le son du microphone après l'exécution
		- state: 0
		- microphone: default_record
	
 