let targetList = []
let targetSorted
let target
let newTarget
let swithing = 0
let clientArr = []

async function createApp() {
    createHeader()
    createMain()
    createNewClient()
    await loadClients().then(() => {
        const preloaderEl = document.getElementById('preloader');
        preloaderEl.classList.add('hidden');
        preloaderEl.classList.remove('visible');
    });

    const response = await loadClients()
    response.forEach(client => {
        const correctCclient = getCorrectClient(client)
        clientArr.push(correctCclient)
    })

    renderTable(clientArr)
    document.querySelector('.addButton').classList.remove('hide')
    hashchange()
}

async function hashchange() {
    if (window.location.hash === '') return
    const id = window.location.hash.slice(1)
    showAddForm()
    document.querySelector('h4').textContent = 'Изменить данные'
    document.querySelector('.showDeleteFormBtn').style.display = 'flex'
    document.querySelector('.closeFormBottom').classList.add('hide')
    const client = await loadClients(id)
    pushClientInfo(client)

    document.querySelector('.showDeleteFormBtn').addEventListener('click', showDeleteForm)
}

function createNewClient() {
    const form = document.querySelector('[name="formName"]')
    form.addEventListener('submit', async function (event) {
        event.preventDefault()

        const target = event.target.querySelector('#save').classList

        if (!checkValidation(form)) {
            console.log('error');
            event.preventDefault()
            event.stopPropagation()
            return

        } else {
            let clientObj
            let client

            const clientData = {
                contactsClient: getContactsClient(),
                clientInfo: getClientInfo()
            }

            if (target.contains('saveContact')) {
                await showPreloader(event)
                clientObj = await createClient(clientData)
                client = getCorrectClient(clientObj)
                clientArr.push(client)
            } else {
                await showPreloader(event)
                clientObj = await changeDataClient(clientData)
                client = getCorrectClient(clientObj)
            }

            closeForm()

            const correctClientsrr = clientArr.map(x => {
                return x.id === client.id ? x = client : x
            })
            clientArr = correctClientsrr
            renderTable(clientArr)
        }
    })
}

function clearTable() {
    document.querySelector('.tbody').innerHTML = ''
}

function renderTable(arr) {
    const sortedClients = sortClients(arr)    
    clearTable()
    sortedClients.forEach(addRow)
}


function sortClients(arr) {
    if (targetSorted === undefined) return arr

    if (arr.length < 2 && targetSorted != undefined) {
        return arr
    }

    for (const cell of targetList) {
        cell.classList.toggle('sorted', cell === targetList[targetSorted])
    }

    document.querySelectorAll('.sort').forEach(th => {
        if (th.classList.contains('sorted')) {
            th.style.color = '#9873ff'
        } else {
            th.style.color = ''
        }
    })

    const sortArr = JSON.parse(JSON.stringify(arr))
    const sorting = document.querySelector('.sorted')
    if (sorting) {
        sorting.setAttribute('data-order', '-1')
        sorting.children[0].classList.remove('arrowAfter')
    }
    if (sorting.children.length > 1) {
        sorting.children[1].textContent = 'А-Я'
    }

    sortArr.sort((a, b) => {
        c = Object.values(a)[targetSorted]
        d = Object.values(b)[targetSorted]

        if (targetSorted === 2 || targetSorted === 3) {
            const dateA = checkTargetColl(a, targetSorted)
            const dateB = checkTargetColl(b, targetSorted)
            return checkedSwitch(dateA, dateB, sorting)
        }
        return checkedSwitch(c, d, sorting)
    })
    return sortArr
}

function checkTargetColl(obj, num) {
    if (num === 2) {
        return new Date(obj.originCreateDate)
    } else {
        return new Date(obj.originChangeDate)
    }
}

function checkedSwitch(a, b, sorting) {
    if (swithing === 1) {
        sorting.setAttribute('data-order', '1')
        sorting.children[0].classList.add('arrowAfter')
        if (sorting.children.length > 1) {
            sorting.children[1].textContent = 'Я-А'
        }
        newTarget = undefined
        return a > b ? -1 : 1
    }
    return a > b ? 1 : -1
}

function sortCoolTable(event) {
    // console.log('ok');
    targetList = event.target.parentNode.cells
    targetSorted = event.target.cellIndex
    if (newTarget === targetSorted) {
        swithing = 1
    } else {
        swithing = 0
    }
    newTarget = targetSorted
    renderTable(clientArr)
}

async function changeClient(event) {
    document.querySelector('h4').textContent = 'Изменить данные'
    document.querySelector('.showDeleteFormBtn').style.display = 'flex'
    document.querySelector('.closeFormBottom').classList.add('hide')

    const id = event.target.closest('tr').querySelector('.idTableCol').textContent

    await showPreloader(event)
    const client = await loadClients(id)
    await hidePreloader(event)
    pushClientInfo(client)

    document.querySelector('.showDeleteFormBtn').addEventListener('click', showDeleteForm)
}

