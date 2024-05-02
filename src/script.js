
const BASE_URL = "http://localhost:3000/stations";

const elements = {
    stationsList: document.getElementById('stations-list'),
    showDeleteFormButton: document.getElementById('show-delete-form'),
    updateButton: document.getElementById('update-button'),
    showAddFormButton: document.getElementById('show-add-form'),
    showEditFormButton: document.getElementById('show-edit-form'),
    showActiveStationsButton: document.getElementById('show-active-stations'),
    addForm: document.getElementById('add-form'),
    deleteForm: document.getElementById('delete-form'),
    editForm: document.getElementById('edit-form'),
    addButton : document.getElementById('add-button'),
    deleteButton : document.getElementById('delete-button'),
    editButton : document.getElementById('edit-button'),
};

let stations;
let isAVisible = false;

async function fetchStations() {
    try {
        const response = await fetch(BASE_URL);
        if (!response.ok) {
            throw new Error('Не вдалося отримати дані про станції');
        }
        stations = await response.json();
    } catch (error) {
        console.error(error.message);
    }
}

async function showStations(filterActive = false) {
    if (!stations) {
        await fetchStations();
    }
    const stationsContainer = elements.stationsList;
    stationsContainer.innerHTML = '';
    stations.forEach(station => {
        if (!filterActive || station.status === filterActive) {
            const stationElement = document.createElement("div");
            stationElement.classList.add("station");
            stationElement.innerHTML = `
                <p>ID: ${station.id}</p>
                <p>Address: ${station.address}</p>
                <p>Status: ${station.status ? 'Active' : 'Inactive'}</p>
                <hr>
            `;
            stationsContainer.appendChild(stationElement);
        }
    });
}

async function addStation(stationData) {
    try {
        const response = await fetch(BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(stationData)
        });
        if (!response.ok) {
            throw new Error('Не вдалося додати станцію');
        }
        await fetchStations();
    } catch (error) {
        console.error(error.message);
    }
}

async function deleteStation(stationId) {
    try {
        const response = await fetch(`${BASE_URL}/${stationId}`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            throw new Error(`Помилка при видаленні станції з ID ${stationId}`);
        }
        await fetchStations();
        console.log(`Станцію з ID ${stationId} успішно видалено`);
    } catch (error) {
        console.error(error.message);
    }
}

async function editStation(stationId, updatedData) {
    const requestOptions = {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedData)
    };
    const response = await fetch(`${BASE_URL}/${stationId}`, requestOptions);
    if (response.ok) {
        await fetchStations();
        console.log(`Станцію з ID ${stationId} успішно відредаговано`);
        return true;
    } else {
        console.log(`Помилка при редагуванні станції з ID ${stationId}`);
    }
}

async function toggleFormVisibility(form) {
    if (!isAVisible) {
        form.style.display = 'block';
        isAVisible = true;
        await showStations();
    } else {
        form.style.display = 'none';
        isAVisible = false;
    }
}

async function getInputElement(inputId) {
    const inputElement = document.getElementById(inputId);
    const inputValue = inputElement.value.trim();
    inputElement.value = '';
    return inputValue;
}

elements.addButton.addEventListener('click', async () => {
        const stationName = await getInputElement('station-add-input');
        console.log(stationName);
            const newStationData = {
                address: stationName,
                status: true ,
            };
            await addStation(newStationData);
            await showStations();
});

elements.deleteButton.addEventListener('click', async () => {
    const stationID =  await getInputElement('station-id-input');
    await deleteStation(stationID);
    await showStations();

})

elements.editButton.addEventListener('click', async () => {
    const stationID = await getInputElement('station-edit-id-input');
    const stationNewAddress = await getInputElement('station-address-input');
    const stationStatusInput = document.getElementById('station-status-input');
    const newStatus = stationStatusInput.checked;
    stationStatusInput.checked = false;
    const editSuccessful = await editStation(stationID, { address: stationNewAddress, status: newStatus });
    if(editSuccessful) {
        await showStations();
    }
});

elements.showAddFormButton.addEventListener('click', () => toggleFormVisibility(elements.addForm));
elements.showDeleteFormButton.addEventListener('click', () => toggleFormVisibility(elements.deleteForm));
elements.showEditFormButton.addEventListener('click', () => toggleFormVisibility(elements.editForm));
elements.showActiveStationsButton.addEventListener('click', () => showStations(true));
elements.updateButton.addEventListener('click', () => showStations());
