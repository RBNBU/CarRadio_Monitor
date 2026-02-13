# 🛰️ Vehicle Tracking & Monitoring System

Een robuust systeem voor real-time voertuigbeheer, gebruikmakend van het **APRS-protocol** en **SDR-technologie** om data-integriteit te garanderen in kritieke situaties.

## 📖 Projectomschrijving
Dit project simuleert een radioverbinding vanuit een voertuig (Jeep) die telemetrie verzendt naar een ontvangststation. De gegevens worden opgevangen via een **Software Defined Radio (SDR)** en verwerkt door een gelaagde infrastructuur.

### ✨ Kernfuncties
* **📡 Live Telemetrie:** Monitoring van locatie, snelheid, heading en signaalsterkte (RSSI).
* **🌦️ Weather Safety:** Automatische waarschuwingen bij extreem weer op de huidige locatie via een Weer-API.
* **🐕 Connection Watchdog:** Directe detectie van verbindingsverlies met visuele statusupdates.
* **🛡️ Data Vault:** Beveiligde opslag met gelaagde netwerkisolatie en fysiek gescheiden back-ups.

---

## 🏗️ Systeemarchitectuur
Het systeem is ondergebracht in een geavanceerde VM-structuur voor maximale isolatie en veiligheid:

* **Security & Gateway (VM 1):** De centrale toegangspoort die tevens waakt over de **High Availability** van de achterliggende systemen.
* **Application Server (VM 2):** Verwerkt de hardware-interfacing (SDR), de C-decoder en host de webinterface.
* **Data Vault (VM 3):** Een volledig geïsoleerd segment voor de SQL-server en geautomatiseerde onderhoudstaken.



---

## 👥 Het Team
* **Jasper Artoos**
* **Ruben Buelens**

---
*Project ontwikkeld in het kader van Practice Enterprise.*