function showPreloader(event) {
    const target = event.target.closest('div')

    let preloaderEl
    if (target.classList.contains('changeClient')) {
        preloaderEl = target.querySelector('.penImg');
        preloaderEl.classList.add('loadPenImg');
        // preloaderEl.classList.remove('penImg');
    } else if (target.classList.contains('deleteClient')) {
        preloaderEl = target.querySelector('.deleteImg');
        preloaderEl.classList.add('loadDeleteImg');
        // preloaderEl.classList.remove('deleteImg');
    } else if (target.classList.contains('showDeleteFormBtn')) {
        const tr = findCorrectTarget(target.parentNode)
        preloaderEl = tr.querySelector('.deleteImg');
        preloaderEl.classList.add('loadDeleteImg');
        preloaderEl.classList.remove('deleteImg');
    } else {
        preloaderEl = target.querySelector('#save')
        preloaderEl.classList.add('loadSaveContact');
        preloaderEl.children[0].style.display = 'block'
    }
}

function findCorrectTarget(target) {
    const id = target.querySelector('.formIdEl').getAttribute('name')
    const trArr = Array.from(document.querySelectorAll('.idTableCol'))
    const tr = trArr.find(coll => coll.textContent == id)
    return tr.parentNode
}

function hidePreloader(event) {
    const target = event.target
    if (target.children[0].classList.contains('loadPenImg')) {
        preloaderEl = target.querySelector('.loadPenImg');
        preloaderEl.classList.add('penImg');
        preloaderEl.classList.remove('loadPenImg');
    }
}

function showDeleteForm(event) {
    event.preventDefault()
    let target
    document.querySelector('body').style.overflow = 'hidden'
    if (event.target.closest('td')) {
        target = event.target.closest('td')
    } else {
        target = event.target
    }
    
    let targetId = target.parentNode.querySelector('.idTableCol').textContent.replace(/\D/g, '')

    if (event.target.closest('div').classList.contains('deleteClient')) {
        document.querySelector('.formContainer').style.display = 'flex'
    }
    document.querySelector('.addForm').classList.add('hide')
    document.querySelector('.deleteClientForm').style.display = 'flex'
    document
        .querySelector('.deleteClientBtn')
        .addEventListener('click', () => deleteClient(targetId, event), { once: true })

}

async function deleteClient(target, event) {

    await showPreloader(event)
    await deleteDataClient(target)
    let correctClientsArr = clientArr.filter(x => x.id !== target)

    clientArr = correctClientsArr
    closeForm()
    clearTable()
    renderTable(clientArr)
}

function pushClientInfo(client) {
    const keys = Object.keys(client)
    document.querySelector('.formIdEl').textContent = `${keys[4].toUpperCase()}: ${client.id}`
    document.querySelector('.formIdEl').setAttribute('name', client.id)
    document.querySelector('[data-name="Фамилия"]').value = client.surname
    document.querySelector('[data-name="Имя"]').value = client.name
    document.querySelector('[data-name="Отчество"]').value = client.lastName
    const clientContacts = client.contacts
    clientContacts.forEach(contact => {
        createContact(contact)
    })
    const contactsGroup = document.querySelectorAll('.contactInfoGroup')
    for (let i = 0; i < clientContacts.length; i++) {
        contactsGroup[i].querySelector('.selectTitle').textContent = clientContacts[i].type
        if (clientContacts[i].type === 'Vk') {
            contactsGroup[i].querySelector('#my-prefix').textContent = 'vk.com/'
            contactsGroup[i].querySelector('.contactInfo').style.width = '180px'
            console.log(screen.width);        
        } else if (clientContacts[i].type === 'Facebook') {
            contactsGroup[i].querySelector('#my-prefix').textContent = 'facebook.com/'
            contactsGroup[i].querySelector('.contactInfo').style.width = '146px'
            console.log(screen.width);
        }

        if (screen.width === 320 && clientContacts[i].type === 'Facebook') {
            contactsGroup[i].querySelector('.contactInfo').style.width = '0'
        } else if (screen.width === 320 && clientContacts[i].type === 'Vk') {
            contactsGroup[i].querySelector('.contactInfo').style.width = '0'
        }

        if (clientContacts[i].type === 'Телефон' || clientContacts[i].type === 'Доп. телефон') {
            contactsGroup[i].querySelector('.contactInfo').setAttribute('pattern', '[0-9]{11}')
        } else {
            contactsGroup[i].querySelector('.contactInfo').removeAttribute('maxlength')
        }
        contactsGroup[i].querySelector('.contactInfo').value = clientContacts[i].value
        contactsGroup[i].querySelector('.contactInfo').setAttribute('data-name', clientContacts[i].type)
        contactsGroup[i].querySelector('.select').setAttribute('data-name', clientContacts[i].type)
    }
}

