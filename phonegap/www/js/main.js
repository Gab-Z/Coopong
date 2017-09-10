var myFileUrl = "";
function saveAs (fileData,fileName) {
  alert("save as start")
    // Get access to the file system
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fileSystem) {
        // Create the file.
        fileSystem.root.getFile(fileName, { create: true, exclusive: false }, function (entry) {
            // After you save the file, you can access it with this URL
            myFileUrl = entry.toURL();
            entry.createWriter(function (writer) {
               writer.onwriteend = function (evt) {
                    alert("Successfully saved file to " + myFileUrl);
                };
                // Write to the file
                writer.write(fileData);
            }, function (error) {
                alert("Error: Could not create file writer, " + error.code);
            });
        }, function (error) {
            alert("Error: Could not create file, " + error.code);
        });
    }, function (evt) {
        alert("Error: Could not access file system, " + evt.target.error.code);
    });
}


var champs = [
"Prénom",
"Nom de famille",
"ID",
"Civilité",
"Fonction",
"Service",
"Nom du compte",
"Description compte",
"Site web",
"Email",
"Email(s) secondaire(s)",
"Portable",
"Téléphone",
"Ligne directe",
"Téléphone autre",
"Fax",
"Adresse principale - Rue 1",
"Adresse principale - Ville",
"Adresse principale - Région",
"Adresse principale - Code Postal",
"Adresse principale - Pays",
"Adresse secondaire - Rue 1",
"Adresse secondaire - Ville",
"Adresse secondaire - Région",
"Adresse secondaire - Code Postal",
"Adresse secondaire - Pays",
"Statut",
"Description Statut",
"Origine principale",
"Description de la principale origine du Coupon",
"Description",
"Transformé",
"Nom Affaire",
"Montant Affaire",
"Fait référence à",
"Id Campagne communication",
"Ne pas appeler",
"Nom sur le portail",
"Portail application",
"Rapporte à",
"Assistant",
"Téléphone assistant",
"Anniversaire",
"Contact (ID)",
"Partenaire (ID)",
"Affaire (ID)",
"Assigné à",
"Assigné à (ID)",
"Date de création",
"Date de modification",
"Créé par (ID)",
"Modifié par (ID)",
"Supprimé",
"Photo",
"Type de coupon",
"Changement de ville prévu dans l&#039;année scolaire ?",
"Diplôme préparé",
"L&#039;année prochaine tu serais",
"Pourquoi souhaites-tu faire un service civique à l&#039;Afev ?",
"Année scolaire",
"Si plus étudiant, quel niveau ?",
"Filière",
"Quelle structure ?",
"Si oui, details",
"Si plus étudiant, quelle filière ?",
"A-t-il déjà participé  à une action associative et solidaire ?",
"Est boursier",
"Etat de l&#039;enregistrement",
"A-t-il déjà fait une colocation ?",
"Situation",
"Est étudiant",
"Niveau études",
"Longitude",
"Latitude",
"Status Géocode",
"Adresse principale"];

var correspondances = {
  "Civilité" : "civilite",
  "Prénom" : "prenom",
  "Nom de famille" : "nom",
  "Email" : "email",
  "Portable" : "portable"
}

var excludedIdFiels = ["submit"];

var request,
    db,
    objectStore,
    STR;

var validityTests = [
  function(input){
    if(input.name == "civilite" && input.value == "none"){ return false;
    }else{return true}
  }
];
var testValidity = function(input){
  var l = validityTests.length;
  for(var i = 0; i < l; i++ ){
    if(validityTests[ i ](input) == false) return false;
  }
  return true;
}

