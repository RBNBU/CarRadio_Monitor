function updateLog() {
    fetch('/api/data') 
        .then(response => {
            if (!response.ok) throw new Error("Network error");
            return response.json();
        })
        .then(data => {
            const logDiv = document.getElementById('log');
            
            // Clear the feed every cycle so we don't get duplicates
            if (data && data.length > 0) {
                logDiv.innerHTML = ''; 
                
                data.forEach(packet => {
                    const dateObj = packet.timestamp ? new Date(packet.timestamp * 1000) : new Date();
                    const timeString = dateObj.toLocaleTimeString();
                    
                    const entry = document.createElement('div');
                    entry.className = 'packet';
                    
                    // HTML for the modern card
                    entry.innerHTML = `
                        <div class="packet-header">
                            <span class="callsign">${packet.callsign || 'UNKNOWN'}</span>
                            <span class="timestamp">${timeString}</span>
                        </div>
                        <span class="data">Lat: ${packet.lat || 'N/A'}, Lon: ${packet.lon || 'N/A'}</span>
                        <span class="comment">${packet.comment || ''}</span>
                    `;
                    
                    logDiv.appendChild(entry);
                });
                
                // Auto-scroll to bottom to keep newest stuff in view
                logDiv.scrollTop = logDiv.scrollHeight;
            }
        })
        .catch(error => console.error("Waiting for data..."));
}

// Initial fetch and set interval
updateLog();
setInterval(updateLog, 5000);

// --- Transmit Modal Logic ---
const modal = document.getElementById('tx-modal');
const btnOpenTx = document.getElementById('btn-open-tx');
const btnCancelTx = document.getElementById('btn-cancel-tx');
const btnSendTx = document.getElementById('btn-send-tx');
const inputTarget = document.getElementById('tx-target');
const inputMessage = document.getElementById('tx-message');
const charCounter = document.getElementById('char-counter');

// Open Modal
btnOpenTx.addEventListener('click', () => {
    modal.classList.remove('hidden');
    inputTarget.focus();
});

// Close Modal & Reset
btnCancelTx.addEventListener('click', () => {
    modal.classList.add('hidden');
    inputMessage.value = '';
    charCounter.innerText = '0';
});

// Update character counter live
inputMessage.addEventListener('input', () => {
    charCounter.innerText = inputMessage.value.length;
});

// Send packet
btnSendTx.addEventListener('click', () => {
    // Force callsign to uppercase, remove extra spaces
    const target = inputTarget.value.trim().toUpperCase();
    const message = inputMessage.value.trim();

    if (!target || !message) {
        alert("Both Callsign and Message are required.");
        return;
    }

    // Temporarily lock the button to prevent double-sends
    btnSendTx.innerText = "TRANSMITTING...";
    btnSendTx.disabled = true;

    // Send payload to the Pi's backend
    fetch('/send', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            target: target,
            message: message
        })
    })
    .then(response => response.json())
    .then(data => {
        // Success! Hide modal and reset
        setTimeout(() => {
            modal.classList.add('hidden');
            inputMessage.value = '';
            charCounter.innerText = '0';
            btnSendTx.innerText = "FIRE PACKET";
            btnSendTx.disabled = false;
        }, 800);
    })
    .catch(error => {
        alert("Failed to send packet. Check connection to Pi.");
        btnSendTx.innerText = "FIRE PACKET";
        btnSendTx.disabled = false;
    });
});

// --- Location Beacon Trigger Logic ---
document.getElementById('btn-beacon-0').addEventListener('click', () => sendLocationBeacon('0'));
document.getElementById('btn-beacon-1').addEventListener('click', () => sendLocationBeacon('1'));

function sendLocationBeacon(commentStr) {
    const btn = document.getElementById(`btn-beacon-${commentStr}`);
    const originalText = btn.innerText;
    
    // UI Feedback
    btn.innerText = "QUEUING...";
    btn.disabled = true;

    fetch('/beacon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment: commentStr })
    })
    .then(response => response.json())
    .then(data => {
        setTimeout(() => {
            btn.innerText = "SENT!";
            btn.style.background = "var(--accent-green)";
            btn.style.color = "#000";
            
            // Reset button after 2 seconds
            setTimeout(() => {
                btn.innerText = originalText;
                btn.style.background = ""; 
                btn.style.color = "";
                btn.disabled = false;
            }, 2000);
        }, 500);
    })
    .catch(err => {
        alert("Failed to queue beacon. Check Pi connection.");
        btn.innerText = originalText;
        btn.disabled = false;
    });
}