function addRow(client) {
    const keys = Object.keys(client)
    let tr = document.createElement("tr")
    tr.classList.add('trBody')
    for (let key of keys) {
        if (key === 'originCreateDate' || key === 'originChangeDate') continue
        if (key === 'id') {
            tr.setAttribute('id', client[key])
        }
        let content
        const td = document.createElement("td")
        td.classList.add(`${key}TableCol`)
        if (key === 'contact') {
            for (let i = 0; i < client[key].length; i++) {

                let div = document.createElement('div')
                let classImg = checkTypeContact(client[key][i].type.toLowerCase())
                if (classImg === 'telImg') {
                    const value = correctValueOfContact(`${client[key][i].value}`)
                    div.setAttribute('data-text', `${value}`)
                } else {
                    div.setAttribute('data-text', `${client[key][i].type.toLowerCase()}: ${client[key][i].value}`)
                }
                if (window.innerWidth <= 1024) {
                    div.setAttribute('data-text', `${client[key][i].value}`)
                }

                if (i > 3) {
                    div.classList.add(`${classImg}`, 'tooltip', 'hide')
                } else {
                    div.classList.add(`${classImg}`, 'tooltip')
                }
                td.insertAdjacentElement('beforeend', div)
            }

            checkContactIcons(client[key], td)
        } else if (key === 'createDate' || key === 'lastChange') {
            client[key].forEach(date => {
                let span = document.createElement('span')
                let spanClass = checkTypeDate(date)
                span.classList.add(spanClass)
                span.textContent = date
                td.insertAdjacentElement('beforeend', span)
            })
        } else if (key === 'action') {
            const divChange = document.createElement('div')
            const spanChange = document.createElement('span')
            divChange.textContent = 'Изменить'
            spanChange.classList.add('penImg')
            divChange.classList.add('changeClient')
            divChange.appendChild(spanChange)

            const divDelete = document.createElement('div')
            const spanDelete = document.createElement('span')
            spanDelete.classList.add('deleteImg')
            divDelete.textContent = 'Удалить'
            divDelete.classList.add('deleteClient')
            divDelete.appendChild(spanDelete)
            td.insertAdjacentElement('beforeend', divChange)
            td.insertAdjacentElement('beforeend', divDelete)

        } else {
            content = client[key]
            td.appendChild(document.createTextNode(content));
        }

        tr.appendChild(td);
    }
    document.querySelector('tbody').insertAdjacentElement('beforeend', tr)

    // tr.querySelector('.penImg').classList.add('changeClient')
    tr.querySelector('.changeClient').addEventListener('click', showAddForm)

    tr.querySelector('.deleteClient').addEventListener('click', showDeleteForm)
    tr.querySelector('.nameTableCol').addEventListener('click', openInfoClient)
}



function correctValueOfContact(value) {
    value = value.split('')
    value[0] = '+7('
    value[3] = value[3] + ')'
    value[6] = value[6] + '-'
    value[8] = value[8] + '-'
    return value.join('');
}

function openInfoClient(event) {
    const id = event.target.parentNode.id
    window.location.hash = id;
}

function showAllContactIcons(event) {
    event.target.parentNode.querySelectorAll('.tooltip').forEach(icon => {
        if (icon.classList.contains('hide')) {
            icon.classList.remove('hide')
        }
    })
    event.target.style.display = 'none'
}

function checkContactIcons(arr, td) {
    if (arr.length > 4) {
        let countDiv = document.createElement('div')
        countDiv.textContent = `+${arr.length - 4}`
        countDiv.classList.add('countDiv')
        td.insertAdjacentElement('beforeend', countDiv)
        countDiv.addEventListener('click', showAllContactIcons)
    }
}

function checkTypeDate(el) {
    if (el.length === 5) {
        return 'time'
    }
}

function checkTypeContact(str) {
    if (str === 'телефон' || str === 'доп. телефон') {
        return 'telImg'
    } else if (str === 'email') {
        return 'emailImg'
    } else if (str === 'vk') {
        return 'vkImg'
    } else if (str === 'facebook') {
        return 'facebookImg'
    }
}

function getCorrectClient(client) {
    const name = getCorrectName([client.surname, client.name, client.lastName])
    const correctClient = {
        id: client.id,
        name,
        createDate: getCorrectTime(client.createdAt),
        lastChange: getCorrectTime(client.updatedAt),
        contact: client.contacts,
        action: 'Изменить',
        originCreateDate: client.createdAt,
        originChangeDate: client.updatedAt
    }
    return correctClient
}