window.onload=function(){
  //Check localStorage availability
  if ( ! storageAvailable('localStorage')) {
  	alert("Navigateur incompatible, merci d'utiliser une version à jour de Mozilla Firefox")
  }
  if (!window.indexedDB) {
    window.alert("Votre navigateur ne supporte pas une version stable d'IndexedDB. Quelques fonctionnalités ne seront pas disponibles.")
  }

  request = window.indexedDB.open("DB_Coupong",1);
  request.onerror = function(event) {
    alert("Pourquoi ne permettez-vous pas à ma web app d'utiliser IndexedDB?!");
  };
  request.onupgradeneeded = function(event) {
    db = event.target.result;

    // Créer un objet de stockage qui contient les informations de nos clients.
    // Nous allons utiliser "ssn" en tant que clé parce qu'il est garanti d'être
    // unique - Du moins, c'est ce qu'on en disait au lancement.
    objectStore = db.createObjectStore("coupons", { keyPath: "date" });

    // Créer un index pour rechercher les clients par leur nom. Nous pourrions
    // avoir des doubles, alors on n'utilise pas d'index unique.
    createDbIndexes(objectStore);

    // Utiliser la transaction oncomplete pour être sûr que la création de l'objet de stockage
    // est terminée avant d'ajouter des données dedans.
    objectStore.transaction.oncomplete = function(event) {
      // Stocker les valeurs dans le nouvel objet de stockage.
      var couponsObjectStore = db.transaction("coupons", "readwrite").objectStore("coupons");
      /*
      for (var i in customerData) {
        couponsObjectStore.add(customerData[i]);
      }
      */
    }
  };
  request.onsuccess = function(event) {
    alert("success")
    db = event.target.result;
    db.onerror = function(event) {
      // Gestion d'erreur générique pour toutes les erreurs de requêtes de cette base
      alert("Database error: " + event.target.errorCode);
    };

    var transaction = db.transaction(["coupons"], "readwrite");
    transaction.oncomplete = function(event) {
      alert("All done!");
    };

    transaction.onerror = function(event) {
      // N'oubliez pas de gérer les erreurs !
    };
    objectStore = transaction.objectStore("coupons");
    //createDbIndexes(objectStore);
  };

  var form = document.getElementById("form");
  form.addEventListener("submit", submitForm);
  document.getElementById("download").addEventListener("click", getFullStore,false);

  var menuBut = document.getElementById("menu_but"),
      menu = document.getElementById("menu");
  menuBut.addEventListener("click",function(e){
    var menu = document.getElementById("menu");
    menu.classList.toggle("invisible");
    menu.classList.toggle("removeIt");
  },false);


  document.body.addEventListener("click",function(e){
    if( e.target.hasAttribute( "clickAction" ) ) return false;
    var removeList = document.querySelectorAll(".removeIt"),
        rl = removeList.length;
    for(var i = 0; i < rl; i++ ){
      var el = removeList[ i ],
          ct = el,
          remove = true;
      for( var j = 0; 1==1; j++){
        if(ct === e.currentTarget)break;
        ct = ct.parentNode;
        if(ct === e.target){
          remove = false;
          break;
        }
      }

      if( remove == true ){
        el.classList.add( "invisible" );
        el.classList.remove( "removeIt" );
      }

    }
  },true);




};

var createDbIndexes = function(obStore){
  obStore.createIndex("civilite", "civilite", { unique: false });
  obStore.createIndex("prenom", "prenom", { unique: false });
  obStore.createIndex("nom", "nom", { unique: false });
  obStore.createIndex("email", "email", { unique: false });
  obStore.createIndex("portable", "portable", { unique: false });
}
var submitForm = function(e){
  e.preventDefault();
  var form = e.currentTarget,
      inputs = form.elements,
      il = inputs.length,
      ret = {},
      formIsValid = true;
  var str="";
  for( var i = 0; i < il; i++ ){
    var input = inputs[ i ];
    if( excludedIdFiels.indexOf( input.id ) > -1){
      continue;
    }
    if(input.type == "radio" && input.checked == false){
      continue;
    }

    ret[input.name] = input.value
    str += input.name + " : " + input.value + " // ";
  }
  ret.date = Date.now();
  clearForm();
  var tranz = db.transaction(["coupons"], "readwrite");
  var objStore = tranz.objectStore("coupons");
  var req = objStore.add(ret);
  req.onsuccess = function(event) {
    // event.target.result == customerData[i].ssn;
    alert("coupon : " + event.target.result + " ajouté avec succès")
  };

  //store(ret);

  //alert(JSON.stringify(ret));
};

var clearForm = function(){
  clearInput("Mme");
  clearInput("M.");
  clearInput("prenom");
  clearInput("nom");
  clearInput("email");
  clearInput("portable");
};
var clearInput = function(id){
  var el = document.getElementById(id),
      elType = el.getAttribute("type");
  if( elType == "text"){
    el.setAttribute("value", "");
    el.value = "";
  }else if( elType == "retro" ){
    el.setAttribute("checked", false);
    el.checked = false;
  }
};

