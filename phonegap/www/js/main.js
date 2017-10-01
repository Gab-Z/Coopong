var myFileUrl = "";
function saveAs (fileData,fileName) {
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fileSystem) {
        fileSystem.root.getFile(fileName, { create: true, exclusive: false }, function (entry) {
            myFileUrl = entry.toURL();
            entry.createWriter(function (writer) {
               writer.onwriteend = function (evt) {
                log({ txt:"Fichier enregistré dans : " + myFileUrl,
                      ico:"k",
                      style:"success"});
                };
                writer.write(fileData);
            }, function (error) {
                log({ txt:"Erreur, le fichier n'a pas été crée. Veuillez réessayer plus tard",
                      ico:"o",
                      style:"err"});
            });
        }, function (error) {
          log({ txt:"Erreur, le fichier n'a pas été crée. Veuillez réessayer plus tard",
                ico:"o",
                style:"err"});
        });
    }, function (evt) {
        log({ txt:"Erreur, Cet appareil n'autorise pas l'accès aux fichiers.",
              ico:"o",
              style:"err"});
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
  "Adresse principale"
];
var correspondances = {
  "Civilité" : "civilite",
  "Prénom" : "prenom",
  "Nom de famille" : "nom",
  "Email" : "email",
  "Portable" : "portable"
}
var autoFields = {
  "Statut" : "A contacter",
  "Transformé": 0,
  "Type de coupon":"Bénévole"
};
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
};
window.onload=function(){
  if (!window.indexedDB) {
    log({ txt:"Votre navigateur ne supporte pas une version stable d'IndexedDB. Cette fonctionnalité est indispensable.",
          ico:"o",
          style:"err"});
  }
  request = window.indexedDB.open("DB_Coupong",1);
  request.onerror = function(event) {
    log({ txt:"Merci d'autoriser l'accès à IndexedDB. Cette fonctionnalité est indispensable.",
          ico:"o",
          style:"err"});
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
      log({ txt:"Erreur de base de donnée. Veuillez réessayer plus tard",
            ico:"o",
            style:"err"});
    };
    var transaction = db.transaction("coupons", "readwrite");
    transaction.oncomplete = function(event) {

    };
    transaction.onerror = function(event) {
      log({ txt:"Erreur de base de donnée. Veuillez réessayer plus tard",
            ico:"o",
            style:"err"});
    };
    objectStore = transaction.objectStore("coupons");
  };

  var form = document.getElementById("form");
  form.addEventListener("submit", submitForm);
  document.getElementById("download").addEventListener("click", getFullStore,false);
  document.getElementById("showCouponsList").addEventListener("click", showCouponsList,false);
  document.getElementById("deleteCoupons").addEventListener("click", deleteCoupons,false);
  document.getElementById("faq").addEventListener("click", showFaq,false);
  var menuBut = document.getElementById("menu_but"),
      menu = document.getElementById("menu");
  menuBut.addEventListener("transitionend",endMenuButRotation, true);

  menuBut.addEventListener("click",function(e){
    var menuBut = e.currentTarget;
    menuBut.classList.remove("rotateReset");
    menuBut.classList.add("rotate");
    removeLog();
    var faqC = document.getElementById("faqContainer");
    if( faqC ) faqC.parentNode.removeChild( faqC );
    var menu = document.getElementById("menu"),
        menuIsInvisible = menu.classList.contains("invisible");
    if(document.getElementById("editContainer")){
      var editCont = document.getElementById("editContainer");
      editCont.parentNode.removeChild(editCont);
      var tableCont = document.getElementById("tableContainer");
      boxTransition(tableCont);
      tableCont.classList.remove("invisible");
    }else if(document.getElementById( "tableContainer" )){
      closeTableContainer();
      document.getElementById( "formWraper" ).classList.add( "invisible" );
      e.currentTarget.querySelector("span").textContent = "l";
      boxTransition(menu);
      menu.classList.remove("invisible");
      document.addEventListener("backbutton", backKeyDown, true);
    //  document.removeEventListener("backbutton", backKeyDown);
    }else if(! menuIsInvisible ){
      menu.classList.add("invisible");
      var formWraper = document.getElementById( "formWraper" );
      boxTransition(formWraper);
      formWraper.classList.remove( "invisible" );
      e.currentTarget.querySelector("span").textContent = "m";
      document.removeEventListener("backbutton", backKeyDown);
    }else if( menuIsInvisible ){
      document.getElementById( "formWraper" ).classList.add( "invisible" );
      e.currentTarget.querySelector("span").textContent = "l";
      boxTransition(menu);
      menu.classList.remove("invisible");
      document.addEventListener("backbutton", backKeyDown, true);
    }

  },false);

};
function backKeyDown() {
  var menuBut = document.getElementById("menu_but");
  menuBut.classList.remove("rotateReset");
  menuBut.classList.add("rotate");
  removeLog();
  var faqC = document.getElementById("faqContainer");
  if( faqC ) faqC.parentNode.removeChild( faqC );
  if(document.getElementById("editContainer")){
    var editCont = document.getElementById("editContainer");
    editCont.parentNode.removeChild(editCont);
    var tableCont = document.getElementById("tableContainer");
    tableCont.classList.remove("invisible");
    return false;
  }else if(document.getElementById( "tableContainer" )){
    closeTableContainer();
  }else{
    document.getElementById("menu").classList.add("invisible");
    document.getElementById( "formWraper" ).classList.remove( "invisible" );
    document.getElementById("menu_but").querySelector("span").textContent = "m";
  }
  document.removeEventListener("backbutton", backKeyDown);
}
var boxTransition = function(el){
  //el.addEventListener("transitionend", endBoxTransition, true);
  el.classList.add("minimized");
  window.setTimeout(removeTransitionClass.bind(el), 2);
};
var removeTransitionClass = function(){
  this.classList.remove("minimized");
};
var endMenuButRotation = function(e){
  var menuBut = document.getElementById("menu_but");
  menuBut.removeEventListener("transitionend",endMenuButRotation);
  menuBut.addEventListener("transitionend",resetMenuButRotation, true);
  menuBut.classList.add("rotateReset");
  menuBut.classList.remove("rotate");
};
var resetMenuButRotation = function(e){
  var menuBut = document.getElementById("menu_but");
  menuBut.removeEventListener("transitionend",resetMenuButRotation);
  menuBut.addEventListener("transitionend",endResetMenuButRotation, true);
  menuBut.classList.remove("rotateReset");
};
var endResetMenuButRotation = function(e){
  var menuBut = document.getElementById("menu_but");
  menuBut.removeEventListener("transitionend",endResetMenuButRotation);
  menuBut.addEventListener("transitionend",endMenuButRotation, true);
    menuBut.classList.remove("rotateReset");
      menuBut.classList.remove("rotate");
};
var showFaq = function(){
  var mainCont = document.createElement("div"),
      centeredCont = mainCont.appendChild( document.createElement("div") ),
      bandBottom = centeredCont.appendChild( document.createElement("div") );
  mainCont.id = "faqContainer";
  centeredCont.id = "centeredCont";
  bandBottom.id = "bandBottom";
  bandBottom.classList.add("fullW");
  document.getElementById( "formWraper" ).classList.add( "invisible" );
  document.getElementById( "menu" ).classList.add( "invisible" );
  document.getElementById( "mainBody" ).appendChild( mainCont );
  boxTransition(mainCont);
  createFaq(bandBottom);
};
var createFaq = function(parent){
  var f = faq,
      l = faq.length;
  for(var i = 0; i < l; i++ ){
    var part = f[ i ],
        partCont = parent.appendChild(document.createElement("div")),
        partTitle = partCont.appendChild(document.createElement("div")),
        partTitleSpan = partTitle.appendChild(document.createElement("p")),
        paragraphs = partCont.appendChild(document.createElement("div")),
        p = part.paragraphs,
        pl = p.length;
    partCont.classList.add("fullW","partCont");
    partTitle.classList.add("faqTitle");
    paragraphs.classList.add("fullW","paragraphs","minimized");
    partTitleSpan.textContent = part.title;
    for( var j = 0; j < pl; j++ ){
      var pr = p[ j ],
          cont = paragraphs.appendChild(document.createElement("div")),
          txt = Array.isArray( pr.text ) ? pr.text : [ pr.text ],
          tl = txt.length,
          tag,
          clas;
      cont.classList.add("fullW");
      if(pr.style == "paragraph"){
        tag = "p";
        clas = "paragraph"
      }else if(pr.style == "subTitle"){
        tag = "p";
        clas= "subTitle"
      }else if(pr.style == "list1"){
        tag = "li";
        clas= "list1"
        var subCont = cont.appendChild(document.createElement("ul"));
        cont = subCont;
      }else if(pr.style == "list2"){
        tag = "li";
        clas= "list2"
        var subCont = cont.appendChild(document.createElement("ul"));
        cont = subCont;
      };
      for( var t = 0; t < tl; t++ ){
        var tx = txt[ t ],
            el = cont.appendChild(document.createElement(tag));
        el.classList.add(clas);
        el.textContent = tx;
      };
    }
    partCont.addEventListener("click",faqTransition,false)
  }
};
var faqTransition = function(e){
  e.currentTarget.querySelector(".paragraphs").classList.toggle("minimized")
};
var log = function(ob){
  var cont = document.createElement("div");
  document.body.insertBefore(cont, document.getElementById("mainBody"));
  var logCont = cont.appendChild(document.createElement("div")),
      logSpan = logCont.appendChild(document.createElement("span")),
      icoCont = cont.appendChild(document.createElement("div")),
      icoSpan = icoCont.appendChild(document.createElement("span"));
  cont.id = "log";
  cont.classList.add("frnccc", "fullW", "logOff");
  logCont.classList.add("frncss", "logCont");
  icoCont.classList.add("fcnccc", "icoCont");
  logSpan.textContent = ob.txt;
  if(ob.ico) icoSpan.textContent = ob.ico;
  if(ob.style) cont.classList.add(ob.style);
  window.setTimeout(startLogTransition, 5);
};
var startLogTransition = function(){
  if(!document.getElementById("log"))return false;
  var cont = document.getElementById("log");
  cont.addEventListener("transitionend", endLogTransition, true);
  cont.classList.toggle("logOff");
};
var endLogTransition = function(e){
  if(!document.getElementById("log"))return false;
  e.currentTarget.removeEventListener("transitionend", endLogTransition);
  window.setTimeout(waitLog, 1500);
};
var waitLog = function(){
  if(!document.getElementById("log"))return false;
  var cont = document.getElementById("log");
  cont.addEventListener("transitionend", removeLog, true);
  cont.classList.toggle("logOff");
};
var removeLog = function(){
  if(!document.getElementById("log"))return false;
  var cont = document.getElementById("log");
  cont.parentNode.removeChild(cont);
}
var createDbIndexes = function(obStore){
  obStore.createIndex("civilite", "civilite", { unique: false });
  obStore.createIndex("prenom", "prenom", { unique: false });
  obStore.createIndex("nom", "nom", { unique: false });
  obStore.createIndex("email", "email", { unique: false });
  obStore.createIndex("portable", "portable", { unique: false });
  obStore.createIndex("date", "date", { unique: true });
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
  var tranz = db.transaction("coupons", "readwrite");
  var objStore = tranz.objectStore("coupons");
  var req = objStore.add(ret);
  req.onsuccess = function(event) {
    // event.target.result == customerData[i].ssn;
    log({txt:"Coupon enregistré avec succès",ico:"k",style:"success"})
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
      elType = el.type || el.getAttribute("type");
  if( ["text","tel","email"].indexOf(elType) > -1 ){
    el.setAttribute("value", "");
    el.value = "";
  }else if( elType == "radio" ){
    el.setAttribute("checked", false);
    el.checked = false;
  }
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
      _correspondances = correspondances,
      _autoFields = autoFields;
  STR='';
  for( var j = 0; j < cl; j++ ){
    var c = _champs[ j ];
    STR += '"' + c + '"' + ( j < cl - 1 ? ';' : '\n' );
  }
  var l = coupons.length;

  for(var c = 0; c < l; c++ ){
    var coupon = coupons[ c ];
    for( var i = 0; i < cl; i++ ){
      var f = _champs[ i ];
      if( _correspondances.hasOwnProperty( f ) ){
        STR += '"' + coupon[ _correspondances[ f ] ] + '"' + ( i < cl - 1 ? ';' : '\n' );
      }else if( _autoFields.hasOwnProperty( f ) ){
        STR += '"' + _autoFields[ f ] + '"' + ( i < cl - 1 ? ';' : '\n' );
      }else{
        STR += '""' + ( i < cl - 1 ? ';' : '\n' );
      }
    }
  }
  var str = decodeURIComponent('' + STR);
  STR = false;
  download(str, cbk);
};
var download = function(str, callback){
  var blob = new Blob([str], {type: "text/plain;charset=ISO-8859-1"}),
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
      centeredCont = mainCont.appendChild( document.createElement("div") ),
      bandBottom = centeredCont.appendChild( document.createElement("div") );
  mainCont.id = "tableContainer";
  centeredCont.id = "centeredCont";
  bandBottom.id = "bandBottom";
  for( var j = 0; j < l; j++ ){
    var coupon = coupons[ j ],
        box = bandBottom.appendChild( document.createElement("div") ),
        numCont = box.appendChild( document.createElement("div") ),
          numSpan = numCont.appendChild( document.createElement("span") ),

        linesCont = box.appendChild( document.createElement("div") ),
          nameCont = linesCont.appendChild( document.createElement("div") ),
            civSpan = nameCont.appendChild( document.createElement("span") ),
            prenomSpan = nameCont.appendChild( document.createElement("span") ),
            nameSpan = nameCont.appendChild( document.createElement("span") ),
          emailCont = linesCont.appendChild( document.createElement("div") ),
            emailSpan = emailCont.appendChild( document.createElement("span") ),
          telCont = linesCont.appendChild( document.createElement("div") ),
            telSpan = telCont.appendChild( document.createElement("span") ),
        editCont = box.appendChild( document.createElement("button") ),
          editSpan = editCont.appendChild( document.createElement("span") );

    box.classList.add("couponBox","frnscc");
    numCont.classList.add("numCont","fcnccc");
    linesCont.classList.add("linesCont","fcnsss");
    civSpan.classList.add("civilite");
    prenomSpan.classList.add("prenom");
    nameSpan.classList.add("nom");
    emailSpan.classList.add("email");
    telSpan.classList.add("portable");
    nameCont.classList.add("frncss","nameCont");
    emailCont.classList.add("frncss","emailCont");
    telCont.classList.add("frncss","telCont");
    editCont.classList.add("editCont","fcnccc");

    numSpan.textContent = j + 1;
    editSpan.textContent = "z";
    civSpan.textContent = ( coupon.civilite ? coupon.civilite : "");
    prenomSpan.textContent = ( coupon.prenom ? coupon.prenom : "");
    nameSpan.textContent = ( coupon.nom ? coupon.nom : "");
    emailSpan.textContent = ( coupon.email ? coupon.email : "Pas d'email");
    telSpan.textContent = ( coupon.portable ? coupon.portable : "Pas de téléphone");

    box.id = coupon.date;
    editCont.setAttribute("dateKey",coupon.date);
    editCont.addEventListener("click",openCoupon,false);
  }
  document.getElementById( "formWraper" ).classList.add( "invisible" );
  document.getElementById( "menu" ).classList.add( "invisible" );
  document.getElementById( "mainBody" ).appendChild( mainCont );
  boxTransition(mainCont);
};
var openCoupon = function(e){
  var but = e.currentTarget,
      keyDate = but.getAttribute("dateKey"),
      box = document.getElementById(keyDate),
      civilite = box.querySelector(".civilite").textContent,
      prenom = box.querySelector(".prenom").textContent,
      nom = box.querySelector(".nom").textContent,
      email = box.querySelector(".email").textContent,
      portable = box.querySelector(".portable").textContent,
      oldLinesCont = box.querySelector(".linesCont");
  var tableCont = document.getElementById("tableContainer");
  tableCont.classList.add("invisible");
  var centerCont = document.getElementById( "wraper" ).appendChild( document.createElement( "div" ) ),
      linesCont = centerCont.appendChild( document.createElement( "form" ) );
  centerCont.classList.add("fcnscc","centerdCont");
  centerCont.id="editContainer";
  linesCont.classList.add("editMode");
  linesCont.setAttribute("oldValues",JSON.stringify({
    civilite: civilite,
    prenom: prenom,
    nom: nom,
    email: email,
    portable: portable,
    date: keyDate
  }));

  var civCont = linesCont.appendChild( document.createElement( "div" ) ),
        civTitle = civCont.appendChild( document.createElement( "div" ) ),
          civSpan = civTitle.appendChild( document.createElement( "span" ) ),

        civInputCont = civCont.appendChild( document.createElement( "div" ) ),

          civMCont = civInputCont.appendChild( document.createElement( "div" ) ),
            civMInput = civMCont.appendChild( document.createElement( "input" ) ),
            civMLabel = civMCont.appendChild( document.createElement( "label" ) ),
              civMTitleCont = civMLabel.appendChild( document.createElement( "div" ) ),
                civMSpan = civMTitleCont.appendChild( document.createElement( "span" ) ),
              civMRetroCont = civMLabel.appendChild( document.createElement( "div" ) ),
                civMRetroSpan = civMRetroCont.appendChild( document.createElement( "span" ) ),

          civMmeCont = civInputCont.appendChild( document.createElement( "div" ) ),
            civMmeInput = civMmeCont.appendChild( document.createElement( "input" ) ),
            civMmeLabel = civMmeCont.appendChild( document.createElement( "label" ) ),
              civMmeTitleCont = civMmeLabel.appendChild( document.createElement( "div" ) ),
                civMmeSpan = civMmeTitleCont.appendChild( document.createElement( "span" ) ),
              civMmeRetroCont = civMmeLabel.appendChild( document.createElement( "div" ) ),
                civMmeRetroSpan = civMmeRetroCont.appendChild( document.createElement( "span" ) );
  civCont.classList.add("fcnsss");
  civSpan.textContent = "Civilité :"
  civInputCont.classList.add("frnccc","radioCont");
  civMInput.setAttribute("type","radio");
  civMmeInput.setAttribute("type","radio");
  civMInput.setAttribute("value","M.");
  civMmeInput.setAttribute("value","Mme");
  civMmeInput.setAttribute("name","civ");
  civMInput.setAttribute("name","civ");
  civMInput.id = "M_"+keyDate;
  civMmeInput.id = "Mme_"+keyDate;
  civMLabel.setAttribute("for",civMInput.id);
  civMmeLabel.setAttribute("for",civMmeInput.id);
  civMLabel.classList.add("frnscc");
  civMmeLabel.classList.add("frnscc");
  civMTitleCont.classList.add("txtCont","fcnccc");
  civMmeTitleCont.classList.add("txtCont","fcnccc");
  civMRetroCont.classList.add("retroCont");
  civMmeRetroCont.classList.add("retroCont");
  civMSpan.textContent = "M.";
  civMmeSpan.textContent = "Mme";
  if(civilite == "M."){
    civMInput.checked = true;
  }else if(civilite == "Mme"){
    civMmeInput.checked = true;
  }

  var prenomCont = linesCont.appendChild( document.createElement( "label" ) ),
        prenomTitle = prenomCont.appendChild( document.createElement( "div" ) ),
          prenomSpan = prenomTitle.appendChild( document.createElement( "span" ) ),
        prenomInput = prenomCont.appendChild( document.createElement( "input" ) );
  prenomCont.classList.add("fcnsss");
  prenomInput.id = "prenom_"+keyDate;
  prenomInput.setAttribute("name", "prenom" );
  prenomCont.setAttribute("for", prenomInput.id );
  prenomSpan.textContent = "Prénom :";
  prenomInput.setAttribute("type", "text" );

  prenomInput.value = prenom;

  var nomCont = linesCont.appendChild( document.createElement( "label" ) ),
        nomTitle = nomCont.appendChild( document.createElement( "div" ) ),
          nomSpan = nomTitle.appendChild( document.createElement( "span" ) ),
        nomInput = nomCont.appendChild( document.createElement( "input" ) );
  nomCont.classList.add("fcnsss");
  nomInput.id = "nom_"+keyDate;
  nomInput.setAttribute("name", "nom" );
  nomCont.setAttribute("for", nomInput.id );
  nomSpan.textContent = "Nom :";
  nomInput.setAttribute("type", "text" );
  nomInput.value = nom;

  var emailCont = linesCont.appendChild( document.createElement( "label" ) ),
        emailTitle = emailCont.appendChild( document.createElement( "div" ) ),
          emailSpan = emailTitle.appendChild( document.createElement( "span" ) ),
        emailInput = emailCont.appendChild( document.createElement( "input" ) );
  emailCont.classList.add("fcnsss");
  emailInput.id = "email_"+keyDate;
  emailInput.setAttribute("name", "email" );
  emailCont.setAttribute("for", emailInput.id );
  emailSpan.textContent = "Email :";
  emailInput.setAttribute("type", "email" );
  emailInput.value = email;

  var telCont = linesCont.appendChild( document.createElement( "label" ) ),
        telTitle = telCont.appendChild( document.createElement( "div" ) ),
          telSpan = telTitle.appendChild( document.createElement( "span" ) ),
        telInput = telCont.appendChild( document.createElement( "input" ) );
  telCont.classList.add("fcnsss");
  telInput.id = "tel_"+keyDate;
  telInput.setAttribute("name", "portable" );
  telCont.setAttribute("for", telInput.id );
  telSpan.textContent = "Portable :";
  telInput.setAttribute("type", "tel" );
  telInput.value = portable;

  var submitCont = linesCont.appendChild( document.createElement( "label" ) ),
      submit = submitCont.appendChild( document.createElement( "input" ) );
  submitCont.classList.add("fcnccc");
  submit.setAttribute("type","image");
  submit.setAttribute("src","img/bouton_envoyer.gif");

  linesCont.addEventListener("submit",updateCoupon,true);

};
var updateCoupon = function(e){
  e.preventDefault();
  var form = e.currentTarget,
      els = form.elements,
      l = els.length,
      ret={};
  for( var i = 0; i < l; i++ ){
    var el = els[ i ];
    if(el.hasAttribute("name")){
      var name = el.getAttribute("name");
      switch(name){
        case "civ" :
          ret.civilite = el.value;
        case "prenom" :
          ret.prenom = el.value;
        case "nom" :
          ret.nom = el.value;
        case "email" :
          ret.email = el.value;
        case "portable" :
          ret.portable = el.value;
      };
    };
  };
  var oldValues = JSON.parse(form.getAttribute("oldvalues"));
  ret.date = parseFloat(oldValues.date);
  STR = ret;
  var objectStore = db.transaction("coupons", "readwrite").objectStore("coupons");
  var req = objectStore.get(ret.date);
  req.onerror = function(event) {
    log({ txt:"Une erreur est survenue. Veuillez réessayer plus tard.",
          ico:"o",
          style:"err"});
  };
  req.onsuccess = function(event) {
    var data = req.result;
    data.civilite = STR.civilite;
    data.prenom = STR.prenom;
    data.nom = STR.nom;
    data.email = STR.email;
    data.portable = STR.portable;
    STR = false;
    var requestUpdate = objectStore.put(data);
     requestUpdate.onerror = function(event) {
       // Faire quelque chose avec l’erreur
     };
     requestUpdate.onsuccess = function(event) {
       var editContainer = document.getElementById("editContainer");
       editContainer.parentNode.removeChild( editContainer );
       closeTableContainer();
       showCouponsList();
       document.getElementById("menu_but").querySelector("span").textContent="l";
     };
  };

};
var closeTableContainer = function(e){
  var mainCont = document.getElementById("tableContainer");
  if(mainCont){
    mainCont.parentNode.removeChild( mainCont );
    document.getElementById( "formWraper" ).classList.remove( "invisible" );
    document.getElementById("menu_but").querySelector("span").textContent = "m";
  }
};
var deleteCoupons = function(){
  var resultat = window.confirm("Êtes vous sûr de vouloir effacer les coupons ? (une sauvegarde sera effectuée. Le fichier sera placé à la racine de la mémoire interne.)");
  if( resultat )getFullStore(clearDb);
};
var clearDb = function(){
  var transaction = db.transaction("coupons", "readwrite");
  transaction.onerror = function(event) {
    log({ txt:"Une erreur est survenue. Veuillez réessayer plus tard.",
          ico:"o",
          style:"err"});
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