function getCorrectTime(value) {
    const info = Date.parse(value)
    const year = new Date(info).getFullYear()
    let month = new Date(info).getMonth() + 1
    let day = new Date(info).getDate()
    let hours = new Date(info).getHours()
    let minutes = new Date(info).getMinutes()

    month = `0${month}`.slice(-2)
    hours = `0${hours}`.slice(-2)
    minutes = `0${minutes}`.slice(-2)
    day = `0${day}`.slice(-2)

    const data = `${day}.${month}.${year}`
    const time = `${hours}:${minutes}`
    return [data, time]
}

function getCorrectName(arr) {
    const correctName = arr.map(el => {
        if (!el) return
        let trimEl = el.trim()

        return (trimEl[0].toUpperCase() + trimEl.slice(1).toLowerCase())
    })
    return correctName.join(' ')
}

function createHeader() {
    let index = -1
    let timeout
    let liSelected;
    document.querySelector('body').insertAdjacentHTML('afterbegin', `
        <header>
            <div class="label">skb.</div>
            <div class="drop-down">
                <input type="text" class="search" name="inputSearch" placeholder="Введите запрос">                
                <ul class="drop-down-content" tabindex="0"></ul>
                <button type="button" class="clearInputButton"><div class="clearInput"></div></button>
            </div>
        </header>`)
    const textInput = document.querySelector('.search')
    const ul = document.querySelector('.drop-down-content')
    textInput.addEventListener('keydown', (e) => {
        if (e.keyCode === 38) {
            e.preventDefault()
        }
    })
    textInput.addEventListener('keyup', (e) => {
        clearTimeout(timeout);
        if (textInput.value) {
            timeout = setTimeout(() => {
                searchValue()
            }, 500)
        }
        if (textInput.value == 0) {
            hideDropdown()
            document.querySelector('.clearInputButton').style.display = 'none'
            renderTable(clientArr)
        }

        let len = ul.getElementsByTagName('li').length - 1;
        if (e.keyCode === 40 && ul.style.display != 'none') {
            clearTimeout(timeout);
            //down 
            if (liSelected) {
                index++;
                removeClass(liSelected, 'selected');
                let next = ul.getElementsByTagName('li')[index];
                if (typeof next !== undefined && index <= len) {

                    liSelected = next;
                } else {
                    index = 0;
                    liSelected = ul.getElementsByTagName('li')[0];
                }
                addClass(liSelected, 'selected');
                console.log(index);
            }
            else {
                index = 0;

                liSelected = ul.getElementsByTagName('li')[0];
                addClass(liSelected, 'selected');
            }
        } else if (e.keyCode === 38) {
            clearTimeout(timeout);
            //up
            if (liSelected) {
                removeClass(liSelected, 'selected');
                index--;
                console.log(index);
                next = ul.getElementsByTagName('li')[index];
                if (typeof next !== undefined && index >= 0) {
                    liSelected = next;
                } else {
                    index = len;
                    liSelected = ul.getElementsByTagName('li')[len];
                }
                addClass(liSelected, 'selected');
            }
            else {
                index = 0;
                liSelected = ul.getElementsByTagName('li')[len];
                addClass(liSelected, 'selected');
            }
        } else if (e.keyCode === 13) {
            selectedDropdown()
        }
    })
}

function selectedDropdown() {
    const selected = document.querySelector('.selected')
    showSearchClient(null, selected)
}

function addClass(el, className) {
    if (el.classList) {
        el.classList.add(className);
    } else {
        el.className += ' ' + className;
    }
};

function removeClass(el, className) {
    if (el.classList) {
        el.classList.remove(className);
    } else {
        el.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
    }
};

function hideDropdown() {
    document.querySelector('.drop-down-content').style.display = 'none'
    document.querySelector('.drop-down-content').innerHTML = ''
}

async function searchValue() {
    let newClientArr = []
    let value = document.querySelector('.search').value

    let response = await searchClient(value)

    response.forEach(client => {
        const correctCclient = getCorrectClient(client)

        newClientArr.push(correctCclient)
    })
    const clear = document.querySelector('.clearInputButton')
    clear.style.display = 'block'

    clear.addEventListener('click', clearInputValue)

    if (response.length != 0) {
        showDropdown(newClientArr)
    } else {
        hideDropdown()
    }
}

function showDropdown(arr) {
    const ul = document.querySelector('.drop-down-content')
    ul.innerHTML = ''
    ul.style.display = 'flex'
    arr.forEach(client => {
        const li = document.createElement('li')
        const a = document.createElement('a')
        a.setAttribute('href', `#${client.id}`)
        li.setAttribute('id', client.id)
        a.textContent = client.name
        li.append(a)
        ul.insertAdjacentElement('beforeend', li)
        a.addEventListener('click', showSearchClient)
        li.addEventListener('click', () => showSearchClient(null, li))
    })
}