var store = function(ob){
  var key = ob.date,
      str = formOutputToString(ob);
  localStorage.setItem(key, str);
};

var getFullStore = function(){
  var objectStore = db.transaction("coupons").objectStore("coupons"),
      _champs = champs,
      cl = _champs.length,
      _correspondances = correspondances;

  STR='';

  for( var j = 0; j < cl; j++ ){
    var c = _champs[ j ];
    STR += '"' + c + '"' + ( j < cl - 1 ? ';' : '\n' );
  }

  objectStore.openCursor().onsuccess = function(event) {
    var cursor = event.target.result;

    if (cursor) {
      //alert("Name for SSN " + cursor.key + " is " + cursor.value.nom);
    //  alert(JSON.stringify(cursor.value))
      for( var i = 0; i < cl; i++ ){
        var c = _champs[ i ];
        if( _correspondances.hasOwnProperty( c ) ){
          STR += '"' + cursor.value[ _correspondances[ c ] ] + '"' + ( i < cl - 1 ? ';' : '\n' );
        }else{
          STR += '""' + ( i < cl - 1 ? ';' : '\n' );
        }
      }

      cursor.continue();
    }  else {
    //  alert("No more entries!");
      alert(STR);
      var str = '' + STR;
      STR = null;
      download(str);
    }

  };

}
var download = function(str){
  var blob = new Blob([str], {type: "text/plain;charset=utf-8"});
  var date = new Date();
  saveAs(blob, "coupons_" + date.getFullYear() + "." + ( date.getMonth() + 1 ) + "." + date.getDate() + "_" + date.getHours() + "h" + date.getMinutes() + "m" + date.getSeconds() + ".csv");
  clearDb();
}
var getFullStore2 = function(){
  var l = localStorage.length,
      str = '',
      _champs = champs,
      cl = _champs.length;
  for( var j = 0; j < cl; j++ ){
    var c = _champs[ j ];
    str += '"' + c + '"' + ( j < cl - 1 ? ';' : '\n' );
  }
  for( var i = 0; i < l; i++ ){
      str += localStorage.getItem( localStorage.key( i ) );
  }
  //alert( str );

  var blob = new Blob([str], {type: "text/plain;charset=utf-8"});
  var date = new Date();
  saveAs(blob, "coupons_" + date.getFullYear() + "." + ( date.getMonth() + 1 ) + "." + date.getDate() + "_" + date.getHours() + "h" + date.getMinutes() + "m" + date.getSeconds() + ".csv");

}
var clearDb = function(){
  // ouvre une transaction de lecture / écriture  prête pour le nettoyage
  var transaction = db.transaction(["coupons"], "readwrite");
/*
  // en cas de succès de l'ouverture de la transaction
  transaction.oncomplete = function(event) {
	   //note.innerHTML += '<li>Transaction complété : modification de la base de données terminée.</li>';
  };
*/
  // en cas d'échec de l'ouverture de la transaction
  transaction.onerror = function(event) {
    alert("error")
  };

  // ouvre l'accès au un magasin "toDoList" de la transaction
  var objectStore = transaction.objectStore("coupons");

  // Vide le magasin d'objet
  var objectStoreRequest = objectStore.clear();
  /*
  objectStoreRequest.onsuccess = function(event) {
  // rapporte le succès du nettoyage
  note.innerHTML += '<li>Enregistrements effacées.</li>';
  };
  */
}
var formOutputToString = function(ob){
  var _champs = champs,
      cl = _champs.length,
      _correspondances = correspondances,
      str = '';
  for( var i = 0; i < cl; i++ ){
    var c = _champs[ i ];
    if( _correspondances.hasOwnProperty( c ) ){
      str += '"' + ob[ _correspondances[ c ] ] + '"' + ( j < cl - 1 ? ';' : '\n' );
    }else{
      str += '""' + ( j < cl - 1 ? ';' : '\n' );
    }
  }
  return str;
};

function storageAvailable(type) {
    try {
        var storage = window[type],
            x = '__storage_test__';
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
    }
    catch(e) {
        return e instanceof DOMException && (
            // everything except Firefox
            e.code === 22 ||
            // Firefox
            e.code === 1014 ||
            // test name field too, because code might not be present
            // everything except Firefox
            e.name === 'QuotaExceededError' ||
            // Firefox
            e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
            // acknowledge QuotaExceededError only if there's something already stored
            storage.length !== 0;
    }
};
