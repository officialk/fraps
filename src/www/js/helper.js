window.addEventListener("load", function () {
  include();
});

const includeStartEvent = new Event("includestart");

const includeEndEvent = new Event("includeend");

const includedNewEvent = new Event("includednew");

async function include() {
  window.dispatchEvent(includeStartEvent);
  var tags = document.getElementsByTagName("include");
  for (var i = 0; i < tags.length; i++) {
      var elem = tags[i];
      await fetch(elem.getAttribute("file") + "?&idForReq=" + elem.getAttribute("to"))
          .then(es => {
              es.text()
                  .then(ex => {
                      let id = es.url.split("?&").pop().split("=").pop();
                      document.getElementById(id)
                          .innerHTML = ex
                      includedNewEvent.id = id;
                      window.dispatchEvent(includedNewEvent);
                  })
          })
  }
  window.dispatchEvent(includeEndEvent);
}

const validator = (type, value) => {
  try {

      switch (type) {
          case "phone":
              return value.length == 10 && /^[7-9][0-9]{9}$/.test(value);
              break;
          case "number":
              try {
                  let x = parseInt(value)
                  return true
              } catch (e) {
                  return false
              }
              break;
          case "email":
              return /^[\w\.=-]+@[\w\.-]+\.[\w]{2,5}$/.test(value)
              break;
          case "name":
              for (let i = 0; i < value.length; i++) {
                  let code = value[i].charCodeAt(0);
                  if (!((code >= 65 && code <= 90) || (code >= 97 && code <= 122) || code == 32)) {
                      return false
                  }
              }
              return true;
              break;
          case "isNotNull":
              return !((value.length == 0) || (value == "") || value == null || value == undefined);
              break;
              //        case "url":
              //            return value.match("_^(?:(?:https?|ftp)://)(?:\S+(?::\S*)?@)?(?:(?!10(?:\.\d{1,3}){3})(?!127(?:\.\d{1,3}){3})(?!169\.254(?:\.\d{1,3}){2})(?!192\.168(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\x{00a1}-\x{ffff}0-9]+-?)*[a-z\x{00a1}-\x{ffff}0-9]+)(?:\.(?:[a-z\x{00a1}-\x{ffff}0-9]+-?)*[a-z\x{00a1}-\x{ffff}0-9]+)*(?:\.(?:[a-z\x{00a1}-\x{ffff}]{2,})))(?::\d{2,5})?(?:/[^\s]*)?$_iuS");
              //            break;
          case "radio" || "checkbox":
              getValuesByNames([value])[0].forEach(function (e) {
                  if (validator("isNotNull", e)) {
                      return true;
                  }
              });
              return false;
              break;
          default:
              throw `Not Handling ${type} validations for Value ${value} please contact the developers`;
              //            //console.log();
      }
      return false;
  } catch (e) {
      return false;
  }
}

const getValuesByIds = (arrayOfIds) => {
  return arrayOfIds.map(id => hasValue(document.getElementById(id)) ? document.getElementById(id).value : document.getElementById(id).innerHTML)
}

const getValuesByNames = (arrayOfNames) => {
  return arrayOfNames.map(name => {
      var elems = document.getElementsByName(name)
      var miniArray = [];
      for (var i = 0; i < elems.length; i++) {
          if (elems[i].multiple) {
              let options = elems[i].selectedOptions
              let insStr = [];
              for (let k = 0; k < options.length; k++) {
                  if (validator("isNotNull", options[k].value)) {
                      insStr.push(options[k].value);
                  }
              }
              miniArray.push(insStr.join(","));
          } else {
              var flag = true;
              try {
                  flag = elems[i].getAttribute("type").toString().toLowerCase() == "checkbox" || elems[i].getAttribute("type").toString().toLowerCase() == "radio";
              } catch (e) {
                  flag = false;
              }
              if (flag) {
                  //console.log(elems[i].checked ? elems[i].value : false);
                  miniArray.push(elems[i].checked ? elems[i].value : false);
              } else if (hasValue(elems[i])) {
                  if (validator("isNotNull", elems[i].value)) {
                      miniArray.push(elems[i].value)
                  }
              } else {
                  if (validator("isNotNull", elems[i].innerHTML)) {
                      miniArray.push(elems[i].innerHTML)
                  }
              }
          }
      };
      return miniArray;
  })
}