function clearInputValue() {
    document.querySelector('.search').value = ''
    hideDropdown()
    document.querySelector('.clearInputButton').style.display = 'none'
    const trfind = document.querySelector('.find')
    if (trfind) {
        trfind.classList.remove('find')
        trfind.style.border = ''
    } else {
        return
    }
}

function showSearchClient(event, li = null) {
    if (!event && !li) return
    let target
    let id
    if (event) {
        event.preventDefault()
        target = event.target.textContent
        id = event.target.hash.slice(1)
    } else {
        target = li.textContent
        id = li.id
    }

    const trfind = document.querySelector('.find')
    if (trfind) {
        trfind.classList.remove('find')
        trfind.style.border = ''
    }
    document.querySelector('.search').value = target
    document.querySelector('.drop-down-content').style.display = 'none'
    const trbody = Array.from(document.querySelectorAll('.trBody'))

    const tr = trbody.find(tr => tr.id == id)
    tr.scrollIntoView({ block: "center", behavior: "smooth" })
    tr.style.border = '2px solid rgba(152, 115, 255, 0.5)'
    tr.classList.add('find')
}

function createMain() {
    const main = `<main>
            <h3>Клиенты</h3>            
            <table>
                <div id="preloader" class="visible">
                    <div class="loader"></div>
                </div>
                <thead></thead>
                <tbody class="tbody"></tbody>
            </table>
            <button class="addButton button btn hide">
                <div class="iconAddButton"></div>Добавить клиента
            </button>
            <div class="formContainer">
                <form class="addForm fadeInTop" name="formName" novalidate>
                    <div class="titleGroup">
                        <h4></h4>
                        <div class="formIdEl idTableCol"></div>
                        <button type="button" id="closeForm" class="closeFormTop">
                            <div class="closeFormImg"></div>
                        </button>
                    </div>
                    <div class="clientInfo">
                        <input type="text" id="fullSurname" class="inputValue field person" minlength="2" data-name="Фамилия" name="surname" required placeholder="Ваша фамилия">
                        <label class="fullName" for="fullSurname">Фамилия<span><sup>*</sup></span></label>                       
                    </div>
                    <div class="clientInfo">
                        <input type="text" id="fullName" class="inputValue field person" minlength="2" data-name="Имя" name="name" required placeholder="Ваше имя">
                        <label class="fullName" for="fullName">Имя<span><sup>*</sup></span></label>                        
                    </div> 
                    <div class="clientInfo">
                        <input type="text" id="fullMiddleName" class="inputValue" data-name="Отчество" name="middleName" data-only-letters placeholder="Ваше отчество">
                        <label class="fullName" for="fullMiddleName">Отчество</label>                        
                    </div>
                    <div class="buttonsGroup">
                        <div class="addContactsGroup">                                                
                            <button class="addContacts button">
                                <div class="addContactsImg"></div> 
                                Добавить контакт
                            </button> 
                        </div>
                        <button type="submit" id="save" class="button">
                            <div class="saveContactImg"></div>
                            Сохранить 
                        </button>                        
                        <button type="button" id="closeForm" tabindex="0" class="closeFormBottom">Отмена</button>
                    </div> 
                    <button class="showDeleteFormBtn">Удалить клиента</button>
                </form>
                <div class="deleteClientForm">
                    <div class="titleGroup">
                        <h4>Удалить клиента</h4>                       
                        <button type="button" id="closeForm" class="closeFormTop">
                            <div class="closeFormImg"></div>
                        </button>
                    </div>
                    <div class="deleteContent">Вы действительно хотите удалить данного клиента?</div>
                    <button type="button" class="deleteClientBtn button">Удалить</button>
                    <button id="closeForm" class="closeFormBottom">Отмена</button>
                </div>
            </div>
            </main>`

    document.querySelector('header').insertAdjacentHTML('afterend', main)
    document.querySelector('thead').insertAdjacentElement('afterbegin', createThead())

    document.querySelectorAll('#closeForm').forEach(closeEl => {
        closeEl.addEventListener('click', closeForm)
    })
    eventListeners()
}


function checkValidation() {
    const fields = document.querySelectorAll('.field')

    fields.forEach(field => {
        field.addEventListener('input', stopValidation)
    })

    removeValidation()

    if (!showErrors(fields)) {
        return false
    } else {
        return true
    }
}

function stopValidation(event) {
    let target
    if (event.target.classList.contains('contactInfo')) {
        target = event.target.parentNode.parentNode.querySelector('.error')
    } else {
        target = event.target.parentNode.querySelector('.error')
    }
    event.target.classList.remove('errorContact')
    event.target.parentNode.style.border = ''
    event.target.style.border = ''
    if (target) {
        target.remove()
    } else {
        return
    }
}

