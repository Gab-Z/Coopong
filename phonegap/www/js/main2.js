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
function fileHandler( fileEntry ) {
    alert( fileEntry.name + " | " + fileEntry.toURL() );
}
window.onload=function(){
  if (!window.indexedDB) {
    window.alert("Votre navigateur ne supporte pas une version stable d'IndexedDB. Quelques fonctionnalités ne seront pas disponibles.")
  }
  request = window.indexedDB.open("DB_Coupong",1);
  request.onerror = function(event) {
    alert("Pourquoi ne permettez-vous pas à ma web app d'utiliser IndexedDB?!");
  };
  request.onupgradeneeded = function(event) {
    db = event.target.result;
    objectStore = db.createObjectStore("coupons", { keyPath: "date" });
    createDbIndexes(objectStore);
    objectStore.transaction.oncomplete = function(event) {
      var couponsObjectStore = db.transaction("coupons", "readwrite").objectStore("coupons");
    }
  };
  request.onsuccess = function(event) {
    db = event.target.result;
    db.onerror = function(event) {
      alert("Database error: " + event.target.errorCode);
    };
    var transaction = db.transaction(["coupons"], "readwrite");
    transaction.oncomplete = function(event) {
    //  alert("All done!");
    };
    transaction.onerror = function(event) {
      // N'oubliez pas de gérer les erreurs !
    };
    objectStore = transaction.objectStore("coupons");
  };

  var form = document.getElementById("form");
  form.addEventListener("submit", submitForm);
  document.getElementById("download").addEventListener("click", getFullStore,false);
  document.getElementById("showCouponsList").addEventListener("click", showCouponsList,false);
  document.getElementById("deleteCoupons").addEventListener("click", deleteCoupons,false);

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
  if( elType == "text" || elType == "tel"){
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
var getAllCoupons = function(callback, callback2){
  var cbk2 = callback2 || false;
  var objectStore = db.transaction("coupons").objectStore("coupons");
  COUPONS=[];
      objectStore.openCursor().onsuccess = function(event) {
        var cursor = event.target.result;
        if (cursor) {
          COUPONS.push(cursor.value);
          cursor.continue();
        }  else {
          var ret = COUPONS;
          COUPONS = null;
          callback(ret, cbk2);
        }
      };
};
var getFullStore = function(callback){
  var cbk = callback || false;
  getAllCoupons(couponsToCSV, cbk);
}
var couponsToCSV = function(coupons, callback){
  var cbk = callback || false;
      _champs = champs,
      cl = _champs.length,
      _correspondances = correspondances;
  STR='';
  for( var j = 0; j < cl; j++ ){
    var c = _champs[ j ];
    STR += '"' + c + '"' + ( j < cl - 1 ? ';' : '\n' );
  }
  var l = coupons.length;
  for(var c = 0; c < l; c++ ){
    var coupon = coupons[ c ];
    for( var i = 0; i < cl; i++ ){
      var c = _champs[ i ];
      if( _correspondances.hasOwnProperty( c ) ){
        STR += '"' + coupon[ _correspondances[ c ] ] + '"' + ( i < cl - 1 ? ';' : '\n' );
      }else{
        STR += '""' + ( i < cl - 1 ? ';' : '\n' );
      }
    }
  }
  //alert(STR);
  var str = '' + STR;
  STR = null;
  download(str, cbk);
}
var getFullStore3 = function(){
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

};
var download = function(str, callback){
  var blob = new Blob([str], {type: "text/plain;charset=utf-8"}),
      cbk = callback || false,
      date = new Date();
  saveAs(blob, "coupons_" + date.getFullYear() + "." + ( date.getMonth() + 1 ) + "." + date.getDate() + "_" + date.getHours() + "h" + date.getMinutes() + "m" + date.getSeconds() + ".csv");
  if(cbk) cbk();

  //clearDb();
}
var showCouponsList = function(){
  getAllCoupons(couponsToTable);
};
var couponsToTable = function(coupons){
  var l = coupons.length,
      mainCont = document.createElement("div"),
      centeredCont = mainCont.appendChild( document.createElement("div") )
      bandTop = centeredCont.appendChild( document.createElement("div") ),
      closerCont = bandTop.appendChild( document.createElement("div") ),
      closerSpan = closerCont.appendChild( document.createElement("span") ),
      bandBottom = centeredCont.appendChild( document.createElement("div") );
  mainCont.id = "tableContainer";
  centeredCont.id = "centeredCont";
  bandTop.id = "bandTop";
  bandBottom.id = "bandBottom";
  closerCont.classList.add( "closerCont" );

  for( var j = 0; j < l; j++ ){
    var coupon = coupons[ j ],
        box = bandBottom.appendChild( document.createElement("div") ),
        nameLine = box.appendChild( document.createElement("div") ),
        nameSpan = nameLine.appendChild( document.createElement("span") ),
        dataLine = box.appendChild( document.createElement("div") ),
        dataSpan = dataLine.appendChild( document.createElement("span") );
      box.classList.add("couponBox");
      nameLine.classList.add("nameLine");
      dataLine.classList.add("dataLine");
      nameSpan.textContent = (j + 1) + " - " + ( coupon.civilite ? coupon.civilite : "") + " " + ( coupon.prenom ? coupon.prenom : "") + " " + ( coupon.nom ? coupon.nom : "");
      dataSpan.textContent = ( coupon.email ? coupon.email : "Pas d'email") + " // " + ( coupon.portable ? coupon.portable : "Pas de téléphone")
  }
  document.getElementById( "wraper" ).classList.add( "invisible" );
  document.body.appendChild( mainCont );
  closerCont.addEventListener("click", closeTableContainer, false);
};

var couponsToTable2 = function(coupons){
  var l = coupons.length,
      table= document.createElement("table"),
      thead = table.appendChild( document.createElement("thead") ),
      thr = thead.appendChild( document.createElement("tr") ),
      tbody = table.appendChild( document.createElement("tbody") ),
      headFields = ["N°","Civilité", "Prénom", "Nom de famille", "Email", "Portable"],
      hl = headFields.length,
      _correspondances = correspondances;
  for( var i = 0; i < hl; i++ ){
    var th = thr.appendChild( document.createElement("th") ),
        span = th.appendChild( document.createElement("span") );
    span.textContent = headFields[ i ];
  }
  for( var j = 0; j < l; j++ ){
    var coupon = coupons[ j ],
        tr = tbody.appendChild( document.createElement("tr") );
    for( var k = 0; k < hl; k++ ){
      var td = tr.appendChild( document.createElement("td") ),
          tspan = td.appendChild( document.createElement("span") );
      if( k == 0 ){
        tspan.textContent = j + 1;
        continue;
      }
      var propName = _correspondances[ headFields[ k ] ];
      tspan.textContent = coupon.hasOwnProperty( propName ) ? coupon[ propName ] : "";
    }
  }
  var mainCont = document.createElement("div"),
      centeredCont = mainCont.appendChild( document.createElement("div") )
      bandTop = centeredCont.appendChild( document.createElement("div") ),
      closerCont = bandTop.appendChild( document.createElement("div") ),
      closerSpan = closerCont.appendChild( document.createElement("span") ),
      bandBottom = centeredCont.appendChild( document.createElement("div") );
  mainCont.id = "tableContainer";
  centeredCont.id = "centeredCont";
  bandTop.id = "bandTop";
  bandBottom.id = "bandBottom";
  bandBottom.appendChild( table );
  closerCont.classList.add( "closerCont" );
  document.getElementById( "wraper" ).classList.add( "invisible" );
  document.body.appendChild( mainCont );

  closerCont.addEventListener("click", closeTableContainer, false);

}
var closeTableContainer = function(e){
  var mainCont = document.getElementById("tableContainer");
  mainCont.parentNode.removeChild( mainCont );
  document.getElementById( "wraper" ).classList.remove( "invisible" );
}
var deleteCoupons = function(){
  getFullStore(clearDb);
};
var clearDb = function(){
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
  var objectStore = transaction.objectStore("coupons");
  var objectStoreRequest = objectStore.clear();
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