const checkRequiredIds = (arrayOfIds) => {
  let flag = true
  arrayOfIds.forEach(id => {
      var elem = document.getElementById(id);
      if (hasValue(elem)) {
          if (!validator("isNotNull", elem.value)) {
              flag = false
          }
      } else {
          if (!validator("isNotNull", elem.innerHTML)) {
              flag = false
          }
      }
  });
  return flag;
}

const checkRequiredNames = (arrayOfNames) => {
  for (let j = 0; j < arrayOfNames.length; j++) {
      let name = arrayOfNames[j];
      let isFilled = false;
      let elem = document.getElementsByName(name);
      for (var i = 0; i < elem.length; i++) {
          if (hasValue(elem[i])) {
              if (validator("isNotNull", elem[i].value)) {
                  isFilled = true;
              }
          } else {
              if (validator("isNotNull", elem[i].innerHTML)) {
                  isFilled = true;
              }
          }
      }
      if (!isFilled) {
          return false;
      }
  }
  return true;
}

const getQueryString = (file, headerOfIds, arrayOfId, headerOfNames = [], arrayOfNames = []) => {
  //starting query string
  var qs = file + "?submit=true";
  //making id string
  getValuesByIds(arrayOfId)
      .forEach((val, i) => {
          qs += "&" + headerOfIds[i] + "=" + val
      })
  //making name string
  getValuesByNames(arrayOfNames)
      .forEach((nameVal, i) => {
          nameVal.forEach((val) => {
              qs += "&" + headerOfNames[i].replace("[]") + "[]=" + val
          })
      })
  //returning query string
  return qs;
}

const createDynamicElement = (parentId, replaceString = "##") => {
  let parentElem = document.getElementById(parentId);
  parentElem.children[0].style.display = "none"
  let children = parentElem.children[0].innerHTML.replace("\n", "")
  let str = "<div>" + replaceInString(children, replaceString, parentElem.childElementCount) + "</div>";
  parentElem.insertAdjacentHTML("beforeend", str)
}

const getDataToIds = (qs, arrayOfIds, splitBy = "##") => {
  fetch(qs)
      .then(res => res.text())
      .then(data => {
          data.split(splitBy).forEach((val, i) => {
              //console.log(val);
              var elem = document.getElementById(arrayOfIds[i]);
              //console.log(elem, hasValue(elem));
              hasValue(elem) ? elem.value = val : elem.innerHTML = val;
          })
      })
}

const filterTable = (tableId, searchBy) => {
  document.getElementById(searchBy).addEventListener("keyup", e => {
      var text = e.srcElement.value;
      var tbody = document.getElementById(tableId).getElementsByTagName("tr");
      for (var rows = 0; rows < tbody.length; rows++) {
          (tbody[rows].innerHTML.toLowerCase().search(text.toLowerCase()) != -1) ?
          tbody[rows].style.display = "block": tbody[rows].style.display = "none";
      }
  })
}

const filterElements = (parentId, searchBy) => {
  document.getElementById(searchBy).addEventListener("keyup", e => {
      var text = e.srcElement.value;
      var children = document.getElementById(parentId).children;;
      for (var index = 0; index < children.length; index++) {
          (children[index].innerHTML.toLowerCase().search(text.toLowerCase()) != -1) ?
          children[index].style.display = "block": children[index].style.display = "none"
      }
  })
}

const local = (name, value) => {
  return validator("isNotNull", value) ? window.localStorage.setItem(name, value) : (window.localStorage.getItem(name))
}

const session = (name, value) => {
  return validator("isNotNull", value) ? window.sessionStorage.setItem(name, value) : (window.sessionStorage.getItem(name))
}

const replaceInString = (mainString, replaceString, replaceWith) => {
  let strArray = mainString.split(replaceString);
  let ret = strArray[0];
  for (let i = 1; i < strArray.length; i++) {
      ret = ret.concat(replaceWith.toString().concat(strArray[i]));
  }
  return ret;
}

const hasValue = (elem) => {
  return ["INPUT", "SELECT", "TEXTAREA"].includes(elem.tagName.toUpperCase());
}