function showErrors(fields) {
    for (var i = 0; i < fields.length; i++) {
        if (fields[i].classList.contains('person') && fields[i].value.length < 2) {
            let name = fields[i].getAttribute('data-name')
            var error = generateError(`${name} не может быть не короче двух букв`)
            fields[i].classList.add('errorContact')
            fields[i].parentNode.insertAdjacentElement('afterbegin', error)
        } else if (fields[i].classList.contains('contactInfo')) {
            let text = generateErroreMessage(fields[i])
            if (text === '') {
                continue
            } else {
                fields[i].classList.add('errorContact')
                let error = generateError(text)
                fields[i].parentNode.parentNode.insertAdjacentElement('beforeend', error)
                fields[i].parentNode.style.border = '1px solid red'
            }
        }
    }

    let errorTipe = document.querySelector('.errorContact')

    if (errorTipe) {
        return false
    } else {
        return true
    }
}

function generateErroreMessage(field) {
    console.log(field);
    switch (field.dataset.name.toLowerCase()) {
        case 'телефон':
        case 'доп. телефон':
            if (field.value.length < 11) {
                return 'Телефон должен быть в формате 89995554433';
            }
            return ''
        case 'email':
            field.removeAttribute('pattern')
            field.removeAttribute('max-length')
            return validMail(field.value)
        case 'vk':
            return validAdress(field.value)
        case 'facebook':
            return validAdress(field.value)
    }
}

function validMail(value) {
    const re = /^[\w]{1}[\w-\.]*@[\w-]+\.[a-z]{2,4}$/i
    let valid = re.test(value);
    if (!valid) {
        return 'Введите корректный email адрес'
    } else {
        return ''
    }
}

function validAdress(str) {
    let re = /^[\w]{1}[\w-]+$/i
    str = str.replace(/\s/g, '');

    let valid = re.test(str);
    if (!valid) {
        return `Введите корректные данные соцсети`
    } else {
        return ''
    }
}

function generateError(text) {
    let error = document.createElement('div')
    error.className = 'error'
    error.style.color = 'red'
    error.innerHTML = text
    return error
}

function removeValidation() {
    document.querySelectorAll('.error').forEach(error => {
        error.remove()
    })

    document.querySelectorAll('.inputValue').forEach(input => {
        input.classList.remove('errorContact')
    })
}

function eventListeners() {

    document.querySelector('.addButton').addEventListener('click', showAddForm)

    document.querySelector('.addContacts').addEventListener('click', (event) => {
        createNewContact(event)
    })

    document.querySelector('.formContainer').addEventListener('click', event => {
        if (event.target.className === 'formContainer') {
            closeForm()
        }
    })
}

function checkInputValue(event) {
    if (event.target.value.match(/[^a-zA-ZА-Яа-яЁё]/g)) {
        event.target.value = event.target.value.replace(/[^a-zA-ZА-Яа-яЁё]/g, '')
    }
}

function checkedSelect(event) {
    const target = event.target.parentNode.parentNode.querySelector('.select').getAttribute('data-name').toLowerCase()
    if (target === 'телефон' || target === 'доп. телефон') {
        event.target.setAttribute('pattern', '[0-9]{11}')
        event.target.setAttribute('maxlength', '11')
        if (event.target.value.match(/[^0-9]/g)) {
            event.target.value = event.target.value.replace(/[^0-9]/g, "");
        }
    } else {
        event.target.removeAttribute('pattern')
        event.target.removeAttribute('maxlength')
        if (event.target.value.match(/\s/g)) {
            event.target.value = event.target.value.replace(/\s/g, '');
        }
    }
}

function getClientInfo() {
    const form = document.querySelector('[name="formName"]')
    const formData = Object.fromEntries(new FormData(form))
    const id = document.querySelector('.formIdEl')
    if (!id.textContent) {
        return formData
    } else {
        formData.id = id.textContent.replace(/\D/g, '')
    }
    return formData
}

function createNewContact(event) {
    event.preventDefault()
    createContact()
}

