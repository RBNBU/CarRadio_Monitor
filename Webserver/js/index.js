/* VARIABELEN EN INITIALISATIE */
const API_URL = 'https://carradio-monitor.com/api/current_aprs';
let map;
let marker;
let routeLine;
let firstLoad = true;

/* COMPASS BEREKENING */
function getCompassPoint(graden) 
{
    if (graden === undefined || graden === null || graden === "") return "-";
    const streken = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW', 'N'];
    const index = Math.round(graden / 45) % 8;
    return streken[index];
}

/* KAART INITIALISEREN */
function initMap() 
{
    map = L.map('map').setView([0, 0], 2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', 
    {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    routeLine = L.polyline([], { color: '#ff0000', weight: 5 }).addTo(map);
}

/* UI INTERACTIE */
function setupUI() 
{
    const toggleBtn = document.getElementById('toggle-stats');
    const panel = document.getElementById('stats-panel');
    
    toggleBtn.addEventListener('click', () => 
    {
        panel.classList.toggle('collapsed');
        setTimeout(() => map.invalidateSize(), 400);
    });
}

/* DASHBOARD DATA UPDATEN */
async function updateDashboard() 
{
    try 
    {
        const response = await fetch(API_URL);
        if (!response.ok) 
        {
            throw new Error(`Network response was not ok: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data || (Array.isArray(data) && data.length === 0)) 
        {
            console.warn("No data received from API");
            return;
        }

        const history = Array.isArray(data) ? data : [data];
        const latest = history[0];

        /* STATISTIEKEN UPDATEN */
        document.getElementById('lat').innerText = latest.Latitude ? parseFloat(latest.Latitude).toFixed(4) : "-";
        document.getElementById('lon').innerText = latest.Longitude ? parseFloat(latest.Longitude).toFixed(4) : "-";
        document.getElementById('alt').innerText = latest.Altitude ? latest.Altitude + "m" : "-";
        document.getElementById('speed').innerText = latest.Speed ?? "0";
        document.getElementById('course-deg').innerText = latest.Course_Degree ?? "-";
        document.getElementById('course-text').innerText = getCompassPoint(latest.Course_Degree);
        
        /* WEERINFORMATIE UPDATEN */
        document.getElementById('temp').innerText = latest.Temperature ?? "-";
        document.getElementById('hum').innerText = (latest.Humidity ?? "-") + "%";
        document.getElementById('clouds').innerText = (latest.Clouds ?? "-") + "%";
        document.getElementById('wind').innerText = (latest.Wind_Speed ?? "-") + " m/s";
        document.getElementById('rain').innerText = (latest.Precipitation ?? "0") + " mm";

        /* KAART LOGICA */
        if (latest.Latitude && latest.Longitude) 
        {
            const latestPos = [latest.Latitude, latest.Longitude];
            
            if (!marker) 
            {
                marker = L.marker(latestPos).addTo(map);
            } 
            else 
            {
                marker.setLatLng(latestPos);
            }

            const coords = history
                .filter(item => item.Latitude && item.Longitude)
                .map(item => [item.Latitude, item.Longitude]);
            routeLine.setLatLngs(coords);

            if (firstLoad) 
            {
                map.setView(latestPos, 15);
                firstLoad = false;
            }
        }

        /* TIJD EN CALLSIGN UPDATEN */
        document.getElementById('callsign').innerText = latest.Callsign || "---";
        if (latest.Timestamp) 
        {
            const date = new Date(latest.Timestamp);
            if (!isNaN(date.getTime())) 
            {
                const dd = String(date.getUTCDate()).padStart(2, '0');
                const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
                const yy = String(date.getUTCFullYear()).slice(-2);
                const hh = String(date.getUTCHours()).padStart(2, '0');
                const min = String(date.getUTCMinutes()).padStart(2, '0');
                const ss = String(date.getUTCSeconds()).padStart(2, '0');
                document.getElementById('time').innerText = `${dd}:${mm}:${yy} ${hh}:${min}:${ss} UTC`;
            } 
            else 
            {
                document.getElementById('time').innerText = latest.Timestamp;
            }
        }

        /* ALARM STATUS */
        const alarmCard = document.getElementById('alarm-card');
        const alarmText = document.getElementById('alarm-text');
        if (latest.Alarm_Status && latest.Alarm_Status != 0) 
        {
            alarmText.innerText = "ALARM ACTIVE";
            alarmCard.classList.add('alarm-active');
        } 
        else 
        {
            alarmText.innerText = "System OK";
            alarmCard.classList.remove('alarm-active');
        }

    } 
    catch (error) 
    {
        console.error("Dashboard Update Error:", error);
        const alarmText = document.getElementById('alarm-text');
        if (alarmText) alarmText.innerText = "API ERROR";
    }
}

/* EVENT LISTENERS EN INTERVAL */
document.addEventListener('DOMContentLoaded', () => 
{
    initMap();
    setupUI();
    updateDashboard();
    setInterval(updateDashboard, 5000);
});