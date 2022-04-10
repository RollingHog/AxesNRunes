
  //Divine, Nature, Ice, Necro

  const ROWS_COUNT = 6
  const COLS_COUNT = 12

  const SPICY_BIOME_GENERATION = true

  // const LAYERS_COUNT = 4
  const CELLS_COUNT = 2

  const EObjTypes = {
    biome     : 'biome',
    unit      : 'unit',
    building  : 'building',
  }

  // eslint-disable-next-line no-unused-vars
  const EResourceTypes = {
    food : 'food',
    metal : 'metal',
    souls : 'souls',
    pantheon : 'pantheon',
  }

  const EBiomeFlags = {
    sky: "небо",
    //advanced biome
    adv: "улучш.",
  }

  var Aff = parseAffinityStr

  const INITIAL_RESOURCES = {
    PLANET: [0, 0, 3, 0],
    EMPIRE: [5, 5, 0, 0]
  }
  const BASE_FOOD   = 2
  const BASE_METAL  = 2
  //  food, ore, affinity, flags
  const EBiomes = {
    list: {
      'поле':         [1, 1, Aff('A' ), []  ],
      'лес':          [1, 0, Aff('N2'), []  ],
      'льды':         [0, 1, Aff('I' ), []  ],
      'пустошь':      [0, 1, Aff('D2'), []  ],

      'Асгард':       [2, 0, Aff('A4'), []  ],
      'Ванахейм':     [1, 1, Aff('N3'), []  ],
      'Нифльхейм':    [1, 1, Aff('I4'), []  ],
      'Хельхейм':     [0, 3, Aff('D3'), []  ],

      'небо'        : [0, 0, Aff('' ) , [EBiomeFlags.sky]  ],
      'цвет-боги'   : [0, 0, Aff('A') , [EBiomeFlags.sky]  ],
      'цвет-природа': [0, 0, Aff('N') , [EBiomeFlags.sky]  ],
      'цвет-лёд'    : [0, 0, Aff('I') , [EBiomeFlags.sky]  ],
      'цвет-смерть' : [0, 0, Aff('D') , [EBiomeFlags.sky]  ],
    },
    base: [
      'поле',
      'лес',
      'льды'  ,
      'пустошь',
    ],
    relations: {

      'поле':         [0, 1],
      'Асгард':       [0, 2],
      'цвет-боги':    [0, 1],

      'лес':          [1, 0],
      'Ванахейм':     [2, 0],
      'цвет-природа': [1, 0],

      'льды':         [-1, 0],
      'Нифльхейм':    [-2, 0],
      'цвет-лёд'    : [-1, 0],

      'пустошь':      [0, -1],
      'Хельхейм':     [0, -2],
      'цвет-смерть' : [0, -1],

      'небо'        : [0, 0],
    }
  }

  // ATK, DEF, MAINTANCE, SPECIAL
  const EUnits = {
    list: {
      "мечник"  : [],
      "ладья"   : [],
      "летучий_корабль" : [],
      // Divine
      // Nature
      // Ice
      "Йотун" : [],
      // Necromancy
      "Скелет_мечник" : [],
      "Баржа_мертвых" : [],
    }
  }

  const BldngEffects = arr => ({
    res: arr[0] || [],
    aff: Aff(arr[1] || ''),
    other: arr[2] || null,
  })

  const Bldng = (prereq, cost, effects) => ({
    prereq,
    cost,
    effects: BldngEffects(effects)
  })

  //TODO add units/buildings table for visual testing
  // prereq, cost, effects[resources, affinities, other], repeatingEffects (same array)
  const EBldngs = {
    list: {
      //pregen
      "Руины"         : Bldng("", "", [[],], []),

      "Столица"       : Bldng("", "", [[],], []),
      "Ферма"         : Bldng("", "", [[3],], []),
      "Шахта"         : Bldng("", "", [[],], []),
      // Divine
      "Храм"          : Bldng("", "", [[],'D3'], []),
      // Nature
      "Круг_друидов"  : Bldng("", "", [[],'N3'], []),
      // Ice
      "Алтарь_льда"   : Bldng("", "", [[],'I3'], []),
      // Necromancy
      "Зиккурат"      : Bldng("", "", [[],'N3'], []),
    }
  }

  const EAffinities = {
    dict: {
      'A': 0,
      'N': 1,
      'I': 2,
      'D': 3,
    }
  }

  const mapEditorData = {
    mode: null,
    brush: null
  }

  const allPage = getEl('allPage')

  // eslint-disable-next-line no-unused-vars
  const log = console.log
  HTMLElement.prototype.qs = HTMLElement.prototype.querySelector
  HTMLElement.prototype.qsa = HTMLElement.prototype.querySelectorAll

  function qsa(selector) {
    return document.querySelectorAll(selector)
  }

  function parseAffinityStr(affinityString) {
    affinityString = affinityString.trim()
    return {
      type: affinityString.charAt(),
      num:  +affinityString.substring(1) || 1
    }
  }

  const TPlanet = {
    populate: function(planet, x, y) {
      let i
      //belongs to
      planet.id = `_${x}_${y}`
      planet.rows[3].cells[0].innerHTML = planet.id

      //sky
      i = 1
      for(let j=0; j<CELLS_COUNT; j++)  {
        setBiome(planet.rows[i].cells[j], 'небо')
      }

      //ground
      i = 2
      let biome = null
        , cell = null
        // , prev_biome = null

      if(!SPICY_BIOME_GENERATION)
        biome = EBiomes.base[getRandomInt(0,3)]
      else
        biome = Object.keys(EBiomes.list)[getRandomInt(0,7-getRandomInt(0,1)*4)]

      let addRuins = biome == 'льды' ? getRandomInt(1,10)%2 : false

      for(let j=0; j<CELLS_COUNT; j++)  {
        // do {

        // } while(prev_biome && calculateBiomeRelations(prev_biome, biome)<2)
        // prev_biome = biome

        cell = planet.rows[i].cells[j]
        setBiome(cell, biome)
        if (addRuins) {
          setBuilding(cell.children[0].children[0].rows[0].cells[0], 'руины')
        }
      }

      TPlanet.updateResources(planet, INITIAL_RESOURCES.PLANET)
    },
    params: {
      update: function (planetName, resourceArray, affinityString, revert = false) {
        TPlanet.updateResources (planetName, resourceArray, revert)
        TPlanet.updateAffinity  (planetName, affinityString, revert)
      },
    },
    //food, metal, two types of souls
    updateResources: function (planet, resourceArray, revert = false) {
      const list = planet.querySelector('.resources').children
      for (let i in list) {
        if(!resourceArray[i]) continue
        if(!list[i].innerText) list[i].innerText = 0
        if(!revert)
          list[i].innerText = +list[i].innerText + resourceArray[i]
        else
          list[i].innerText = +list[i].innerText - resourceArray[i]
      }
    },

    updateAffinity: function  (planet, affinity, revert = false) {
      if(!affinity || !affinity.type) return
      const target = planet.querySelector('.affinities').children[EAffinities.dict[affinity.type]]
      if(!target.innerText) target.innerText = 0
      if(!revert)
        target.innerText = +target.innerText + affinity.num
      else
        target.innerText = +target.innerText - affinity.num

      if(+target.innerText <= 0) target.innerText = ''
    }
  }

  function getEl(name) {
    return document.getElementById(name)
  }

  function addStyle(elID, styleStr) {
    var s = document.createElement('style')
    s.id = elID
    s.innerHTML = styleStr
    document.head.appendChild(s)
  }

  function getRandomInt(min, maxInclusive) {
    min = Math.ceil(min)
    maxInclusive = Math.floor(maxInclusive)
    return Math.floor(Math.random() * (maxInclusive - min + 1)) + min
  }

  function onCellClick() {
    let t, objs
    if(this.nextSibling.nextSibling) {
      //left, building
      //if building exists - upgrade?
      objs = Object.keys(EBldngs.list)
      // this.innerHTML = '<select>' + objs.map(e => `<option value=${e}>${e}`).join('\n')
      t = prompt("Новое здание:\n- - удалить\n"+objs.map((e,i)=>i+' - '+e).join('\n'))
      if(t && objs[t]) {
        setBuilding(this, objs[t])
      } else if(t == '-') {
        setBuilding(this, '')
      }
    } else {
      // right, unit
      objs = Object.keys(EUnits.list)
      t = prompt("Новый юнит:\n- - удалить\n"+objs.map((e,i)=>i+' - '+e).join('\n'))
      if(t && objs[t]) {
        setUnit(this, objs[t])
      } else if(t == '-') {
        setUnit(this, '')
      }
    }
    return

    /*
    switch (mapEditorData.mode) {
      case 'biomes':
        if(!mapEditorData.brush)
          this.classList = ""
        else
          this.classList = mapEditorData.brush
        break
      case 'units':
        if(applyUnit == "Сброс")
          getUnit(this).innerHTML = ""
        else
          getUnit(this).innerHTML = createUnit(applyUnit)
        break
      case 'empires':
        if(applyEmpire == "Сброс")
          setEmpire(this, "")
        else
          setEmpire(this, applyEmpire)
        break
      case null:
        break
    }
    */

  }

  function setBuilding(cell, objectTextureName) {
    const planet = cell.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode
    let name = cell.className
    if(name) {
      TPlanet.params.update(planet, EBldngs.list[name].effects.res, EBldngs.list[name].effects.aff, true)
    }
    name = cell.className = capitalizeString(objectTextureName)
    if(name) TPlanet.params.update(planet, EBldngs.list[name].effects.res, EBldngs.list[name].effects.aff)
  }

  function setUnit(cell, objectTextureName) {
    const planet = cell.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode
    if(cell.className) {
      TPlanet.params.update(planet, EUnits.list[cell.className], EUnits.list[cell.className][2], true)
    }
    cell.className = objectTextureName
    TPlanet.params.update(planet, EUnits.list[objectTextureName], EUnits.list[objectTextureName][2])
  }

  function setBiome(cell, biomeName) {
    const planet = cell.parentNode.parentNode.parentNode
    if(cell.className) {
      TPlanet.params.update(planet, EBiomes.list[cell.className], EBiomes.list[cell.className][2], true)
    }
    cell.className = biomeName
    updatePlanetResources(planet, EObjTypes.biome, biomeName)
  }

  function calculateBiomeRelations(biome1, biome2) {
    let
      p1 = EBiomes.relations[biome1],
      p2 = EBiomes.relations[biome2]
    return Math.floor(Math.sqrt(
      Math.pow((p1[0]-p2[0]),2)+Math.pow((p1[1]-p2[1]),2)
    ))
  }

  function updatePlanetResources(planet, objType, objName, revert = false) {
    let affinityStr, resourceStr
    switch(objType) {
      case EObjTypes.biome:
        affinityStr = EBiomes.list[objName][2]
        resourceStr = EBiomes.list[objName].slice(0,2)
        //FIXME move this to initialization
        if(!EBiomes.list[objName][3].includes(EBiomeFlags.sky)) {
          resourceStr[0] += BASE_FOOD
          resourceStr[1] += BASE_METAL
        }
        break
      case EObjTypes.unit:
        break
      case EObjTypes.building:
        break
    }
    TPlanet.params.update(planet, resourceStr, affinityStr, revert)
  }

  function getPlanetResources(planetName) {
    const el = getEl(planetName)
    if(!el) return null
    return Array.from(el.querySelector('.resources').cells)
      .map(e => e.innerText)
  }

  function updateEmpireResources(empireName, resources, invert = false) {
    const root = document.querySelector(`#${empireName}.empire`)
    if(!invert) {
      root.qs('.food-income').innerText  = +root.qs('.food-income').innerText + +resources[0]
      root.qs('.ore-income').innerText   = +root.qs('.ore-income').innerText  + +resources[1]
    } else {
      root.qs('.food-income').innerText
        = Math.max(+root.qs('.food-income').innerText - +resources[0], 0)
      root.qs('.ore-income').innerText
        = Math.max(+root.qs('.ore-income').innerText  - +resources[1], 0)
    }
  }

  function getCell(planetName, cellLevel, cellNumber) {
    return getEl(planetName).rows[cellLevel].cells[cellNumber]
  }

  // eslint-disable-next-line no-unused-vars
  function getCellByXY(x, y) {
    return getEl('map').tBodies[0].rows[y].cells[x+1]
  }

  function editName(el) {
    if(el instanceof Event) el = el.target
    const res = prompt("", el.innerHTML)
    if(!res) return
    if(qsa('#'+res).length > 1) {
      alert('Нельзя, имя неуникально: '+res)
      return
    }
    getEl(el.innerHTML).id = capitalizeString(res)
    el.innerHTML = capitalizeString(res)
    //after name first set - we never change it, we only select empire
    el.onclick = selectEmpireOnEl
    selectEmpireOnEl(el)
  }

  const choosingHomeworld = {
    start: function(el) {
      el.innerText = '?'
      choosingHomeworld.el = el
    },
    done: function (el) {
      const empireName = choosingHomeworld.el.parentNode.parentNode.rows[0].cells[0].innerText
      choosingHomeworld.el.innerText = el.innerText
      setPlanetOwner(el, empireName)
      choosingHomeworld.el = null
    },
    getEmpireName: function () {
      return
    },
    el: null
  }

  function editEmpireName(el) {
    if(el instanceof Event) el = el.target
    const newName = prompt("", el.innerHTML)
    if(!newName) return
    getEl(el.innerHTML).id = newName
    el.innerHTML = newName
  }

  function selectEmpireOnEl(el) {
    if(el instanceof Event) el = el.target
    if(choosingHomeworld.el) {
      //we're choosing homeworld
      choosingHomeworld.done(el)
      return
    }
    let objs = Object.keys(getEmpiresList().colors)
    let t = prompt( "Выбрать империю:\n- - удалить\n"+objs.map((e,i)=>i+' - '+e).join('\n'))
    if(t && objs[t]) {
        setPlanetOwner(el, objs[t])
    } else if(t == '-') {
      setPlanetOwner(el, null)
    }
  }

  function getEmpiresList() {
    //TODO replace with refreshing JS structure instead of html parsing every time
    //TODO add when testing ends: .empires-list>
    const empires = Array.from(document.querySelectorAll('.empire'))
    let res = {
      colors: {}
    }

    empires.forEach( el => {
      const tColor = el.querySelector('.empire-color').innerText.trim()
      el.querySelector('.empire-color').style.backgroundColor = tColor
      res.colors[ el.querySelector('.empire-name').innerHTML ]
        = tColor
    })
    return res
  }

  function setPlanetOwner(nameEl, empireName) {
    const list = getEmpiresList().colors
    const invList = swapKnV(list)
    const ress = getPlanetResources(nameEl.innerText)
    let bgs = nameEl.parentNode.style
    if(list[empireName]
      && bgs.backgroundColor == list[empireName]
    ) return null

    if(invList[bgs.backgroundColor]) {
      updateEmpireResources(invList[bgs.backgroundColor], ress, true)
    }
    // if(nameEl.parentNode.style.backgroundColor)
    //TODO add empire statistics changing
    //TODO replace with changing empire class, see empires-stylesheet
    if(empireName) {
      bgs.backgroundColor = list[empireName]
      updateEmpireResources(empireName, ress)
    }
    else
      bgs.backgroundColor = 'transparent'
  }

  function swapKnV(obj) {
    return Object.fromEntries(
      Object.entries(obj).map( ([k, v]) => [v, k])
    )
  }

  function capitalizeString(string) {
    return string.charAt(0).toUpperCase() + string.slice(1)
  }

  // eslint-disable-next-line no-unused-vars
  function savePage() {
    getEl('downloadhref').href = 'data:application/xml;charset=utf-8, '+allPage.innerHTML
    getEl('downloadhref').click()
  }

  // eslint-disable-next-line no-unused-vars
  function loadPage() {
    allPage.innerHTML=prompt('Весь текст из файла сюда')
  }

  function generateMap() {
    console.time('map generation')

    let map = document.createElement('table')
    map.id = 'map'

    map.createTHead()
    map.createTBody()

    map.tHead.insertRow(0)
    for(let j=0; j<COLS_COUNT; j++)  {
      map.tHead.rows[0].insertCell(0)
      map.tHead.rows[0].cells[0].classList = 'map-border'
      map.tHead.rows[0].cells[0].innerHTML = COLS_COUNT-j-1
    }
    map.tHead.rows[0].insertCell(0)
    map.tHead.rows[0].cells[0].classList = 'map-border'
    map.tHead.rows[0].cells[0].innerHTML = ''

    for(let i=0; i<ROWS_COUNT; i++)  {
      let y = ROWS_COUNT-i-1, x = 0

      map.tBodies[0].insertRow(0)
      for(let j=0; j<COLS_COUNT; j++)  {
        x = COLS_COUNT-j-1
        map.tBodies[0].rows[0].insertCell(0)
        // if(i%2==1 && j%2==0 || i%2==0 && j%2==1) continue
        map.tBodies[0].rows[0].cells[0].innerHTML = getEl('planet_template').innerHTML

        TPlanet.populate(map.tBodies[0].rows[0].cells[0].children[0], x, y)
      }
      map.tBodies[0].rows[0].insertCell(0)
      map.tBodies[0].rows[0].cells[0].classList= 'shakal map-border'
      map.tBodies[0].rows[0].cells[0].innerHTML = y
    }

    getEl('map').remove()
    allPage.insertBefore(map, allPage.firstChild)

    console.timeEnd('map generation')
  }

  function init() {
    console.time('init')

    for(let i of ['planet_template', 'empire_template', 'examples']) {
      getEl(i).innerHTML = window['htmljs_'+i]

    }

    generateMap()

    for(let i of Array.from(document.querySelectorAll('.cell>tbody>tr>td'))) {
      i.onclick = onCellClick
    }

    for(let i of Array.from(document.querySelectorAll('.belongs>.name'))) {
      i.onclick = editName
    }

    for(let i of Array.from(document.querySelectorAll('.empire-name'))) {
      i.onclick = editEmpireName
    }

    let t = ''

    for (const i in EBldngs.list) {
      getEl('buildings_test').innerHTML += `<td class='${i}' title='${i}'>`
        t += `.${i} { background-image: url(images/buildings/${i}.png); }\n`
    }
    addStyle('style__building_images', t)

    for (const i in EUnits.list) {
      getEl('units_test').innerHTML += `<td class='${i}'  title='${i}'>`
      t += `.${i} { background-image: url(images/units/${i}.png); }\n`
    }
    addStyle('style__unit_images', t)

    // placeObject("Земля", 0,1,1,"летучий")
    // placeObject("Земля", 1,1,0,"building")
    // placeObject("Земля", 1,1,1,"мечник")
    // setBiome("Земля", 1,1,"льды")

    // TODO
    // tr.affinities, .belongs, .resources {
    //   display: none;
    // }

    console.timeEnd('init')
  }
  document.body.onload = init