function createContact(contact = null) {
    // console.log(contact);
    document.querySelector('.addContacts').style.margin = '25px auto'
    document.querySelector('.addContactsGroup').style.paddingTop = '25px'

    const newContact = `<div class="contactInfoGroup">    
            <div class="select" data-state="" data-name="Телефон" >
                <button type="button" class="selectTitle" tabindex="0">Телефон</button>
                <div class="selectContent" >
                    <input id="singleSelect1" class="selectInput" type="radio">
                    <label for="singleSelect1" id="tel" class="selectLabel">Телефон</label>
                    <input id="singleSelect2" class="selectInput" type="radio">
                    <label for="singleSelect2" id="tel" class="selectLabel">Доп. телефон</label>
                    <input id="singleSelect3" class="selectInput" type="radio">
                    <label for="singleSelect3" class="selectLabel" >Email</label>
                    
                    <input id="singleSelect4" class="selectInput" type="radio">
                    <label for="singleSelect4" class="selectLabel">Vk</label>

                    <input id="singleSelect5" class="selectInput" type="radio">
                    <label for="singleSelect5" class="selectLabel">Facebook</label>                
                </div>            
            </div>

            <div class="input-box">
                <span id="my-prefix"></span>
                <input type="tel" class="contactInfo field" data-name="Телефон" placeholder="Введите данные контакта" maxlength="11" required>
            </div>            
            <button type="button" data-text="Удалить контакт" class="deleteContact tooltip">
            </button>                  
            </div>`

    document.querySelector('.addContacts').insertAdjacentHTML('beforebegin', newContact)

    document.querySelectorAll('.selectTitle').forEach(title => {
        title.addEventListener('click', showSelect)
    })

    document.querySelectorAll('.contactInfo').forEach(contactValue => {
        contactValue.addEventListener('input', checkedSelect)
    })

    document.querySelectorAll('.deleteContact').forEach(btn => {
        btn.addEventListener('click', deleteContact)
    })

    checkContactsLength()
}

function deleteContact(event) {
    event.target.parentNode.remove()

    checkContactsLength()
}

function checkContactsLength() {
    const contactsGroup = document.querySelectorAll('.contactInfoGroup')

    if (contactsGroup.length === 0) {
        document.querySelector('.addContacts').style.margin = '0 auto'
        document.querySelector('.addContactsGroup').style.paddingTop = '0'
    }

    if (contactsGroup.length < 10) {
        document.querySelector('.addContacts').classList.remove('hide')
    }

    if (contactsGroup.length === 10) {
        document.querySelector('.addContacts').classList.add('hide')
        return
    }
}

function showSelect(event) {
    // Toggle menu
    const selectSingle = event.target.parentNode;
    const option = selectSingle.children[1]
    const selectSingle_labels = option.querySelectorAll('.selectLabel');
    const active = document.querySelectorAll('[data-state="active"]')
    const input = selectSingle.parentNode.querySelector('.contactInfo')

    if ('active' !== selectSingle.getAttribute('data-state') && active.length === 0) {
        showContacts(selectSingle, selectSingle_labels, option, event)
    } else if ('active' !== selectSingle.getAttribute('data-state') && active.length > 0) {
        active[0].setAttribute('data-state', '');
        showContacts(selectSingle, selectSingle_labels, option)
    } else {
        selectSingle.setAttribute('data-state', '');
        option.style.display = 'none'
    }

    // Close when click to option
    for (let i = 0; i < selectSingle_labels.length; i++) {
        selectSingle_labels[i].addEventListener('click', (evt) => {
            selectSingle.children[0].textContent = evt.target.textContent;
            input.value = ''
            input.style.border = ''
            selectSingle.setAttribute('data-name', evt.target.textContent)
            input.setAttribute('data-name', evt.target.textContent.toLowerCase())
            input.setAttribute('id', evt.target.textContent.toLowerCase())
            if (evt.target.textContent === 'Vk' || evt.target.textContent === 'Facebook') {
                input.setAttribute('placeholder', 'Введите данные')
                showMyCastomSpan(input)
            } else {
                hideMyCastomSpan(input)
                input.setAttribute('placeholder', 'Введите данные контакта')
            }
            option.style.display = 'none'
            selectSingle.setAttribute('data-state', '');
            if (!selectSingle.parentNode.querySelector('.error')) {
                return
            } else {
                selectSingle.parentNode.querySelector('.error').remove()
                selectSingle.parentNode.querySelector('.input-box').style.border = ''
            }
        });
    }
};

function showMyCastomSpan(input) {
    if (input.id === 'vk') {
        input.style.width = '176px'
        input.parentNode.children[0].textContent = 'vk.com/'
    } else {
        input.style.width = '132px'
        input.parentNode.children[0].textContent = 'facebook.com/'
    }
    if (screen.width === 320 && input.id === 'vk') {
        input.style.width = '0px'
    } else if (screen.width === 320 && input.id === 'facebook') {
        input.style.width = '0px'
    }
}

function hideMyCastomSpan(input) {
    input.parentNode.children[0].textContent = ''
    input.style.width = '226px'
}

function showContacts(selectSingle, selectSingle_labels, option, event) {
    selectSingle.setAttribute('data-state', 'active');

    option.style.display = 'flex'
    selectSingle_labels.forEach(label => {
        if (label.textContent !== event.target.textContent) {
            label.style.display = 'flex'
        } else {
            label.style.display = 'none'
        }
    })
}

function showAddForm(event) {
    let target
    if (!event) {
        target = undefined
    } else {
        target = event.target.classList
    }
    document.querySelector('body').style.overflow = 'hidden'

    if (target === undefined) {
        document.querySelector('#save').classList.remove('saveContact')
        document.querySelector('#save').classList.add('changeContact')
    } else if (target.contains('changeClient')) {
        document.querySelector('#save').classList.remove('saveContact')
        document.querySelector('#save').classList.add('changeContact')
        changeClient(event)
    } else if (target.contains('addButton')) {
        document.querySelector('#save').classList.add('saveContact')
        document.querySelector('#save').classList.remove('changeContact')
        document.querySelector('.formIdEl').textContent = ''
        document.querySelector('h4').textContent = 'Новый клиент'
    }

    document.querySelector('.formContainer').style.display = 'flex'

    document.querySelectorAll('.person').forEach(input => {
        input.addEventListener('input', checkInputValue)
    })
}

function closeForm() {
    const form = document.querySelector('[name="formName"]')
    document.querySelector('body').style.overflow = 'auto'
    document.querySelector('.formContainer').style.display = 'none'
    document.querySelectorAll('.contactInfoGroup').forEach(contact => {
        contact.remove()
    })

    removeValidation()

    document.querySelector('.addContacts').style.margin = '0 auto'
    document.querySelector('.addContacts').classList.remove('hide')
    document.querySelector('.addContactsGroup').style.paddingTop = '0'
    document.querySelector('.showDeleteFormBtn').style.display = 'none'
    document.querySelector('.closeFormBottom').classList.remove('hide')
    document.querySelector('.deleteClientForm').style.display = 'none'
    document.querySelector('.addForm').classList.remove('hide')
    document.querySelector('#save').classList.remove('loadSaveContact')
    document.querySelector('.saveContactImg').style.display = 'none'
    window.location.hash = ''
    console.log(window.location.search);
    form.reset()
}

function createThead() {
    const theadTitles = {
        id: 'ID',
        name: 'Фамилия Имя Отчество',
        createDate: 'Дата и время создания',
        lastChange: 'Последние изменения',
        contact: 'Контакты',
        action: 'Действия',
    }
    const keys = Object.keys(theadTitles)
    const tr = document.createElement("tr")
    tr.classList.add('trTitle')

    for (let key of keys) {
        const th = document.createElement('th')
        th.classList.add(`${key}TableCol`)
        const content = theadTitles[key]
        th.appendChild(document.createTextNode(content))

        if (key === 'id' || key === 'name' || key === 'createDate' || key === 'lastChange') {
            th.classList.add('sort')
            const arrow = document.createElement('div')
            arrow.classList.add('arrow')
            th.insertAdjacentElement('beforeend', arrow)
            if (key === 'name') {
                const arrowText = document.createElement('div')
                arrowText.classList.add('arrowText')
                arrowText.textContent = 'А-Я'
                th.insertAdjacentElement('beforeend', arrowText)
            }
            th.addEventListener('click', sortCoolTable)
        }
        tr.appendChild(th)
    }
    return tr
}

function deleteDataClient(id) {
    return fetch(`http://localhost:3000/api/clients/${id}`, {
        method: 'DELETE',
    }).then(data => data.json())
}

function getContactsClient() {
    let arr = []
    const contactsGroup = document.querySelectorAll('.contactInfoGroup')
    contactsGroup.forEach(contact => {
        const typeContact = contact.querySelector('.select').getAttribute('data-name')
        const valueContact = contact.querySelector('.contactInfo').value
        arr.push({
            type: typeContact,
            value: valueContact
        })
    })
    return arr
}

function searchClient(value) {
    return fetch(`http://localhost:3000/api/clients?search=${value}`).then(data => data.json())
}

function loadClients(id = null) {
    if (id) {
        return fetch(`http://localhost:3000/api/clients/${id}`).then(data => data.json())
    } else {
        return fetch('http://localhost:3000/api/clients')
            .then(data => data.json())
    }
}

function changeDataClient(clientData) {
    return fetch(`http://localhost:3000/api/clients/${clientData.clientInfo.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: clientData.clientInfo.name,
            surname: clientData.clientInfo.surname,
            lastName: clientData.clientInfo.middleName,
            contacts: clientData.contactsClient
        })
    }).then(data => data.json())
}

function createClient(clientData) {
    return fetch('http://localhost:3000/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: clientData.clientInfo.name,
            surname: clientData.clientInfo.surname,
            lastName: clientData.clientInfo.middleName,
            contacts: clientData.contactsClient
        })
    }).then(data => data.json())
}
document.addEventListener('DOMContentLoaded', () => {
    window.addEventListener('hashchange', hashchange)
    createApp()
})